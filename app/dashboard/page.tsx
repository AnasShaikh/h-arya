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
const SUBJECT_CONFIG: Record<string, { emoji: string; subtitle: string; color: string }> = {
  Science:     { emoji: '🔬', subtitle: 'Physics, Chemistry, Biology',   color: 'from-green-500 to-emerald-600' },
  Mathematics: { emoji: '📐', subtitle: 'Numbers, Algebra, Geometry',    color: 'from-blue-500 to-indigo-600'  },
  English:     { emoji: '📖', subtitle: 'Literature, Grammar, Writing',  color: 'from-purple-500 to-pink-600'  },
  Marathi:     { emoji: '🌸', subtitle: 'कथा, कविता, व्याकरण',            color: 'from-orange-500 to-amber-600' },
  History:     { emoji: '🏰', subtitle: 'Medieval India, Maratha Empire',  color: 'from-yellow-600 to-orange-700' },
  Civics:      { emoji: '⚖️',  subtitle: 'Constitution of India',           color: 'from-teal-500 to-cyan-600'    },
  Geography:   { emoji: '🌍', subtitle: 'Physical, Human & Practical',     color: 'from-sky-500 to-blue-600'     },
  Hindi:       { emoji: '📔', subtitle: 'सुलभभारती - सुवचन, कथा, व्याकरण',   color: 'from-red-500 to-orange-600'   },
};

const DEFAULT_CONFIG = { emoji: '📚', subtitle: 'Grade 7 Maharashtra Board', color: 'from-gray-500 to-gray-600' };

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const name = sessionStorage.getItem('name');
    if (!userId) { router.push('/login'); return; }
    setUserName(name || 'Student');
    fetchCurriculum();
  }, [router]);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const fetchCurriculum = async () => {
    try {
      const grade = sessionStorage.getItem('grade') || '7';
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
  const subjects = Object.entries(subjectMap);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎓</span>
              <h1 className="text-2xl font-bold text-gray-900">H-Arya</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-800">Welcome, {userName}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-800 hover:text-gray-900 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Dashboard</h2>
          <p className="text-gray-800">Grade 7 - Maharashtra Board</p>
        </div>

        <div className="grid gap-8">
          {subjects.map(([subject, subjectChapters]) => {
            const config = SUBJECT_CONFIG[subject] ?? DEFAULT_CONFIG;
            const isExpanded = expandedSubjects.has(subject);
            return (
              <div key={subject} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Subject Header */}
                <button 
                  onClick={() => toggleSubject(subject)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center">
                    <span className="text-4xl mr-3">{config.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{subject}</h3>
                      <p className="text-gray-700">{config.subtitle} • {subjectChapters.length} Chapters</p>
                    </div>
                  </div>
                  <div className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </button>

                {/* Chapter List */}
                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-gray-100">
                    <div className="grid gap-4 mt-4">
                      {subjectChapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className={`p-4 rounded-lg border-2 ${
                            chapter.isActive
                              ? 'border-indigo-200 bg-indigo-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-semibold text-gray-900 mr-2">
                                  {chapter.chapterName === `Unit ${chapter.chapterNumber}`
                                    ? chapter.chapterName
                                    : `Ch ${chapter.chapterNumber}:`}
                                </span>
                                {chapter.chapterName !== `Unit ${chapter.chapterNumber}` && (
                                  <span className="text-gray-900">{chapter.chapterName}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{chapter.description}</p>
                            </div>
                            {chapter.isActive ? (
                              <Link
                                href={`/chapter/${chapter.id}`}
                                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                              >
                                Start
                              </Link>
                            ) : (
                              <span className="ml-4 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm">
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
