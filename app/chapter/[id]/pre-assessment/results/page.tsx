'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PreAssessmentResults() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const score = parseInt(searchParams.get('score') || '0');
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '5');

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const getPerformanceLevel = () => {
    if (score >= 80) return { level: 'Excellent!', color: 'text-green-600', emoji: '🌟' };
    if (score >= 60) return { level: 'Good!', color: 'text-blue-600', emoji: '👍' };
    return { level: 'Keep Learning!', color: 'text-orange-600', emoji: '💪' };
  };

  const performance = getPerformanceLevel();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pre-Assessment Complete!
            </h1>
            <p className="text-gray-800">
              Great job! Here&apos;s how you did:
            </p>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {Math.round(score)}%
              </div>
              <p className="text-xl text-gray-900 mb-4">
                {correct} out of {total} questions correct
              </p>
              <div className={`text-2xl font-semibold ${performance.color} flex items-center justify-center`}>
                <span className="mr-2">{performance.emoji}</span>
                {performance.level}
              </div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <p className="text-gray-900">
              <span className="font-semibold">💡 What&apos;s Next:</span>{' '}
              {score >= 60 
                ? "You have a good understanding of the basics! Let's dive deeper into the concepts."
                : "Don't worry! We'll start from the fundamentals and build your understanding step by step."
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href={`/chapter/${params.id}/explanation`}
              className="block w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition text-center text-lg"
            >
              Continue to Explanation →
            </Link>
            
            <Link
              href={`/chapter/${params.id}`}
              className="block w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              Back to Chapter Overview
            </Link>
          </div>

          {/* Stage Indicator */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-700">
              <span className="mr-2">Stage 1 of 5 Complete</span>
              <span>✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
