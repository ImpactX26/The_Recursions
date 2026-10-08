from fastapi import FastAPI
import json

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "AI Demand Forecasting API is running"
    }


@app.get("/forecast")
def get_forecast():

    with open("forecast.json", "r") as file:
        forecast = json.load(file)

    return forecast

@app.get("/forecast/summary")
def get_forecast_summary():

    with open("forecast.json", "r") as file:
        forecast = json.load(file)

    summary = {
        "high_demand": [],
        "medium_demand": [],
        "low_demand": []
    }

    services_added = set()

    for item in forecast:

        service = item["service"]
        level = item["demand_level"]

        # Only use each service once
        if service in services_added:
            continue

        services_added.add(service)

        if level == "HIGH":
            summary["high_demand"].append(service)

        elif level == "MEDIUM":
            summary["medium_demand"].append(service)

        elif level == "LOW":
            summary["low_demand"].append(service)

    return summary

@app.get("/forecast/{service_name}/latest")
def get_latest_forecast(service_name: str):

    with open("forecast.json", "r") as file:
        forecast = json.load(file)

    service_forecasts = []

    for item in forecast:

        if item["service"].lower() == service_name.lower():
            service_forecasts.append(item)

    if not service_forecasts:
        return {
            "message": "Service not found"
        }

    latest_forecast = min(
        service_forecasts,
        key=lambda item: item["forecast_date"]
    )

    return latest_forecast

@app.get("/forecast/{service_name}")
def get_service_forecast(service_name: str):

    with open("forecast.json", "r") as file:
        forecast = json.load(file)

    results = []

    for item in forecast:

        if item["service"].lower() == service_name.lower():
            results.append(item)

    if not results:
        return {
            "message": "Service not found"
        }

    return results


