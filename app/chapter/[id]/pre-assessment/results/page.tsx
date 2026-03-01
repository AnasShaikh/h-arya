'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import InteractiveElement from '../../../../components/InteractiveElement';

export default function PreAssessmentResults() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [interactiveElement, setInteractiveElement] = useState<any>(null);

  const score = parseInt(searchParams.get('score') || '0');
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '5');

  useEffect(() => {
    const init = async () => {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`/api/content/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.interactiveElement) setInteractiveElement(data.interactiveElement);
        }
      } catch (error) {
        console.error('Error loading interactive element:', error);
      }

      setIsLoading(false);
    };

    init();
  }, [router, params.id]);

  const isPerfectScore = score === 100;

  useEffect(() => {
    if (isPerfectScore) {
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6D28D9', '#7C3AED', '#F59E0B', '#10B981', '#EC4899'],
        });
      });
    }
  }, [isPerfectScore]);

  useEffect(() => {
    const target = score;
    const duration = 1000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setDisplayScore(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getPerformanceLevel = () => {
    if (score >= 80) return { level: 'Excellent!', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', emoji: '🌟' };
    if (score >= 60) return { level: 'Good Start!', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', emoji: '👍' };
    return { level: 'Keep Learning!', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', emoji: '💪' };
  };

  const handleInteractiveComplete = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    await fetch(`/api/chapter/${params.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(userId || '0'),
        stageCompleted: 6,
      })
    });
  };

  const performance = getPerformanceLevel();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
           <p className="mt-4 text-gray-800">Calculating results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-violet-100">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="text-5xl animate-bounce">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Assessment Complete!
            </h1>
            <p className="text-gray-500 font-medium">
              Great job! Here's your starting point:
            </p>
          </div>

          {/* Score Display */}
          <div className={`${performance.bg} ${performance.border} border-2 rounded-2xl p-8 mb-8 text-center transform transition hover:scale-[1.02]`}>
              <div className={`text-6xl font-black ${performance.color} mb-2 tracking-tight`}>
                {displayScore}%
              </div>
              <p className="text-lg font-medium text-gray-700 mb-4">
                {correct} out of {total} questions correct
              </p>
              <div className={`inline-flex items-center justify-center px-4 py-1 rounded-full bg-white/60 text-lg font-bold ${performance.color}`}>
                <span className="mr-2">{performance.emoji}</span>
                {performance.level}
              </div>
          </div>

          {/* Performance Message */}
          <div className="bg-violet-50 rounded-2xl p-6 mb-8 border border-violet-100">
            <div className="flex gap-4">
               <span className="text-2xl">💡</span>
               <div>
                  <h3 className="font-bold text-violet-900 mb-1">What's Next</h3>
                  <p className="text-violet-800 leading-relaxed">
                    {score >= 60 
                      ? "You have a solid foundation! Let's build on it with some advanced concepts."
                      : "No worries! We'll start from the basics and help you master this topic step-by-step."
                    }
                  </p>
               </div>
            </div>
          </div>

          {/* Interactive Practice */}
          {interactiveElement && (
            <div className="mb-8">
              <InteractiveElement element={interactiveElement} onComplete={handleInteractiveComplete} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href={`/chapter/${params.id}/explanation`}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 py-4 font-bold text-lg shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Continue to Explanation</span>
              <span>→</span>
            </Link>
            
            <Link
              href={`/chapter/${params.id}`}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 rounded-xl px-6 py-4 font-semibold transition-all active:scale-95 flex items-center justify-center"
            >
              Back to Chapter Overview
            </Link>
          </div>

          {/* Stage Indicator */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center text-sm font-medium text-gray-500">
              <span className="mr-2">Stage 1 of 5 Complete</span>
              <span className="text-green-500">✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
