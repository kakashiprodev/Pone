import pandas as pd
import sys
from dotenv import load_dotenv
import os
from pocketbase import PocketBase

# Pfad zur Excel-Datei aus dem CMD Parametern
# py .\convert_xls.py "231192_CO2-Faktoren 2023.xlsx"
excel_file_path = sys.argv[1]
if not excel_file_path:
    raise ValueError('Kein Pfad zur Excel-Datei angegeben!')

# Simulation Modus
simulation_mode = True
if len(sys.argv) > 2 and sys.argv[2] == 'false':
    simulation_mode = False

# Lade Pocketbase Credentials aus .env Datei
load_dotenv()
pocketbase_url = os.getenv("POCKETBASE_URL")
pocketbase_user = os.getenv("POCKETBASE_USER")
pocketbase_password = os.getenv("POCKETBASE_PASSWORD")
if not pocketbase_url or not pocketbase_user or not pocketbase_password:
    raise ValueError('Pocketbase credentials not set!')


# Einlesen der Excel-Datei
df = pd.read_excel(excel_file_path)

# Füge eine Spalte "ID" hinzu und setze sie als Index. Der Index soll ein String sein.
df['ID'] = df.index.astype(str)

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

# Funktion zur Duplizierung von Zeilen mit "Alternative Einheit"
def duplicate_alternative_unit(row):
    duplicate_rows = []
    if row['Alternative Einheit'] != '':
        new_row = row.copy()
        new_row['Einheit Eingabe'] = row['Alternative Einheit']
        new_row['Einheit Ausgabe'] = row['Einheit Eingabe']
        new_row['Übergeordnet'] = row['ID']
        # neue temporäre ID
        new_row['ID'] = row['ID'] + '_1'
        duplicate_rows.append(new_row)
    return duplicate_rows

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
    'avgValue',
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
transformed_df['avgValue'] = None
transformed_df['monthlyValues'] = False
transformed_df['project'] = None


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
}

# Umbennenung einiger Spalten nach dem Schema db_schema
transformed_df.rename(columns=db_schema, inplace=True)

# Schreibe Output als JSON-Datei
if simulation_mode:
    transformed_df.to_json('output.json', orient='records', indent=2, force_ascii=False)
else:
    # Iteriere über alle Zeilen und füge sie in die Datenbank ein
    print(f"Connecting to {pocketbase_url} as {pocketbase_user}...")
    client = PocketBase(pocketbase_url, pocketbase_user, pocketbase_password)
    for _, row in transformed_df.iterrows():
        try:
            print(f"Creating entry for {row['id_tmp']}...")
            new_entry = client.collection("equivalents").create(obj)
            print(f"Created entry {new_entry.id} for {row['id_tmp']}")
            # Überschreibe die temporäre ID mit der ID aus der Datenbank
            old_id = row['id_tmp']
            row['id_tmp'] = new_entry.id
            # Überschreibe auch alle "parent" Einträge, die auf die alte ID verweisen
            transformed_df.loc[transformed_df['parent'] == old_id, 'parent'] = new_entry.id
        except Exception as e:
            print(f"Fehler beim Erstellen von {row['id_tmp']}: {e}")
            break
