import pandas as pd
from sqlalchemy import create_engine, text

# Setările de conexiune
engine = create_engine("postgresql://postgres:ad12min34@localhost:5432/exam_scheduler")

# ======================
# 1. Creează toate tabelele cu noile denumiri
with engine.connect() as conn:
    conn.execute(text("""
        DROP TABLE IF EXISTS subgrupe, sali, cadre, facultati CASCADE;

        CREATE TABLE facultati (
            id SERIAL PRIMARY KEY,
            shortName VARCHAR(50),
            longName VARCHAR(255)
        );

        CREATE TABLE cadre (
            id SERIAL PRIMARY KEY,
            lastName VARCHAR(100),
            firstName VARCHAR(100),
            emailAddress VARCHAR(100),
            phoneNumber VARCHAR(20),
            facultyName VARCHAR(255),
            departmentName VARCHAR(255)
        );

        CREATE TABLE sali (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            shortName VARCHAR(50),
            buildingName VARCHAR(255),
            capacitate INTEGER,
            computers BOOLEAN
        );

        CREATE TABLE subgrupe (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50),
            facultyId INTEGER REFERENCES facultati(id),
            specializationShortName VARCHAR(255),
            studyYear INTEGER,
            groupName INTEGER,
            subgroupIndex VARCHAR(10),
            isModular BOOLEAN,
            orarId INTEGER
        );
    """))
    print("✔ Tabele create cu succes")

# ======================
# 2. Populează fiecare tabel cu date din CSV

def import_csv_to_table(filename, table_name, convert_bools=None):
    df = pd.read_csv(filename)

    if convert_bools:
        for col in convert_bools:
            if col in df.columns:  # Verifică existența coloanei
                df[col] = df[col].astype(bool)

    df.to_sql(table_name, engine, if_exists="append", index=False)
    print(f"✔ {table_name} populat cu {len(df)} rânduri")

# Facultati
import_csv_to_table("csv_output/facultati.csv", "facultati")

# Cadre
import_csv_to_table("csv_output/cadre.csv", "cadre")

# Sali
import_csv_to_table("csv_output/sali.csv", "sali", convert_bools=["computers"])

# Subgrupe
import_csv_to_table("csv_output/subgrupe.csv", "subgrupe", convert_bools=["isModular"])
