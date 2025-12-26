# 🛠️ StreamForge: Data Pipeline Orchestration

A centralized digital platform designed to streamline data workflow design, real-time pipeline execution, and AI-assisted data transformation for engineers and data scientists.

## 💻 Tech Stack & Dependencies

| Component | Technology | File Location |
| :--- | :--- | :--- |
| **Front-End** | React (Vite), React Flow, Framer Motion | `frontend/src/`, `frontend/package.json` |
| **Back-End Logic** | Python, Flask, Socket.IO | `backend/app/`, `backend/run.py` |
| **Database** | SQLite (via SQLAlchemy) | `backend/pipelines.db` |
| **AI Integration** | Google Gemini (Generative AI) | `backend/app/chatbot_context.py` |

## ✨ Core Modules & Features

### 🧑‍💻 User Features (Engineers/Data Scientists)

| Feature | Description | Key Mechanism |
| :--- | :--- | :--- |
| **Visual Pipeline Builder** | Drag-and-drop interface to design complex data workflows. | Uses **React Flow** in `PipelineBuilder.jsx`. |
| **AI Chat Assistant** | Context-aware chatbot for debugging and optimization suggestions. | Powered by **Gemini** via `ChatAssistant.jsx`. |
| **Real-Time Execution** | Execute pipelines and view live status updates. | WebSocket events in `events.py`. |
| **Data Visualization** | Preview and analyze processed datasets (CSV/Excel). | Handled by `DataPreviewPanel.jsx` & `ProcessedData.jsx`. |
| **Collaboration** | Shared workspace for team-based pipeline management. | Managed via `CollaborationPage.jsx`. |

### 🛡️ Admin Features

| Feature | Description | Key Mechanism |
| :--- | :--- | :--- |
| **User Management** | Monitor registered users and manage access roles. | `AdminUsers.jsx` and `models.py`. |
| **System Dashboard** | Overview of active pipelines, system health, and logs. | `AdminDashboard.jsx`. |
| **Pipeline Oversight** | Review and manage all user-created pipelines globally. | `AllPipelines.jsx`. |

## 🚀 Installation Guide

### Prerequisites

Ensure you have the following installed:
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+) & **pip**

### Quick Setup

1.  **Clone the Repository:**
    ```bash
    git clone [repository_url] StreamForge
    cd StreamForge
    ```

2.  **Backend Setup:** Navigate to the backend, install dependencies, and start the server.
    ```bash
    cd backend
    pip install -r requirements.txt
    python run.py
    ```
    * *Note: Ensure you create a `.env` file in `backend/` with your `GOOGLE_API_KEY`.*

3.  **Frontend Setup:** Open a new terminal, navigate to the frontend, and run the dev server.
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Platform:**
    Open your browser and navigate to the local URL provided (typically `http://localhost:5173`).

## 🔒 Credentials & Authentication

StreamForge utilizes **JWT Authentication**.

* **New Users**: You can register a new account via the **Sign Up** page (`SignupPage.jsx`) upon launching the application.
* **Admin Access**: The first registered user or a user manually set in `pipelines.db` will have admin privileges (depending on configuration).

<br>

**Developed by Abhinav R Nair.**
