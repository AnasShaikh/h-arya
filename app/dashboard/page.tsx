'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Chapter {
  id: number;
  subject: string;
  chapterNumber: number;
  chapterName: string;
  description: string;
  isActive: boolean;
}

// Visual config per subject — add new subjects here as needed
interface SubjectVisualConfig {
  emoji: string;
  subtitle: string;
  color: string;
  activeCard: string;
  inactiveCard: string;
  button: string;
}

const SUBJECT_CONFIG: Record<string, SubjectVisualConfig> = {
  Science: { emoji: '🔬', subtitle: 'Physics, Chemistry, Biology', color: 'from-emerald-500 via-green-600 to-teal-600', activeCard: 'border-emerald-200 bg-emerald-50', inactiveCard: 'border-emerald-100 bg-emerald-50/40', button: 'bg-emerald-600 hover:bg-emerald-700' },
  Mathematics: { emoji: '📐', subtitle: 'Numbers, Algebra, Geometry', color: 'from-blue-500 via-indigo-600 to-violet-700', activeCard: 'border-blue-200 bg-blue-50', inactiveCard: 'border-blue-100 bg-blue-50/40', button: 'bg-blue-600 hover:bg-blue-700' },
  English: { emoji: '📖', subtitle: 'Literature, Grammar, Writing', color: 'from-purple-500 via-fuchsia-600 to-pink-600', activeCard: 'border-purple-200 bg-purple-50', inactiveCard: 'border-purple-100 bg-purple-50/40', button: 'bg-purple-600 hover:bg-purple-700' },
  Marathi: { emoji: '🌸', subtitle: 'कथा, कविता, व्याकरण', color: 'from-orange-500 via-amber-600 to-yellow-600', activeCard: 'border-amber-200 bg-amber-50', inactiveCard: 'border-amber-100 bg-amber-50/40', button: 'bg-amber-600 hover:bg-amber-700' },
  History: { emoji: '🏰', subtitle: 'Medieval India, Maratha Empire', color: 'from-amber-600 via-orange-600 to-rose-700', activeCard: 'border-yellow-200 bg-yellow-50', inactiveCard: 'border-yellow-100 bg-yellow-50/40', button: 'bg-yellow-700 hover:bg-yellow-800' },
  Civics: { emoji: '⚖️', subtitle: 'Constitution of India', color: 'from-cyan-500 via-sky-600 to-blue-600', activeCard: 'border-teal-200 bg-teal-50', inactiveCard: 'border-teal-100 bg-teal-50/40', button: 'bg-teal-600 hover:bg-teal-700' },
  Geography: { emoji: '🌍', subtitle: 'Physical, Human & Practical', color: 'from-sky-500 via-blue-600 to-indigo-700', activeCard: 'border-sky-200 bg-sky-50', inactiveCard: 'border-sky-100 bg-sky-50/40', button: 'bg-sky-600 hover:bg-sky-700' },
  Hindi: { emoji: '📔', subtitle: 'सुलभभारती - सुवचन, कथा, व्याकरण', color: 'from-rose-500 via-red-600 to-orange-600', activeCard: 'border-red-200 bg-red-50', inactiveCard: 'border-red-100 bg-red-50/40', button: 'bg-red-600 hover:bg-red-700' },
};

