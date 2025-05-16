import requests
import pandas as pd
import os

def descarca_subgrupe_si_salveaza_excel(folder='vizualizare_date', filename='subgrupe.xlsx'):
    url = "https://orar.usv.ro/orar/vizualizare/data/subgrupe.php?json"
    output_file = os.path.join(folder, filename)

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        df = pd.DataFrame(data)

        # 🧹 Eliminăm explicit rândul în care id == 0 și groupName este gol sau null
        df = df[~((df['id'] == "0") & (df['groupName'].isnull() | (df['groupName'] == "")))]

        # 🔢 Sortăm pentru lizibilitate
        df = df.sort_values(by=['specializationShortName', 'studyYear', 'groupName', 'subgroupIndex'])

        os.makedirs(folder, exist_ok=True)
        df.to_excel(output_file, index=False)

        print(f"✅ Fișier salvat în: {output_file}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Eroare la descărcare: {e}")
    except Exception as e:
        print(f"❌ Eroare generală: {e}")

# Executăm funcția
descarca_subgrupe_si_salveaza_excel()
