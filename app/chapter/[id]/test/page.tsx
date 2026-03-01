'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type RawQuestion = {
  id?: string;
  question?: string;
  options?: string[] | Record<string, string>;
  correctAnswer?: string | number;
  explanation?: string;
};

const wrongAnswerVariants = {
  idle: { x: 0 },
  shake: {
    x: [-4, 4, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

function normalizeQuestions(rawQuestions: unknown, sourcePrefix: string): TestQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions
    .map((raw, index) => normalizeQuestion(raw as RawQuestion, sourcePrefix, index))
    .filter((q): q is TestQuestion => q !== null);
}

function normalizeQuestion(raw: RawQuestion, sourcePrefix: string, index: number): TestQuestion | null {
  const questionText = typeof raw.question === 'string' ? raw.question.trim() : '';
  if (!questionText) return null;

  const options = raw.options;
  let optionEntries: [string, string][] = [];

  if (Array.isArray(options)) {
    optionEntries = options
      .map((value, i) => [String.fromCharCode(65 + i), String(value ?? '').trim()] as [string, string])
      .filter(([, value]) => Boolean(value));
  } else if (options && typeof options === 'object') {
    optionEntries = Object.entries(options)
      .map(([key, value]) => [key.trim().toUpperCase(), String(value ?? '').trim()] as [string, string])
      .filter(([key, value]) => Boolean(key && value))
      .sort((a, b) => a[0].localeCompare(b[0]));
  }

  if (optionEntries.length < 2) return null;

  const optionKeys = optionEntries.map(([key]) => key);
  const optionValues = optionEntries.map(([, value]) => value);

  const rawCorrect = (raw.correctAnswer ?? '').toString().trim();
  const correctAsKey = rawCorrect.toUpperCase();
  let correctIndex = 0;

  if (optionKeys.includes(correctAsKey)) {
    correctIndex = optionKeys.indexOf(correctAsKey);
  } else {
    const numericAnswer = Number.parseInt(rawCorrect, 10);
    if (!Number.isNaN(numericAnswer)) {
      if (numericAnswer >= 0 && numericAnswer < optionValues.length) {
        correctIndex = numericAnswer;
      } else if (numericAnswer >= 1 && numericAnswer <= optionValues.length) {
        correctIndex = numericAnswer - 1;
      }
    } else {
      const answerIndex = optionValues.findIndex(v => v.toLowerCase() === rawCorrect.toLowerCase());
      if (answerIndex >= 0) {
        correctIndex = answerIndex;
      }
    }
  }

  return {
    id: raw.id?.toString().trim() || `${sourcePrefix}_${index + 1}`,
    question: questionText,
    options: optionValues,
    correctAnswer: String.fromCharCode(65 + correctIndex),
    explanation: typeof raw.explanation === 'string' ? raw.explanation : '',
  };
}

export default function Test() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    setQuestions([]);
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setIsLoading(true);
    fetchTestQuestions();
  }, [router, params.id]);

  const fetchTestQuestions = async () => {
    try {
      setLoadError(null);
      setFallbackMessage(null);

      const response = await fetch(`/api/content/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch chapter content');

      const data = await response.json();

      const primaryQuestions = normalizeQuestions(data.test, 'test');
      if (primaryQuestions.length > 0) {
        setQuestions(primaryQuestions);
        return;
      }

      const fallbackQuestions = normalizeQuestions(data.preAssessment, 'pre-fallback');
      if (fallbackQuestions.length > 0) {
        setQuestions(fallbackQuestions);
        setFallbackMessage(
          'Final test questions were unavailable for this chapter. We loaded pre-assessment questions so you can still continue safely.'
        );
        return;
      }

      setLoadError('No valid test questions are available for this chapter yet. Please continue learning and try again later.');
    } catch (error) {
      console.error('Error fetching test questions:', error);
      setLoadError('Failed to load test questions right now. Please retry in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = sessionStorage.getItem('userId');

      let correct = 0;
      questions.forEach(q => {
        const userAnswer = selectedAnswers[q.id];
        if (userAnswer === q.correctAnswer) {
          correct++;
        }
      });

      const score = (correct / questions.length) * 100;

      await fetch(`/api/chapter/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId || '0'),
          stageCompleted: 4,
          score,
        }),
      });

      router.push(
        `/chapter/${params.id}/test/results?score=${score}&correct=${correct}&total=${questions.length}&answers=${encodeURIComponent(JSON.stringify(selectedAnswers))}`
      );
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg p-8 border border-violet-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Final Test Unavailable</h1>
          <p className="text-gray-700 mb-6">
            {loadError || 'We could not prepare valid test questions for this chapter yet.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-5 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition font-semibold"
            >
              Retry
            </button>
            <Link
              href={`/chapter/${params.id}/explanation`}
              className="w-full block text-center px-5 py-3 rounded-xl border border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold"
            >
              Continue Learning
            </Link>
            <Link
              href={`/chapter/${params.id}`}
              className="w-full block text-center px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Back to Chapter Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto py-4 md:py-8">
        {fallbackMessage && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-4 text-sm">{fallbackMessage}</div>
        )}

        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6 border border-violet-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href={`/chapter/${params.id}`}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 transition"
              >
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Final Test</h1>
                <p className="text-sm text-gray-500">Chapter Assessment</p>
              </div>
            </div>
            <span className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 text-sm rounded-full font-bold border border-amber-100">
              Stage 4 of 5
            </span>
          </div>

          <div className="mb-2 flex justify-between items-center text-sm font-medium text-gray-500">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-violet-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-violet-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-violet-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full -z-0 opacity-50"></div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 relative z-10 leading-snug">{question?.question}</h2>

          <div className="space-y-4 relative z-10">
            {question?.options?.map((option: string, index: number) => {
              const optionKey = String.fromCharCode(65 + index);
              const selectedAnswer = selectedAnswers[question.id] ?? null;
              const correctOption = question.correctAnswer;
              const isCorrect = selectedAnswer === correctOption;
              const showResult = selectedAnswer !== null;

              return (
                <motion.button
                  key={optionKey}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.1 }}
                  animate={selectedAnswer === optionKey && !isCorrect ? 'shake' : 'idle'}
                  variants={wrongAnswerVariants}
                  onClick={() => handleAnswer(question.id, optionKey)}
                  className={`w-full text-left p-4 rounded-2xl border-2 font-semibold transition-all duration-200 ${
                    selectedAnswer === null
                      ? 'border-gray-200 bg-white text-gray-800 hover:border-violet-300 hover:bg-violet-50'
                      : selectedAnswer === optionKey && isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : selectedAnswer === optionKey && !isCorrect
                      ? 'border-red-400 bg-red-50 text-red-800'
                      : correctOption === optionKey && selectedAnswer !== null
                      ? 'border-green-300 bg-green-50/50 text-green-700'
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 bg-white/70 border border-current/20">
                      {optionKey}
                    </span>
                    <span className="text-lg pt-0.5 flex items-center">
                      {option}
                      {showResult && selectedAnswer === optionKey && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="ml-2"
                        >
                          {isCorrect ? '✅' : '❌'}
                        </motion.span>
                      )}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(selectedAnswers).length !== questions.length}
                className="px-8 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-lg shadow-violet-200 hover:shadow-xl transform active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Submitting...
                  </>
                ) : (
                  <>Submit Test ✓</>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition font-bold shadow-lg shadow-violet-200 hover:shadow-xl transform active:scale-95 flex items-center gap-2"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
