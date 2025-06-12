"""
Definirea modelelor de date pentru aplicația ExamScheduler folosind SQLAlchemy ORM.
Fiecare clasă reprezintă o tabelă în baza de date PostgreSQL.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

# Baza pentru toate modelele ORM
Base = declarative_base()

class Facultati(Base):
    """
    Model pentru facultăți. Fiecare facultate poate avea subgrupe.
    """
    __tablename__ = 'facultati'

    id = Column(Integer, primary_key=True, index=True)
    shortName = Column(String(50), unique=True, nullable=False)  # Ex: "FIESC"
    longName = Column(String(255))  # Nume complet al facultății

    # Relație 1:M cu subgrupe
    subgrupe = relationship("Subgrupe", back_populates="facultate")

class Cadre(Base):
    """
    Model pentru cadre didactice.
    """
    __tablename__ = 'cadre'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    facultyName = Column(String(255))
    departmentName = Column(String(255))

class Secretariat(Base):
    """
    Model pentru angajații din secretariat.
    """
    __tablename__ = 'secretariat'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    facultyName = Column(String(255))
    departmentName = Column(String(255))

class Sefgrupe(Base):
    """
    Model pentru șefii de grupă (studenți cu rol special).
    """
    __tablename__ = 'sefgrupe'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    id_facultate = Column(Integer, ForeignKey('facultati.id'))
    id_subgrupe = Column(Integer, ForeignKey('subgrupe.id'))

    facultate = relationship("Facultati")
    subgrupa = relationship("Subgrupe")

class Admin(Base):
    """
    Model pentru utilizatorii cu rol de administrator.
    """
    __tablename__ = 'admin'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    facultyName = Column(String(255))
    departmentName = Column(String(255))

class Sali(Base):
    """
    Model pentru sălile disponibile pentru examene.
    """
    __tablename__ = 'sali'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # Nume complet al sălii
    shortName = Column(String(50))  # Ex: "D014"
    buildingName = Column(String(255))  # Ex: "Corp D"
    
class Subgrupe(Base):
    __tablename__ = 'subgrupe'
    id = Column(Integer, primary_key=True, index=True)
    facultyId = Column(Integer, ForeignKey('facultati.id'))
    studyYear = Column(Integer)
    groupName = Column(String(50))
    subgroupIndex = Column(String(10))

    facultate = relationship("Facultati", back_populates="subgrupe")

class Disciplina(Base):
    __tablename__ = "discipline"

    id = Column(Integer, primary_key=True, index=True)
    id_cadru = Column(Integer, ForeignKey("cadre.id"))
    id_subgrupa = Column(Integer, ForeignKey("subgrupe.id"))  # Adăugat acest câmp
    topic = Column(String, nullable=False)

    cadru = relationship("Cadre", backref="discipline")
    subgrupa = relationship("Subgrupe", backref="discipline")  # Legătura spre subgrupa


class PropunereExamen(Base):
    """
    Model pentru propunerile de examene/colocvii făcute de șefii de grupă.
    """
    __tablename__ = "propuneri_examene"

    id = Column(Integer, primary_key=True, index=True)
    id_disciplina = Column(Integer, ForeignKey("discipline.id"), nullable=False)
    id_sefgrupa = Column(Integer, ForeignKey("sefgrupe.id"), nullable=False)
    id_sala = Column(Integer, ForeignKey("sali.id"), nullable=True)
    data = Column(DateTime, nullable=False)
    durata = Column(Integer, nullable=False)
    status = Column(String, default="trimisa")
    motiv_respingere = Column(Text, nullable=True)
    id_asistent = Column(Integer, ForeignKey("cadre.id"), nullable=True)

    # Relații
    asistent = relationship("Cadre", foreign_keys=[id_asistent])
    disciplina = relationship("Disciplina", backref="propuneri")
    sefgrupa = relationship("Sefgrupe", backref="propuneri")
    sala = relationship("Sali", backref="propuneri")
class ExamenLimite(Base):
    __tablename__ = "examen_limite"

    id = Column(Integer, primary_key=True, index=True)
    data_inceput = Column(DateTime, nullable=False)
    data_sfarsit = Column(DateTime, nullable=False)
