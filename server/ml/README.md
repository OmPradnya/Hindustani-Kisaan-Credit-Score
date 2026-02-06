# ML Service for HKCS Credit Scoring

This folder contains the Python ML service that provides repayment probability predictions.

## Setup

```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python ml_service.py
```

The service will run on `http://localhost:5001`

## API Endpoint

### POST /predict

Request body:
```json
{
  "cultivatedLandAcres": 5,
  "cropType": "Cotton",
  "repaymentHistory": "On-Time",
  "irrigationSource": "Canal",
  "scaleOfFinance": 120000,
  "annualFarmIncome": 250000,
  "marketRisk": "Low"
}
```

Response:
```json
{
  "probability": 0.76,
  "mlScore": 76
}
```
