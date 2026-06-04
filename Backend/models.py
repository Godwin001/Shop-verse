from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import declarative_base

# The unified base instance for your entire application
Base = declarative_base()

class Company(Base):
    __tablename__ = 'companies'
    
    company_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=None)
    company_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class User(Base):
    __tablename__ = 'users'

    user_id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)  
    user_role = Column(String, nullable=False)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey('companies.company_id'), nullable=False)