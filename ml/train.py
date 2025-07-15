import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
import os

def train_and_save_models():
    """
    Trains and saves all necessary scikit-learn models.
    """
    print("--- Starting Model Training ---")
    
    # Ensure the models directory exists
    if not os.path.exists('models'):
        os.makedirs('models')

    # --- 1. Fuel Predictor (Regression) ---
    print("\n[1/2] Training Fuel Predictor...")
    np.random.seed(42)
    num_samples = 1000
    # Let's use more features for a better model
    data_fuel = {
        'cargo_weight': np.random.uniform(20000, 150000, num_samples),
        'distance_km': np.random.uniform(5000, 20000, num_samples),
        'avg_speed_knots': np.random.uniform(14, 22, num_samples),
    }
    df_fuel = pd.DataFrame(data_fuel)
    df_fuel['fuel_tons'] = (df_fuel['distance_km'] * 0.12) + (df_fuel['cargo_weight'] * 0.003) + (df_fuel['avg_speed_knots']**2 * 0.5) + np.random.normal(0, 50, num_samples)

    X_fuel = df_fuel[['cargo_weight', 'distance_km', 'avg_speed_knots']]
    y_fuel = df_fuel['fuel_tons']
    
    fuel_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    fuel_model.fit(X_fuel, y_fuel)
    joblib.dump(fuel_model, 'models/fuel_predictor.joblib')
    print("✅ Fuel Predictor saved to models/fuel_predictor.joblib")

    # --- 2. Maintenance Forecaster (Classification) ---
    print("\n[2/2] Training Maintenance Forecaster...")
    num_samples_maint = 500
    data_maint = {
        'total_running_hours': np.random.uniform(500, 15000, num_samples_maint),
        'voyages_since_service': np.random.randint(1, 20, num_samples_maint),
        'avg_load_percent': np.random.uniform(0.5, 0.95, num_samples_maint)
    }
    df_maint = pd.DataFrame(data_maint)
    # Rule: High hours, many voyages, and high load increase failure chance
    prob_service_needed = 0.05 + (df_maint['total_running_hours'] / 15000) * 0.4 + (df_maint['voyages_since_service'] / 20) * 0.4 + (df_maint['avg_load_percent'] - 0.5) * 0.3
    df_maint['service_needed'] = (prob_service_needed > np.random.rand(num_samples_maint)).astype(int)

    X_maint = df_maint[['total_running_hours', 'voyages_since_service', 'avg_load_percent']]
    y_maint = df_maint['service_needed']
    
    maint_model = LogisticRegression(random_state=42)
    maint_model.fit(X_maint, y_maint)
    joblib.dump(maint_model, 'models/maintenance_forecaster.joblib')
    print("✅ Maintenance Forecaster saved to models/maintenance_forecaster.joblib")
    
    print("\n--- Model Training Complete ---")

if __name__ == '__main__':
    train_and_save_models()