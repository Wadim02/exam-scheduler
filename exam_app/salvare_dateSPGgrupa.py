import pandas as pd
import requests
import os
import time

def extrage_cursuri_unice_din_orar(
    excel_path="vizualizare_date/subgrupe.xlsx",
    output_path="vizualizare_date/discipline.xlsx"
):
    os.makedirs("vizualizare_date", exist_ok=True)

    try:
        df_ids = pd.read_excel(excel_path)
    except Exception as e:
        print(f"❌ Eroare la citirea fișierului Excel: {e}")
        return

    if "id" not in df_ids.columns:
        print("❌ Coloana 'id' nu există în fișierul Excel!")
        return

    id_subgrupe = df_ids["id"].dropna().astype(int).tolist()
    data = []

    for i, id_subgrupa in enumerate(id_subgrupe, 1):
        url = f"https://orar.usv.ro/orar/vizualizare/data/orarSPG.php?ID={id_subgrupa}&mod=grupa&json"
        print(f"🔄 ({i}/{len(id_subgrupe)}) Procesare ID: {id_subgrupa}")

        try:
            response = requests.get(url)
            response.raise_for_status()
            json_data = response.json()

            if not isinstance(json_data, list):
                print(f"⚠️ Răspuns invalid pentru ID {id_subgrupa}")
                continue

            for sublist in json_data:
                if isinstance(sublist, list):
                    for cls in sublist:
                        if isinstance(cls, dict) and cls.get("typeShortName") == "curs":
                            data.append({
                                "id": cls.get("id", ""),
                                "id_cadru": cls.get("teacherID", ""),
                                "id_subgrupa": id_subgrupa,
                                "topic": cls.get("topicLongName", "")
                            })
        except Exception as e:
            print(f"❌ Eroare la ID {id_subgrupa}: {e}")

        time.sleep(0.05)

    df = pd.DataFrame(data)

    # Eliminăm duplicatele după subgrupă + topic (păstrăm primul rând)
    df_unique = df.drop_duplicates(subset=["id_subgrupa", "topic"])
    df_unique.to_excel(output_path, index=False)

    print(f"\n✅ Fișierul cu **cursuri unice pe subgrupă** a fost salvat în: {output_path}")

# Executăm
extrage_cursuri_unice_din_orar()
