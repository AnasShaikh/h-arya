'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              H-Arya
            </h1>
            <p className="text-gray-800 mb-4">
              Your personal learning companion for 7th Grade Maharashtra Board
            </p>
            <p className="text-sm text-gray-700">
              Interactive AI-powered tutoring for Science and Mathematics
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-3">
              What you&apos;ll get:
            </p>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Personalized learning based on your level</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Interactive chat with AI tutor</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Track your progress and improvements</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Assessment and adaptive teaching</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/register"
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="block w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition text-center"
            >
              Log In
            </Link>
          </div>

          {/* Current Topics */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-800 font-medium mb-2">
              Currently Available:
            </p>
            <div className="text-center text-sm text-gray-700">
              <p>📚 Science - Chapter 18: Sound</p>
              <p className="text-xs text-gray-600 mt-1">More chapters coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
