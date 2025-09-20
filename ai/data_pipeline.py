"""
Real-time data pipeline for Aura AI Backend
Integrates with Pyth, CoinGecko, and Avalanche RPC
"""
import aiohttp
import asyncio
import time
from typing import Dict, Optional, List
import json
import logging
from datetime import datetime, timedelta

from config import Config

# Setup logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL), format=Config.LOG_FORMAT)
logger = logging.getLogger(__name__)

class DataCache:
    """Simple in-memory cache for API responses"""
    def __init__(self, ttl: int = Config.CACHE_TTL):
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key: str):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return data
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value):
        self.cache[key] = (value, time.time())

# Global cache instance
cache = DataCache()

class OracleDataPipeline:
    """Main class for fetching real-time market data"""
    
    def __init__(self):
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_coingecko_data(self, coin_id: str = "avalanche-2") -> Optional[Dict]:
        """Fetch live market data from CoinGecko API"""
        cache_key = f"coingecko_{coin_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.debug(f"Using cached CoinGecko data for {coin_id}")
            return cached_data
        
        try:
            url = f"{Config.COINGECKO_BASE_URL}/coins/{coin_id}"
            params = {
                "localization": "false",
                "tickers": "true",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
                "sparkline": "false"
            }
            
            if Config.COINGECKO_API_KEY:
                params["x_cg_demo_api_key"] = Config.COINGECKO_API_KEY
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Extract relevant market data
                    market_data = {
                        "price_usd": data["market_data"]["current_price"]["usd"],
                        "price_change_24h": data["market_data"]["price_change_percentage_24h"],
                        "volume_24h": data["market_data"]["total_volume"]["usd"],
                        "market_cap": data["market_data"]["market_cap"]["usd"],
                        "liquidity_score": data["liquidity_score"] if "liquidity_score" in data else 0,
                        "volatility": abs(data["market_data"]["price_change_percentage_24h"]),
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    cache.set(cache_key, market_data)
                    logger.info(f"Fetched CoinGecko data for {coin_id}: ${market_data['price_usd']}")
                    return market_data
                else:
                    logger.error(f"CoinGecko API error: {response.status}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching CoinGecko data: {e}")
            return None
    
    async def fetch_pyth_price_data(self, symbol: str = "AVAX/USD") -> Optional[Dict]:
        """Fetch real-time price data from Pyth Network using modern v2 API"""
        cache_key = f"pyth_{symbol}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.debug(f"Using cached Pyth data for {symbol}")
            return cached_data
        
        try:
            # Step 1: Get AVAX price feed ID from the v2/price_feeds endpoint
            feeds_url = "https://hermes.pyth.network/v2/price_feeds"
            params = {
                "query": "AVAX",
                "asset_type": "crypto"
            }
            
            async with self.session.get(feeds_url, params=params) as response:
                if response.status == 200:
                    feeds = await response.json()
                    
                    # Find AVAX/USD feed
                    avax_feed = None
                    for feed in feeds:
                        attrs = feed.get("attributes", {})
                        base = attrs.get("base", "").upper()
                        quote = attrs.get("quote_currency", "").upper()
                        if "AVAX" in base and "USD" in quote:
                            avax_feed = feed
                            break
                    
                    if not avax_feed:
                        logger.error("AVAX/USD feed not found in Pyth price feeds")
                        return None
                    
                    feed_id = avax_feed["id"]
                    
                    # Step 2: Get latest price data using the feed ID
                    price_url = "https://hermes.pyth.network/v2/updates/price/latest"
                    price_params = {
                        "ids[]": feed_id,
                        "encoding": "hex"
                    }
                    
                    async with self.session.get(price_url, params=price_params) as price_response:
                        if price_response.status == 200:
                            price_data = await price_response.json()
                            
                            if price_data and "parsed" in price_data and len(price_data["parsed"]) > 0:
                                parsed_feed = price_data["parsed"][0]
                                price_info = parsed_feed["price"]
                                
                                price = int(price_info["price"])
                                expo = int(price_info["expo"])
                                confidence = int(price_info["conf"])
                                
                                # Calculate actual price (Pyth prices use scaled integers)
                                actual_price = price * (10 ** expo)
                                confidence_interval = confidence * (10 ** expo)
                                
                                pyth_data = {
                                    "symbol": symbol,
                                    "price": actual_price,
                                    "confidence": confidence_interval,
                                    "confidence_ratio": confidence_interval / abs(actual_price) if actual_price != 0 else 0,
                                    "publish_time": price_info["publish_time"],
                                    "feed_id": feed_id,
                                    "base": avax_feed["attributes"].get("base", "AVAX"),
                                    "quote": avax_feed["attributes"].get("quote_currency", "USD"),
                                    "timestamp": datetime.now().isoformat()
                                }
                                
                                cache.set(cache_key, pyth_data)
                                logger.info(f"Fetched Pyth data for {symbol}: ${actual_price:.4f} (±{confidence_interval:.4f})")
                                return pyth_data
                            else:
                                logger.error("No parsed price data in Pyth response")
                                return None
                        else:
                            logger.error(f"Pyth price API error: {price_response.status}")
                            return None
                else:
                    logger.error(f"Pyth feeds API error: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching Pyth data: {e}")
            return None
    
    async def fetch_avalanche_network_stats(self) -> Optional[Dict]:
        """Fetch Avalanche network statistics via RPC"""
        cache_key = "avalanche_stats"
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.debug("Using cached Avalanche network stats")
            return cached_data
        
        try:
            # Fetch basic network info
            payload = {
                "jsonrpc": "2.0",
                "method": "eth_blockNumber",
                "params": [],
                "id": 1
            }
            
            async with self.session.post(Config.AVALANCHE_RPC_URL, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    block_number = int(data["result"], 16)
                    
                    # Fetch gas price
                    gas_payload = {
                        "jsonrpc": "2.0",
                        "method": "eth_gasPrice",
                        "params": [],
                        "id": 2
                    }
                    
                    async with self.session.post(Config.AVALANCHE_RPC_URL, json=gas_payload) as gas_response:
                        gas_data = await gas_response.json()
                        gas_price = int(gas_data["result"], 16)
                        
                        network_stats = {
                            "block_number": block_number,
                            "gas_price_wei": gas_price,
                            "gas_price_gwei": gas_price / 1e9,
                            "network_congestion": "low" if gas_price < 25e9 else "high",
                            "timestamp": datetime.now().isoformat()
                        }
                        
                        cache.set(cache_key, network_stats)
                        logger.info(f"Fetched Avalanche stats: Block {block_number}, Gas {network_stats['gas_price_gwei']:.2f} GWEI")
                        return network_stats
                else:
                    logger.error(f"Avalanche RPC error: {response.status}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching Avalanche stats: {e}")
            return None
    
    async def get_comprehensive_market_data(self) -> Dict:
        """Fetch all market data concurrently"""
        try:
            # Fetch all data sources concurrently
            tasks = [
                self.fetch_coingecko_data(),
                self.fetch_pyth_price_data(),
                self.fetch_avalanche_network_stats()
            ]
            
            coingecko_data, pyth_data, network_stats = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine data, handling exceptions
            combined_data = {
                "timestamp": datetime.now().isoformat(),
                "coingecko": coingecko_data if not isinstance(coingecko_data, Exception) else None,
                "pyth": pyth_data if not isinstance(pyth_data, Exception) else None,
                "network": network_stats if not isinstance(network_stats, Exception) else None
            }
            
            # Calculate derived metrics
            if combined_data["coingecko"]:
                combined_data["market_indicators"] = self._calculate_market_indicators(combined_data)
            
            return combined_data
            
        except Exception as e:
            logger.error(f"Error fetching comprehensive market data: {e}")
            return {"timestamp": datetime.now().isoformat(), "error": str(e)}
    
    def _calculate_market_indicators(self, data: Dict) -> Dict:
        """Calculate additional market indicators from fetched data"""
        coingecko = data.get("coingecko", {})
        
        if not coingecko:
            return {}
        
        volatility = coingecko.get("volatility", 0)
        volume_24h = coingecko.get("volume_24h", 0)
        market_cap = coingecko.get("market_cap", 0)
        
        # Calculate market indicators
        indicators = {
            "volatility_category": self._categorize_volatility(volatility),
            "volume_category": self._categorize_volume(volume_24h),
            "market_health": "healthy" if volatility < Config.VOLATILITY_THRESHOLD else "volatile",
            "liquidity_depth_estimate": volume_24h / max(market_cap, 1) * 100,  # Volume to market cap ratio
            "recommended_fee_adjustment": self._calculate_fee_adjustment(volatility)
        }
        
        return indicators
    
    def _categorize_volatility(self, volatility: float) -> str:
        """Categorize market volatility"""
        if volatility < 2:
            return "low"
        elif volatility < 5:
            return "medium"
        elif volatility < 10:
            return "high"
        else:
            return "extreme"
    
    def _categorize_volume(self, volume: float) -> str:
        """Categorize trading volume"""
        if volume < 100_000_000:  # < 100M
            return "low"
        elif volume < 500_000_000:  # < 500M
            return "medium"
        elif volume < 1_000_000_000:  # < 1B
            return "high"
        else:
            return "very_high"
    
    def _calculate_fee_adjustment(self, volatility: float) -> float:
        """Calculate recommended fee adjustment based on volatility"""
        base_fee = Config.BASE_FEE_RATE
        
        if volatility > Config.VOLATILITY_THRESHOLD:
            # Increase fee by 0.2% for every 3% of volatility above threshold
            multiplier = (volatility - Config.VOLATILITY_THRESHOLD) / 3.0
            adjustment = 0.2 * multiplier
            return min(base_fee + adjustment, 2.0)  # Cap at 2%
        
        return base_fee

# Utility functions for external use
async def get_live_market_data() -> Dict:
    """Get live market data - main entry point"""
    async with OracleDataPipeline() as pipeline:
        return await pipeline.get_comprehensive_market_data()

async def get_avax_price() -> Optional[float]:
    """Get current AVAX price"""
    async with OracleDataPipeline() as pipeline:
        coingecko_data = await pipeline.fetch_coingecko_data()
        if coingecko_data:
            return coingecko_data.get("price_usd")
        return None

async def get_volatility() -> Optional[float]:
    """Get current AVAX volatility"""
    async with OracleDataPipeline() as pipeline:
        coingecko_data = await pipeline.fetch_coingecko_data()
        if coingecko_data:
            return coingecko_data.get("volatility")
        return None

# Test function
async def test_pipeline():
    """Test the data pipeline"""
    print("Testing Aura AI Data Pipeline...")
    
    async with OracleDataPipeline() as pipeline:
        print("\n1. Testing CoinGecko integration...")
        coingecko_data = await pipeline.fetch_coingecko_data()
        print(f"CoinGecko data: {coingecko_data}")
        
        print("\n2. Testing Pyth integration...")
        pyth_data = await pipeline.fetch_pyth_price_data()
        print(f"Pyth data: {pyth_data}")
        
        print("\n3. Testing Avalanche RPC...")
        network_stats = await pipeline.fetch_avalanche_network_stats()
        print(f"Network stats: {network_stats}")
        
        print("\n4. Testing comprehensive data fetch...")
        comprehensive_data = await pipeline.get_comprehensive_market_data()
        print(f"Comprehensive data: {json.dumps(comprehensive_data, indent=2)}")

if __name__ == "__main__":
    asyncio.run(test_pipeline())