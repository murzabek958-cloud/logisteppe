def estimate_price(distance_km: float, weight_kg: float, cargo_type, month: int) -> float:
    base = distance_km * 120
    weight_coeff = 1 + (weight_kg / 10000)
    summer_coeff = 1.15 if month in [6, 7, 8] else 1.0
    perishable_coeff = 1.3 if str(cargo_type) in ["perishable", "CargoType.perishable"] else 1.0
    return round(base * weight_coeff * summer_coeff * perishable_coeff, 2)
