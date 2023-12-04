import pandas as pd
import sys
from dotenv import load_dotenv
import os
from pocketbase import PocketBase
import json
import uuid

# Generiere eine eindeutige ID
def get_id():
    return str(uuid.uuid4())

if len(sys.argv) < 2:
    raise ValueError('Kein Pfad zur Excel-Datei angegeben!')

# Pfad zur Excel-Datei aus dem CMD Parametern
# py .\convert_xls.py "231192_CO2-Faktoren 2023.xlsx"
excel_file_path = sys.argv[1]
if not excel_file_path:
    raise ValueError('Kein Pfad zur Excel-Datei angegeben!')

# ermittle den ordner in dem sich die xls datei befindet
base_path = os.path.dirname(excel_file_path)

# Simulation Modus
simulation_mode = True
if len(sys.argv) > 2 and sys.argv[2] == 'false':
    simulation_mode = False

# Lösche alle Einträge in der Datenbank? Dann muss eine importRef angegeben sein
import_ref = get_id()
old_import_ref = None
if len(sys.argv) > 3:
    old_import_ref = sys.argv[3]

# Lade Pocketbase Credentials aus .env Datei
load_dotenv()
pocketbase_url = os.getenv("POCKETBASE_URL")
pocketbase_user = os.getenv("POCKETBASE_USER")
pocketbase_password = os.getenv("POCKETBASE_PASSWORD")
if not pocketbase_url or not pocketbase_user or not pocketbase_password:
    raise ValueError('Pocketbase credentials not set!')

def delete_all_equivalents():
    # Initialize the client
    client = PocketBase(pocketbase_url)
    # Authenticate as admin (or as a regular user)
    user_data = client.collection("users").auth_with_password(pocketbase_user, pocketbase_password)
    # Fetch first record from the "equivalents" collection
    entries = client.collection("equivalents").get_list(
        1, 1, {
            #'filter': 'status = true && created > "2022-08-01 10:00:00"'
            }
    )
    print(entries)
    # ListResult(page=1, per_page=500, total_items=997, total_pages=2, items=[<Record: 0or9fnm6vpc8sn2>])
    
    # Iteriere über alle Seiten
    page = 1
    while page <= entries.total_pages:
        # lösche immer seite 1. müsste auch so gehen...
        equivalents = client.collection("equivalents").get_list(1, 500)
        # Lösche alle Einträge
        for record in equivalents.items:
            print(f"Deleting entry {record.id}...")
            client.collection("equivalents").delete(record.id)
        page += 1


if not simulation_mode and old_import_ref is not None and old_import_ref != '':
    print("Deleting all entries in Pocketbase...")
    delete_all_equivalents()

print(f"Simulation mode: {simulation_mode}")

# Einlesen der Excel-Datei
df = pd.read_excel(excel_file_path)

# Füge eine Spalte "ID" hinzu und setze sie als Index. Der Index soll ein String sein.
# der Index wird mit uuid erzeugt, damit er eindeutig ist
df['ID'] = df.apply(lambda _: get_id(), axis=1)
df['importRef'] = import_ref

# Füge leere Spalten hinzu
df['Übergeordnet'] = None
df['Dupliziert'] = None

# Funktion zum Entfernen von "-"
def remove_hyphens(row):
    for col in row.index:
        if isinstance(row[col], str) and row[col] == '-':
            row[col] = ''
    return row

# Funktion zur Validierung und Transformation der Daten
def validate_and_transform(row):
    # Entfernen von unnötigen Leerzeichen und "-"
    row = remove_hyphens(row)
    
    # Validierung der Spalte "Scope"
    if row['Scope'] not in [1, 2, 3]:
        raise ValueError(f'Ungültiger Wert in Spalte "Scope": {row["Scope"]}')
    
    # Validierung der Mindestlängen
    min_length_columns = ['Kategorie', 'Einheit Eingabe', 'Einheit Ausgabe', 'Quelle']
    for col in min_length_columns:
        if len(row[col]) < 1:
            raise ValueError(f'Mindestlänge für Spalte "{col}" nicht erreicht: {row[col]}')
    
    return row

# Funktion zur Duplizierung von Zeilen mit "Alternative Bezeichnung" und "Äquivalent zu"
def duplicate_alternative_name(row):
    duplicate_rows = []
    for col in ['Alternative Bezeichnung', 'Äquivalent zu']:
        if row[col]:
            alternatives = row[col].split('\n')
            for alt in alternatives:
                new_row = row.copy()
                new_row['Spezifikation 1'] = alt
                new_row['Dupliziert'] = row['ID']
                duplicate_rows.append(new_row)
    return duplicate_rows

# Funktion zur Duplizierung von Zeilen mit "Alternative Einheit"
def duplicate_alternative_unit(row):
    duplicate_rows = []
    if row['Alternative Einheit'] != '':
        new_row = row.copy()
        new_row['Einheit Eingabe'] = row['Alternative Einheit']
        new_row['Einheit Ausgabe'] = row['Einheit Eingabe']
        new_row['Übergeordnet'] = row['ID']
        # neue temporäre ID
        new_row['ID'] = get_id()
        duplicate_rows.append(new_row)
    return duplicate_rows

