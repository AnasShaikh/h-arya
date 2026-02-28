'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-violet-700 to-indigo-600 rounded-2xl p-4 w-20 h-20 flex items-center justify-center mx-auto mb-5">
            <span aria-hidden="true" className="text-5xl">🎓</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center mb-2">
            Ace Your Maharashtra Board Exams
          </h1>
          <p className="text-gray-500 font-medium text-center text-base mb-6">
            Smart AI tutoring for Std 7 — Science, Maths, English, History & more
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-gray-800">
            <span className="text-amber-500">🧠</span>
            <span>Personalized learning paths</span>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-gray-800">
            <span className="text-amber-500">💬</span>
            <span>Interactive AI tutor chat</span>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-gray-800">
            <span className="text-amber-500">📈</span>
            <span>Progress tracking & insights</span>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-gray-800">
            <span className="text-amber-500">✅</span>
            <span>Adaptive assessments</span>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-violet-700 to-violet-600 text-white py-4 rounded-2xl font-bold text-base hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-200 text-center"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="block w-full bg-white border-2 border-violet-300 text-violet-700 py-4 rounded-2xl font-bold text-base hover:bg-violet-50 active:scale-95 transition-all duration-200 text-center"
          >
            Log In
          </Link>
        </div>

        <div className="mt-6 border-t border-violet-100 pt-4">
          <p className="text-center text-xs text-gray-400 font-medium">
            Trusted by Maharashtra Board students
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-violet-700">
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:underline">
              Refund Policy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