const DEFAULT_CONFIG: SubjectVisualConfig = {
  emoji: '📚',
  subtitle: 'Maharashtra State Board',
  color: 'from-gray-500 via-slate-600 to-gray-700',
  activeCard: 'border-gray-200 bg-gray-50',
  inactiveCard: 'border-gray-200 bg-gray-50',
  button: 'bg-indigo-600 hover:bg-indigo-700',
};

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState<Record<string, any>>({});
  const [totalStarted, setTotalStarted] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const name = sessionStorage.getItem('name');
    const grade = sessionStorage.getItem('grade') || '7';
    const weak = JSON.parse(sessionStorage.getItem('weakSubjects') || '[]');
    setWeakSubjects(weak);

    if (!userId) {
      router.push('/login');
      return;
    }
    setUserName(name || 'Student');
    fetchCurriculum(grade);
    fetchProgressSummary(userId);
  }, [router]);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const fetchCurriculum = async (grade: string) => {
    try {
      const response = await fetch(`/api/curriculum?grade=${grade}`);
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgressSummary = async (userId: string) => {
    try {
      const response = await fetch(`/api/progress/summary?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
        setTotalStarted(data.totalStarted || 0);
        setTotalCompleted(data.totalCompleted || 0);
      }
    } catch (error) {
      console.error('Error fetching progress summary:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  // Group chapters by subject, preserving insertion order
  const subjectMap: Record<string, Chapter[]> = {};
  for (const chapter of chapters) {
    if (!subjectMap[chapter.subject]) subjectMap[chapter.subject] = [];
    subjectMap[chapter.subject].push(chapter);
  }
  const subjects = Object.entries(subjectMap).sort(([subjectA], [subjectB]) => {
    const isWeakA = weakSubjects.includes(subjectA);
    const isWeakB = weakSubjects.includes(subjectB);
    if (isWeakA && !isWeakB) return -1;
    if (!isWeakA && isWeakB) return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-violet-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm text-xl">
                🎓
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent font-black text-2xl">H-Arya</h1>
                <p className="text-sm text-gray-600">Std 7 · Maharashtra Board</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 transition"
              >
                Menu ▾
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-violet-100 rounded-2xl shadow-xl p-2 z-20">
                  <Link
                    href="/pricing"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-violet-700 hover:bg-violet-50"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-violet-700 hover:bg-violet-50"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-violet-700 hover:bg-violet-50"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-violet-700 to-indigo-600 rounded-2xl p-5 text-white mb-6">
          <h2 className="text-2xl font-black">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {userName}! 🌟
          </h2>
          <p className="text-violet-200 font-medium mt-1">Ready to learn something new today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-violet-100 shadow-[0_2px_16px_rgba(109,40,217,0.07)] p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-3xl font-black text-violet-700">{totalStarted}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Chapters Started</p>
          </div>

          <div className="bg-white rounded-2xl border border-violet-100 shadow-[0_2px_16px_rgba(109,40,217,0.07)] p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-lg">✅</span>
            </div>
            <p className="text-3xl font-black text-violet-700">{totalCompleted}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Chapters Completed</p>
          </div>

          <div className="bg-white rounded-2xl border border-violet-100 shadow-[0_2px_16px_rgba(109,40,217,0.07)] p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-lg">⭐</span>
            </div>
            <p className="text-3xl font-black text-violet-700">{progressData.overallMastery || 0}%</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Avg Mastery</p>
          </div>
        </div>

        <div className="grid gap-6">
          {subjects.map(([subject, subjectChapters]) => {
            const config = SUBJECT_CONFIG[subject] ?? DEFAULT_CONFIG;
            const isExpanded = expandedSubjects.has(subject);
            const subjectProgress = progressData?.bySubject?.[subject];
            // Extract the first color from the gradient string for the chapter circle bg
            const firstColorClass = config.color.split(' ')[0].replace('from-', 'bg-');
            
            return (
              <div key={subject} className="bg-white rounded-2xl border border-violet-100 shadow-[0_2px_16px_rgba(109,40,217,0.07)] overflow-hidden">
                <button
                  onClick={() => toggleSubject(subject)}
                  className={`w-full p-6 text-left bg-gradient-to-r ${config.color} hover:opacity-95 transition-opacity text-white`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-5xl leading-none">{config.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                        <h4 className="text-2xl font-bold truncate">{subject}</h4>
                        {weakSubjects.includes(subject) && (
                          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                            🎯 Focus area
                          </span>
                        )}
                      </div>
                        <p className="text-white/90 text-sm truncate">{config.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {subjectProgress && (
                        <span className="px-3 py-1 rounded-full bg-white/25 text-white text-xs font-semibold border border-white/40">
                          {subjectProgress.completed}/{subjectProgress.total} done
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/30">
                        {subjectChapters.length} Chapters
                      </span>
                      <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-white">
                    <div className="grid gap-3">
                      {subjectChapters.map((chapter) => {
                        const chapterProgress = progressData?.bySubject?.[chapter.subject]?.chapters?.[chapter.chapterName];
                        return (
                          <div
                            key={chapter.id}
                            className={`rounded-xl border p-4 ${chapter.isActive ? 'border-violet-100 bg-white' : 'border-gray-100 bg-gray-50/50'}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                              <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 ${firstColorClass}`}>
                                  {chapter.chapterNumber}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 truncate">
                                    {chapter.chapterName === `Unit ${chapter.chapterNumber}`
                                      ? chapter.chapterName
                                      : chapter.chapterName}
                                  </div>
                                  <p className="text-sm text-gray-500 font-medium mt-1 leading-6 line-clamp-4">
                                    {chapter.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Progress</span>
                                    <div className="flex items-center gap-1.5">
                                      {[1, 2, 3, 4, 5, 6].map((stage) => (
                                        <span
                                          key={stage}
                                          className={`w-2.5 h-2.5 rounded-full ${chapterProgress?.stagesCompleted?.includes(stage) ? 'bg-violet-600 shadow-[0_0_6px_rgba(109,40,217,0.5)]' : 'bg-gray-200'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {chapter.isActive ? (
                                <Link
                                  href={`/chapter/${chapter.id}`}
                                  className="bg-gradient-to-r from-violet-700 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-violet-200 self-start sm:self-auto"
                                >
                                  Start
                                </Link>
                              ) : (
                                <span className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 self-start sm:self-auto">
                                  <span aria-hidden>🔒</span>
                                  Coming Soon
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-violet-100 bg-white/80 backdrop-blur-sm mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-500 font-medium">© {new Date().getFullYear()} H-Arya • Built for Maharashtra Board students</p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-violet-700">
              <Link href="/pricing" className="hover:text-violet-900">Pricing</Link>
              <Link href="/privacy-policy" className="hover:text-violet-900">Privacy</Link>
              <Link href="/terms" className="hover:text-violet-900">Terms</Link>
              <Link href="/refund-policy" className="hover:text-violet-900">Refunds</Link>
              <Link href="/contact" className="hover:text-violet-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
