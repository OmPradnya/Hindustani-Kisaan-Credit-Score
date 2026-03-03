# THIS FILE WAS TRAIEND IN COLAB JUST ADDED HERE FOR REFERENCE

import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
import joblib

# ---------------------------------------------
# STEP 1 – LOAD DATA
# ---------------------------------------------

df = pd.read_csv("hkcs_ml_ready_dataset.csv")

print("Dataset Loaded")
print(df.head())

# ---------------------------------------------
# STEP 2 – SEPARATE FEATURES AND TARGET
# ---------------------------------------------

X = df.drop(["loan_status"], axis=1)
y = df["loan_status"]

# ---------------------------------------------
# STEP 3 – ENCODE CATEGORICAL VARIABLES
# ---------------------------------------------

X_encoded = pd.get_dummies(X)

# Encode target labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print("\nClasses:", label_encoder.classes_)

# ---------------------------------------------
# STEP 4 – TRAIN TEST SPLIT
# ---------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X_encoded,
    y_encoded,
    test_size=0.2,
    random_state=42
)

print("\nTraining Samples:", X_train.shape[0])
print("Testing Samples:", X_test.shape[0])

# ---------------------------------------------
# STEP 5 – TRAIN BEST MODEL (RANDOM FOREST)
# ---------------------------------------------

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=12,
    min_samples_split=5,
    random_state=42
)

model.fit(X_train, y_train)

print("\nModel Training Completed!")

# ---------------------------------------------
# STEP 6 – EVALUATE MODEL
# ---------------------------------------------

preds = model.predict(X_test)

print("\nACCURACY:", accuracy_score(y_test, preds))

print("\nCLASSIFICATION REPORT:\n")
print(classification_report(y_test, preds))

print("\nCONFUSION MATRIX:\n")
print(confusion_matrix(y_test, preds))

# ---------------------------------------------
# STEP 7 – FEATURE IMPORTANCE (INTERPRETABILITY)
# ---------------------------------------------

feature_importance = pd.DataFrame({
    "feature": X_encoded.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

print("\nTop Important Features:\n")
print(feature_importance.head(10))

# ---------------------------------------------
# STEP 8 – SAVE MODEL FOR DEPLOYMENT
# ---------------------------------------------

joblib.dump(model, "hkcs30_random_forest_model.pkl")
joblib.dump(label_encoder, "hkcs30_label_encoder.pkl")
joblib.dump(list(X_encoded.columns), "hkcs30_feature_columns.pkl")

print("\nModel and encoders saved successfully!")
