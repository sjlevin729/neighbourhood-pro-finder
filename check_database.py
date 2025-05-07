import sys
sys.path.append('.')

from backend.database import Provider, SessionLocal
from sqlalchemy import func

def main():
    # Create a database session
    db = SessionLocal()
    
    try:
        # Count total providers
        total_count = db.query(Provider).count()
        print(f"Total providers in database: {total_count}")
        
        # Count providers by service type
        print("\nProviders by service type:")
        service_types = db.query(Provider.service_type, 
                                 func.count(Provider.id).label('count'))\
                          .group_by(Provider.service_type)\
                          .order_by(func.count(Provider.id).desc())\
                          .all()
        
        for service_type, count in service_types:
            print(f"  {service_type}: {count} providers")
        
        # Count providers by neighborhood
        print("\nTop 10 neighborhoods:")
        neighborhoods = db.query(Provider.neighborhood, 
                                 func.count(Provider.id).label('count'))\
                          .group_by(Provider.neighborhood)\
                          .order_by(func.count(Provider.id).desc())\
                          .limit(10)\
                          .all()
        
        for neighborhood, count in neighborhoods:
            print(f"  {neighborhood}: {count} providers")
        
        # Show a few sample providers
        print("\nSample providers:")
        sample_providers = db.query(Provider).limit(5).all()
        
        for provider in sample_providers:
            print(f"  {provider.name} - {provider.service_type} in {provider.neighborhood} (Rating: {provider.rating})")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
