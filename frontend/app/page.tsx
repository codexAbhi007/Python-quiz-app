"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import quizData from "@/data/questions.json";
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
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [resultsAnalysis, setResultsAnalysis] = useState<{question: string, correct: boolean, yourAnswer: string, correctAnswer: string}[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isFinished && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handleNextQuestion(null);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying, isFinished]);

  const handleStartQuiz = (topic: Topic) => {
    const topicQs = quizData.questions.filter(q => q.topicId === topic.id);
    setSelectedTopic(topic);
    setQuestions(topicQs);
    setCurrentQuestionIndex(0);
    setScore(0);
    setResultsAnalysis([]);
    setSelectedAnswer(null);
    setIsFinished(false);
    setIsPlaying(true);
    setTimeLeft(15);
  };

  const handleNextQuestion = (answerIndex: number | null) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQ.correctOption;
    
    if (isCorrect) setScore(prev => prev + 1);
    
    setResultsAnalysis(prev => [...prev, {
      question: currentQ.question,
      correct: isCorrect,
      yourAnswer: answerIndex !== null ? currentQ.options[answerIndex] : "Didn't answer",
      correctAnswer: currentQ.options[currentQ.correctOption]
    }]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      setSelectedAnswer(null);
      setIsFinished(true);
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setIsPlaying(false);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="p-4 border-b flex justify-between items-center max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">QuizApp (v1)</h1>
        <ModeToggle />
      </header>
      
      <main className="max-w-3xl mx-auto p-6 mt-8">
        {!isPlaying && !isFinished && (
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold mb-6">Choose a Topic</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {quizData.topics.map((topic) => (
                <Card key={topic.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer border hover:border-primary" onClick={() => handleStartQuiz(topic)}>
                  <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                  <p className="text-muted-foreground text-sm">{topic.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isPlaying && !isFinished && questions.length > 0 && (
          <Card className="p-8 max-w-2xl mx-auto relative overflow-hidden">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <div className={`flex items-center gap-1.5 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold">{timeLeft}s</span>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="rounded-full h-2" />
            </div>

            <h2 className="text-2xl font-semibold mb-6">{questions[currentQuestionIndex].question}</h2>
            
            <div className="grid gap-3">
              {questions[currentQuestionIndex].options.map((option, idx) => (
                <Button 
                  key={idx} 
                  variant={selectedAnswer === idx ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-4 px-6 text-md"
                  onClick={() => {
                    setSelectedAnswer(idx);
                    handleNextQuestion(idx);
                  }}
                >
                  <span className="mr-4 font-mono text-muted-foreground">{String.fromCharCode(65 + idx)}</span>
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {isFinished && (
          <div className="space-y-8 animate-in slide-in-from-bottom border p-8 rounded-xl shadow-sm bg-card">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold mb-2">Quiz Completed!</h2>
              <p className="text-xl text-muted-foreground mb-4">
                Your Score: <span className="font-bold text-primary">{score} / {questions.length}</span>
              </p>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-full mb-8">
                Accuracy: {Math.round((score / questions.length) * 100)}%
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold mb-4 border-b pb-2">Result Analysis</h3>
              {resultsAnalysis.map((res, i) => (
                <div key={i} className={`p-4 rounded-lg border ${res.correct ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <p className="font-medium mb-3">{i + 1}. {res.question}</p>
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 text-sm">
                    <p className={res.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      <span className="font-semibold">Your Answer:</span> {res.yourAnswer}
                    </p>
                    {!res.correct && (
                      <p className="text-green-600 dark:text-green-400">
                        <span className="font-semibold">Correct Answer:</span> {res.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 text-center">
              <Button size="lg" onClick={handleRestart} className="px-8 font-semibold">Play Again</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}