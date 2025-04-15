import requests
import pandas as pd
import os

# Fetch the JSON data
url = "https://orar.usv.ro/orar/vizualizare/data/orarSPG.php?ID=723&mod=prof&json"
response = requests.get(url)

# Parse the JSON content
data = response.json()

# Prepare the data for Excel
schedule_data = []
for entry in data[0]:  # Assuming schedule data is in the first list
    schedule_data.append({
        "id": entry["id"],
        "typeShortName": entry["typeShortName"],
        "teacher": f"{entry['teacherFirstName']} {entry['teacherLastName']}",
        "room": entry["roomLongName"],
        "topic": entry["topicLongName"],
        "day": entry["weekDay"],
        "startHour": entry["startHour"],
        "duration": entry["duration"]
    })

# Convert the data into a DataFrame
df = pd.DataFrame(schedule_data)

# Create folder if it doesn't exist
os.makedirs("vizualizare_date", exist_ok=True)

# Save the DataFrame to an Excel file in the specified folder
df.to_excel("vizualizare_date/orar_dataSPGprof.xlsx", index=False)

print("Data saved to vizualizare_date/schedule_data.xlsx")
