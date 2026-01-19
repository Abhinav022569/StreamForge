# 🛠️ StreamForge: Data Pipeline Orchestration

StreamForge is a centralized digital platform designed to democratize data engineering. It provides a visual, "No-Code/Low-Code" drag-and-drop interface for building complex ETL (Extract, Transform, Load) workflows, allowing both technical and non-technical users to process data without writing a single line of code.

## 💻 Tech Stack & Dependencies

| Component | Technology | File Location |
| :--- | :--- | :--- |
| **Front-End** | React (Vite), React Flow, Framer Motion, Socket.IO | `frontend/src/`, `frontend/package.json` |
| **Back-End Logic** | Python, Flask, Socket.IO, APScheduler | `backend/app/`, `backend/run.py` |
| **Data Processing**| Pandas, NumPy, Matplotlib | `backend/app/pipeline_engine.py` |
| **Database** | SQLite (via SQLAlchemy) | `backend/pipelines.db` |
| **AI Integration** | Google Gemini (Generative AI) | `backend/app/chatbot_context.py` |

## ✨ Core Modules & Features

### 🧑‍💻 User Features (Engineers/Data Scientists)
* **Visual Pipeline Builder**: An interactive canvas to design workflows by connecting Source, Filter, Join, and Destination nodes.
* **Advanced Transformation Engine**:
    * **Data Cleaning**: Tools for deduplication, filling null values (fillna), and type casting.
    * **Logic Operations**: Join multiple datasets, perform group-by aggregations, and run mathematical calculations between columns.
    * **Custom Python Nodes**: Execute arbitrary Python scripts within the pipeline for bespoke data logic.
* **AI Chat Assistant**: Context-aware chatbot powered by Gemini to help debug errors or generate pipeline plans from natural language.
* **Data Catalog & Lineage**: Search datasets and track "lineage" to see which pipelines created or utilized specific files.
* **Real-Time Execution**: View live status updates and execution logs via WebSockets.
* **Visualization**: Generate Bar, Line, Scatter, Pie, and Histogram charts directly from your data.

### 🤝 Collaboration & Automation
* **Real-Time Collaboration**: Share pipelines with team members and assign "Viewer" or "Editor" roles.
* **Automated Scheduling**: Schedule pipelines to run automatically at set intervals (minutes), daily at a specific time, or once on a future date.
* **Notification System**: Receive real-time alerts for pipeline successes, failures, and administrative broadcasts.

### 🛡️ Admin Features
* **User Management**: Monitor registered users, track total data processed, and manage account statuses (suspend/activate).
* **System Dashboard**: Global overview of active pipelines, system health, and logs.
* **Global Communication**: Send system-wide broadcast notifications or email blasts to all users.

## 🚀 Installation Guide

### Prerequisites
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+) & **pip**

### Quick Setup

1.  **Clone the Repository:**
    ```bash
    git clone [repository_url] StreamForge
    cd StreamForge
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    # Create a .env file in backend/ with your GEMINI_API_KEY
    python run.py
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Platform:**
    Open `http://localhost:5173` in your browser.

## 🔒 Security & Authentication
* **JWT Authentication**: Secure login and session management.
* **Role-Based Access**: Strict separation between Admin and User capabilities.
* **Data Privacy**: Users can only view or edit their own pipelines and files unless shared via the collaboration module.

<br>

**Developed by Abhinav R Nair.**
