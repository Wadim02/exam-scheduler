from models import Base, PropunereExamen, Subgrupe, Disciplina, Cadre, SubgrupeDisciplina, Facultati, Secretariat, Sefgrupe, Admin
from database import engine

Base.metadata.create_all(bind=engine)
print("✔️ Tabelele au fost create.")
