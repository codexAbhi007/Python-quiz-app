import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Quiz API")

# Setup CORS to allow the frontend to fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_quiz_data():
    file_path = os.path.join(os.path.dirname(__file__), "questions.json")
    with open(file_path, "r") as f:
        return json.load(f)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Quiz API"}


@app.get("/api/data")
def get_quiz_data():
    return load_quiz_data()


@app.get("/api/topics")
def get_topics():
    data = load_quiz_data()
    return data.get("topics", [])


@app.get("/api/questions/{topic_id}")
def get_questions(topic_id: str):
    data = load_quiz_data()
    questions = data.get("questions", [])
    return [q for q in questions if q.get("topicId") == topic_id]
