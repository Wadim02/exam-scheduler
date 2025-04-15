import os
import requests
import pandas as pd
from urllib.parse import urlparse, parse_qs

# Funcția care procesează URL-uri JSON și salvează fiecare într-un fișier Excel separat
def proceseaza_urluri_json_in_excel(urluri_json, folder_output='vizualizare_date'):
    # Verificăm dacă folderul de output există, altfel îl creăm
    if not os.path.exists(folder_output):
        os.makedirs(folder_output)

    # Procesăm fiecare URL JSON
    for url in urluri_json:
        try:
            # Descărcăm fișierul JSON de la URL
            response = requests.get(url)
            
            # Verificăm dacă cererea a fost cu succes
            if response.status_code == 200:
                data = response.json()

                # Normalizăm JSON-ul într-un DataFrame Pandas, gestionând structuri imbricate
                df = pd.json_normalize(data, sep='_')  # Folosim un separator pentru a aplatiza structurile

                # Extragem numele fișierului din URL pentru a-l folosi în numele fișierului Excel
                url_parsed = urlparse(url)
                base_name = url_parsed.path.split('/')[-1].replace('.php', '')  # Exemplu: 'cadre', 'sali'
                
                # Extragem parametrii din URL pentru a-i adăuga la numele fișierului
                params = parse_qs(url_parsed.query)
                if 'ID' in params:
                    id_value = params['ID'][0]  # Extragerea valorii ID
                    base_name += f"_{id_value}"  # Adăugăm ID-ul la numele fișierului
                if 'mod' in params:
                    mod_value = params['mod'][0]  # Extragerea valorii mod
                    base_name += f"_{mod_value}"  # Adăugăm mod la numele fișierului

                # Creăm calea completă pentru fișierul Excel de output
                excel_file_path = os.path.join(folder_output, f'{base_name}.xlsx')
                
                # Salvăm datele într-un fișier Excel
                df.to_excel(excel_file_path, index=False)
                print(f"Fișierul Excel pentru {base_name} a fost salvat în: {excel_file_path}")
            else:
                print(f"Nu s-a putut obține fișierul de la URL-ul {url}. Status cod: {response.status_code}")
        
        except Exception as e:
            print(f"Nu s-a putut procesa URL-ul {url}: {e}")
            continue

# Exemplu de utilizare a funcției
urluri_json = [
    'https://orar.usv.ro/orar/vizualizare/data/cadre.php?json',
    'https://orar.usv.ro/orar/vizualizare/data/sali.php?json',
    'https://orar.usv.ro/orar/vizualizare/data/facultati.php?json',
    'https://orar.usv.ro/orar/vizualizare/data/subgrupe.php?json'
    ]

# Apelăm funcția pentru a procesa URL-urile JSON
proceseaza_urluri_json_in_excel(urluri_json)
