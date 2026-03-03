# Training Notes & Experimental Context – HKCS30

## 🔬 Development Context

The ML model was initially trained and experimented using Google Colab 
to leverage faster iteration cycles and simplified dependency management.

Final production-ready training script was later structured into `train.py`.

---

## 📊 Dataset Characteristics

- Total Records: 40,000
- Features: Agricultural, financial, and verification attributes
- Target Variable: `loan_status`
- Class Labels: APPROVED / REJECTED

The dataset includes structured features such as:
- Land area
- Crop type
- Cropping pattern
- Repayment history
- Irrigation type
- Market risk
- Verification status
- Years of farming experience

---

## 🧪 Model Selection Rationale

Random Forest was chosen because:

- Handles mixed categorical + numerical data well
- Robust to overfitting compared to single decision trees
- Provides feature importance for interpretability
- Performs well without heavy hyperparameter tuning

---

## ⚠️ Data Considerations

- `farmer_unique_id` is treated as an identifier and excluded from training 
  to prevent data leakage.
- Categorical features were encoded using one-hot encoding.
- Target labels were encoded using `LabelEncoder`.

---

## 📈 Observations

Feature importance analysis showed:

- Land area and repayment history are dominant predictors.
- Agricultural stability factors (irrigation, cropping pattern) influence risk.
- Hybrid scoring improves interpretability compared to pure ML decision.

---

## 🏗 Design Philosophy

The goal of this system is not only prediction accuracy, 
but also explainable and policy-aligned credit scoring.

This ensures:
- Transparency
- Domain alignment
- Reduced black-box dependency