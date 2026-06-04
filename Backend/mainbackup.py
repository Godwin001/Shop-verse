from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware # 1. Import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import urllib.parse
from pydantic import BaseModel
from models import Base, Company, User 
import admin_ops 

# --- DATABASE SETUP ---
raw_password = "$A08138529746a" 
safe_password = urllib.parse.quote_plus(raw_password)
DATABASE_URL = f"postgresql://postgres:{safe_password}@localhost:5432/shop_verse_management"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- 2. THE HANDSHAKE (CORS) ---
# This allows your React frontend to communicate with this Python API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"], # Allows POST, GET, PUT, DELETE
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class CompanyCreate(BaseModel):
    company_name: str

class UserCreate(BaseModel):
    full_name: str
    user_id: str
    email: str
    password: str
    user_role: str
    company_id: str 

# --- ENDPOINTS ---

@app.post("/companies")
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    new_company = Company(company_name=company.company_name)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

# 3. UPDATED ENDPOINT NAME
# Renamed from /create-staff to /staff to match your React axios call
@app.post("/staff")
def create_staff(user: UserCreate, db: Session = Depends(get_db)):
    # Check if company exists first
    company_exists = db.query(Company).filter(Company.company_id == user.company_id).first()
    if not company_exists:
        raise HTTPException(status_code=404, detail="Company ID does not exist in our records")

    new_staff = User(
        full_name=user.full_name,
        user_id=user.user_id,
        email=user.email,
        password_hash=user.password,
        user_role=user.user_role,
        company_id=user.company_id
    )
    try:
        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)
        return {"message": "Staff created!", "user": new_staff.full_name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Could not create staff: {str(e)}")

@app.get("/companies")
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()

@app.get("/staff/{role}")
def get_staff_by_role(role: str, db: Session = Depends(get_db)):
    staff = db.query(User).filter(User.user_role == role).all()
    if not staff:
        raise HTTPException(status_code=404, detail=f"No staff found with role: {role}")
    return staff

@app.delete("/staff/{user_id}")
def delete_staff(user_id: str, db: Session = Depends(get_db)):
    return admin_ops.delete_staff_member(db, user_id)


#company directory endpoint to fetch all companies for the directory page
@app.get("/companies")
def get_companies(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    # Ensure your database records include fields like status, created_at, or industry
    return companies

# Add this to your main.py to fetch staff for a specific company in the directory page
@app.get("/companies/{company_id}/staff")
def get_company_staff(company_id: str, db: Session = Depends(get_db)):
    
    # Query all users where the company_id matches the requested one
    staff = db.query(User).filter(User.company_id == company_id).all()
    return staff










# ✅ GET STAFF BY ROLE
@app.get("/staff/{role}")
def get_staff_by_role(role: str, db: Session = Depends(get_db)):
    staff = db.query(User).filter(User.user_role == role).all()
    if not staff:
        raise HTTPException(status_code=404, detail=f"No staff found with role: {role}")
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




# ✅ DELETE STAFF
@app.delete("/staff/{user_id}")
def delete_staff(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff member record missing.")
    try:
        db.delete(user)
        db.commit()
        return {"message": "Staff member deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Could not complete command execution: {str(e)}")

