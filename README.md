# 🛠️ StreamForge: Data Pipeline Orchestration

StreamForge is a centralized digital platform designed to democratize data engineering. It provides a visual, "No-Code/Low-Code" drag-and-drop interface for building complex ETL (Extract, Transform, Load) workflows, allowing both technical and non-technical users to process data without writing a single line of code.

## 💻 Tech Stack & Dependencies

| Component | Technology | File Location |
| :--- | :--- | :--- |
| **Front-End** | React (Vite), React Flow, Framer Motion, Socket.IO | `frontend/src/` |
| **Back-End Logic** | Python, Flask, Socket.IO, APScheduler | `backend/app/` |
| **Data Processing**| Pandas, NumPy, Matplotlib | `backend/app/pipeline_engine.py` |
| **Database** | SQLite (via SQLAlchemy) | `backend/pipelines.db` |
| **AI Integration** | Google Gemini (Generative AI) | `backend/app/chatbot_context.py` |

## ✨ Core Modules & Features

### 🧑‍💻 User Features
* **Visual Pipeline Builder**: Drag-and-drop interface for designing data flows using specialized nodes.
* **Advanced Transformation Engine**: Execute complex data cleaning, joining, and aggregation logic in-memory.
* **AI Chat Assistant**: Gemini-powered sidekick to help debug logic or generate pipeline structures from text.
* **Data Catalog & Lineage**: Full traceability of datasets to see which user or pipeline created a specific file.
* **Real-Time Execution**: Monitor live logs and status updates as pipelines process data.
* **Visualization**: Instant generation of professional charts directly from the workflow.

### 🤝 Collaboration & Automation
* **Real-Time Collaboration**: Share pipelines with teammates using "Viewer" or "Editor" permissions.
* **Automated Scheduling**: Cron-style scheduling for running tasks at set intervals or specific times.
* **Notification System**: Integrated alerts for pipeline status changes and admin messages.

## 🧩 Comprehensive Node Catalog

The Execution Engine supports a wide array of specialized nodes to handle any data task:

| Category | Node Name | Description |
| :--- | :--- | :--- |
| **Sources** | `Source Node` | Ingest CSV, Excel, or JSON files from local uploads or previous runs. |
| **Logic** | `Join` | Merge two datasets using Inner, Left, Right, or Outer join logic. |
| | `Filter` | Remove rows based on conditions like `>`, `<`, `==`, or `!=`. |
| | `Deduplicate` | Identify and remove duplicate rows from the dataset. |
| **Transform** | `Sort` | Order data based on a specific column in ascending or descending order. |
| | `Limit` | Restrict the dataset to a specific number of rows (e.g., top 100). |
| | `Select` | Pick specific columns to keep and discard the rest. |
| | `Rename` | Change the name of existing columns for better readability. |
| | `Cast` | Change data types (e.g., String to Integer, or Date). |
| | `Fill Null` | Replace missing (NaN) values with a constant or specific value. |
| | `Constant` | Add a new column with a fixed value to every row. |
| **Advanced** | `Group By` | Aggregate data using Sum, Mean, Count, Max, or Min operations. |
| | `Calculate` | Perform math between two columns (Add, Sub, Mult, Div). |
| | `String Op` | Manipulate text (Upper, Lower, Strip, or Title Case). |
| | `Python Script` | **Custom Code**: Write raw Python/Pandas scripts for bespoke logic. |
| **Output** | `Visualize` | Create Bar, Line, Scatter, Pie, or Histogram charts (PNG). |
| | `Destination` | Export results to CSV, JSON, Excel, or a SQLite database. |

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
    # Important: Add your GEMINI_API_KEY to a .env file in /backend
    python run.py
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access:** Open `http://localhost:5173`.

## 🛡️ Admin Oversight
Admin users have exclusive access to:
* **User Management**: Monitor total data processed per user and suspend accounts.
* **System Broadcast**: Send real-time notifications to all active users.
* **Email Blast**: Queue system-wide emails for critical updates.

<br>

**Developed by Abhinav R Nair.**
