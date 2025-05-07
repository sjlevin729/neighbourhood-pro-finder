import os
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable or use SQLite for local development
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./test.db")

# Handle special case for Render PostgreSQL URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Define the Provider model
class Provider(Base):
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    service_type = Column(String, index=True)
    neighborhood = Column(String, index=True)
    contact = Column(String)
    rating = Column(Float)
    
    # Additional fields
    address = Column(String, nullable=True)
    street = Column(String, nullable=True)
    city = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    website = Column(String, nullable=True)
    full_phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    reviews_count = Column(Integer, nullable=True)
    
    # Review distribution
    one_star = Column(Integer, nullable=True)
    two_star = Column(Integer, nullable=True)
    three_star = Column(Integer, nullable=True)
    four_star = Column(Integer, nullable=True)
    five_star = Column(Integer, nullable=True)
    
    # Reviews (stored as JSON strings)
    reviews = Column(String, nullable=True)
    
    def to_dict(self):
        """Convert model instance to dictionary for API response"""
        import json
        
        # Parse reviews JSON if it exists
        reviews_data = []
        if self.reviews:
            try:
                reviews_data = json.loads(self.reviews)
            except:
                reviews_data = []
        
        # Create review distribution object
        review_distribution = {
            "oneStar": self.one_star or 0,
            "twoStar": self.two_star or 0,
            "threeStar": self.three_star or 0,
            "fourStar": self.four_star or 0,
            "fiveStar": self.five_star or 0
        }
        
        return {
            "id": self.id,
            "name": self.name,
            "service_type": self.service_type,
            "neighborhood": self.neighborhood,
            "contact": self.contact,
            "rating": self.rating,
            "address": self.address,
            "street": self.street,
            "city": self.city,
            "postal_code": self.postal_code,
            "website": self.website,
            "full_phone": self.full_phone,
            "email": self.email,
            "reviews_count": self.reviews_count,
            "review_distribution": review_distribution,
            "reviews": reviews_data
        }

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables in the database
def create_tables():
    Base.metadata.create_all(bind=engine)

# Import enhanced providers from the processed dataset.json file
from enhanced_providers import enhanced_providers

# Function to seed the database with sample data
def seed_database():
    db = SessionLocal()
    try:
        # Get existing service types
        existing_service_types = set(row[0] for row in db.query(Provider.service_type).distinct().all())
        
        # Check if we need to add new service types
        new_service_types = set(provider["service_type"] for provider in enhanced_providers)
        missing_service_types = new_service_types - existing_service_types
        
        # Get existing neighborhoods
        existing_neighborhoods = set(row[0] for row in db.query(Provider.neighborhood).distinct().all())
        new_neighborhoods = set(provider["neighborhood"] for provider in enhanced_providers)
        missing_neighborhoods = new_neighborhoods - existing_neighborhoods
        
        # Force database refresh if we're using enhanced providers
        force_refresh = True
        
        if force_refresh or missing_service_types or missing_neighborhoods or db.query(Provider).count() == 0:
            # If we're forcing a refresh or have new data
            if force_refresh:
                print("Forcing database refresh with enhanced provider data...")
                # Clear existing providers
                db.query(Provider).delete()
                db.commit()
            else:
                # Remove any providers with 'unknown' or invalid neighborhoods
                unknown_count = db.query(Provider).filter(Provider.neighborhood.in_(["unknown", "nightclub!"])).delete()
                if unknown_count > 0:
                    print(f"Removed {unknown_count} existing providers with 'unknown' or invalid neighborhoods")
                    db.commit()
            
            if missing_service_types:
                print(f"Adding providers for new service types: {', '.join(missing_service_types)}")
            
            if missing_neighborhoods:
                print(f"Adding providers for new neighborhoods: {', '.join(missing_neighborhoods)}")
            
            # Add enhanced providers (excluding those with 'unknown' or invalid neighborhoods)
            filtered_providers = [p for p in enhanced_providers if p["neighborhood"] != "unknown" and p["neighborhood"] != "nightclub!"]
            print(f"Adding {len(filtered_providers)} enhanced providers from dataset (excluded {len(enhanced_providers) - len(filtered_providers)} with unknown or invalid neighborhoods)...")
            for provider_data in filtered_providers:
                # Check if this exact provider already exists
                existing = db.query(Provider).filter(
                    Provider.name == provider_data["name"],
                    Provider.service_type == provider_data["service_type"]
                ).first()
                
                if not existing:
                    provider = Provider(**provider_data)
                    db.add(provider)
            
            db.commit()
            print(f"Database seeding completed successfully")
        else:
            print("Database already contains all service types and neighborhoods, skipping seed")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
