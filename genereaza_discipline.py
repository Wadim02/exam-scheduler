import pandas as pd
import os
import re

from pathlib import Path

# Foldere
orar_folder = "orar_csv"  # aici sunt fișierele Excel orar_dataSPGgrupa<ID>.xlsx
cadre_csv = "csv_output/cadre.csv"
output_file = "csv_output/discipline.csv"

# Încarcă cadrele didactice
df_cadre = pd.read_csv(cadre_csv)
df_cadre["full_name"] = df_cadre["lastName"].str.strip() + " " + df_cadre["firstName"].str.strip()

discipline_rows = []
next_id = 1

# Parcurge fișierele Excel din folder
for filename in os.listdir(orar_folder):
    match = re.match(r"orar_dataSPGgrupa(\d+)\.xlsx", filename)
    if not match:
        continue

    id_subgrupa = int(match.group(1))
    file_path = os.path.join(orar_folder, filename)

    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        print(f"[✘] Eroare la fișierul {filename}: {e}")
        continue

    for _, row in df.iterrows():
        teacher_name = str(row["Teacher"]).strip()
        topic = str(row["Topic"]).strip()

        cadru = df_cadre[df_cadre["full_name"].str.lower() == teacher_name.lower()]
        if cadru.empty:
            print(f"[!] Profesorul '{teacher_name}' nu a fost găsit. Ignorat.")
            continue

        id_cadru = int(cadru.iloc[0]["id"])

        discipline_rows.append({
            "id": next_id,
            "topic": topic,
            "id_cadru": id_cadru,
            "id_subgrupa": id_subgrupa
        })
        next_id += 1

# Exportă în CSV
df_discipline = pd.DataFrame(discipline_rows)
df_discipline.to_csv(output_file, index=False)
print(f"✔ Discipline generate: {len(df_discipline)} rânduri → {output_file}")
