import pandas as pd
from sqlalchemy import create_engine, text

# Conexiune
engine = create_engine("postgresql://postgres:ad12min34@localhost:5432/exam_scheduler")

# 1. Creare tabele
with engine.connect() as conn:
    conn.execute(text("""
        DROP TABLE IF EXISTS subgrupe, sali, cadre, facultati, sefgrupe, admin, secretariat CASCADE;

        CREATE TABLE facultati (
            id SERIAL PRIMARY KEY,
            shortName VARCHAR(50),
            longName VARCHAR(255)
        );
        CREATE TABLE sefgrupe (
            id SERIAL PRIMARY KEY,
            lastName VARCHAR(100),
            firstName VARCHAR(100),
            emailAddress VARCHAR(100),
            phoneNumber VARCHAR(20),
            facultyName VARCHAR(255),
            departmentName VARCHAR(255),
            grupa VARCHAR(100),
            an INTEGER
        );
        CREATE TABLE admin (
            id SERIAL PRIMARY KEY,
            lastName VARCHAR(100),
            firstName VARCHAR(100),
            emailAddress VARCHAR(100),
            phoneNumber VARCHAR(20),
            facultyName VARCHAR(255),
            departmentName VARCHAR(255)
        );
        CREATE TABLE secretariat (
            id SERIAL PRIMARY KEY,
            lastName VARCHAR(100),
            firstName VARCHAR(100),
            emailAddress VARCHAR(100),
            phoneNumber VARCHAR(20),
            facultyName VARCHAR(255),
            departmentName VARCHAR(255)
        );
        CREATE TABLE cadre (
            id SERIAL PRIMARY KEY,
            lastName VARCHAR(100),
            firstName VARCHAR(100),
            emailAddress VARCHAR(100) UNIQUE,
            phoneNumber VARCHAR(20),
            facultyName VARCHAR(255),
            departmentName VARCHAR(255)
        );
        CREATE TABLE sali (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            shortName VARCHAR(50),
            buildingName VARCHAR(255),
            capacitate INTEGER,
            computers BOOLEAN
        );
        CREATE TABLE subgrupe (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50),
            facultyId INTEGER REFERENCES facultati(id) ON DELETE CASCADE,
            specializationShortName VARCHAR(255),
            studyYear INTEGER,
            groupName VARCHAR(50),
            subgroupIndex VARCHAR(10),
            isModular BOOLEAN,
            orarId INTEGER
        );
    """))
    print("✔ Tabele create cu succes")

# 2. Funcția de import CSV
def import_csv_to_table(filename, table_name, convert_bools=None):
    df = pd.read_csv(filename)

    # Curățare specifică
    if table_name == "facultati":
        df = df.dropna(subset=["shortName"])
    elif table_name == "cadre":
        df = df.dropna(subset=["lastName", "emailAddress"])
        df = df.drop_duplicates(subset=["emailAddress"])
    elif table_name == "sali":
        df = df.dropna(subset=["name"])
    elif table_name == "subgrupe":
        df = df[df["facultyId"].notna()]
        df = df[df["facultyId"] != 0]

    # Convertire booleene
    if convert_bools:
        for col in convert_bools:
            if col in df.columns:
                df[col] = df[col].astype(bool)

    # Golire tabel cu ordonare
    with engine.begin() as conn:
        if table_name == "facultati":
            conn.execute(text("DELETE FROM subgrupe;"))
        conn.execute(text(f"DELETE FROM {table_name};"))
        print(f"🧹 Tabelul {table_name} a fost golit")

    # Inserare
    df.to_sql(table_name, engine, if_exists="append", index=False)
    print(f"✔ {table_name} populat cu {len(df)} rânduri")

# 3. Apeluri import
import_csv_to_table("csv_output/facultati.csv", "facultati")
import_csv_to_table("csv_output/cadre.csv", "cadre")
import_csv_to_table("csv_output/sali.csv", "sali", convert_bools=["computers"])
import_csv_to_table("csv_output/subgrupe.csv", "subgrupe", convert_bools=["isModular"])
import_csv_to_table("csv_output/sefgrupe.csv", "sefgrupe")
import_csv_to_table("csv_output/admin.csv", "admin")
import_csv_to_table("csv_output/secretariat.csv", "secretariat")
