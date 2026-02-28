'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Kpis = {
  chapter_started: number;
  memorize_completed: number;
  test_submitted: number;
  score_avg_all_time: number;
  score_avg_24h: number;
  active_learners: number;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [grade, setGrade] = useState('7');
  const [board, setBoard] = useState('Maharashtra');
  const [cohort, setCohort] = useState<'all' | 'new_7d' | 'new_30d'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (grade) params.set('grade', grade);
    if (board) params.set('board', board);
    if (cohort) params.set('cohort', cohort);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    return params.toString();
  }, [grade, board, cohort, fromDate, toDate]);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/cohort?${queryString}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setKpis(data.kpis);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, queryString]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-600">
              Analytics & Insights
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Monitor learning velocity and cohort performance.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-violet-700 bg-white border border-violet-100 rounded-2xl shadow-sm hover:bg-violet-50 transition-all duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-violet-100/50 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <label className="block">
              <span className="text-xs font-semibold text-violet-900/60 uppercase tracking-wider block mb-2">Grade</span>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-3 transition-colors hover:bg-white"
              >
                <option value="">All Grades</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-violet-900/60 uppercase tracking-wider block mb-2">Board</span>
              <input
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-3 transition-colors hover:bg-white placeholder:text-slate-400"
                placeholder="e.g. Maharashtra"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-violet-900/60 uppercase tracking-wider block mb-2">Cohort</span>
              <select
                value={cohort}
                onChange={(e) => setCohort(e.target.value as 'all' | 'new_7d' | 'new_30d')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-3 transition-colors hover:bg-white"
              >
                <option value="all">All Time</option>
                <option value="new_7d">New (7 days)</option>
                <option value="new_30d">New (30 days)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-violet-900/60 uppercase tracking-wider block mb-2">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-3 transition-colors hover:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-violet-900/60 uppercase tracking-wider block mb-2">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block p-3 transition-colors hover:bg-white"
              />
            </label>
          </div>
        </div>

        {!kpis ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <p className="text-slate-500">Could not load analytics data. Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <KpiCard
                title="Chapters Started"
                value={kpis.chapter_started}
                subtitle="Progress rows with activity"
                color="violet"
              />
              <KpiCard
                title="Memorize Completed"
                value={kpis.memorize_completed}
                subtitle="Stage 6 completion count"
                color="fuchsia"
              />
              <KpiCard
                title="Tests Submitted"
                value={kpis.test_submitted}
                subtitle="Stage 4 completion count"
                color="amber"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KpiCard
                title="Avg Score (All Time)"
                value={`${kpis.score_avg_all_time}%`}
                subtitle="Historical assessment mean"
                color="emerald"
              />
              <KpiCard
                title="Avg Score (24h)"
                value={`${kpis.score_avg_24h}%`}
                subtitle="Recent assessment quality"
                color="cyan"
              />
              <KpiCard
                title="Active Learners"
                value={kpis.active_learners}
                subtitle="Unique users with progress"
                color="indigo"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  color = 'violet',
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color?: 'violet' | 'fuchsia' | 'amber' | 'emerald' | 'cyan' | 'indigo';
}) {
  const colorStyles = {
    violet: 'bg-violet-100 text-violet-600',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6 border border-slate-50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-4xl font-extrabold text-slate-800 tracking-tight my-2">{value}</p>
          <p className="text-xs font-medium text-slate-400">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-2xl ${colorStyles[color]} flex items-center justify-center shadow-inner`}>
          {/* Simple geometric icon placeholder based on color */}
          <div className="w-6 h-6 rounded-full border-[3px] border-current opacity-80" />
        </div>
      </div>
      
      {/* Decorative background blob */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.03] ${colorStyles[color].replace('text-', 'bg-')}`} />
    </div>
  );
}
