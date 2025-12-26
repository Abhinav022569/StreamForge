# StreamForge

StreamForge is a comprehensive data pipeline orchestration and visual builder platform. It allows users to design, manage, and execute data processing pipelines through an intuitive drag-and-drop interface, enhanced by an AI-powered chat assistant.

## 🚀 Features

-   **Visual Pipeline Builder**: Create complex data workflows using a node-based editor (powered by React Flow).
-   **AI Assistant**: Integrated chatbot powered by Google Gemini (Generative AI) to assist with data tasks and context.
-   **Real-time Execution**: WebSocket integration for real-time updates on pipeline status and data processing.
-   **Data Transformation**: Built-in support for filtering, transformation, and visualization of datasets (CSV, etc.).
-   **User Management**: Secure authentication (JWT), user profiles, and an admin dashboard for managing users and pipelines.
-   **Interactive Dashboard**: Visualize processed data and monitor system events.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **Visualization**: React Flow (Pipeline Builder), Framer Motion (Animations)
-   **Communication**: Socket.io-client, Axios
-   **Styling**: CSS Modules / Standard CSS

### Backend
-   **Framework**: Flask (Python)
-   **Database**: SQLAlchemy (SQLite/Relational)
-   **AI/ML**: Google Generative AI (Gemini)
-   **Data Processing**: Pandas, NumPy, OpenPYXL
-   **Real-time**: Flask-SocketIO
-   **Task Scheduling**: APScheduler

## 📂 Project Structure

```bash
StreamForge/
├── backend/            # Flask server, API routes, and data processing logic
│   ├── app/            # Application blueprints (routes, models, events)
│   ├── uploads/        # Directory for user-uploaded files
│   ├── requirements.txt
│   └── run.py          # Entry point for the backend
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # UI Components (PipelineBuilder, ChatAssistant, etc.)
│   │   └── assets/     # Static assets
│   └── package.json
└── README.md
