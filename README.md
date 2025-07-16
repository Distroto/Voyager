# 🚢 Voyager – Smart Ship Intelligence System

Voyager is an AI-powered backend platform designed to assist commercial vessels with:
- 🧭 **Route Optimization**
- ⛽ **Fuel Consumption Prediction**
- 🛠️ **Maintenance Forecasting**

It integrates machine learning models, RESTful APIs, queue-based workers, and automated deployment to provide scalable voyage intelligence.

---

## 📌 Features

### 1. 🌍 Route Optimizer (via OpenAI)
Suggests optimal shipping routes based on cargo, distance, and weather context.

### 2. ⛽ Fuel Predictor
Predicts estimated fuel usage using a regression ML model with the following inputs:
- Distance
- Cargo weight
- Vessel type

### 3. 🔧 Maintenance Forecaster
Forecasts whether the vessel requires maintenance based on historical load, usage stats, and engine metrics.

---

## 🧱 Tech Stack

| Layer           | Technology                    |
|----------------|-------------------------------|
| Backend API     | Node.js, Express.js           |
| ML API Service  | Python, Flask, scikit-learn   |
| ML Models       | Pre-trained `.joblib` models  |
| Message Queue   | Redis, BullMQ                 |
| Database        | MongoDB Atlas                 |
| Auth & Secrets  | dotenv, .env, GitHub Secrets  |
| DevOps          | Docker, GitHub Actions, EC2   |
| Docs            | Swagger UI                    |

---

## 📁 Folder Structure

```bash
Voyager/
├── backend/                # Node.js backend
│   ├── src/
│   ├── worker.Dockerfile
│   ├── Dockerfile
│   ├── .env.example
├── ml/                     # Python ML API
│   ├── models/
│   ├── api.py
│   ├── train.py
│   ├── requirements.txt
│   └── .env.example
├── docker-compose.yaml
├── .github/workflows/ci.yml
└── README.md
```

---

## 🌐 Live API Docs

> [http://13.53.122.82:3000/api-docs](http://13.53.122.82:3000/api-docs)

---

## 🚀 Quickstart (Docker)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/voyager.git
   cd voyager
   ```

2. **Create Required `.env` Files**
   - `backend/.env`
   - `ml/.env`

   Example:

   ```env
   # backend/.env
   PORT=3000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
   REDIS_HOST=redis
   REDIS_PORT=6379
   ```

   ```env
   # ml/.env
   OPENAI_API_KEY=sk-xxxxx
   ```

3. **Run in Docker**
   ```bash
   docker compose up --build
   ```

4. Open your browser at:
   ```
   http://localhost:3000/api-docs
   ```

---

## 🧪 Local Development (Manual)

### Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```

### ML API (Python)
```bash
cd ml
pip install -r requirements.txt
python api.py
```

---

## 🧠 AI/ML Model Info

### Models Used:
- `fuel_predictor.joblib` – Linear Regression
- `maintenance_forecaster.joblib` – Random Forest Classifier

### Retrain (optional):
```bash
cd ml
python train.py
```

---

## ✅ Sample API Usage

### POST `/ships`
```json
{
  "name": "MV Odyssey",
  "imoNumber": "1234567",
  "engineType": "MAN B&W",
  "capacity": 65000,
  "fuelConsumptionRate": 24
}
```

### GET `/maintenance-alerts`
Queues a job for analysis and returns a Job ID.

---

## 🔁 GitHub Actions – CI/CD

- ✅ Runs tests & linter on every push to `main` or `testing`
- ✅ Builds & pushes Docker images
- ✅ SSH deploys to EC2 instance and runs `docker compose`

```yaml
on:
  push:
    branches: [main, testing]
  workflow_dispatch:
```

---

## 🧪 Testing

```bash
cd backend
npm run test
```

Tests included:
- API endpoints (CRUD)
- ML job triggers
- Redis queue integrity

---

## 📄 Environment Config

### `.env.example` – Backend
```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
REDIS_HOST=redis
REDIS_PORT=6379
```

### `.env.example` – ML
```env
OPENAI_API_KEY=sk-xxxxx
```

---

## 📦 Deployment Summary

- ✅ Deployed to EC2
- ✅ Exposed Swagger: [http://13.53.122.82:3000/api-docs](http://13.53.122.82:3000/api-docs)
- ✅ Runs on Docker Compose
- ✅ GitHub Actions with auto-deploy via SSH

> Built with ❤️ by **Abhishek Sokhal** | © 2025
