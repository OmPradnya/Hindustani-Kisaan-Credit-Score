# Hindustani Kisaan Credit Score Model

Developed by: Om Pednekar  

This module implements a Hybrid Credit Scoring System combining:

- Rule-Based Scoring (80% weight)
- Machine Learning Classification (20% influence)

The system predicts farmer loan eligibility and generates personalized recommendations.

## 📊 Model Performance

- Total Samples: 40,000
- Training Samples: 32,000
- Testing Samples: 8,000
- Accuracy: 96.76%
- Precision (APPROVED): 0.97
- Precision (REJECTED): 0.96
- Confusion Matrix:
    [[5456   89]
     [ 170 2285]]

## 📌 Architecture Overview

The module consists of:

- `train.py` → Full ML training pipeline
- `ml_service.py` → Flask microservice for deployment
- `hkcs30_random_forest_model.pkl` → Trained ML model
- `hkcs30_label_encoder.pkl` → Encoded label transformer
- `hkcs30_feature_columns.pkl` → Stored feature structure
- `requirements.txt` → Python dependencies

---

## 🧠 Machine Learning Details

- Algorithm: RandomForestClassifier
- n_estimators: 150
- max_depth: 12
- min_samples_split: 5
- Random State: 42
- Problem Type: Binary Classification (Loan Approved / Rejected)

### Feature Engineering
- One-hot encoding using `pd.get_dummies`
- Label encoding for target variable
- Train-test split (80-20)
- Feature importance extraction

### Evaluation Metrics
- Accuracy Score
- Classification Report
- Confusion Matrix
- Feature Importance Ranking

---

## ⚙️ Hybrid Credit Decision Logic

Final Decision combines:

- Rule-based agricultural scoring (land, irrigation, experience, risk, verification)
- ML-based classification
- Final decision weighted 80% rule + 20% ML

This ensures:
- Domain reliability
- Model intelligence
- Interpretability

---

## 🚀 How To Train Model

From inside `server/ml`:

```bash
python train.py