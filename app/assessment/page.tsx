'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/lib/types';

export default function Assessment() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAssessment();
  }, []);

  const fetchAssessment = async () => {
    try {
      const response = await fetch('/api/assessment');
      if (!response.ok) throw new Error('Failed to fetch assessment');
      
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      alert('Failed to load assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
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
      const studentId = sessionStorage.getItem('studentId');
      
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(studentId || '0'),
          answers: selectedAnswers
        })
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      const data = await response.json();
      
      // Store results
      sessionStorage.setItem('assessmentScore', data.score);
      sessionStorage.setItem('knowledgeLevel', data.level);

      // Navigate to chat
      router.push('/session');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quick Assessment
          </h1>
          <p className="text-gray-800 mb-4">
            Let&apos;s see what you already know! This helps us personalize your learning.
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {question?.question}
          </h2>

          <div className="space-y-3">
            {question?.options?.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswers[question.id] === optionLetter;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, optionLetter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-gray-900'
                      : 'border-gray-300 hover:border-indigo-400 text-gray-900'
                  }`}
                >
                  <span className="font-semibold mr-2">{optionLetter}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(selectedAnswers).length !== questions.length}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
