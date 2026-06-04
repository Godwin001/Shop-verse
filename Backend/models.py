# models.py
import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    # Using PG_UUID ensures PostgreSQL handles the random ID correctly
    company_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.company_id"))
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_role = Column(String, nullable=False)