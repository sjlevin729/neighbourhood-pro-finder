import os
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

# Import database models and functions
from database import Provider, get_db, create_tables, seed_database

# Initialize FastAPI app
app = FastAPI(title="Neighbourhood Pro Finder API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Provider response model
class ProviderResponse(Dict):
    pass

class RecommendationsResponse(Dict):
    pass

# Startup event to create tables and seed database
@app.on_event("startup")
async def startup_event():
    print("Starting up the FastAPI application...")
    create_tables()
    seed_database()
    print("Database initialization complete")

# Sample endpoint to verify the server works
@app.get("/ping")
async def ping():
    """
    Health check endpoint to verify the API is running.
    Returns a simple JSON response.
    """
    return {"status": "ok"}

# Recommendations endpoint
@app.get("/recommendations")
async def get_recommendations(
    service_type: str = Query(..., description="Type of service needed"),
    neighborhood: str = Query(..., description="Neighborhood to search in"),
    db: Session = Depends(get_db)
):
    """
    Get service provider recommendations based on service type and neighborhood.
    
    Parameters:
    - service_type: The type of service needed (e.g., plumber, electrician)
    - neighborhood: The neighborhood to search in
    
    Returns:
    - A list of recommended service providers, sorted by rating (highest first)
    """
    # Normalize inputs to lowercase for case-insensitive matching
    service_type_lower = service_type.lower()
    neighborhood_lower = neighborhood.lower()
    
    # Query the database for matching providers and sort by rating (highest first)
    providers = db.query(Provider).filter(
        Provider.service_type == service_type_lower,
        Provider.neighborhood == neighborhood_lower
    ).order_by(Provider.rating.desc()).all()
    
    # Convert provider objects to dictionaries for the response
    provider_dicts = [provider.to_dict() for provider in providers]
    
    # Add AI-powered ranking explanation
    for i, provider in enumerate(provider_dicts):
        # Add rank position
        provider["rank"] = i + 1
        
        # Add recommendation strength based on rating
        rating = provider.get("rating", 0)
        if rating >= 4.8:
            provider["recommendation_strength"] = "Highly Recommended"
        elif rating >= 4.5:
            provider["recommendation_strength"] = "Strongly Recommended"
        elif rating >= 4.0:
            provider["recommendation_strength"] = "Recommended"
        else:
            provider["recommendation_strength"] = "Somewhat Recommended"
    
    return {"providers": provider_dicts}

# Run the server
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default 8000
    port = int(os.environ.get("PORT", 8000))
    
    # Run the server
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
