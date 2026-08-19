from typing import List

def group_orders(orders: List, truck_capacity: float) -> List[List]:
    direction_groups = {}
    for order in orders:
        key = (order.origin.lower(), order.destination.lower())
        if key not in direction_groups:
            direction_groups[key] = []
        direction_groups[key].append(order)

    groups = []
    for key, orders_list in direction_groups.items():
        current_group = []
        current_weight = 0.0
        for order in orders_list:
            if current_weight + order.weight_kg <= truck_capacity:
                current_group.append(order)
                current_weight += order.weight_kg
            else:
                if current_group:
                    groups.append(current_group)
                current_group = [order]
                current_weight = order.weight_kg
        if current_group:
            groups.append(current_group)
    return groups
