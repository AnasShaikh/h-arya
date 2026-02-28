'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3;

const SUBJECTS = ['Science', 'Mathematics', 'English', 'Marathi', 'History', 'Civics', 'Geography', 'Hindi'] as const;

const SUBJECT_EMOJIS: Record<(typeof SUBJECTS)[number], string> = {
  Science: '🔬',
  Mathematics: '📐',
  English: '📖',
  Marathi: '🌸',
  History: '🏰',
  Civics: '⚖️',
  Geography: '🌍',
  Hindi: '📔',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('Student');
  const [grade, setGrade] = useState('7');
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const storedName = sessionStorage.getItem('name');
    const storedGrade = sessionStorage.getItem('grade');
    const onboardingDone = sessionStorage.getItem('onboardingDone');

    if (!userId) {
      router.push('/login');
      return;
    }

    if (onboardingDone === 'true') {
      router.push('/dashboard');
      return;
    }

    setName(storedName || 'Student');
    setGrade(storedGrade || '7');
  }, [router]);

  const toggleSubject = (subject: string) => {
    setWeakSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const finishOnboarding = () => {
    sessionStorage.setItem('onboardingDone', 'true');
    sessionStorage.setItem('weakSubjects', JSON.stringify(weakSubjects));
    router.push('/dashboard');
  };

  const progressWidth = step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full';

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100 p-8 max-w-md w-full">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={step === dot ? 'w-2.5 h-2.5 bg-violet-600 rounded-full' : 'w-2 h-2 bg-gray-200 rounded-full'}
            />
          ))}
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div className={`bg-gradient-to-r from-violet-700 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ${progressWidth}`} />
        </div>

        {step === 1 && (
          <div className="text-center">
            <div className="inline-flex bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-5xl mb-6 shadow-lg">
              🎓
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to H-Arya, {name}! 🙏</h1>
            <p className="text-gray-500 mb-6">Your personal tutor for Std {grade} Maharashtra Board</p>

            <div className="text-left space-y-3 mb-8 text-gray-700">
              <p>✅ Learn every concept from your textbook</p>
              <p>✅ Memorize exact answers that score marks</p>
              <p>✅ Practice with chapter-end questions</p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3.5 font-bold transition"
            >
              Let&apos;s get started →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Which subjects feel hardest? 😅</h2>
            <p className="text-gray-500 text-sm mb-6">We&apos;ll prioritize these for you. Pick all that apply.</p>

            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {SUBJECTS.map((subject) => {
                const selected = weakSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={selected
                      ? 'border-2 border-violet-600 bg-violet-600 text-white rounded-2xl px-4 py-2.5 font-semibold text-sm shadow-md shadow-violet-200'
                      : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50 rounded-2xl px-4 py-2.5 font-semibold text-sm transition-all duration-150'}
                  >
                    {SUBJECT_EMOJIS[subject]} {subject}
                  </button>
                );
              })}
            </div>

            <button onClick={() => setStep(3)} className="text-sm text-violet-700 hover:text-violet-800 mb-6">
              Skip for now →
            </button>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3.5 font-bold transition"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="inline-flex bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-5xl mb-6 shadow-lg">
              🚀
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">You&apos;re all set!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your dashboard is ready. Start with any chapter — we&apos;ll track your progress as you go.
            </p>

            <div className="bg-violet-50 rounded-2xl p-5 border border-violet-200 text-left mb-6">
              <p className="text-sm text-violet-900">
                💡 Start with a chapter you just studied in school — memorize the answers while they&apos;re fresh!
              </p>
            </div>

            <button
              onClick={finishOnboarding}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl py-3.5 font-bold transition"
            >
              Go to my dashboard 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
