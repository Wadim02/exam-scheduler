"""
Data model definitions for the ExamScheduler application using SQLAlchemy ORM.
Each class represents a table in the PostgreSQL database.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

# Base class for all ORM models
Base = declarative_base()

class Faculty(Base):
    """
    Model for faculties. Each faculty can have multiple subgroups.
    """
    __tablename__ = 'faculties'

    id = Column(Integer, primary_key=True, index=True)
    shortName = Column(String(50), unique=True, nullable=False)  # Ex: "FIESC"
    longName = Column(String(255))  # Full faculty name

    # 1:M relationship with subgroups
    subgroups = relationship("Subgroup", back_populates="faculty")

class Professor(Base):
    """
    Model for teaching staff / professors.
    """
    __tablename__ = 'professors'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    facultyName = Column(String(255))
    departmentName = Column(String(255))

class Secretariat(Base):
    """
    Model for secretariat employees.
    """
    __tablename__ = 'secretariat'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    facultyName = Column(String(255))
    departmentName = Column(String(255))

class GroupLeader(Base):
    """
    Model for group leaders (students with a special administrative role).
    """
    __tablename__ = 'group_leaders'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    faculty_id = Column(Integer, ForeignKey('faculties.id'))
    subgroup_id = Column(Integer, ForeignKey('subgroups.id'))

    faculty = relationship("Faculty")
    subgroup = relationship("Subgroup")

class Admin(Base):
    """
    Model for users with an administrator role.
    """
    __tablename__ = 'admins'

    id = Column(Integer, primary_key=True, index=True)
    lastName = Column(String(100), nullable=False)
    firstName = Column(String(100))
    emailAddress = Column(String(100), unique=True)
    phoneNumber = Column(String(20))
    facultyName = Column(String(255))
    departmentName = Column(String(255))

class Room(Base):
    """
    Model for rooms available for exams.
    """
    __tablename__ = 'rooms'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # Full room name
    shortName = Column(String(50))  # Ex: "D014"
    buildingName = Column(String(255))  # Ex: "Building D"
    
class Subgroup(Base):
    """
    Model for student subgroups.
    """
    __tablename__ = 'subgroups'
    id = Column(Integer, primary_key=True, index=True)
    facultyId = Column(Integer, ForeignKey('faculties.id'))
    studyYear = Column(Integer)
    groupName = Column(String(50))
    subgroupIndex = Column(String(10))

    faculty = relationship("Faculty", back_populates="subgroups")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professors.id"))
    subgroup_id = Column(Integer, ForeignKey("subgroups.id"))
    topic = Column(String, nullable=False)

    professor = relationship("Professor", backref="subjects")
    subgroup = relationship("Subgroup", backref="subjects")


class ExamProposal(Base):
    """
    Model for exam proposals submitted by group leaders.
    """
    __tablename__ = "exam_proposals"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    group_leader_id = Column(Integer, ForeignKey("group_leaders.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)
    status = Column(String, default="submitted")  # Options: submitted, approved, rejected
    rejection_reason = Column(Text, nullable=True)
    assistant_id = Column(Integer, ForeignKey("professors.id"), nullable=True)

    # Relationships
    assistant = relationship("Professor", foreign_keys=[assistant_id])
    subject = relationship("Subject", backref="proposals")
    group_leader = relationship("GroupLeader", backref="proposals")
    room = relationship("Room", backref="proposals")
class ExamLimits(Base):
    """
    Model for defining exam session start and end dates.
    """
    __tablename__ = "exam_limits"

    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)