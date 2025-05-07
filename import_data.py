import json
import os
import sys
import re

# Add the current directory to the path so we can import from backend
sys.path.append('.')

# Import database modules
from backend.database import Provider, SessionLocal, create_tables

def categorize_service(business_info):
    """Categorize a business based on its category name and categories list"""
    category_name = business_info.get('categoryName', '').lower()
    categories = [cat.lower() for cat in business_info.get('categories', [])]
    
    # Define service type categories with keywords
    service_categories = {
        'auto': ['car', 'auto', 'mechanic', 'garage', 'tyre', 'tire', 'vehicle', 'mot'],
        'plumber': ['plumb', 'pipe', 'drain'],
        'electrician': ['electric', 'wiring'],
        'gardener': ['garden', 'landscape', 'lawn'],
        'handyman': ['handyman', 'repair', 'builder', 'construction', 'carpentry'],
        'cleaner': ['clean', 'maid', 'janitorial'],
        'hvac': ['hvac', 'heating', 'cooling', 'air conditioning'],
        'locksmith': ['lock', 'key', 'security']
    }
    
    # Check all categories including the main category name
    all_categories = [category_name] + categories
    
    # Try to match with our defined categories
    for service_type, keywords in service_categories.items():
        for category in all_categories:
            for keyword in keywords:
                if keyword in category:
                    return service_type
    
    # If no match found, return 'other'
    return 'other'

def extract_neighborhood(business_info):
    """Extract neighborhood from address information"""
    # Try to use the city as neighborhood
    city = business_info.get('city', '')
    if city:
        return city.lower()
    
    # If no city, try to extract from address
    address = business_info.get('address', '')
    if address:
        # Try to extract a neighborhood or area from the address
        address_parts = address.split(',')
        if len(address_parts) > 1:
            return address_parts[1].strip().lower()
    
    # Default neighborhood if nothing found
    return 'unknown'

def format_phone(phone):
    """Format phone number to a consistent format"""
    if not phone:
        return ""
    
    # Remove non-numeric characters
    digits = re.sub(r'\D', '', phone)
    
    # Format as XXX-XXXX for the last 7 digits
    if len(digits) >= 7:
        return digits[-7:-4] + '-' + digits[-4:]
    
    return phone

def main():
    # Ensure database tables exist
    create_tables()
    
    # Read the JSON data
    with open('dataset.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Processing {len(data)} businesses from dataset.json...")
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Process and add each business
        added_count = 0
        skipped_count = 0
        
        for business in data:
            # Skip businesses that are permanently closed
            if business.get('permanentlyClosed', False):
                skipped_count += 1
                continue
            
            # Categorize the service
            service_type = categorize_service(business)
            
            # Skip 'other' category
            if service_type == 'other':
                skipped_count += 1
                continue
            
            # Extract neighborhood
            neighborhood = extract_neighborhood(business)
            
            # Format phone number
            phone = format_phone(business.get('phone', ''))
            
            # Get rating
            rating = business.get('totalScore', 0)
            
            # Check if provider already exists
            existing = db.query(Provider).filter(
                Provider.name == business.get('title', ''),
                Provider.service_type == service_type
            ).first()
            
            if existing:
                skipped_count += 1
                continue
            
            # Create new provider
            provider = Provider(
                name=business.get('title', ''),
                service_type=service_type,
                neighborhood=neighborhood,
                contact=phone,
                rating=rating
            )
            
            # Add to database
            db.add(provider)
            added_count += 1
            
            # Commit in batches to avoid large transactions
            if added_count % 20 == 0:
                db.commit()
                print(f"Added {added_count} providers so far...")
        
        # Final commit
        db.commit()
        
        print(f"Successfully added {added_count} new providers to the database")
        print(f"Skipped {skipped_count} businesses (already exists, closed, or 'other' category)")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
