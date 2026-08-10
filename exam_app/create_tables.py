from models import Base, ExamLimits, ExamProposal, Subgroup, Subject, Professor, Faculty, Secretariat, GroupLeader, Admin, Room
from database import engine

Base.metadata.create_all(bind=engine)
print("✔️ Tables created successfully.")
