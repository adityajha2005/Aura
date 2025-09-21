#!/usr/bin/env python3
"""
Startup script for Aura AI Backend
Handles graceful fallback if main application fails to start
"""
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main startup function"""
    try:
        logger.info("Attempting to start Aura AI Backend...")
        from main import app
        import uvicorn
        
        logger.info("Starting with full functionality...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
    except Exception as e:
        logger.error(f"Failed to start main application: {e}")
        logger.info("Falling back to minimal mode...")
        
        try:
            from main_minimal import app
            import uvicorn
            
            logger.info("Starting in minimal mode...")
            uvicorn.run(app, host="0.0.0.0", port=8000)
            
        except Exception as e2:
            logger.error(f"Failed to start minimal application: {e2}")
            logger.error("All startup attempts failed!")
            sys.exit(1)

if __name__ == "__main__":
    main()
