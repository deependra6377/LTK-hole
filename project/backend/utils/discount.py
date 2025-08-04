def calculate_discount(hole_area_mm2: float) -> str:
    if hole_area_mm2 < 10:
        return "5%"
    elif hole_area_mm2 < 30:
        return "10%"
    else:
        return "20%"