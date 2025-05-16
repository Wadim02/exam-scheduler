from models import Base, ExamenLimite, PropunereExamen, Subgrupe, Disciplina, Cadre, Facultati, Secretariat, Sefgrupe, Admin, Sali
from database import engine

Base.metadata.create_all(bind=engine)
print("✔️ Tabelele au fost create.")
