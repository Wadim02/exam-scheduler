import pandas as pd
from sqlalchemy import create_engine, text

# Conexiune la baza de date
engine = create_engine("postgresql://postgres:ad12min34@localhost:5432/exam_scheduler")
with engine.begin() as conn:
    print("🧹 Golesc datele existente...")
    conn.execute(text("DELETE FROM propuneri_examene;"))
    conn.execute(text("DELETE FROM subgrupe_discipline;"))
    conn.execute(text("DELETE FROM discipline;"))
    conn.execute(text("DELETE FROM sefgrupe;"))
    conn.execute(text("DELETE FROM subgrupe;"))
    conn.execute(text("DELETE FROM cadre;"))
    conn.execute(text("DELETE FROM sali;"))
    conn.execute(text("DELETE FROM facultati;"))
    conn.execute(text("DELETE FROM admin;"))
    conn.execute(text("DELETE FROM secretariat;"))
    conn.execute(text("DELETE FROM discipline;"))
    print("✔ Tabele golite.")
# Configurație per tabel: numele coloanelor acceptate
TABLE_COLUMNS = {
    "facultati": ["id", "shortName", "longName"],
    "sali": ["id", "name", "shortName", "buildingName"],
    "subgrupe": ["id", "facultyId", "studyYear", "groupName", "subgroupIndex"],
    "cadre": ["id", "lastName", "firstName", "emailAddress", "phoneNumber", "facultyName", "departmentName"],
    "sefgrupe": ["id", "lastName", "firstName", "emailAddress", "phoneNumber", "id_facultate", "id_subgrupe"],
    "admin": ["id", "lastName", "firstName", "emailAddress", "phoneNumber", "facultyName", "departmentName"],
    "secretariat": ["id", "lastName", "firstName", "emailAddress", "phoneNumber", "facultyName", "departmentName"],
    "discipline": ["id", "id_cadru", "id_subgrupa", "topic"],
}

# Funcție de import sigur
def safe_import_csv(file_path, table_name):
    try:
        # Citește doar coloanele permise
        valid_cols = TABLE_COLUMNS[table_name]
        df = pd.read_csv(file_path, usecols=lambda col: col in valid_cols)

        # Inserare
        df.to_sql(table_name, engine, index=False, if_exists="append")
        print(f"✔ Import reușit: {table_name} ({len(df)} rânduri)")

    except Exception as e:
        print(f"[✘] Eroare la importul {file_path} → {table_name}: {e}")

# Lista fișierelor și tabelului asociat
import_list = [
    ("csv_output/facultati.csv", "facultati"),
    ("csv_output/sali.csv", "sali"),
    ("csv_output/subgrupe.csv", "subgrupe"),
    ("csv_output/cadre.csv", "cadre"),
    ("csv_output/sefgrupe.csv", "sefgrupe"),
    ("csv_output/admin.csv", "admin"),
    ("csv_output/secretariat.csv", "secretariat"),
    ("csv_output/discipline.csv", "discipline"),
]

# Execuție import
for filepath, table in import_list:
    safe_import_csv(filepath, table)
