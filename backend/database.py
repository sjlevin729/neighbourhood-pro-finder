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

# Define Provider model
class Provider(Base):
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    service_type = Column(String, nullable=False, index=True)
    neighborhood = Column(String, nullable=False, index=True)
    contact = Column(String)
    rating = Column(Float)
    
    def to_dict(self):
        """Convert model instance to dictionary for API response"""
        return {
            "id": self.id,
            "name": self.name,
            "service_type": self.service_type,
            "neighborhood": self.neighborhood,
            "contact": self.contact,
            "rating": self.rating
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

# Import real providers from the processed dataset.json file
from real_providers import real_providers

# Sample data for seeding the database
sample_providers = [
    # Downtown providers
    {"name": "Joe's Plumbing", "service_type": "plumber", "neighborhood": "downtown", "contact": "555-1234", "rating": 4.8},
    {"name": "Downtown Plumbing Solutions", "service_type": "plumber", "neighborhood": "downtown", "contact": "555-5678", "rating": 4.5},
    {"name": "Downtown Electric Co", "service_type": "electrician", "neighborhood": "downtown", "contact": "555-9876", "rating": 4.7},
    {"name": "Spark Electricians", "service_type": "electrician", "neighborhood": "downtown", "contact": "555-4321", "rating": 4.6},
    {"name": "Green Thumb Gardens", "service_type": "gardener", "neighborhood": "downtown", "contact": "555-2468", "rating": 4.9},
    {"name": "Urban Oasis Landscaping", "service_type": "gardener", "neighborhood": "downtown", "contact": "555-1357", "rating": 4.4},
    
    # West Side providers
    {"name": "West Side Plumbing", "service_type": "plumber", "neighborhood": "west side", "contact": "555-3698", "rating": 4.3},
    {"name": "Pipe Masters", "service_type": "plumber", "neighborhood": "west side", "contact": "555-7412", "rating": 4.7},
    {"name": "Westend Electrical Services", "service_type": "electrician", "neighborhood": "west side", "contact": "555-9632", "rating": 4.8},
    {"name": "Reliable Electric", "service_type": "electrician", "neighborhood": "west side", "contact": "555-8521", "rating": 4.2},
    {"name": "Westside Garden Pros", "service_type": "gardener", "neighborhood": "west side", "contact": "555-7539", "rating": 4.6},
    {"name": "Sunset Landscaping", "service_type": "gardener", "neighborhood": "west side", "contact": "555-9517", "rating": 4.5},
    
    # North Hills providers
    {"name": "Northside Plumbers", "service_type": "plumber", "neighborhood": "north hills", "contact": "555-1593", "rating": 4.4},
    {"name": "Hill Top Plumbing", "service_type": "plumber", "neighborhood": "north hills", "contact": "555-7531", "rating": 4.9},
    {"name": "North Hills Electric", "service_type": "electrician", "neighborhood": "north hills", "contact": "555-3579", "rating": 4.7},
    {"name": "Highland Electrical", "service_type": "electrician", "neighborhood": "north hills", "contact": "555-9517", "rating": 4.5},
    {"name": "Hilltop Gardens", "service_type": "gardener", "neighborhood": "north hills", "contact": "555-7539", "rating": 4.8},
    {"name": "Northern Landscape Design", "service_type": "gardener", "neighborhood": "north hills", "contact": "555-1472", "rating": 4.6}
]

# Function to seed the database with sample data
def seed_database():
    db = SessionLocal()
    try:
        # Get existing service types
        existing_service_types = set(row[0] for row in db.query(Provider.service_type).distinct().all())
        
        # Check if we need to add new service types
        all_providers = real_providers + sample_providers
        new_service_types = set(provider["service_type"] for provider in all_providers)
        missing_service_types = new_service_types - existing_service_types
        
        # Get existing neighborhoods
        existing_neighborhoods = set(row[0] for row in db.query(Provider.neighborhood).distinct().all())
        new_neighborhoods = set(provider["neighborhood"] for provider in all_providers)
        missing_neighborhoods = new_neighborhoods - existing_neighborhoods
        
        if missing_service_types or missing_neighborhoods or db.query(Provider).count() == 0:
            # If we have new service types, neighborhoods, or the database is empty
            if missing_service_types:
                print(f"Adding providers for new service types: {', '.join(missing_service_types)}")
            
            if missing_neighborhoods:
                print(f"Adding providers for new neighborhoods: {', '.join(missing_neighborhoods)}")
            
            if db.query(Provider).count() == 0:
                print("Database is empty, seeding with all providers...")
                
                # Add real providers first
                print(f"Adding {len(real_providers)} real providers from dataset...")
                for provider_data in real_providers:
                    # Check if this exact provider already exists
                    existing = db.query(Provider).filter(
                        Provider.name == provider_data["name"],
                        Provider.service_type == provider_data["service_type"]
                    ).first()
                    
                    if not existing:
                        provider = Provider(**provider_data)
                        db.add(provider)
                
                # Add sample providers for other neighborhoods
                print(f"Adding {len(sample_providers)} sample providers for other neighborhoods...")
                for provider_data in sample_providers:
                    # Check if this exact provider already exists
                    existing = db.query(Provider).filter(
                        Provider.name == provider_data["name"],
                        Provider.service_type == provider_data["service_type"]
                    ).first()
                    
                    if not existing:
                        provider = Provider(**provider_data)
                        db.add(provider)
            else:
                # Only add providers for missing service types or neighborhoods
                for provider_data in all_providers:
                    if (provider_data["service_type"] in missing_service_types or 
                        provider_data["neighborhood"] in missing_neighborhoods):
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
