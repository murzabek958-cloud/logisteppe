DISTANCES = {
    ("ақтау", "жаңаөзен"): {"km": 180, "quality": "asphalt"},
    ("жаңаөзен", "ақтау"): {"km": 180, "quality": "asphalt"},
    ("ақтау", "бейнеу"): {"km": 350, "quality": "asphalt"},
    ("бейнеу", "ақтау"): {"km": 350, "quality": "asphalt"},
    ("ақтау", "шетпе"): {"km": 160, "quality": "partial"},
    ("шетпе", "ақтау"): {"km": 160, "quality": "partial"},
    ("ақтау", "форт-шевченко"): {"km": 130, "quality": "asphalt"},
    ("форт-шевченко", "ақтау"): {"km": 130, "quality": "asphalt"},
    ("жаңаөзен", "бейнеу"): {"km": 280, "quality": "asphalt"},
    ("бейнеу", "жаңаөзен"): {"km": 280, "quality": "asphalt"},
    ("бейнеу", "үштаған"): {"km": 120, "quality": "dirt"},
    ("үштаған", "бейнеу"): {"km": 120, "quality": "dirt"},
    ("шетпе", "үштаған"): {"km": 90, "quality": "dirt"},
    ("үштаған", "шетпе"): {"km": 90, "quality": "dirt"},
    ("ақтау", "мұнайлы"): {"km": 140, "quality": "partial"},
    ("мұнайлы", "ақтау"): {"km": 140, "quality": "partial"},
}

SPEED = {"asphalt": 90, "partial": 60, "dirt": 40}

def calculate_route(origin: str, destination: str, cargo_type, temp_celsius: float) -> dict:
    key = (origin.lower(), destination.lower())
    route = DISTANCES.get(key)
    warnings = []

    if not route:
        return {"distance_km": 200, "estimated_hours": 3.0, "road_quality": "unknown", "warnings": ["Маршрут табылмады"]}

    quality = route["quality"]
    distance_km = route["km"]

    if str(cargo_type) in ["perishable", "CargoType.perishable"] and temp_celsius > 40:
        warnings.append("Ыстық! Тез бұзылатын жүк — тек асфальт жол қолданыңыз")
        if quality != "asphalt":
            warnings.append("ҚАУІП: Жол сапасы жеткіліксіз тез бұзылатын жүк үшін")

    if temp_celsius > 45:
        warnings.append("Экстремалды ыстық +45°C — жүргізушіге су мен демалыс қажет")

    speed = SPEED.get(quality, 60)
    estimated_hours = round(distance_km / speed, 2)
    fuel_cost = round(distance_km * 0.35 * 600, 0)

    return {
        "distance_km": distance_km,
        "estimated_hours": estimated_hours,
        "road_quality": quality,
        "fuel_cost_tenge": fuel_cost,
        "warnings": warnings
    }
