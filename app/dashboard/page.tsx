'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Chapter {
  id: number;
  subject: string;
  chapter_number: number;
  chapter_name: string;
  description: string;
  is_active: number;
}

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    const name = sessionStorage.getItem('name');

    if (!userId) {
      router.push('/login');
      return;
    }

    setUserName(name || 'Student');
    fetchCurriculum();
  }, [router]);

  const fetchCurriculum = async () => {
    try {
      const response = await fetch('/api/curriculum');
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

  // Group chapters by subject
  const subjects = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return {};
  }, {} as Record<string, Chapter[]>);

  const scienceChapters = chapters.filter(c => c.subject === 'Science');
  const mathChapters = chapters.filter(c => c.subject === 'Mathematics');

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
              <h1 className="text-2xl font-bold text-gray-900">AI Tutor</h1>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Learning Dashboard
          </h2>
          <p className="text-gray-800">
            Grade 7 - Maharashtra Board
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-8">
          {/* Science */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-4xl mr-3">🔬</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Science</h3>
                <p className="text-gray-700">Physics, Chemistry, Biology</p>
              </div>
            </div>

            <div className="grid gap-4">
              {scienceChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`p-4 rounded-lg border-2 ${
                    chapter.is_active
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">
                          Ch {chapter.chapter_number}:
                        </span>
                        <span className="text-gray-900">{chapter.chapter_name}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{chapter.description}</p>
                    </div>
                    {chapter.is_active ? (
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

          {/* Mathematics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-4xl mr-3">📐</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Mathematics</h3>
                <p className="text-gray-700">Numbers, Algebra, Geometry</p>
              </div>
            </div>

            <div className="grid gap-4">
              {mathChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`p-4 rounded-lg border-2 ${
                    chapter.is_active
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">
                          Ch {chapter.chapter_number}:
                        </span>
                        <span className="text-gray-900">{chapter.chapter_name}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{chapter.description}</p>
                    </div>
                    {chapter.is_active ? (
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
        </div>
      </main>
    </div>
  );
}
