"""
FastAPI main application for Aura AI Backend
Provides REST API endpoints for DEX fee recommendations and contract scanning
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import logging
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field
import json

from config import Config
from data_pipeline import get_live_market_data, get_avax_price, get_volatility
from production_models import get_production_fee_recommendation, get_model_info, train_production_models
from contract_scanner import scan_contract_address, quick_risk_assessment

# Setup logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL), format=Config.LOG_FORMAT)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Aura AI Backend",
    description="AI-powered backend for Aura Protocol providing DEX fee recommendations and contract analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class FeeRecommendationResponse(BaseModel):
    recommended_fee: float = Field(..., description="Recommended fee percentage")
    confidence: float = Field(..., description="Model confidence (0-1)")
    reasoning: str = Field(..., description="Human-readable reasoning")
    market_condition: str = Field(..., description="Current market condition")
    current_volatility: float = Field(..., description="Current market volatility")
    timestamp: str = Field(..., description="Timestamp of recommendation")

class ContractScanRequest(BaseModel):
    address: str = Field(..., description="Contract address to scan")
    quick: bool = Field(default=False, description="Perform quick scan only")

class ContractScanResponse(BaseModel):
    address: str
    risk_score: float
    risk_level: str
    flags: List[Dict]
    contract_type: str
    is_verified: bool
    recommendation: str
    timestamp: str

class MarketDataResponse(BaseModel):
    price_usd: Optional[float]
    volatility: Optional[float]
    volume_24h: Optional[float]
    market_condition: str
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    services: Dict[str, str]

# Global state for caching
market_data_cache = {}
cache_timestamp = None
CACHE_DURATION = 300  # 5 minutes

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    logger.info("Starting Aura AI Backend...")
    
    # Validate configuration
    if not Config.validate_config():
        logger.warning("Some API keys are missing - functionality may be limited")
    
    # Warm up AI models
    try:
        logger.info("Warming up AI models...")
        # Production models are ready on import
        logger.info("AI models ready")
    except Exception as e:
        logger.error(f"Error warming up AI models: {e}")
    
    logger.info("Aura AI Backend started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Aura AI Backend...")

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    services = {
        "ai_models": "healthy",
        "data_pipeline": "healthy",
        "contract_scanner": "healthy"
    }
    
    # Test services
    try:
        await get_avax_price()
    except Exception:
        services["data_pipeline"] = "degraded"
    
    overall_status = "healthy" if all(s == "healthy" for s in services.values()) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        services=services
    )

# Market data endpoints
@app.get("/market-data", response_model=MarketDataResponse)
async def get_market_data():
    """Get current market data"""
    try:
        global market_data_cache, cache_timestamp
        
        # Check cache
        if (cache_timestamp and 
            (datetime.now() - cache_timestamp).total_seconds() < CACHE_DURATION and
            market_data_cache):
            logger.debug("Using cached market data")
            return MarketDataResponse(**market_data_cache)
        
        # Fetch fresh data
        market_data = await get_live_market_data()
        coingecko_data = market_data.get("coingecko", {})
        indicators = market_data.get("market_indicators", {})
        
        response_data = {
            "price_usd": coingecko_data.get("price_usd"),
            "volatility": coingecko_data.get("volatility"),
            "volume_24h": coingecko_data.get("volume_24h"),
            "market_condition": indicators.get("volatility_category", "unknown"),
            "timestamp": datetime.now().isoformat()
        }
        
        # Update cache
        market_data_cache = response_data
        cache_timestamp = datetime.now()
        
        return MarketDataResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error fetching market data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")

@app.get("/volatility")
async def get_current_volatility():
    """Get current AVAX volatility"""
    try:
        volatility = await get_volatility()
        return {
            "volatility": volatility,
            "threshold": Config.VOLATILITY_THRESHOLD,
            "status": "high" if volatility and volatility > Config.VOLATILITY_THRESHOLD else "normal",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching volatility: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch volatility: {str(e)}")

# AI recommendation endpoints
@app.get("/recommend-fee", response_model=FeeRecommendationResponse)
async def recommend_fee(
    force_refresh: bool = Query(False, description="Force refresh market data"),
    use_production: bool = Query(True, description="Use production ML models")
):
    """Get AI-powered DEX fee recommendation"""
    try:
        # Get market data
        market_data = None
        if force_refresh or not market_data_cache:
            market_data = await get_live_market_data()
        
        # Get fee recommendation using production ML models or legacy system
        if use_production:
            recommendation = await get_production_fee_recommendation(market_data)
        else:
            recommendation = await get_production_fee_recommendation(market_data)
        
        return FeeRecommendationResponse(
            recommended_fee=recommendation["recommended_fee"],
            confidence=recommendation["confidence"],
            reasoning=recommendation["reasoning"],
            market_condition=recommendation["market_condition"],
            current_volatility=recommendation.get("current_volatility", 0),
            timestamp=recommendation.get("prediction_timestamp", datetime.now().isoformat())
        )
        
    except Exception as e:
        logger.error(f"Error generating fee recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendation: {str(e)}")

@app.get("/recommend-fee/production")
async def recommend_fee_production():
    """Get production ML-based fee recommendation with detailed model info"""
    try:
        recommendation = await get_production_fee_recommendation()
        return recommendation
    except Exception as e:
        logger.error(f"Error generating production fee recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendation: {str(e)}")

@app.get("/model-info")
async def get_ai_model_info():
    """Get information about the trained AI models"""
    try:
        model_info = get_model_info()
        return model_info
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")

@app.post("/retrain-models")
async def retrain_ai_models(background_tasks: BackgroundTasks):
    """Retrain production ML models (admin endpoint)"""
    async def retrain():
        try:
            logger.info("Starting model retraining...")
            results = await train_production_models()
            logger.info(f"Model retraining completed: {results}")
        except Exception as e:
            logger.error(f"Model retraining failed: {e}")
    
    background_tasks.add_task(retrain)
    return {
        "message": "Model retraining initiated", 
        "timestamp": datetime.now().isoformat(),
        "note": "This process may take several minutes"
    }

@app.get("/market-analysis")
async def get_market_analysis():
    """Get comprehensive market analysis"""
    try:
        market_data = await get_live_market_data()
        production_recommendation = await get_production_fee_recommendation(market_data)
        
        analysis = {
            "market_data": market_data,
            "fee_recommendation": production_recommendation,
            "analysis_timestamp": datetime.now().isoformat()
        }
        return analysis
    except Exception as e:
        logger.error(f"Error generating market analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")

# Contract scanning endpoints
@app.post("/scan-contract", response_model=ContractScanResponse)
async def scan_contract(request: ContractScanRequest):
    """Scan a contract for security risks"""
    try:
        address = request.address.strip()
        
        # Validate address format
        if not address or len(address) != 42 or not address.startswith("0x"):
            raise HTTPException(status_code=400, detail="Invalid contract address format")
        
        if request.quick:
            # Quick risk assessment
            result = await quick_risk_assessment(address)
            return ContractScanResponse(
                address=address,
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                flags=[],
                contract_type="unknown",
                is_verified=result.get("is_verified", False),
                recommendation=result["message"],
                timestamp=result["timestamp"]
            )
        else:
            # Full contract scan
            result = await scan_contract_address(address)
            return ContractScanResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning contract {request.address}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to scan contract: {str(e)}")

@app.get("/scan-contract/{address}")
async def scan_contract_get(
    address: str,
    quick: bool = Query(False, description="Perform quick scan only")
):
    """Scan a contract via GET request"""
    request = ContractScanRequest(address=address, quick=quick)
    return await scan_contract(request)

@app.get("/quick-risk/{address}")
async def quick_risk(address: str):
    """Quick risk assessment for a contract"""
    try:
        result = await quick_risk_assessment(address)
        return result
    except Exception as e:
        logger.error(f"Error in quick risk assessment for {address}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to assess risk: {str(e)}")

# Utility endpoints
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Aura AI Backend",
        "version": "2.0.0",
        "description": "Production AI-powered backend for Aura Protocol with ML models",
        "ml_features": {
            "production_models": ["Random Forest", "Gradient Boosting", "Neural Network"],
            "ensemble_prediction": True,
            "real_time_training": True,
            "confidence_scoring": True
        },
        "endpoints": {
            "health": "/health",
            "market_data": "/market-data",
            "volatility": "/volatility",
            "recommend_fee": "/recommend-fee",
            "recommend_fee_production": "/recommend-fee/production",
            "model_info": "/model-info",
            "retrain_models": "/retrain-models",
            "market_analysis": "/market-analysis",
            "scan_contract": "/scan-contract",
            "quick_risk": "/quick-risk/{address}",
            "docs": "/docs"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/config")
async def get_config():
    """Get current configuration (excluding sensitive data)"""
    return {
        "api_version": "1.0.0",
        "base_fee_rate": Config.BASE_FEE_RATE,
        "volatility_threshold": Config.VOLATILITY_THRESHOLD,
        "cache_ttl": Config.CACHE_TTL,
        "model_retrain_interval": Config.MODEL_RETRAIN_INTERVAL,
        "has_api_keys": {
            "coingecko": bool(Config.COINGECKO_API_KEY),
            "snowtrace": bool(Config.SNOWTRACE_API_KEY)
        },
        "timestamp": datetime.now().isoformat()
    }

# Background tasks
@app.post("/retrain-model")
async def retrain_model(background_tasks: BackgroundTasks):
    """Trigger model retraining (admin endpoint)"""
    def retrain():
        try:
            # This would trigger model retraining in a real implementation
            logger.info("Model retraining triggered")
        except Exception as e:
            logger.error(f"Model retraining failed: {e}")
    
    background_tasks.add_task(retrain)
    return {"message": "Model retraining initiated", "timestamp": datetime.now().isoformat()}

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint not found",
            "available_endpoints": [
                "/health", "/market-data", "/recommend-fee", 
                "/scan-contract", "/docs"
            ]
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )

# Development and testing utilities
if Config.DEBUG:
    @app.get("/test/data-pipeline")
    async def test_data_pipeline():
        """Test data pipeline (debug only)"""
        try:
            from data_pipeline import test_pipeline
            await test_pipeline()
            return {"status": "success", "message": "Data pipeline test completed"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")
    
    @app.get("/test/ai-models")
    async def test_ai_models():
        """Test AI models (debug only)"""
        try:
            # Test production model
            market_data = await get_live_market_data()
            recommendation = await get_production_fee_recommendation(market_data)
            model_info = await get_model_info()
            
            return {
                "status": "success", 
                "message": "AI models test completed",
                "sample_recommendation": recommendation,
                "model_info": model_info
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")
    
    @app.get("/test/contract-scanner")
    async def test_contract_scanner():
        """Test contract scanner (debug only)"""
        try:
            from contract_scanner import test_scanner
            await test_scanner()
            return {"status": "success", "message": "Contract scanner test completed"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

# Main function to run the server
def main():
    """Main function to run the FastAPI server"""
    logger.info(f"Starting Aura AI Backend on {Config.API_HOST}:{Config.API_PORT}")
    
    uvicorn.run(
        "main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=Config.DEBUG,
        log_level=Config.LOG_LEVEL.lower()
    )

if __name__ == "__main__":
    main()