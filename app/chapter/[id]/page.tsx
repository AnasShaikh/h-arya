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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading chapter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center text-indigo-600 hover:text-indigo-700">
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
        {/* Chapter Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chapter {chapter?.chapterNumber}: {chapter?.chapterName}
            </h1>
            <p className="text-gray-700">{chapter?.description}</p>
            <p className="text-sm text-gray-600 mt-2">Subject: {chapter?.subject}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">Overall Progress</span>
              <span className="text-sm font-semibold text-indigo-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Learning Stages */}
        <div className="space-y-4">
          {LEARNING_STAGES.map((stage) => {
            const status = getStageStatus(stage.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            const isLocked = status === 'locked';

            return (
              <button
                key={stage.id}
                onClick={() => handleStageClick(stage)}
                disabled={isLocked}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-300 hover:border-green-400'
                    : isCurrent
                    ? 'bg-indigo-50 border-indigo-400 hover:border-indigo-500 shadow-md'
                    : isLocked
                    ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center">
                  {/* Icon */}
                  <div className={`text-5xl mr-4 ${isLocked ? 'grayscale' : ''}`}>
                    {isCompleted ? '✅' : isLocked ? '🔒' : stage.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center mb-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {stage.id}. {stage.name}
                      </h3>
                      {isCurrent && (
                        <span className="ml-3 px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{stage.description}</p>
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <div className="ml-4 text-2xl text-indigo-600">
                      →
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-indigo-200">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">💡 Tip:</span> Complete each stage in order to unlock the next one.
            {currentStage === 1 && ' Start with the Pre-Assessment to begin!'}
          </p>
        </div>
      </main>
    </div>
  );
}
