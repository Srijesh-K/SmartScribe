import React, { useState } from "react";
import { QuizQuestion, QuizAttempt } from "../types";
import { Check, X, AlertCircle, ArrowLeft, ArrowRight, RotateCcw, Award, CheckCircle2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizViewProps {
  questions: QuizQuestion[];
  noteTitle: string;
  onClose: () => void;
  onFinishQuiz: (attempt: QuizAttempt) => void;
}

export default function QuizView({ questions, noteTitle, onClose, onFinishQuiz }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return; // Prevent changing after clicking
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsAnswered(selectedAnswers[questions[currentIdx + 1].id] !== undefined);
    } else {
      // Complete quiz
      setQuizFinished(true);
      const score = questions.reduce((acc, q) => {
        return acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0);
      }, 0);
      onFinishQuiz({
        notesSessionId: "", // will be linked in App.tsx
        score,
        total: questions.length,
        userAnswers: selectedAnswers,
        completedAt: new Date().toISOString()
      });
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setIsAnswered(true); // Since it was already answered
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  const score = questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div id="quiz-view-root" className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Study Notes</span>
          </button>
          <h2 className="font-sans font-bold text-xl text-slate-900 leading-tight">
            Comprehension Practice: {noteTitle}
          </h2>
        </div>
        <div className="font-mono text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 font-semibold uppercase tracking-wider">
          Quiz Mode
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key="active-quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Main Question Card */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span className="font-bold text-indigo-600">{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Statement */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-lg md:text-xl text-slate-800 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const letter = ["A", "B", "C", "D"][idx] || "";
                  const isSelected = selectedAnswers[currentQuestion.id] === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  
                  let optionStyles = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
                  if (isAnswered) {
                    if (isCorrect) {
                      // Correct answer gets green border
                      optionStyles = "border-green-300 bg-green-50 text-green-900 font-medium";
                    } else if (isSelected) {
                      // Selected incorrect answer gets red border
                      optionStyles = "border-rose-300 bg-rose-50 text-rose-900";
                    } else {
                      // Non-selected incorrect answers fade slightly
                      optionStyles = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60 pointer-events-none";
                    }
                  } else if (isSelected) {
                    optionStyles = "border-indigo-500 bg-indigo-50/50 text-indigo-900";
                  }

                  return (
                    <button
                      id={`quiz-option-${currentIdx}-${idx}`}
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all text-sm font-sans ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0
                          ${isSelected 
                            ? "bg-indigo-600 text-white" 
                            : isAnswered && isCorrect
                              ? "bg-green-600 text-white"
                              : isAnswered && isSelected
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </div>
                      
                      {isAnswered && isCorrect && (
                        <Check className="w-5 h-5 text-green-600 shrink-0 ml-2" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <X className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* feedback explanation */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2 mt-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-indigo-700 font-sans font-semibold text-xs uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4" />
                      <span>Educational Explanation</span>
                    </div>
                    <p className="font-sans text-sm text-slate-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  id="quiz-back-btn"
                  onClick={handleBack}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-sans font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Previous
                </button>

                <button
                  id="quiz-next-btn"
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-sans font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span>{currentIdx < questions.length - 1 ? "Next Question" : "Finish Assessment"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Assessment Side-card */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-widest text-slate-500">Practice insights</h4>
              
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                <p className="font-sans text-slate-600 leading-relaxed">
                  Quizzes reinforce <strong>Active Recall</strong> and prevent passive reading traps.
                </p>
                <p className="font-sans text-slate-600 leading-relaxed">
                  Review explanations deeply, especially for items you missed.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-sans text-slate-500">Note Source</span>
                  <span className="font-mono text-slate-700 truncate max-w-[120px]">{noteTitle}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-sans text-slate-500">Current Score</span>
                  <span className="font-mono font-bold text-indigo-600">{score} / {currentIdx + (isAnswered ? 1 : 0)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm text-center space-y-8"
          >
            {/* Score Ring */}
            <div className="space-y-4">
              <div className="relative inline-flex items-center justify-center">
                {/* Visual Circle */}
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 font-mono">{score}</span>
                  <span className="text-xs text-slate-400 font-mono border-t pt-1 border-slate-100">Out of {questions.length}</span>
                </div>
                <Award className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-10 h-10 p-2 rounded-full shadow-md" />
              </div>

              <div className="space-y-2">
                <h3 className="font-sans font-bold text-2xl text-slate-800">
                  {percentage >= 80 ? "Superb Comprehension!" : percentage >= 50 ? "Solid Progress!" : "Keep Reviewing!"}
                </h3>
                <p className="font-sans text-slate-500 max-w-md mx-auto text-sm">
                  You scored <strong className="text-slate-800">{percentage}%</strong>. Understanding is a continuous journey. You can rebuild these notes or retake the assessment.
                </p>
              </div>
            </div>

            {/* Question Breakdown Checklist */}
            <div id="quiz-breakdown-list" className="text-left space-y-3 max-h-80 overflow-y-auto border border-slate-100 rounded-xl p-4 bg-slate-50/50">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Detailed Questions breakdown</h4>
              {questions.map((q, idx) => {
                const isUserCorrect = selectedAnswers[q.id] === q.correctAnswer;
                return (
                  <div key={q.id} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl text-xs sm:text-sm">
                    {isUserCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-xs text-slate-500">
                        Your answer: <span className={isUserCorrect ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>{selectedAnswers[q.id] || "Skipped"}</span>
                      </p>
                      {!isUserCorrect && (
                        <p className="text-xs text-slate-500 mt-1">
                          Correct: <span className="text-slate-700 font-semibold">{q.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                id="quiz-retry-btn"
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-sans font-semibold transition-colors w-full sm:w-auto justify-center"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>

              <button
                id="quiz-finish-close-btn"
                onClick={onClose}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-sans font-semibold transition-all shadow-sm w-full sm:w-auto justify-center"
              >
                Return to Notes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
