'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProfileUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  grade: number;
  board?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('7');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initials = useMemo(() => (name?.trim()?.charAt(0) || 'S').toUpperCase(), [name]);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (!storedUserId) {
      router.push('/login');
      return;
    }

    setUserId(storedUserId);

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/auth/profile?userId=${storedUserId}`);
        const data: ProfileUser | { error: string } = await response.json();

        if (!response.ok) {
          const error = (data as { error?: string }).error || 'Failed to load profile';
          setErrorMessage(error);
          return;
        }

        const user = data as ProfileUser;
        setUsername(user.username || '');
        setName(user.name || '');
        setEmail(user.email || '');
        setGrade(String(user.grade || 7));
      } catch (error) {
        console.error('Error loading profile:', error);
        setErrorMessage('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSaving(true);

    try {
      const payload: Record<string, string> = {
        userId,
        name,
        email,
        grade,
      };

      if (showPasswordFields && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to update profile');
        return;
      }

      sessionStorage.setItem('name', data.user?.name || name);
      sessionStorage.setItem('grade', String(data.user?.grade || grade));
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordFields(false);
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-4 py-6">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-violet-600 font-semibold"
      >
        ← Dashboard
      </button>

      <div className="max-w-lg mx-auto mt-12 bg-white rounded-3xl shadow-xl p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">{initials}</span>
        </div>

        <p className="text-center">
          <span className="inline-block bg-gray-100 text-gray-600 rounded-full px-4 py-1.5 text-sm font-semibold">
            @{username}
          </span>
        </p>

        <hr className="my-6 border-gray-100" />

        {successMessage && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-3 text-sm mb-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-3 text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-violet-500 focus:outline-none transition text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-violet-500 focus:outline-none transition text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-violet-500 focus:outline-none transition text-gray-900"
            >
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>

          <hr className="my-6 border-gray-100" />

          <button
            type="button"
            onClick={() => setShowPasswordFields((prev) => !prev)}
            className="text-violet-600 font-semibold text-sm"
          >
            {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
          </button>

          {showPasswordFields && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-violet-500 focus:outline-none transition text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-violet-500 focus:outline-none transition text-gray-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-2xl font-bold hover:opacity-90 transition mt-4 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
