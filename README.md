# Full-Stack Minimalist Quiz Application

A modern, responsive, and minimalist Quiz Application built with a decoupled architecture. It features a Next.js frontend with a professional light/dark glassmorphism UX, and a lightning-fast Python FastAPI backend serving the quiz data in real-time.

## Features
- **Professional Minimalist UI:** Clean aesthetic with subtle glassmorphism (transparency/backdrop-blur) effects—no distracting gradients or emojis.
- **Dark & Light Mode:** Fully responsive theme support.
- **Full-Stack Architecture:** Next.js (React) front-end communicating with a Python FastAPI REST API.
- **Topic Selection:** Categorized quizzes with multiple subjects.
- **Result Analysis:** See detailed breakdown of your correct and incorrect answers at the end of the quiz.
- **Time Tracking:** Per-question countdown timer.
- **Customizable Content:** Easily structure and add your own topics and questions via a simple JSON file.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Lucide Icons, shadcn/ui.
- **Backend:** Python 3, FastAPI, Uvicorn, Pydantic.

## Getting Started

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [Python](https://www.python.org/downloads/) (v3.8 or higher)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/codexAbhi007/Python-quiz-app.git
cd Python-quiz-app
```

### 2. Setup the Backend (FastAPI)
```bash
# Navigate to the backend directory
cd backend

# (Optional but recommended) Create and activate a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate 
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (FastAPI, Uvicorn, etc.)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```
The backend API will run on `http://localhost:8000`.

### 3. Setup the Frontend (Next.js)
Open a *new* terminal window/tab:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will run on `http://localhost:3000`. Open this URL in your browser to play the quiz!

---

## How to Add Your Own Questions

The quiz data is currently served from a static JSON file located at `backend/questions.json`. To add custom topics and questions, simply modify this file.

### Structure of `questions.json`

```json
{
  "topics": [
    {
      "id": "topic-1",
      "name": "Your Custom Topic",
      "description": "Short description of what the topic covers."
    }
  ],
  "questions": [
    {
      "id": 1,
      "topicId": "topic-1",
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "answer": "4"
    }
  ]
}
```

### Steps to add data:
1. **Add a Topic:** Add a new JSON object inside the `"topics"` array. Give it a unique `"id"` (e.g., `"web-dev"`).
2. **Add Questions:** Add new question objects inside the `"questions"` array. 
   - Ensure the `"topicId"` exactly matches the `"id"` of the topic you created.
   - Provide an array of 4 exactly formatted `"options"`.
   - Set the `"answer"` to exactly match one of the string options you provided.
3. **Save the file:** The FastAPI server will automatically serve the updated data on the next request. Refresh your browser to see your new questions!
