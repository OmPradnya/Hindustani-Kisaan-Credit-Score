"""
HKCS30 ML Service - Hybrid Credit Score Prediction
Flask microservice that loads HKCS30 pickle models and provides predictions.
Uses a hybrid approach: Rule-based scoring + ML classification.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import random

app = Flask(__name__)
CORS(app)

# Path to model files
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'hkcs30_random_forest_model.pkl')
FEATURE_COLUMNS_PATH = os.path.join(MODEL_DIR, 'hkcs30_feature_columns.pkl')
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, 'hkcs30_label_encoder.pkl')

# Global variables for loaded models
model = None
feature_columns = None
label_encoder = None

# === Backend Constants ===
MARKET_RISK = {
    "Wheat": 2.1, "Rice": 1.9, "Cotton": 4.2,
    "Soybean": 3.8, "Onion": 6.5, "Sugarcane": 1.5
}

SCALE_OF_FINANCE = {
    "Wheat": 35000, "Rice": 42000, "Cotton": 48000,
    "Soybean": 32000, "Onion": 55000, "Sugarcane": 75000
}

INCOME_PROXY = {
    "Wheat": 72000, "Rice": 80000, "Cotton": 95000,
    "Soybean": 60000, "Onion": 110000, "Sugarcane": 150000
}


def load_models():
    """Load ML model, feature columns, and label encoder from pickle files"""
    global model, feature_columns, label_encoder
    
    try:
        print(f"Loading model from: {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully!")
        
        print(f"Loading feature columns from: {FEATURE_COLUMNS_PATH}")
        feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
        print(f"Feature columns loaded: {len(feature_columns)} features")
        
        print(f"Loading label encoder from: {LABEL_ENCODER_PATH}")
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        print("Label encoder loaded successfully!")
        
        return True
    except FileNotFoundError as e:
        print(f"Model file not found: {e}")
        return False
    except Exception as e:
        print(f"Error loading models: {e}")
        return False


def calculate_rule_score(data):
    """
    Calculate rule-based HKCS score with detailed breakdown.
    Returns total score, repayment history, market risk, and breakdown.
    """
    primary = data.get("primary_crop", "Wheat")
    secondary = data.get("secondary_crop", "None")
    pattern = data.get("cropping_pattern", "Single")
    
    # Simulated repayment history (40-100)
    repayment_history = random.randint(40, 100)
    
    # Calculate combined metrics based on cropping pattern
    if pattern == "Single" or secondary == "None":
        risk = MARKET_RISK.get(primary, 3.0)
        cost = SCALE_OF_FINANCE.get(primary, 40000)
        income = INCOME_PROXY.get(primary, 80000)
    else:
        risk = (MARKET_RISK.get(primary, 3.0) + MARKET_RISK.get(secondary, 3.0)) / 2
        cost = (SCALE_OF_FINANCE.get(primary, 40000) + SCALE_OF_FINANCE.get(secondary, 40000)) / 2
        income = (INCOME_PROXY.get(primary, 80000) + INCOME_PROXY.get(secondary, 80000)) / 2
    
    breakdown = {}
    land_area = float(data.get("land_area", 1.0))
    years_experience = int(data.get("years_experience", 1))
    irrigation = data.get("irrigation", "Rainfed")
    verification_status = data.get("verification_status", "Unverified")
    
    # Score breakdown (max ~100 points)
    breakdown["land_area"] = min(22, land_area * 3)
    breakdown["cropping"] = 14 if pattern == "Multi" else 8
    breakdown["repayment"] = (repayment_history / 100) * 18
    breakdown["irrigation"] = 12 if irrigation == "Irrigated" else 6
    breakdown["cost"] = (1 - (cost / 100000)) * 10
    breakdown["income"] = (income / 150000) * 8
    breakdown["experience"] = min(6, years_experience / 5)
    breakdown["market_risk"] = (5 - risk)
    breakdown["verification"] = 5 if verification_status == "Verified" else 2
    
    total_score = sum(breakdown.values())
    
    return total_score, repayment_history, risk, breakdown


def generate_recommendations(data, breakdown, repayment, risk):
    """Generate personalized recommendations based on farmer profile."""
    recos = []
    land_area = float(data.get("land_area", 1.0))
    irrigation = data.get("irrigation", "Rainfed")
    years_experience = int(data.get("years_experience", 1))
    verification_status = data.get("verification_status", "Unverified")
    
    if land_area < 2:
        recos.append("🌱 Increase cultivated land area through leasing or cooperative farming to improve credit eligibility.")
    
    if irrigation == "Rainfed":
        recos.append("💧 Adopt drip or borewell irrigation to reduce weather dependency. Apply for PM-KUSUM scheme for solar pump subsidy.")
    
    if years_experience < 5:
        recos.append("📚 Enroll in agricultural training programs at your nearest Krishi Vigyan Kendra to improve farm management skills.")
    
    if verification_status != "Verified":
        recos.append("✅ Complete Aadhaar and land record verification to increase your trust score and loan eligibility.")
    
    if repayment < 60:
        recos.append("💳 Improve repayment history by clearing outstanding dues or taking smaller loans first.")
    
    if risk > 4:
        recos.append("🌾 Consider switching to more stable crops with lower price volatility like Sugarcane or Wheat.")
    
    if len(recos) == 0:
        recos.append("✅ Your profile is strong. Maintain current practices for better credit access.")
    
    return recos


def ml_prediction(data, repayment_history, risk):
    """
    Get ML model prediction for credit decision.
    Returns APPROVED/REJECTED based on model classification.
    """
    global model, feature_columns, label_encoder
    
    if model is None or feature_columns is None or label_encoder is None:
        return "UNKNOWN"
    
    try:
        ml_input = {
            "land_area": float(data.get("land_area", 1.0)),
            "primary_crop": data.get("primary_crop", "Wheat"),
            "secondary_crop": data.get("secondary_crop", "None"),
            "cropping_pattern": data.get("cropping_pattern", "Single"),
            "irrigation": data.get("irrigation", "Rainfed"),
            "years_experience": int(data.get("years_experience", 1)),
            "verification_status": data.get("verification_status", "Unverified"),
            "repayment_history": repayment_history,
            "market_risk": risk
        }
        
        df = pd.DataFrame([ml_input])
        df = pd.get_dummies(df)
        
        # Ensure all feature columns exist
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        df = df[feature_columns]
        
        pred = model.predict(df)
        return label_encoder.inverse_transform(pred)[0]
    except Exception as e:
        print(f"ML prediction error: {e}")
        return "UNKNOWN"


def final_decision(user_input):
    """
    Calculate final hybrid credit decision.
    Combines rule-based scoring (80%) with ML classification (20% influence).
    """
    score, repayment, risk, breakdown = calculate_rule_score(user_input)
    
    # Rule-based decision
    rule_decision = "APPROVED" if score >= 65 else "REJECTED"
    
    # ML-based decision
    ml_decision = ml_prediction(user_input, repayment, risk)
    
    # Hybrid decision (80% rule, 20% ML influence)
    if ml_decision != "UNKNOWN":
        final = rule_decision if random.random() < 0.8 else ml_decision
    else:
        final = rule_decision
    
    recos = generate_recommendations(user_input, breakdown, repayment, risk)
    
    return {
        "final_score": round(score, 2),
        "decision": final,
        "score_breakdown": breakdown,
        "recommendations": recos,
        "repayment_history": repayment,
        "market_risk": round(risk, 2),
        "rule_decision": rule_decision,
        "ml_decision": ml_decision
    }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'feature_columns_loaded': feature_columns is not None,
        'label_encoder_loaded': label_encoder is not None
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict credit score and eligibility for a farmer profile.
    
    Expected input:
    {
        "land_area": 5.0,
        "primary_crop": "Wheat",
        "secondary_crop": "Rice",
        "cropping_pattern": "Multi",
        "irrigation": "Irrigated",
        "years_experience": 12,
        "verification_status": "Verified"
    }
    
    Returns:
    {
        "final_score": 76.5,
        "decision": "APPROVED",
        "score_breakdown": {...},
        "recommendations": [...],
        "mlScore": 76.5
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        result = final_decision(data)
        
        # Format response for compatibility with existing frontend
        return jsonify({
            'probability': result['final_score'] / 100,
            'mlScore': result['final_score'],
            'decision': result['decision'],
            'scoreBreakdown': result['score_breakdown'],
            'recommendations': result['recommendations'],
            'repaymentHistory': result['repayment_history'],
            'marketRisk': result['market_risk'],
            'model_used': model is not None
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("HKCS30 ML Service Starting...")
    print("=" * 50)
    
    # Load models at startup
    models_loaded = load_models()
    
    if not models_loaded:
        print("\n⚠️  WARNING: ML models not loaded. Using fallback rule-based calculations.")
        print("Make sure HKCS30 pickle files are in the same directory as this script.")
    
    print("\nStarting Flask server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
