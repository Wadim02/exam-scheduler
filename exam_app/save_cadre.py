import requests
import pandas as pd
import os

def descarca_cadre_si_salveaza_excel(folder='vizualizare_date', filename='cadre.xlsx'):
    url = "https://orar.usv.ro/orar/vizualizare/data/cadre.php?json"
    output_file = os.path.join(folder, filename)

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        df = pd.DataFrame(data)

        # 🧹 Eliminăm înregistrările fără prenume sau nume
        df = df[df['lastName'].notna() & df['firstName'].notna()]
        df['lastName'] = df['lastName'].str.strip()
        df['firstName'] = df['firstName'].str.strip()
        df = df[(df['lastName'] != '') & (df['firstName'] != '')]

        # 🔢 Sortăm alfabetic după nume de familie și prenume
        df = df.sort_values(by=['lastName', 'firstName'])

        # 🧽 Resetăm indexul
        df.reset_index(drop=True, inplace=True)

        # 🗂️ Salvăm doar coloanele relevante
        coloane_de_pasat = ['id', 'lastName', 'firstName', 'emailAddress', 'phoneNumber', 'facultyName', 'departmentName']
        df = df[coloane_de_pasat]

        os.makedirs(folder, exist_ok=True)
        df.to_excel(output_file, index=False)

        print(f"✅ Fișierul cu cadre a fost salvat în: {output_file}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Eroare la descărcare: {e}")
    except Exception as e:
        print(f"❌ Eroare generală: {e}")

# Executăm funcția
descarca_cadre_si_salveaza_excel()
