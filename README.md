# MaatriNet - AI Maternal & Child Health System

MaatriNet is a sophisticated web application designed to track and predict maternal and child health outcomes using AI. It supports regional health schemes in India by providing proactive risk analysis and coverage tracking.

## 🚀 Vision
To ensure "No Mother or Child is Left Behind" by using data-driven insights to identify high-risk cases and service gaps early.

## 🛠 Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite) + Tailwind CSS
- **Database**: SQLite (SQLModel)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📂 Project Structure
- `/backend`: FastAPI server handling data, AI predictions, and user management.
- `/frontend`: React application with role-based dashboards.

### 🤖 AI/ML Pipeline
MaatriNet uses Gradient Boosting classifiers to predict health risks. You must train the models first:
1. Navigate to `backend/`
2. Run: `python -m ml.train_models`
   - This generates `/ml/synthetic_maternal_data.csv`
   - This trains and saves models to `/ml/models/*.pkl`

### 🚦 How to Run

#### Backend
1. Navigate to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Train models: `python -m ml.train_models`
4. Run the server: `python main.py`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`

## 👥 User Roles
1. **Authorizer**: High-level regional analytics and trend monitoring.
2. **Hospital**: Daily patient management and risk alert follow-up.
3. **Beneficiary**: Personal health tracking and scheme benefit monitoring.

---
*Developed with ❤️ for Advanced Maternal Health.*
