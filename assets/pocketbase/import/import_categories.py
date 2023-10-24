from typing import TypedDict, Optional
from dotenv import load_dotenv
import os
import json

load_dotenv()

pocketbase_url = os.getenv("POCKETBASE_URL")
pocketbase_user = os.getenv("POCKETBASE_USER")
pocketbase_password = os.getenv("POCKETBASE_PASSWORD")

print(f"Connecting to {pocketbase_url} as {pocketbase_user}...")

class Categorie(TypedDict):
    id: str
    name: str
    parent: Optional[str]
    equivalent: str


from pocketbase import PocketBase

# Initialize the client
client = PocketBase(pocketbase_url)

# Authenticate as admin (or as a regular user)
user_data = client.collection("users").auth_with_password(pocketbase_user, pocketbase_password)

# Data to be inputted
data = {
    "Direkter Brennstoffeinsatz": [
        "Bioethanol", "Heizöl (leicht & schwer)", "Erdgas", "Biogas", "Flüssiggas", "Deponiegas", 
        "Klärgas", "Klärschlamm", "Holz (Biomasse)", "Pellets", "Hackschnitzel", 
        "Strom (herkömmlich / erneuerbar)", "Wasserstoff ((herkömmlich / erneuerbar)", 
        "Steinkohle", "Braunkohle", "Solarwärme", "Umweltwärme", "Fern-/Nahwärme"
    ],
    "Kühlmittelverlust und Isoliergase": [
        "R134a", "R404A", "R407C", "R407F", "R449A", "R410A", "R422D", "R32", "R1234yf", 
        "R744", "R717", "R290", "R600a", "SF6"
    ],
    "Kraftstoffverbrauch Fuhrpark": [
        "Benzin", "Diesel", "Biodiesel", "Ladestrom", "CNG / LPG"
    ],
    "Raumwärme": [
        "Fern-/Nahwärme", "Raumwärme"
    ]
}

# Assuming there's a collection named "categories" for the data
for category, items in data.items():
    # First, create the main category
    main_entry = client.collection("categories").get_first_list_item(filter=f'name = "{category}"')

    if not main_entry:
        print("Error getting main category")
        exit(1)
        # create it
        # main_entry = client.collection("categories").create({"name": category})

    # Now, create the sub-categories
    for item in items:
        client.collection("categories").create({"name": item, "parent": main_entry.id})

print("Data inputted successfully!")
