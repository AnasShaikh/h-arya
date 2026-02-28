'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Chapter {
  id: number;
  subject: string;
  chapterNumber: number;
  chapterName: string;
  description: string;
}

interface Stage {
  id: number;
  name: string;
  description: string;
  icon: string;
  route: string;
}

const LEARNING_STAGES: Stage[] = [
  {
    id: 1,
    name: 'Pre-Assessment',
    description: 'Quick test to check your current knowledge',
    icon: '📋',
    route: '/pre-assessment'
  },
  {
    id: 2,
    name: 'Explanation',
    description: 'Learn concepts with AI tutor explanations',
    icon: '📚',
    route: '/explanation'
  },
  {
    id: 3,
    name: 'Chat Session',
    description: 'Ask questions and clarify doubts',
    icon: '💬',
    route: '/chat'
  },
  {
    id: 4,
    name: 'Test',
    description: 'Assess your understanding',
    icon: '✍️',
    route: '/test'
  },
  {
    id: 5,
    name: 'Revision',
    description: 'Review and strengthen weak areas',
    icon: '🔄',
    route: '/revision'
  },
  {
    id: 6,
    name: 'Interactive Practice',
    description: 'Complete the chapter activity to lock in learning',
    icon: '🎮',
    route: '/revision'
  }
];

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    fetchChapterData();
  }, [params.id, router]);

  const fetchChapterData = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      
      // Fetch chapter details with userId
      const chapterRes = await fetch(`/api/chapter/${params.id}`, {
        headers: {
          'x-user-id': userId || ''
        }
      });
      
      if (chapterRes.ok) {
        const chapterData = await chapterRes.json();
        setChapter(chapterData.chapter);
        setCurrentStage(chapterData.currentStage || 1);
        setCompletedStages(chapterData.completedStages || []);
        
        console.log('Progress loaded:', {
          currentStage: chapterData.currentStage,
          completedStages: chapterData.completedStages
        });
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageClick = (stage: Stage) => {
    // Only allow clicking on current stage or completed stages
    if (stage.id <= currentStage) {
      router.push(`/chapter/${params.id}${stage.route}`);
    }
  };

  const getStageStatus = (stageId: number) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (stageId === currentStage) return 'current';
    if (stageId < currentStage) return 'available';
    return 'locked';
  };

  const progressPercentage = (completedStages.length / LEARNING_STAGES.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center text-violet-600 hover:text-violet-700 transition font-medium">
              <span className="mr-2">←</span>
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎓</span>
              <h1 className="text-xl font-bold text-gray-900">H-Arya</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chapter Header (Hero Card) */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold mb-4 border border-white/30">
              {chapter?.subject}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Chapter {chapter?.chapterNumber}: {chapter?.chapterName}
            </h1>
            <p className="text-violet-100 text-lg max-w-2xl">{chapter?.description}</p>
          </div>
          
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-violet-100 p-6 mb-8">
           <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Chapter Progress</h2>
                <p className="text-sm text-gray-500">Keep going, you're doing great!</p>
              </div>
              <span className="text-2xl font-bold text-violet-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-violet-100 rounded-full h-3">
              <div
                className="bg-violet-600 h-3 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(108,63,198,0.3)]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
        </div>

        {/* Learning Stages (Stepper) */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Learning Path</h3>
          <div className="relative">
            {/* Vertical connecting line (optional visual aid, kept subtle) */}
            <div className="absolute left-[2.25rem] top-6 bottom-6 w-0.5 bg-violet-100 -z-10 hidden sm:block"></div>

            {LEARNING_STAGES.map((stage, index) => {
              const status = getStageStatus(stage.id);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isLocked = status === 'locked';

              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageClick(stage)}
                  disabled={isLocked}
                  className={`w-full group relative flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-50 border-green-200 hover:border-green-300'
                      : isCurrent
                      ? 'bg-white border-violet-600 shadow-md transform scale-[1.02]'
                      : isLocked
                      ? 'bg-gray-50 border-transparent opacity-60 cursor-not-allowed'
                      : 'bg-white border-transparent hover:border-violet-200 shadow-sm'
                  }`}
                >
                  {/* Status Indicator / Icon */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mr-5 shadow-sm transition-colors ${
                     isCompleted ? 'bg-green-100 text-green-600' :
                     isCurrent ? 'bg-violet-600 text-white' :
                     isLocked ? 'bg-gray-200 text-gray-400' : 'bg-violet-100 text-violet-600'
                  }`}>
                    {isCompleted ? '✓' : stage.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider mr-2 ${
                        isCurrent ? 'text-violet-600' : 'text-gray-400'
                      }`}>
                        Step {index + 1}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold truncate ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                      {stage.name}
                    </h3>
                    <p className={`text-sm truncate ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stage.description}
                    </p>
                  </div>

                  {/* Arrow Action */}
                  {!isLocked && (
                    <div className={`ml-4 text-xl transform transition-transform group-hover:translate-x-1 ${
                      isCurrent ? 'text-violet-600' : 'text-gray-300 group-hover:text-violet-400'
                    }`}>
                      →
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
           {/* Begin/Continue Button (Dynamic based on progress) */}
           <button 
             onClick={() => {
                const stageToStart = LEARNING_STAGES.find(s => s.id === currentStage);
                if(stageToStart) handleStageClick(stageToStart);
             }}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-4 font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <span>{currentStage === 1 ? 'Start Chapter' : 'Continue Chapter'}</span>
             <span>→</span>
           </button>

           {/* Exam Mode CTA */}
           <Link
             href={`/chapter/${params.id}/recall`}
             className="w-full bg-white border-2 border-amber-100 hover:border-amber-300 text-amber-900 rounded-xl px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 group"
           >
             <span className="text-xl">🎯</span>
             <div className="text-left">
               <span className="block text-sm font-bold text-amber-600 uppercase tracking-wide">Extra Practice</span>
               <span className="block leading-none">Exam Mode Recall</span>
             </div>
           </Link>
        </div>
      </main>
    </div>
  );
}
