import csv

# Öffne die CSV-Datei zum Lesen
with open('equivalents.csv', mode='r', newline='', encoding='utf-8') as csv_file:
    # Öffne die SQL-Datei zum Schreiben
    with open('update_script.sql', mode='w', newline='', encoding='utf-8') as sql_file:
        # Erstelle einen CSV-Reader, der Semikolon als Trennzeichen verwendet
        csv_reader = csv.reader(csv_file, delimiter=';')
        # Überspringe die Kopfzeile
        next(csv_reader)
        
        # Iteriere über jede Zeile in der CSV-Datei
        for row in csv_reader:
            # Extrahiere die benötigten Werte
            specification1 = row[3]  # Spalte 4
            specification2 = row[4]  # Spalte 5
            specification3 = row[5]  # Spalte 6
            value_to_update = row[11]  # Spalte 12
            source = row[10] # Spalte 11
            scope = row[1] # Spalte 2
            category = row[2] # Spalte 3
            unit_in = row[8] # Spalte 9
            unit_out = row[9] # Spalte 10
            
            # Erstelle den SQL-Update-Befehl
            sql_update = f'''UPDATE data.equivalents SET avg_value = {value_to_update} WHERE specification1 = '{specification1}' AND specification2 = '{specification2}' AND specification3 = '{specification3}' AND source = '{source}' AND scope = {scope} AND category = '{category}' AND "in" = '{unit_in}' AND "out" = '{unit_out}';\r\n'''
            
            # Schreibe den SQL-Befehl in die Datei
            sql_file.write(sql_update)
