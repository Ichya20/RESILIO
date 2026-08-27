from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Resilio AI Predictive Microservice")

class PredictionRequest(BaseModel):
    disaster_type: str
    affected_population: int
    severity_level: int

@app.post("/api/v1/predict-logistics")
def predict_logistics(req: PredictionRequest):
    # Algorithmic logic simulating ML inference scaling factor
    multiplier = req.severity_level * 1.35
    
    # Calculate exact logistics requirements
    water = int(req.affected_population * 4.5 * multiplier)  # Liters
    medical = int((req.affected_population * 0.08) * req.severity_level) # Kits
    blankets = int(req.affected_population * 0.85 * (multiplier / 2)) # Units
    food = round((req.affected_population * 2.5 * multiplier) / 1000, 2) # Tons
    
    # Simulated geospatial drop zones
    zones = [
        {"id": "Z-01", "name": "Titik Alpha (Pusat Episentrum)", "lat": -6.2088, "lng": 106.8456, "status": "KRITIS", "color": "#FF453A"},
        {"id": "Z-02", "name": "Titik Bravo (Jalur Evakuasi Utama)", "lat": -6.2110, "lng": 106.8490, "status": "SIAGA", "color": "#00E5FF"},
        {"id": "Z-03", "name": "Titik Charlie (Posko Aman Terpadu)", "lat": -6.2050, "lng": 106.8400, "status": "AMAN", "color": "#32D74B"},
    ]
    
    return {
        "status": "success",
        "data": {
            "requirements": {
                "clean_water_liters": water,
                "medical_kits": medical,
                "blankets": blankets,
                "food_rations_tons": food
            },
            "critical_drop_zones": zones
        }
    }
