import requests
import pandas as pd
import os

def descarca_sali_si_salveaza_excel(folder='vizualizare_date', filename='sali.xlsx'):
    url = "https://orar.usv.ro/orar/vizualizare/data/sali.php?json"
    output_file = os.path.join(folder, filename)

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        df = pd.DataFrame(data)

        # 🧹 Opțional: eliminăm săli fără nume (dacă există)
        df = df[df['name'].notna() & (df['name'].str.strip() != "")]

        # 🔢 Sortăm după denumirea sălii
        df = df.sort_values(by='name')

        os.makedirs(folder, exist_ok=True)
        df.to_excel(output_file, index=False)

        print(f"✅ Fișierul cu săli a fost salvat în: {output_file}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Eroare la descărcare: {e}")
    except Exception as e:
        print(f"❌ Eroare generală: {e}")

# Executăm funcția
descarca_sali_si_salveaza_excel()
