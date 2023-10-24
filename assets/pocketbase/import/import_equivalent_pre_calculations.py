from dotenv import load_dotenv
import os
from pocketbase import PocketBase
from unit_helper import to_si_unit

load_dotenv()

pocketbase_url = os.getenv("POCKETBASE_URL")
pocketbase_user = os.getenv("POCKETBASE_USER")
pocketbase_password = os.getenv("POCKETBASE_PASSWORD")

print(f"Connecting to {pocketbase_url} as {pocketbase_user}...")
# Initialize the client
client = PocketBase(pocketbase_url)
# Authenticate as admin (or as a regular user)
user_data = client.collection("users").auth_with_password(pocketbase_user, pocketbase_password)

# example to find an entry by name
# some_entry = client.collection("my-collection").get_first_list_item(filter=f'name = "{name}"')

# example to create an entry
# new_entry = client.collection("my-collection").create(some_oject)

# database description:
"""
name: <name>
year: <year>
jan: 0.0
feb: 0.0
mar: 0.0
apr: 0.0
may: 0.0
jun: 0.0
jul: 0.0
aug: 0.0
sep: 0.0
oct: 0.0
nov: 0.0
dec: 0.0
avgValue: <resulting factor>
monthlyValues: false
parent: <the found main factor>
source: <reference id to source>
in: <unit that goes in>
out: <unit that goes out>
project: None
"""

# data as CSV
# all units must be converted to SI units which is: kg, Wh, l, Nm³
# 1 kWh == 1000 Wh
# 1 MWh == 1000000 Wh
# 1 to == 1000 kg
# 1 Mto == 1000000 kg

data = """
Name	Umrechnung
Rohbenzin	9,02 kWh/l
Biodiesel	9,96 kWh/l
Bioethanol	7,40 kWh/kg
Diesel	9,96 kWh/l
Heizöl leicht	9,94 kWh/l
Heizöl schwer	10,90 kWh/l
Erdgas	9,77 kWh/Nm³
Biogas	6,00 kWh/Nm³
Flüssiggas	12,77 kWh/kg
Deponiegas	5,00 kWh/Nm³
Biomasse Holz	4,07 kWh/kg
Pellets	4,80 kWh/kg
Hackschnitzel	4,00 kWh/kg
Wasserstoff	33,00 kWh/kg
Wasserstoff (Erneuerbare Quelle)	33,00 kWh/kg
Steinkohle	8,36 kWh/kg
Braunkohle	2,51 kWh/kg
"""

# example:
"""
Rohbenzin	9,02 kWh/l
will result in:
{
    "name": "Rohbenzin",
    "in": "l",
    "out": "Wh",
    "avgValue": 9020.0,
    "parent": <found factor with name="Rohbenzin" and parent = None since that will be the main factor>,
}
"""

# static values:
monthlyValues = False
project = None
year = 2022
source = client.collection("sources").get_first_list_item(filter=f'name = "Bafa V2"')
if not source:
    print("Error getting source")
    exit(1)

# logic
""" HERE GOES THE CODE """
# Split the data into lines
lines = data.strip().split("\n")

# Skip the header row
entries = lines[1:]

# Iterate over each entry and process it
for entry in entries:
    # Split entry 
    name, conversion = entry.split("\t")
    quantity, combined_unit = conversion.split()
    unit_out, unit_in = combined_unit.split('/')
    
    # Convert the units to SI units
    # replace comma with dot
    print(f"Processing {quantity}...")
    quantity = quantity.replace(",", ".")
    quantity = float(quantity)
    
    print(f"Unit in: {unit_in}, Unit out: {unit_out}, for {quantity}")

    # transform units
    quantity, unit_in = to_si_unit(quantity, unit_in, "in")
    quantity, unit_out = to_si_unit(quantity, unit_out, "out")

    print(f"Results in: Unit in: {unit_in}, Unit out: {unit_out}, for {quantity}")

    # try to find the parent
    print(f"Trying to find parent for {name}...")
    parent = client.collection("equivalents").get_first_list_item(filter=f'name = "{name}" && parent = null')
    if not parent:
        print("Error getting parent for " + name)
        continue
        
    # Create the object to be inserted into the database
    obj = {
        "name": name,
        "in": unit_in,
        "out": unit_out,
        "avgValue": quantity,
        "monthlyValues": monthlyValues,
        "parent": parent.id,
        "source": source.id,
        "year": year,
        "project": project,
        "jan": 0.0,
        "feb": 0.0,
        "mar": 0.0,
        "apr": 0.0,
        "may": 0.0,
        "jun": 0.0,
        "jul": 0.0,
        "aug": 0.0,
        "sep": 0.0,
        "oct": 0.0,
        "nov": 0.0,
        "dec": 0.0,
    }
    
    # Insert the object into the database
    print(f"Creating entry for {name}...")
    print(obj)
    new_entry = client.collection("equivalents").create(obj)
    print(f"Created entry {new_entry.id} for {name}")


# finish
print("Data inputted successfully!")