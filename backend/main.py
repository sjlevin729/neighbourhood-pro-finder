import os
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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

# Root endpoint to provide API documentation
@app.get("/", response_class=HTMLResponse)
async def root():
    """
    Root endpoint that provides information about the API.
    """
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Neighbourhood Pro Finder API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.6;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #3498db;
                    margin-top: 30px;
                }
                code {
                    background-color: #f8f9fa;
                    padding: 2px 5px;
                    border-radius: 3px;
                    font-family: monospace;
                }
                .endpoint {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                }
                .method {
                    font-weight: bold;
                    color: #27ae60;
                }
            </style>
        </head>
        <body>
            <h1>Neighbourhood Pro Finder API</h1>
            <p>Welcome to the Neighbourhood Pro Finder API. This API provides service provider recommendations based on service type and neighborhood.</p>
            
            <h2>Available Endpoints</h2>
            
            <div class="endpoint">
                <p><span class="method">GET</span> <code>/ping</code></p>
                <p>Health check endpoint to verify the API is running.</p>
                <p>Example: <code>/ping</code></p>
            </div>
            
            <div class="endpoint">
                <p><span class="method">GET</span> <code>/recommendations</code></p>
                <p>Get service provider recommendations based on service type and neighborhood.</p>
                <p>Required query parameters:</p>
                <ul>
                    <li><code>service_type</code>: The type of service needed (e.g., plumber, electrician)</li>
                    <li><code>neighborhood</code>: The neighborhood to search in</li>
                </ul>
                <p>Example: <code>/recommendations?service_type=plumber&neighborhood=downtown</code></p>
            </div>
            
            <h2>API Documentation</h2>
            <p>For detailed API documentation, visit <a href="/docs">/docs</a>.</p>
            
            <h2>Frontend Application</h2>
            <p>The frontend application for Neighbourhood Pro Finder should be available at a separate URL provided by your deployment service.</p>
        </body>
    </html>
    """
    return html_content

# Sample endpoint to verify the server works
@app.get("/ping")
async def ping():
    """
    Health check endpoint to verify the API is running.
    Returns a simple JSON response.
    """
    return {"status": "ok"}

# Get available service types and neighbourhoods endpoint
@app.get("/options")
async def get_options(db: Session = Depends(get_db)):
    """
    Get available service types and neighbourhoods from the database.
    
    Returns:
    - A list of unique service types and neighbourhoods
    """
    # Query unique service types
    service_types = db.query(Provider.service_type).distinct().all()
    service_types = [item[0] for item in service_types]
    
    # Query unique neighbourhoods
    neighbourhoods = db.query(Provider.neighborhood).distinct().all()
    neighbourhoods = [item[0] for item in neighbourhoods]
    
    # Return formatted response
    return {
        "service_types": sorted(service_types),
        "neighbourhoods": sorted(neighbourhoods)
    }

# Recommendations endpoint
@app.get("/recommendations")
async def get_recommendations(
    service_type: str = Query(..., description="Type of service needed"),
    neighborhood: str = Query(..., description="Neighbourhood to search in"),
    db: Session = Depends(get_db)
):
    """
    Get service provider recommendations based on service type and neighbourhood.
    
    Parameters:
    - service_type: The type of service needed (e.g., plumber, electrician)
    - neighborhood: The neighbourhood to search in
    
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
