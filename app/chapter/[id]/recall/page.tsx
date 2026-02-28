'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface QACard {
  question: string;
  answer: string;
}

export default function RecallTestPage() {
  const params = useParams();
  const router = useRouter();
  const [cards, setCards] = useState<QACard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selfMarks, setSelfMarks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    loadRecallCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadRecallCards = async () => {
    try {
      const res = await fetch(`/api/content/${params.id}`);
      if (!res.ok) throw new Error('Failed to load chapter content');
      const data = await res.json();

      const qaCards = Array.isArray(data?.textbookExercise?.qaCards) ? data.textbookExercise.qaCards : [];
      let prepared: QACard[] = qaCards
        .filter((q: any) => q?.question && q?.answer)
        .map((q: any) => ({ question: q.question, answer: q.answer }));

      if (prepared.length === 0 && Array.isArray(data?.test)) {
        prepared = data.test
          .filter((q: any) => q?.question && q?.explanation)
          .map((q: any) => ({ question: q.question, answer: q.explanation }));
      }

      if (prepared.length === 0) {
        throw new Error('No recall cards available for this chapter');
      }

      setCards(prepared);
    } catch (e) {
      console.error('Recall card loading failed:', e);
      alert('Could not load recall test for this chapter.');
      router.push(`/chapter/${params.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const markAndNext = (known: boolean) => {
    setSelfMarks((prev) => ({ ...prev, [index]: known }));
    setRevealed(false);

    if (index === cards.length - 1) {
      const updated = { ...selfMarks, [index]: known };
      const correct = Object.values(updated).filter(Boolean).length;
      const score = cards.length ? (correct / cards.length) * 100 : 0;
      router.push(`/chapter/${params.id}/recall/results?score=${score}&correct=${correct}&total=${cards.length}`);
      return;
    }

    setIndex((i) => i + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const progress = ((index + 1) / cards.length) * 100;
  const current = cards[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href={`/chapter/${params.id}`} className="text-violet-700 hover:text-violet-800 text-sm font-medium">← Back to Chapter</Link>
              <h1 className="text-2xl font-bold text-gray-900">Textbook Recall Test</h1>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-semibold">Exam Mode</span>
          </div>
          <p className="text-gray-700 mb-3">Try to answer from memory, then reveal and self-evaluate honestly.</p>
          <div className="w-full bg-violet-100 rounded-full h-2.5">
            <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Card {index + 1} of {cards.length}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question</h2>
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-6">
            <p className="text-gray-900 leading-relaxed">{current.question}</p>
          </div>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition font-semibold"
            >
              Reveal Model Answer
            </button>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Model Answer</h3>
                <div className="bg-green-50 border border-green-300 rounded-2xl p-5">
                  <p className="text-gray-900 leading-relaxed">{current.answer}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => markAndNext(true)}
                  className="py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 font-semibold"
                >
                  ✅ I recalled this well
                </button>
                <button
                  onClick={() => markAndNext(false)}
                  className="py-3 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 font-semibold"
                >
                  📌 Need more revision
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
