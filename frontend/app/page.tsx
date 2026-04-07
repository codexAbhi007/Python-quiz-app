"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Topic = {
  id: string;
  name: string;
  description: string;
};

type Question = {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctOption: number;
};

export default function Home() {
  const [quizData, setQuizData] = useState<{
    topics: Topic[];
    questions: Question[];
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [resultsAnalysis, setResultsAnalysis] = useState<
    {
      question: string;
      correct: boolean;
      yourAnswer: string;
      correctAnswer: string;
    }[]
  >([]);

  useEffect(() => {
    // Uses the Environment variable in production, falls back to localhost in dev
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    fetch(`${API_URL}/api/data`)
      .then((res) => res.json())
      .then((data) => setQuizData(data))
      .catch((err) => console.error("Error fetching quiz data:", err));
  }, []);

  const handleNextQuestion = useCallback(
    (answerIndex: number | null) => {
      const currentQ = questions[currentQuestionIndex];
      if (!currentQ) return;
      const isCorrect = answerIndex === currentQ.correctOption;

      if (isCorrect) setScore((prev) => prev + 1);

      setResultsAnalysis((prev) => [
        ...prev,
        {
          question: currentQ.question,
          correct: isCorrect,
          yourAnswer:
            answerIndex !== null && currentQ.options
              ? currentQ.options[answerIndex]
              : "Didn't answer",
          correctAnswer: currentQ.options[currentQ.correctOption],
        },
      ]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        setSelectedAnswer(null);
        setIsFinished(true);
        setIsPlaying(false);
      }
    },
    [questions, currentQuestionIndex],
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying && !isFinished) {
      // Small delay to allow the last tick to render before jumping to next question
      timer = setTimeout(() => {
        handleNextQuestion(null);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying, isFinished, handleNextQuestion]);

  const handleStartQuiz = (topic: Topic) => {
    if (!quizData) return;
    const topicQs = quizData.questions.filter((q) => q.topicId === topic.id);
    setQuestions(topicQs);
    setCurrentQuestionIndex(0);
    setScore(0);
    setResultsAnalysis([]);
    setSelectedAnswer(null);
    setIsFinished(false);
    setIsPlaying(true);
    setTimeLeft(15);
  };

  const handleRestart = () => {
    setQuestions([]);
    setIsPlaying(false);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-950 dark:via-background dark:to-slate-900 text-foreground transition-colors duration-500 overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="flex-shrink-0 sticky top-0 z-50 p-4 border-b border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            Quiz Application
          </h1>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto px-4 py-6 relative z-10 mb-10">
        {!isPlaying && !isFinished && (
          <div className="flex-1 space-y-6 pb-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Choose a Topic</h2>
              <p className="text-muted-foreground">
                Select a subject to begin your quiz
              </p>
            </div>
            {!quizData ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {quizData.topics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="group p-6 cursor-pointer border hover:border-primary transition-colors bg-white/50 dark:bg-slate-950/50 backdrop-blur-md shadow-sm"
                    onClick={() => handleStartQuiz(topic)}
                  >
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {topic.description}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {isPlaying && !isFinished && questions.length > 0 && (
          <Card className="p-6 md:p-8 w-full max-w-3xl mx-auto relative flex flex-col flex-1 min-h-0 overflow-hidden border shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
            <div className="mb-4 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Question{" "}
                  <span className="font-semibold text-foreground">
                    {currentQuestionIndex + 1}
                  </span>{" "}
                  of {questions.length}
                </span>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    timeLeft <= 5
                      ? "bg-red-500/10 border-red-500/30 text-red-600 font-medium"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{timeLeft}s</span>
                </div>
              </div>
              <Progress
                value={((currentQuestionIndex + 1) / questions.length) * 100}
                className="h-2 rounded-full bg-secondary"
              />
            </div>

            <div className="py-4 md:py-6 shrink-0 flex items-center justify-center">
              <h2 className="text-xl md:text-2xl font-medium text-foreground text-center">
                {questions[currentQuestionIndex].question}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto grid gap-3 mt-2 pr-2 pb-4">
              {questions[currentQuestionIndex].options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={selectedAnswer === idx ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 px-4 md:px-5 transition-colors border ${
                    selectedAnswer === idx
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => {
                    setSelectedAnswer(idx);
                    handleNextQuestion(idx);
                  }}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-muted text-muted-foreground mr-4 font-medium uppercase shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 flex-shrink-0 flex justify-end border-t border-border mt-auto">
              <Button
                variant="ghost"
                onClick={handleRestart}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Cancel & Exit Quiz
              </Button>
            </div>
          </Card>
        )}

        {isFinished && (
          <div className="space-y-8 animate-in slide-in-from-bottom max-w-3xl mx-auto flex flex-col flex-1 min-h-0 w-full">
            <Card className="p-8 border rounded-xl shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-md overflow-hidden relative flex flex-col flex-1 min-h-0">
              <div className="text-center shrink-0">
                <h2 className="text-3xl font-bold">Quiz Completed</h2>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <div className="flex flex-col p-4 rounded-lg bg-muted border">
                    <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                      Final Score
                    </span>
                    <span className="text-2xl font-bold">
                      {score}{" "}
                      <span className="text-lg text-muted-foreground">
                        / {questions.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col p-4 rounded-lg bg-muted border">
                    <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider mb-1">
                      Accuracy
                    </span>
                    <span className="text-2xl font-bold">
                      {Math.round((score / questions.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-0 space-y-4">
                <h3 className="text-xl font-semibold mb-1 shrink-0">
                  Result Analysis
                </h3>

                <div className="grid gap-4 mt-4 overflow-y-auto pr-2 flex-1 pb-4">
                  {resultsAnalysis.map((res, i) => (
                    <div
                      key={i}
                      className={`p-5 rounded-lg border shrink-0 ${
                        res.correct
                          ? "border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400"
                          : "border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="font-semibold">{i + 1}.</div>
                        <div className="flex-1">
                          <p className="font-medium mb-3 text-foreground">
                            {res.question}
                          </p>

                          <div className="grid gap-2 text-sm">
                            <div className="flex gap-2">
                              <span className="font-semibold min-w-[120px]">
                                Your Answer:
                              </span>
                              <span>{res.yourAnswer}</span>
                            </div>

                            {!res.correct && (
                              <div className="flex gap-2">
                                <span className="font-semibold min-w-[120px]">
                                  Correct Answer:
                                </span>
                                <span>{res.correctAnswer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 text-center mt-auto border-t shrink-0">
                <Button
                  size="lg"
                  onClick={handleRestart}
                  className="px-8 font-medium"
                >
                  Return to Home
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
