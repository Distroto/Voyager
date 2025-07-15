import os
import joblib
import pandas as pd
import json
import openai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from dateutil import parser as date_parser

load_dotenv()

app = Flask(__name__)

# Load scikit-learn models
try:
    fuel_model = joblib.load('models/fuel_predictor.joblib')
    maint_model = joblib.load('models/maintenance_forecaster.joblib')
    print("✅ Models loaded successfully.")
except FileNotFoundError:
    fuel_model = None
    maint_model = None
    print("⚠️ Model files not found. Run train.py to generate them.")

# Configure OpenAI
try:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        raise ValueError("OPENAI_API_KEY not set.")
    print("✅ OpenAI client configured.")
except Exception as e:
    print(f"❌ Failed to configure OpenAI: {e}")


# --- Fuel Prediction ---
@app.route('/predict/fuel', methods=['POST'])
def predict_fuel():
    if not fuel_model:
        return jsonify({"error": "Fuel model not available"}), 500
    data = request.get_json()
    input_df = pd.DataFrame([{
        "cargo_weight": data.get("cargoWeight"),
        "distance_km": data.get("distance_km"),
        "avg_speed_knots": data.get("avg_speed_knots", 18)
    }])
    prediction = fuel_model.predict(input_df)
    return jsonify({"predictedFuel": round(prediction[0], 2)})


# --- Maintenance Prediction ---
@app.route('/predict/maintenance', methods=['POST'])
def predict_maintenance():
    if not maint_model:
        return jsonify({"error": "Maintenance model not available"}), 500
    data = request.get_json()
    input_df = pd.DataFrame([{
        "total_running_hours": data.get("total_running_hours"),
        "voyages_since_service": data.get("voyages_since_service"),
        "avg_load_percent": data.get("avg_load_percent")
    }])
    prediction = maint_model.predict(input_df)
    proba = maint_model.predict_proba(input_df)
    return jsonify({
        "maintenanceRequired": bool(prediction[0]),
        "riskProbability": round(proba[0][1], 3)
    })


# --- Route Prediction (via LLM) ---
@app.route('/predict/route', methods=['POST'])
def predict_route():
    if not openai.api_key:
        return jsonify({"error": "OpenAI API key not configured"}), 500

    try:
        data = request.get_json(force=True)
        voyage_details = data.get("voyageDetails", {})
        ship_details = data.get("shipDetails", {})
        historical_data = data.get("historicalData", [])

        # Create a summary of historical data for the prompt
        history_summary = "No historical data available."
        if historical_data:
            history_summary = "\n".join([
                f"- Voyage from {v.get('origin')} to {v.get('destination')}: "
                f"Predicted Fuel: {v.get('predictedFuel')} tons, Actual Fuel: {v.get('actualFuel')} tons."
                for v in historical_data
            ])

        prompt = f"""
You are Poseidon, an expert maritime AI for voyage optimization.

**Task:** Create a detailed and efficient voyage plan based on the provided data.

**Ship Specifications:**
- Name: {ship_details.get('name')}
- Engine Type: {ship_details.get('engineType')}
- Max Cargo Capacity: {ship_details.get('capacity')} tons
- Baseline Fuel Consumption: {ship_details.get('fuelConsumptionRate')} tons/day

**Current Voyage Details:**
- Departure Time: {voyage_details.get("departureTime")}
- Origin: {voyage_details.get("origin")}
- Destination: {voyage_details.get("destination")}
- Cargo Weight: {voyage_details.get("cargoWeight")} tons
- Weather Summary: {voyage_details.get("weatherForecast", {}).get("summary", "Standard conditions")}

**Historical Performance for this Ship (Predicted vs. Actual):**
{history_summary}

**Your Instructions:**
1. Analyze the ship's specs and cargo load to adjust speed/fuel trade-offs.
2. Consider if fuel predictions were consistently underestimated in historical voyages.
3. Estimate the voyage **duration in hours** (e.g., 72, 120, etc.) based on current cargo/weather.
4. DO NOT calculate ETA. The backend will handle that.
5. Return ONLY a valid JSON object with the structure below. No explanations.

**Required JSON Output:**
{{
  "durationHours": <integer>,
  "distance_km": <integer>,
  "avg_speed_knots": <integer>,
  "speedSchedule": "<string>",
  "routeSummary": "<string>"
}}
"""


        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        plan_data_string = response.choices[0].message.content
        if not plan_data_string:
            return jsonify({"error": "Empty response from OpenAI"}), 500

        plan_data_dict = json.loads(plan_data_string)
        if "durationHours" not in plan_data_dict:
            return jsonify({"error": "Missing durationHours from OpenAI response"}), 500

        departure_time_str = voyage_details.get("departureTime")
        if not departure_time_str:
            return jsonify({"error": "Missing departureTime in voyageDetails"}), 400

        departure_time_obj = date_parser.isoparse(departure_time_str)

        # Compute ETA
        duration = int(plan_data_dict["durationHours"])
        predicted_eta = departure_time_obj + timedelta(hours=duration)
        plan_data_dict["predictedETA"] = predicted_eta.strftime('%Y-%m-%dT%H:%M:%SZ')

        return jsonify(plan_data_dict), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Failed to generate voyage plan.",
            "details": str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
