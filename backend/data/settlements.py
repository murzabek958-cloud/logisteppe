from sqlalchemy.orm import Session
from ..models import Settlement, RoadQuality

SETTLEMENTS = [
    {"name": "Ақтау",          "lat": 43.6519, "lng": 51.1972, "road_quality": RoadQuality.asphalt,  "distance_from_aktau_km": 0},
    {"name": "Жаңаөзен",       "lat": 43.3333, "lng": 52.8500, "road_quality": RoadQuality.asphalt,  "distance_from_aktau_km": 180},
    {"name": "Бейнеу",         "lat": 45.3167, "lng": 55.1000, "road_quality": RoadQuality.asphalt,  "distance_from_aktau_km": 350},
    {"name": "Шетпе",          "lat": 44.1667, "lng": 52.1333, "road_quality": RoadQuality.partial,  "distance_from_aktau_km": 160},
    {"name": "Үштаған",        "lat": 44.8333, "lng": 53.6667, "road_quality": RoadQuality.dirt,     "distance_from_aktau_km": 380},
    {"name": "Форт-Шевченко",  "lat": 44.5100, "lng": 50.2600, "road_quality": RoadQuality.asphalt,  "distance_from_aktau_km": 130},
    {"name": "Мұнайлы",        "lat": 43.7167, "lng": 52.1000, "road_quality": RoadQuality.partial,  "distance_from_aktau_km": 140},
    {"name": "Құрық",          "lat": 43.1833, "lng": 51.6500, "road_quality": RoadQuality.partial,  "distance_from_aktau_km": 95},
    {"name": "Жетібай",        "lat": 43.5833, "lng": 52.0833, "road_quality": RoadQuality.asphalt,  "distance_from_aktau_km": 60},
    {"name": "Саура",          "lat": 44.0000, "lng": 52.5000, "road_quality": RoadQuality.dirt,     "distance_from_aktau_km": 220},
]

def seed_settlements(db: Session) -> None:
    """DB-де Settlement жоқ болса, деректерді жүктейді. Idempotent."""
    if db.query(Settlement).count() > 0:
        return
    for data in SETTLEMENTS:
        db.add(Settlement(**data))
    db.commit()
    
