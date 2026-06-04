# admin_ops.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import User, Company # Import from our new blueprints file

def delete_staff_member(db: Session, user_id: int):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Staff not found")
    db.delete(db_user)
    db.commit()
    return {"detail": f"Staff ID {user_id} deleted"}

def toggle_company_status(db: Session, company_id: str, active_status: bool):
    db_company = db.query(Company).filter(Company.company_id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    db_company.is_active = active_status
    db.commit()
    return {"message": "Status updated"}