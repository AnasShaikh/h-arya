'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RecallResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const score = Math.round(parseFloat(searchParams.get('score') || '0'));
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '0');

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) router.push('/login');
  }, [router]);

  const tone = score >= 80
    ? { emoji: '🌟', title: 'Excellent recall!', color: 'text-green-600' }
    : score >= 60
    ? { emoji: '👍', title: 'Good recall', color: 'text-violet-600' }
    : { emoji: '💪', title: 'Keep practicing', color: 'text-amber-600' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-violet-100 p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{tone.emoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Textbook Recall Results</h1>
          <p className="text-gray-700">Your self-evaluated memory score for this chapter.</p>
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 text-center mb-6">
          <p className="text-5xl font-bold text-violet-700">{score}%</p>
          <p className="text-gray-800 mt-2">{correct} of {total} cards recalled well</p>
          <p className={`mt-2 font-semibold ${tone.color}`}>{tone.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href={`/chapter/${params.id}/recall`}
            className="py-3 rounded-2xl bg-violet-600 text-white text-center font-semibold hover:bg-violet-700"
          >
            Retry Recall Test
          </Link>
          <Link
            href={`/chapter/${params.id}/revision`}
            className="py-3 rounded-2xl bg-violet-600 text-white text-center font-semibold hover:bg-violet-700"
          >
            Go to Revision
          </Link>
        </div>

        <Link
          href={`/chapter/${params.id}`}
          className="block mt-4 py-3 rounded-2xl border border-violet-200 text-violet-700 text-center font-semibold hover:bg-violet-50"
        >
          Back to Chapter Overview
        </Link>
      </div>
    </div>
  );
}
