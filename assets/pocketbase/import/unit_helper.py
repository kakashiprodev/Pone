
def to_si_unit(quantity, unit, direction="in"):
    """Converts the given quantity to SI units."""
    if direction == "out":
        if unit == "kWh":
            unit = "Wh"
            quantity *= 1000
        if unit == "MWh":
            unit = "Wh"
            quantity *= 1000000
        if unit == "to":
            unit = "kg"
            quantity *= 1000
        if unit == "Mto":
            unit = "kg"
            quantity *= 1000000

    if direction == "in":
        if unit == "kWh":
            unit = "Wh"
            quantity /= 1000
        if unit == "MWh":
            unit = "Wh"
            quantity /= 1000000
        if unit == "to":
            unit = "kg"
            quantity /= 1000
        if unit == "Mto":
            unit = "kg"
            quantity /= 1000000

    return quantity, unit