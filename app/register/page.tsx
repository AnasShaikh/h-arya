'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Registration successful
      if (data?.userId) sessionStorage.setItem('userId', String(data.userId));
      if (data?.name) sessionStorage.setItem('name', String(data.name));
      if (data?.grade !== undefined && data?.grade !== null) {
        sessionStorage.setItem('grade', String(data.grade));
      }

      router.push('/onboarding');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-5xl mb-5 shadow-lg">
              <span aria-hidden="true">🎓</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              Join H-Arya 🎓
            </h1>
            <p className="text-gray-600">
              Start your Std 7 learning journey today
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200"
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200"
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200"
                placeholder="Create a password (min 6 characters)"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 text-gray-900 font-medium placeholder:text-gray-400 transition-all duration-200"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-700 to-violet-600 text-white py-4 rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-700 hover:text-violet-800 font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
