from models import Base, Subgrupe, Disciplina, Cadre
from database import engine

Base.metadata.create_all(bind=engine)
print("✔️ Tabelele au fost create.")
