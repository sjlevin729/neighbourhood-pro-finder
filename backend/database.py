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
        # Check if we already have data
        if db.query(Provider).count() == 0:
            print("Seeding database with sample providers...")
            for provider_data in sample_providers:
                provider = Provider(**provider_data)
                db.add(provider)
            db.commit()
            print(f"Added {len(sample_providers)} sample providers to the database")
        else:
            print("Database already contains providers, skipping seed")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
