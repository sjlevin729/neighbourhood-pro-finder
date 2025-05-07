import json
import os
import sys
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, Provider

# Define service type categories
SERVICE_CATEGORIES = {
    # Auto services
    'auto': [
        'car', 'auto', 'mechanic', 'garage', 'tyre', 'tire', 'vehicle', 'mot', 'brake', 
        'battery', 'transmission', 'exhaust', 'wheel', 'alignment', 'oil change'
    ],
    
    # Home improvement
    'home_improvement': [
        'builder', 'construction', 'renovation', 'remodel', 'contractor', 'carpentry', 
        'painter', 'painting', 'decorator', 'flooring', 'tiling', 'roofing', 'roofer',
        'kitchen', 'bathroom', 'cabinet', 'drywall', 'insulation', 'handyman'
    ],
    
    # Plumbing
    'plumber': [
        'plumb', 'plumbing', 'drain', 'pipe', 'toilet', 'faucet', 'sink', 'water heater'
    ],
    
    # Electrical
    'electrician': [
        'electric', 'electrical', 'electrician', 'wiring', 'lighting', 'power'
    ],
    
    # Landscaping/Gardening
    'gardener': [
        'garden', 'landscape', 'lawn', 'tree', 'shrub', 'mow', 'yard', 'outdoor', 
        'plant', 'grass', 'hedge', 'weed'
    ],
    
    # Cleaning
    'cleaner': [
        'clean', 'cleaning', 'maid', 'janitorial', 'housekeeping', 'carpet cleaning', 
        'window cleaning', 'pressure washing'
    ],
    
    # HVAC
    'hvac': [
        'hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'boiler', 
        'ventilation', 'heat pump'
    ],
    
    # Locksmith
    'locksmith': [
        'lock', 'key', 'security', 'door'
    ],
    
    # Other services (default category)
    'other': []
}

def categorize_service(business_info):
    """Categorize a business based on its category name and categories list"""
    category_name = business_info.get('categoryName', '').lower()
    categories = [cat.lower() for cat in business_info.get('categories', [])]
    
    # Check all categories including the main category name
    all_categories = [category_name] + categories
    
    # Try to match with our defined categories
    for service_type, keywords in SERVICE_CATEGORIES.items():
        for category in all_categories:
            for keyword in keywords:
                if keyword.lower() in category:
                    return service_type
    
    # If no match found, return 'other'
    return 'other'

def extract_neighborhood(business_info):
    """Extract neighborhood from address information"""
    # Try to use the neighborhood field if available
    if business_info.get('neighborhood'):
        return business_info['neighborhood'].lower()
    
    # Otherwise, use the city as a fallback
    city = business_info.get('city', '')
    if city:
        return city.lower()
    
    # If no city, try to extract from address
    address = business_info.get('address', '')
    if address:
        # Try to extract a neighborhood or area from the address
        # This is a simple approach - might need refinement
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

def process_data(input_file):
    """Process the dataset and return formatted data for the database"""
    # Read the JSON data
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    formatted_data = []
    
    for business in data:
        # Skip businesses that are permanently closed
        if business.get('permanentlyClosed', False):
            continue
        
        # Categorize the service
        service_type = categorize_service(business)
        
        # Skip 'other' category if desired
        # if service_type == 'other':
        #     continue
        
        # Extract neighborhood
        neighborhood = extract_neighborhood(business)
        
        # Format phone number
        phone = format_phone(business.get('phone', ''))
        
        # Get rating
        rating = business.get('totalScore', 0)
        
        # Create formatted entry
        formatted_entry = {
            "name": business.get('title', ''),
            "service_type": service_type,
            "neighborhood": neighborhood,
            "contact": phone,
            "rating": rating
        }
        
        formatted_data.append(formatted_entry)
    
    return formatted_data

def add_to_database(formatted_data):
    """Add the formatted data to the database"""
    # Import here to avoid circular imports
    import sys
    sys.path.append('.')
    from backend.database import Base, Provider, SessionLocal, engine
    
    # Create session
    db = SessionLocal()
    
    try:
        print(f"Starting to add {len(formatted_data)} providers to the database...")
        
        # Add each provider to the database
        added_count = 0
        for provider_data in formatted_data:
            try:
                # Check if provider already exists (by name and service_type)
                existing = db.query(Provider).filter(
                    Provider.name == provider_data['name'],
                    Provider.service_type == provider_data['service_type']
                ).first()
                
                if not existing:
                    provider = Provider(**provider_data)
                    db.add(provider)
                    added_count += 1
                    
                    # Commit in batches to avoid large transactions
                    if added_count % 50 == 0:
                        db.commit()
                        print(f"Added {added_count} providers so far...")
            except Exception as item_error:
                print(f"Error adding provider {provider_data['name']}: {item_error}")
                continue
        
        # Final commit for any remaining providers
        db.commit()
        print(f"Successfully added {added_count} new providers to the database")
        
    except Exception as e:
        print(f"Error adding providers to database: {e}")
        db.rollback()
    finally:
        db.close()

def print_category_summary(formatted_data):
    """Print a summary of the categories"""
    categories = {}
    neighborhoods = {}
    
    for entry in formatted_data:
        service_type = entry['service_type']
        neighborhood = entry['neighborhood']
        
        categories[service_type] = categories.get(service_type, 0) + 1
        neighborhoods[neighborhood] = neighborhoods.get(neighborhood, 0) + 1
    
    print("\nService Type Summary:")
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count} providers")
    
    print("\nNeighborhood Summary:")
    for neighborhood, count in sorted(neighborhoods.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {neighborhood}: {count} providers")

if __name__ == "__main__":
    input_file = "dataset.json"
    
    # Process the data
    print(f"Processing data from {input_file}...")
    formatted_data = process_data(input_file)
    print(f"Processed {len(formatted_data)} businesses")
    
    # Print category summary
    print_category_summary(formatted_data)
    
    # Ask for confirmation before adding to database
    confirmation = input("\nDo you want to add these providers to the database? (y/n): ")
    if confirmation.lower() == 'y':
        add_to_database(formatted_data)
    else:
        print("Operation cancelled")
