# MaatriNet Hackathon Devlog: 30-Hour Build Journey

This log documents the end-to-end development of **MaatriNet** (Maternal & Child Health Intervention System) from concept to deployment-ready MVP over a continuous 30-hour hackathon.

---

### **Sprint 1: The Blueprint (Hours 0-2)**
**Status:** ✅ Completed
**Focus:** Tech Stack & Architecture
**Update:**
"Kicked off the hackathon with a clear mission: **Zero Preventable Maternal Deaths.** 
The architectural challenge is handling real-world scale with complex relationships. Decided on:
- **Backend:** Python **FastAPI** for high-performance async processing.
- **ORM:** **SQLModel** (Pydantic + SQLAlchemy) to ensure strict type safety across the entire stack.
- **Frontend:** **React + Vite** for blazing fast HMR.
- **Design System:** Building a custom **Glassmorphism UI** with TailwindCSS to make healthcare data approachable, not intimidating.
Repo initialized, virtual environments activated. Engines are go! 🚀"

### **Sprint 2: The Mental Model (Hours 2-4)**
**Status:** ✅ Completed
**Focus:** Database Schema Design
**Update:**
"Spent the last 2 hours deep in data modeling. Healthcare data is relational and complex. 
Designed the core schema to track a mother's entire lifecycle:
- `User`: Handles RBAC (Admins vs. Doctors vs. Field Workers).
- `Beneficiary`: The central profile for mothers.
- `Pregnancy` (One-to-Many): Allows tracking multiple pregnancies over time for the same mother.
- `Delivery` & `Child`: Linking birth outcomes directly to immunization schedules.
This structure supports longitudinal tracking—crucial for identifying high-risk trends."

### **Sprint 3: The Gatekeeper (Hours 4-6)**
**Status:** ✅ Completed
**Focus:** Authentication & Security
**Update:**
"Security cannot be an afterthought in healthcare. 🔒 
Implemented a robust **JWT (JSON Web Token)** authentication system.
- Built a custom `get_current_user` dependency in FastAPI to secure every endpoint.
- Enforced strict Role-Based Access Control (RBAC):
    - **Admins** manage facility onboarding.
    - **Authorizers** see aggregated state-level data.
    - **Hospitals** only access their own patient records.
No unauthorized access past this point."

### **Sprint 4: Frontend Scaffold (Hours 6-8)**
**Status:** ✅ Completed
**Focus:** UI Foundation & Routing
**Update:**
"Frontend is live! 🎨 Moved away from generic templates to build a custom React architecture.
- Set up **React Router v6** for seamless navigation between Auth, Dashboards, and Analytics.
- Integrated **Lucide React** for modern, lightweight iconography.
- Established the `DashboardLayout` component with a responsive sidebar that adapts to role permissions.
The skeleton is strong; now to add the muscle."

### **Sprint 5: Ingesting Reality (Hours 8-10)**
**Status:** ✅ Completed
**Focus:** Data Seeding Engine
**Update:**
"Real apps need real data. 📂 
Built a sophisticated **Excel Ingestion Engine** using `pandas`.
- It parses raw RCH (Reproductive Child Health) datasets.
- Automatically normalizes messy column names (e.g., 'LMP Date' -> `lmp_date`).
- Handles missing dates and sanitizes inputs before hitting the database.
- Successfully seeded **5,000+ synthetic records** to simulate a live district deployment. The dashboard is no longer empty!"

### **Sprint 6: The Clinical Brain (Hours 10-12)**
**Status:** ✅ Completed
**Focus:** Risk Prediction Logic
**Update:**
"Injecting medical intelligence into the backend. 🧠 
Developed the core `risk_models.py` module:
- **Pre-birth Risk Engine**: Calculates risk scores based on Age (>35), Anemia (<11g/dL), BP (>140/90), and previous C-sections.
- **Post-birth Classifier**: Flags potential complications based on birth weight (<2.5kg) and NICU admissions.
- **Immunization Tracker**: Determines if a child is 'Off-Track' based on calculated age vs. completed doses.
We are now generating actionable insights, not just storing text."

