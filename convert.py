import pandas as pd
import os

folder = "vizualizare_date"

# Creează folderul "csv_output" pentru rezultate (opțional)
output_folder = "csv_output"
os.makedirs(output_folder, exist_ok=True)

# Iterează prin toate fișierele din folder
for filename in os.listdir(folder):
    if filename.endswith(".xlsx") or filename.endswith(".xls"):
        excel_path = os.path.join(folder, filename)
        csv_filename = os.path.splitext(filename)[0] + ".csv"
        csv_path = os.path.join(output_folder, csv_filename)

        # Citește Excel și scrie CSV
        df = pd.read_excel(excel_path)
        df.to_csv(csv_path, index=False)

        print(f"✔ Convertit: {filename} → {csv_filename}")
