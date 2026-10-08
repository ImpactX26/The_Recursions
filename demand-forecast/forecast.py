import pandas as pd
import json
from sklearn.linear_model import LinearRegression


def demand_level(prediction):

    if prediction >= 18:
        return "HIGH"

    elif prediction >= 11:
        return "MEDIUM"

    else:
        return "LOW"


forecast_results = []


# Load booking data
data = pd.read_csv("bookings.csv")


# Convert date column
data["date"] = pd.to_datetime(data["date"])


# Sort data by service and date
data = data.sort_values(["service", "date"])


# Create time-based features
data["day_number"] = (
    data["date"] - data["date"].min()
).dt.days

data["day_of_week"] = data["date"].dt.dayofweek


# Store available services
services = data["service"].unique()


# Forecast each service
for service in services:

    service_data = data[
        data["service"] == service
    ].copy()

    # Previous day's demand
    service_data["previous_day_demand"] = (
        service_data["bookings"].shift(1)
    )

    # Remove first row because it has no previous day
    service_data = service_data.dropna()

    # Features
    X = service_data[
        [
            "day_number",
            "day_of_week",
            "previous_day_demand"
        ]
    ]

    # Target
    y = service_data["bookings"]

    # Create model
    model = LinearRegression()

    # Train model
    model.fit(X, y)

    # Last known day
    last_day = service_data["day_number"].max()

    # Start with latest actual demand
    previous_demand = service_data[
        "bookings"
    ].iloc[-1]

    print("\n================================")
    print("Service:", service)
    print("================================")

    # Predict next 7 days
    for day in range(1, 8):

        future_day = last_day + day

        future_date = (
            data["date"].max()
            + pd.Timedelta(days=day)
        )

        future_day_of_week = (
            future_date.dayofweek
        )

        # Create future input
        future_data = pd.DataFrame({
            "day_number": [future_day],
            "day_of_week": [future_day_of_week],
            "previous_day_demand": [
                previous_demand
            ]
        })

        # Predict
        prediction = model.predict(
            future_data
        )[0]

        # Prevent negative demand
        prediction = max(
            0,
            round(prediction)
        )

        level = demand_level(prediction)

        print(
            "Day +",
            day,
            ":",
            prediction,
            "bookings",
            "→",
            level
        )

        # Save forecast result
        forecast_results.append({
            "service": service,
            "forecast_date": future_date.strftime("%Y-%m-%d"),
            "day": day,
            "predicted_demand": prediction,
            "demand_level": level
        })

        # Use prediction as previous demand
        # for the next day
        previous_demand = prediction


# Save forecast results to JSON
with open("forecast.json", "w") as file:

    json.dump(
        forecast_results,
        file,
        indent=4
    )


print("\nForecast saved to forecast.json")