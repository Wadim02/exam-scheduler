import requests
import pandas as pd
import os

def descarca_facultati_si_salveaza_excel(folder='vizualizare_date', filename='facultati.xlsx'):
    url = "https://orar.usv.ro/orar/vizualizare/data/facultati.php?json"
    output_file = os.path.join(folder, filename)

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        df = pd.DataFrame(data)

        # 🧹 Eliminăm înregistrările fără longName (nume complet)
        df = df[df['longName'].notna()]
        df['longName'] = df['longName'].str.strip()
        df = df[df['longName'] != '']

        # 🔢 Sortăm după longName
        df = df.sort_values(by='longName')

        # 🧽 Resetăm indexul
        df.reset_index(drop=True, inplace=True)

        # 🗂️ Selectăm doar coloanele relevante
        df = df[['id', 'shortName', 'longName']]

        os.makedirs(folder, exist_ok=True)
        df.to_excel(output_file, index=False)

        print(f"✅ Fișierul cu facultăți a fost salvat în: {output_file}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Eroare la descărcare: {e}")
    except Exception as e:
        print(f"❌ Eroare generală: {e}")

# Executăm funcția
descarca_facultati_si_salveaza_excel()