### **Sprint 7: Frontline Tools (Hours 12-14)**
**Status:** ✅ Completed
**Focus:** Hospital Dashboard
**Update:**
"Empowering the doctors! 🏥 
Built the **Hospital Dashboard** with a focus on triage speed.
- **High-Risk Alerts**: Top section immediately highlights mothers needing urgent care.
- **Patient List**: Sortable, filterable view of all registered pregnancies.
- Integrated the risk scores from the backend directly into the UI with color-coded badges (Red/Orange/Green).
Doctors can now see who needs attention in seconds."

### **Sprint 8: Authorizer Oversight (Hours 14-16)**
**Status:** ✅ Completed
**Focus:** State-Level Analytics
**Update:**
"Zooming out to the governance layer. 🗺️
Built the **State Authorizer Dashboard** for government officials.
- **Aggregated metrics**: Total High Risk cases vs. Total Enrolled.
- **District Breakdown**: A table view showing performance across different blocks.
- **Off-Track Monitoring**: A dedicated view to spot districts falling behind on immunizations.
Crucial for resource allocation at the macro level."

### **Sprint 9: Enter Sentinel AI (Hours 16-18)**
**Status:** ✅ Completed
**Focus:** LLM Integration
**Update:**
"The game changer. 🤖 
Integrated **Google Gemini 2.0 Flash** into the backend to create 'Sentinel AI'.
- Constructed a 'System Context' that feeds live database stats (e.g., total high-risk cases, hospital load) directly into the LLM's prompt.
- The AI is now 'grounded' in our real-time data.
- It can answer questions like: 'Which hospital has the highest burden of anemia patients?' instantly."

### **Sprint 10: Conversational Interface (Hours 18-20)**
**Status:** ✅ Completed
**Focus:** Floating Chat Assistant
**Update:**
"Making AI accessible. 💬 
Built a beautiful, floating **AI Chat Interface** in React.
- Uses `framer-motion` for smooth entry/exit animations.
- Implemented **Voice-to-Text** using the Web Speech API—critical for field workers who might prefer speaking over typing.
- Added a 'Verified Metric' UI badge whenever the AI cites a number from our database.
It feels futuristic yet grounded in utility."

### **Sprint 11: Agentic Analysis (Hours 20-22)**
**Status:** ✅ Completed
**Focus:** Python Code Execution
**Update:**
"Taking the AI from 'Chatbot' to 'Analyst'. 🚀 
- Implemented a **Sandboxed Python Executor** in the backend.
- When you ask a complex question (e.g., 'Correlation between education and immunization rates'), the AI writes pandas code, executes it on the live dataframe, and returns the result.
- It derives *new features* on the fly. Real agentic behavior in a hackathon project!"

### **Sprint 12: UX Refinement (Hours 22-24)**
**Status:** ✅ Completed
**Focus:** Visual Polish & Responsiveness
**Update:**
"Polishing the diamond. ✨ 
- Refined the **Glassmorphism** visual language: subtle blurs, translucent cards, and soft gradients.
- Optimized the layout for mobile devices (many health workers use tablets).
- Improved loading states and error boundaries.
The application now feels production-grade."

### **Sprint 13: Closing the Loop (Hours 24-26)**
**Status:** ✅ Completed
**Focus:** Off-Track Alerts System
**Update:**
"Ensuring no child is left behind. 🚨 
- Finalized the **Immunization Alert System**.
- Automatically flags children who have missed milestones based on their Date of Birth.
- Aggregates this data for Authorizers to deploy field teams.
- Visualized this with a 'Red Zone' list on the dashboard.
This feature directly addresses the problem statement."

### **Sprint 14: Stress Testing (Hours 26-28)**
**Status:** ✅ Completed
**Focus:** QA & Resilience
**Update:**
"Squashing bugs and hardening the system. 🐛 
- Added robust error handling for the AI service (graceful degradation if API limits are hit).
- Optimized database queries to handle the 5,000 record load without lag.
- Verified role permissions one last time to prevent data leaks.
- Fixed a timezone bug in the Date of Birth calculation.
System status: Stable."

### **Sprint 15: The Final Pitch (Hours 28-30)**
**Status:** ✅ Ready to Submit
**Focus:** Documentation & Demo
**Update:**
"Pens down! 🏁 
- `README.md` is complete with setup instructions.
- Recorded the demo flow: From Login -> High Risk Identification -> AI Analysis -> Intervention.
- **MaatriNet** is ready. 
We built a full-stack, AI-powered maternal health ecosystem in 30 hours. Proud of the result!
Let's go present! 🎤"
