import pandas as pd
import os

folder = "vizualizare_date"
output_folder = "csv_output"
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(folder):
    if (filename.endswith(".xlsx") or filename.endswith(".xls")) and not filename.startswith("~$"):
        excel_path = os.path.join(folder, filename)
        csv_filename = os.path.splitext(filename)[0] + ".csv"
        csv_path = os.path.join(output_folder, csv_filename)

        try:
            df = pd.read_excel(excel_path, engine="openpyxl")
            df.to_csv(csv_path, index=False)
            print(f"✔ Convertit: {filename} → {csv_filename}")
        except Exception as e:
            print(f"[✘] Eroare la fișierul {filename}: {e}")
