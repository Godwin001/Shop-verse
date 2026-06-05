# start backend -- uvicorn main:app --reload
# start frontend -- npm run dev 
# npx localtunnel --port 5173
# npm run deploy-- to deploy to github from frontend

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import urllib.parse
from pydantic import BaseModel
from models import Base, Company, User
import uuid
import hashlib

# --- DATABASE SETUP ---
raw_password = "$A08138529746a"
safe_password = urllib.parse.quote_plus(raw_password)
DATABASE_URL = f"postgresql://postgres:{safe_password}@localhost:5432/shop_verse_management"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Rebuilds database layout cleanly
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SCHEMAS ---
class CompanyCreateExtended(BaseModel):
    company_name: str
    company_id: str = None  

class UserCreate(BaseModel):
    full_name: str
    user_id: str
    email: str
    password: str
    user_role: str
    company_id: str  

class LoginRequest(BaseModel):
    staff_id: str
    password: str
    company_id: str

class LoginPayload(BaseModel):
    company_name: str
    company_id: str

# --- ZERO-DEPENDENCY PASSWORD HASHING (NO BCRYPT 72-BYTE LIMIT) ---
def hash_password(password: str) -> str:
    """Hashes passwords natively using SHA-256. Completely immune to byte size limits."""
    cleaned = password.strip()
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain text matches the database SHA-256 signature."""
    return hash_password(plain_password) == hashed_password

def convert_uuid_to_string(uuid_obj):
    if uuid_obj is None:
        return None
    return str(uuid_obj)

def parse_uuid(uuid_str: str) -> uuid.UUID:
    try:
        return uuid.UUID(uuid_str.strip())
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=400, 
            detail=f"The provided ID string '{uuid_str}' is not a valid UUID format."
        )

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "ShopVerse Management API is running cleanly"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ShopVerse Management API",
        "database": "connected"
    }

# STAFF/USER LOGIN ENDPOINT FOR A COMPANY
@app.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        company_uuid = parse_uuid(request.company_id)
        
        user = db.query(User).filter(
            User.user_id == request.staff_id,
            User.company_id == company_uuid
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid Staff ID or Company ID Workspace Match"
            )

        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials password verification failure."
            )

        return {
            "status": "success",
            "user": {
                "user_id": user.user_id,
                "full_name": user.full_name,
                "email": user.email,
                "user_role": user.user_role,
                "company_id": convert_uuid_to_string(user.company_id)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Critical Login Error Trace: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server authentication fault.")
    
# STAFF/USER LOGIN ENDPOINT FOR A COMPANY ...END


# START TO CREATE/REGISTER A COMPANY
@app.post("/companies")
def create_company(company: CompanyCreateExtended, db: Session = Depends(get_db)):
    try:
        if company.company_id:
            company_uuid = parse_uuid(company.company_id)
        else:
            company_uuid = uuid.uuid4()
        
        new_company = Company(
            company_id=company_uuid,
            company_name=company.company_name,
            is_active=True
        )
        
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        return {
            "message": "Company created successfully!",
            "company": {
                "company_id": convert_uuid_to_string(new_company.company_id),
                "company_name": new_company.company_name,
                "is_active": new_company.is_active
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Could not create company: {str(e)}")
    
    # END TO CREATE/REGISTER A COMPANY


# START OF CREATE A STAFF FOR A REGISTERED COMPANY
@app.post("/staff")
def create_staff(user: UserCreate, db: Session = Depends(get_db)):
    try:
        company_uuid = parse_uuid(user.company_id)
        
        company_exists = db.query(Company).filter(Company.company_id == company_uuid).first()
        if not company_exists:
            raise HTTPException(status_code=404, detail="Company ID workspace does not exist.")

        existing_user = db.query(User).filter(User.user_id == user.user_id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Staff username/ID already registered.")

        # Save utilizing the standard native SHA-256 setup
        hashed_password = hash_password(user.password)

        new_staff = User(
            full_name=user.full_name,
            user_id=user.user_id,
            email=user.email,
            password_hash=hashed_password,
            user_role=user.user_role,
            company_id=company_uuid
        )
        
        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)
        
        return {
            "message": "Staff created successfully!",
            "user": {
                "user_id": new_staff.user_id,
                "full_name": new_staff.full_name,
                "email": new_staff.email,
                "user_role": new_staff.user_role,
                "company_id": convert_uuid_to_string(new_staff.company_id)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating staff: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Could not complete profile save: {str(e)}")

# END OF CREATE A STAFF FOR A REGISTERED COMPANY


# START OF GET ALL REGISTERED COMPANIES
@app.get("/companies")
def get_companies(db: Session = Depends(get_db)):
    try:
        companies = db.query(Company).all()
        return [
            {
                "company_id": convert_uuid_to_string(c.company_id),
                "company_name": c.company_name,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat() if hasattr(c, 'created_at') and c.created_at else None
            }
            for c in companies
        ]
    except Exception as e:
        print(f"Error fetching companies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database read error: {str(e)}")

# END OF GET ALL REGISTERED COMPANIES


# START OF GET STAFF FOR SPECIFIC COMPANY
@app.get("/companies/{company_id}/staff")
def get_company_staff(company_id: str, db: Session = Depends(get_db)):
    try:
        company_uuid = parse_uuid(company_id)
        
        company = db.query(Company).filter(Company.company_id == company_uuid).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company workspace validation error.")
        
        staff = db.query(User).filter(User.company_id == company_uuid).all()
        return [
            {
                "user_id": s.user_id,
                "full_name": s.full_name,
                "email": s.email,
                "user_role": s.user_role,
                "company_id": convert_uuid_to_string(s.company_id)
            }
            for s in staff
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching company staff: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data fetch engine breakdown: {str(e)}")

# END OF GET STAFF FOR SPECIFIC COMPANY


# SRART OF DELETE STAFF FROM SPECIFIC COMPANY
@app.delete("/companies/{company_id}/staff/{user_id}")
def delete_company_staff(company_id: str, user_id: str, db: Session = Depends(get_db)):
    try:
        company_uuid = parse_uuid(company_id)
        user = db.query(User).filter(User.user_id == user_id, User.company_id == company_uuid).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="Staff targeted does not belong to requested tenant container.")
        
        db.delete(user)
        db.commit()
        return {"message": "Staff member deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Execution error: {str(e)}")
    
    # END OF DELETE STAFF FROM SPECIFIC COMPANY


# START OF PAUSE/RESUME OF A COMPANY
@app.put("/companies/{company_id}")
def update_company(company_id: str, is_active: bool = None, db: Session = Depends(get_db)):
    try:
        company_uuid = parse_uuid(company_id)
        company = db.query(Company).filter(Company.company_id == company_uuid).first()
        
        if not company:
            raise HTTPException(status_code=404, detail="Targeted Company record missing.")
        
        if is_active is not None:
            company.is_active = is_active
        
        db.commit()
        db.refresh(company)
        
        return {
            "company_id": convert_uuid_to_string(company.company_id),
            "company_name": company.company_name,
            "is_active": company.is_active
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Status update configuration fault: {str(e)}")

    # END OF PAUSE/RESUME OF A COMPANY


# START OF DELETE COMPANY QUERRY
@app.delete("/companies/{company_id}")
def delete_company(company_id: str, db: Session = Depends(get_db)):
    try:
        company_uuid = parse_uuid(company_id)
        company = db.query(Company).filter(Company.company_id == company_uuid).first()
        
        if not company:
            raise HTTPException(status_code=404, detail="Targeted Company record missing.")
        
        db.query(User).filter(User.company_id == company_uuid).delete()
        db.delete(company)
        db.commit()
        
        return {"message": "Company and all contextual staff accounts dropped successfully."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Deactivation pipeline failure: {str(e)}")

    # END OF DELETE COMPANY QUERRY


# START OF LOGIN CODE FOR PYTHON BACKEND
@app.post("/companies/login")
def login_company(payload: LoginPayload, db: Session = Depends(get_db)):
    try:
        # 1. Safely transform incoming token string into structured database UUID formatting
        company_uuid = parse_uuid(payload.company_id)
        
        # 2. Execute strict verification search matching BOTH the UUID and the name
        company = db.query(Company).filter(
            Company.company_id == company_uuid,
            Company.company_name == payload.company_name
        ).first()
        
        # 3. Halt processing immediately if verification returns empty
        if not company:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid company name or secure UUID credential combination."
            )
            
        # 4. Success payload hand-off to populate React overview dashboard components
        return {
            "company_id": convert_uuid_to_string(company.company_id),
            "company_name": company.company_name,
            "is_active": company.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Server Core Company Auth Mismatch: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Internal execution architecture error processing database query."
        )

        #END OF LOGIN CODE FOR PYTHON BACKEND