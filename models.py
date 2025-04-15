from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")

class Facultati(Base):
    __tablename__ = 'facultati'
    
    id = Column(Integer, primary_key=True, index=True)
    shortName = Column(String(50), unique=True, nullable=False)  # nume_prescurtat
    longName = Column(String(255))  # nume_deplin
    
    subgrupe = relationship("Subgrupe", back_populates="facultate")

class Cadre(Base):
    __tablename__ = 'cadre'
    
    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)  # nume
    firstName = Column(String(100))  # prenume
    emailAddress = Column(String(100), unique=True)  # email
    phoneNumber = Column(String(20))  # telefon
    facultyName = Column(String(255))  # facultate_nume
    departmentName = Column(String(255))  # departament_nume

class Sali(Base):
    __tablename__ = 'sali'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # nume
    shortName = Column(String(50))  # nume_prescurtat
    buildingName = Column(String(255))  # locatia
    capacitate = Column(Integer)  # capacitatea
    computers = Column(Boolean, default=False)  # calculatoare

class Subgrupe(Base):
    __tablename__ = 'subgrupe'
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50))
    facultyId = Column(Integer, ForeignKey('facultati.id'))  # id_facultate
    specializationShortName = Column(String(255))  # specializare
    studyYear = Column(Integer)  # anul_curent
    groupName = Column(Integer)  # numar_grupa
    subgroupIndex = Column(String(10))  # indice_grupa
    isModular = Column(Boolean, default=False)  # modular
    orarId = Column(Integer)  # orar_id
    
    facultate = relationship("Facultati", back_populates="subgrupe")
