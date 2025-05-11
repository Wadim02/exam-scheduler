import requests
import pandas as pd
import json

# URL provided by the user
url = "https://orar.usv.ro/orar/vizualizare/data/orarSPG.php?ID=938&mod=grupa&json"

# Send a request to fetch the data
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Load JSON data
    data = response.json()
    
    # Initialize lists to store processed data
    processed_data = []

    # Process the first part of the JSON (class data)
    class_data = data[0]
    for class_info in class_data:
        processed_data.append({
            "ID": class_info.get("id"),
            "Type": class_info.get("typeLongName"),
            "Teacher": f"{class_info.get('teacherFirstName')} {class_info.get('teacherLastName')}",
            "Room": class_info.get("roomShortName"),
            "Topic": class_info.get("topicLongName"),
            "WeekDay": class_info.get("weekDay"),
            "StartHour": class_info.get("startHour"),
            "Duration": class_info.get("duration"),
            "Parity": class_info.get("parity"),
            "OtherInfo": class_info.get("otherInfo")
        })

    # Convert the processed data into a DataFrame
    df = pd.DataFrame(processed_data)

    # Process the second part of the JSON (additional metadata, like year)
    metadata = data[1]
    for class_id, info in metadata.items():
        df.loc[df['ID'] == class_id, 'AdditionalInfo'] = ', '.join(info)
    
    # Save the DataFrame to an Excel file
    excel_path = "vizualizare_date/orar_dataSPGgrupa938.xlsx"
    df.to_excel(excel_path, index=False, engine="openpyxl")
    
    print(f"Data saved to {excel_path}")
else:
    print("Failed to fetch data from the URL")
