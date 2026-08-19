from datetime import datetime
from typing import List

def find_backhaul(carrier_destination: str, carrier_return_time: datetime) -> List[dict]:
    mock_orders = [
        {"id": 101, "origin": "Бейнеу", "destination": "Ақтау", "weight_kg": 2000},
        {"id": 102, "origin": "Жаңаөзен", "destination": "Ақтау", "weight_kg": 1500},
        {"id": 103, "origin": "Шетпе", "destination": "Ақтау", "weight_kg": 3000},
    ]
    return [o for o in mock_orders if o["origin"].lower() == carrier_destination.lower()]
