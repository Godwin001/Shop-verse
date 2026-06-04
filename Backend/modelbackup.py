# models.py
import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    
    # Matches: company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
    company_id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    
    # Matches: user_id VARCHAR(255) PRIMARY KEY
    user_id = Column(String(255), primary_key=True, index=True)
    
    # Matches: company_id UUID REFERENCES companies(company_id)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.company_id"), nullable=False)
    
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_role = Column(String(50), nullable=False)




    
import DashboardOverviewPage from './features/client-portal/pages/DashboardOverviewPage'; // Import the dashboard overview page

        <Route path="/Dashboard" element={<DashboardOverviewPage />} /> {/* Company Login Page */}