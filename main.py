"""
This file redirects to the backend main.py file.
It's used as a fallback for Render deployment.
"""
import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import the app from the backend main.py
from backend.main import app

# The app object is now available for uvicorn to use