# Anwendung der Transformation
df = df.apply(validate_and_transform, axis=1)

# Duplikationslogik
all_rows = []
for _, row in df.iterrows():
    all_rows.append(row)
    all_rows.extend(duplicate_alternative_unit(row))
    all_rows.extend(duplicate_alternative_name(row))

# Erstellung eines neuen DataFrame aus den transformierten Daten
transformed_df = pd.DataFrame(all_rows)

# Verwerfe unnötige Spalten
columns_to_drop = ['Alternative Einheit', 'Umrechnungsfaktor', 'Alternative Bezeichnung', 'Äquivalent zu']
transformed_df.drop(columns=columns_to_drop, inplace=True)

# Füge nötige Spalten mit None hinzu
cols_to_add_with_none = [
    'project',
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
]
cols_to_add_with_False = [
    'monthlyValues',
]
for col in cols_to_add_with_none:
    transformed_df[col] = None
for col in cols_to_add_with_False:
    transformed_df[col] = False

# Definition des Zielschemas
db_schema = {
    'ID': 'id_tmp',
    'Scope': 'scope',
    'Kategorie': 'category',
    'Spezifikation 1': 'specification1',
    'Spezifikation 2': 'specification2',
    'Spezifikation 3': 'specification3',
    'Alternativer Name': 'addName1',
    'Bemerkung': 'comment',
    'Einheit Eingabe': 'in',
    'Einheit Ausgabe': 'out',
    'Quelle': 'source',
    'Übergeordnet': 'parent',
    'Quelle': 'source',
    'Dupliziert': 'duplicated_tmp',
    'Faktor': 'avgValue',
}

# Umbennenung einiger Spalten nach dem Schema db_schema
transformed_df.rename(columns=db_schema, inplace=True)

# Schreibe Output als JSON-Datei in base_path
if simulation_mode:
    print("Schreiben der JSON-Datei mit " + str(len(transformed_df)) + " Einträgen nach " + base_path + "/factors.json")
    transformed_df.to_json(base_path + '/factors.json', orient='records', indent=2, force_ascii=False)

else:
    created_entries = []
    # Iteriere über alle Zeilen und füge sie in die Datenbank ein
    print(f"Connecting to {pocketbase_url} as {pocketbase_user}...")
    # Initialize the client
    client = PocketBase(pocketbase_url)
    # Authenticate as admin (or as a regular user)
    user_data = client.collection("users").auth_with_password(pocketbase_user, pocketbase_password)

    # create all main entries
    count = 0
    max_count = 9999
    for _, row in transformed_df.iterrows():
        if (row['parent'] is None or row['parent'] == '') and count < max_count:
            try:
                print(f"Creating entry for {row['id_tmp']}...")
                print(row.to_dict())
                new_entry = client.collection("equivalents").create(row.to_dict())
                print(f"Created entry {new_entry.id} for {row['id_tmp']}")                
                old_id = row['id_tmp']

                # Überschreibe die temporäre ID mit der ID aus der Datenbank                
                transformed_df.loc[transformed_df['id_tmp'] == old_id, 'id_tmp'] = new_entry.id
                # Überschreibe auch alle "parent" Einträge, die auf die alte ID verweisen und gebe diese auf der Konsole aus
                transformed_df.loc[transformed_df['parent'] == old_id, 'parent'] = new_entry.id

                # füge neue id in liste der neuen einträge ein
                created_entries.append(new_entry.id)
                count += 1
            except Exception as e:
                print(f"Fehler beim Erstellen von {row['id_tmp']}: {e}")
                break

    # create all sub entries
    count = 0
    max_count = 5
    for _, row in transformed_df.iterrows():
        if (row['parent'] is not None and row['parent'] != ''):
            try:
                print(f"Creating sub-entry for {row['id_tmp']}...")
                print(row.to_dict())
                new_entry = client.collection("equivalents").create(row.to_dict())
                print(f"Created entry {new_entry.id} for {row['id_tmp']}")                
                old_id = row['id_tmp']
                # Überschreibe die temporäre ID mit der ID aus der Datenbank                
                transformed_df.loc[transformed_df['id_tmp'] == old_id, 'id_tmp'] = new_entry.id
                # Überschreibe auch alle "parent" Einträge, die auf die alte ID verweisen und gebe diese auf der Konsole aus
                transformed_df.loc[transformed_df['parent'] == old_id, 'parent'] = new_entry.id
                # füge neue id in liste der neuen einträge ein
                created_entries.append(new_entry.id)                
            except Exception as e:
                print(f"Fehler beim Erstellen von {row['id_tmp']}: {e}")
                break

    # schreib die json datei mit den neuen ids
    transformed_df.to_json(base_path + '/factors.json', orient='records', indent=2, force_ascii=False)

    # schreibe eine formatierte JSON datei mit den neuen IDs (created_entries) mit der json library
    with open(base_path + '/created_entries.json', 'w') as outfile:
        outfile.write(json.dumps(created_entries, indent=2))
