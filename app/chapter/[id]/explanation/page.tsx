'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Example {
  icon: string;
  text: string;
  sound?: string; // optional sound file path
}

interface Concept {
  id: number;
  title: string;
  emoji: string;
  colorTheme: string;
  bgColor: string;
  borderColor: string;
  content: string;
  pageReference: string;
  examples: Example[];
  keyPoints: string[];
  funFact: string;
  textbookRef: string;
  imageUrl?: string;
  videoUrl?: string;
}

// Learning mode types
type LearningMode = 'learn' | 'memorize';
type MemorizeSection = 'flashcards' | 'fillblanks' | 'mnemonics' | 'audio';

// Sound mapping for examples (hardcoded for now, can move to JSON later)
const exampleSounds: Record<string, string> = {
  '👏': '/sounds/clap.mp3',
  '🔔': '/sounds/bell.mp3',
  '📱': '/sounds/phone.mp3',
  '🥁': '/sounds/tabla.mp3',
  '🪀': '/sounds/swing.mp3',
  '⏱️': '/sounds/tick.mp3',
  '🎸': '/sounds/guitar.mp3',
};

export default function Explanation() {
  const params = useParams();
  const router = useRouter();

  // Content state
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentConcept, setCurrentConcept] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mode state
  const [activeMode, setActiveMode] = useState<LearningMode>('learn');
  const [activeMemorizeSection, setActiveMemorizeSection] = useState<MemorizeSection>('flashcards');

  // Progress tracking
  const [completedConcepts, setCompletedConcepts] = useState<Set<number>>(new Set());
  const [isMemorizeUnlocked, setIsMemorizeUnlocked] = useState(false);

  // Interactive state
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reading practice state
  const [isRecording, setIsRecording] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [readingFeedback, setReadingFeedback] = useState<{show: boolean; perfect: boolean; message: string; userText?: string} | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    loadContent();
  }, [router, params.id]);

  // Check if all concepts are completed to unlock memorize mode
  useEffect(() => {
    if (concepts.length > 0 && completedConcepts.size >= concepts.length) {
      setIsMemorizeUnlocked(true);
    }
  }, [completedConcepts, concepts.length]);

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
      if (!response.ok) throw new Error('Failed to load content');

      const data = await response.json();
      setConcepts(data.concepts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Failed to load chapter content. Please try again.');
      router.push(`/chapter/${params.id}`);
    }
  };

  const handleNext = () => {
    if (currentConcept < concepts.length - 1) {
      setCompletedConcepts(prev => new Set([...prev, currentConcept]));
      setCurrentConcept(prev => prev + 1);
      setReadingFeedback(null);
    }
  };

  const handlePrevious = () => {
    if (currentConcept > 0) {
      setCurrentConcept(prev => prev - 1);
      setReadingFeedback(null);
    }
  };

  const handleModeChange = (mode: LearningMode) => {
    if (mode === 'memorize' && !isMemorizeUnlocked) return;
    setActiveMode(mode);
  };

  // Play sound for interactive examples
  const playExampleSound = (icon: string) => {
    const soundPath = exampleSounds[icon];
    if (!soundPath) return;

    // Stop any currently playing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlayingSound(icon);

    // Create and play audio
    const audio = new Audio(soundPath);
    audioRef.current = audio;

    audio.play().catch(() => {
      // If sound file doesn't exist, show visual feedback instead
      console.log('Sound not available:', soundPath);
    });

    audio.onended = () => {
      setPlayingSound(null);
    };

    // Auto-reset after 2 seconds even if sound fails
    setTimeout(() => setPlayingSound(null), 2000);
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await checkReading(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setReadingFeedback(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const checkReading = async (audioBlob: Blob) => {
    setIsChecking(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      const userText = data.transcription.toLowerCase().trim();
      const expectedText = concepts[currentConcept].content.toLowerCase().trim();

      const userWords = userText.split(/\s+/);
      const expectedWords = expectedText.split(/\s+/);
      let matches = 0;

      expectedWords.forEach(word => {
        if (userWords.includes(word)) matches++;
      });

      const similarity = (matches / expectedWords.length) * 100;

      if (similarity >= 95) {
        setReadingFeedback({
          show: true,
          perfect: true,
          message: 'Perfect reading! You used exact textbook wording.',
          userText: data.transcription
        });
      } else if (similarity >= 85) {
        setReadingFeedback({
          show: true,
          perfect: false,
          message: 'Good try! Try to match the textbook wording more closely.',
          userText: data.transcription
        });
      } else {
        setReadingFeedback({
          show: true,
          perfect: false,
          message: 'Keep practicing! Focus on the exact words from the textbook.',
          userText: data.transcription
        });
      }
    } catch (error) {
      console.error('Error checking reading:', error);
      alert('Could not check your reading. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleComplete = async () => {
    try {
      const userId = sessionStorage.getItem('userId');

      await fetch(`/api/chapter/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId || '0'),
          stageCompleted: 2,
          score: 100
        })
      });

      router.push(`/chapter/${params.id}/chat`);
    } catch (error) {
      console.error('Error completing explanation:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  // ============ RENDER MEMORIZE MODE ============

  const renderMemorizeMode = () => {
    return (
      <div className="space-y-6">
        {/* Memorize Section Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
            { id: 'fillblanks', label: 'Fill Blanks', icon: '✏️' },
            { id: 'mnemonics', label: 'Mnemonics', icon: '🧠' },
            { id: 'audio', label: 'Audio', icon: '🔊' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveMemorizeSection(section.id as MemorizeSection)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                activeMemorizeSection === section.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Memorize Content */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border-2 border-purple-200">
          {activeMemorizeSection === 'flashcards' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flashcards</h3>
              <p className="text-gray-600 mb-6">Flip cards to test your memory</p>

              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200 min-h-[200px] flex items-center justify-center cursor-pointer hover:shadow-xl transition">
                  <div>
                    <p className="text-lg font-medium text-gray-900">What is vibration?</p>
                    <p className="text-sm text-purple-600 mt-4">Click to flip</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">Coming soon!</p>
              </div>
            </div>
          )}

          {activeMemorizeSection === 'fillblanks' && (
            <div className="text-center">
              <div className="text-6xl mb-4">✏️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fill in the Blanks</h3>
              <p className="text-gray-600 mb-6">Complete textbook sentences</p>
              <p className="text-sm text-gray-500">Coming soon!</p>
            </div>
          )}

          {activeMemorizeSection === 'mnemonics' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Memory Tricks</h3>
              <p className="text-gray-600 mb-6">Remember key facts easily</p>

              <div className="max-w-lg mx-auto bg-white rounded-xl p-6 shadow border-2 border-purple-200 text-left">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-purple-600">VIM</span>
                  <span className="text-gray-500 ml-2">= Vibration Is Must (for sound)</span>
                </div>
                <div className="text-4xl mb-2">🎸 → 〰️ → 👂</div>
                <p className="text-gray-600 text-sm">
                  Guitar string vibrates → creates sound waves → reaches your ear
                </p>
              </div>
            </div>
          )}

          {activeMemorizeSection === 'audio' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🔊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Listen & Repeat</h3>
              <p className="text-gray-600 mb-6">Hear and practice definitions</p>
              <p className="text-sm text-gray-500">Coming soon!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============ LOADING STATE ============

  if (isLoading || concepts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading chapter content...</p>
        </div>
      </div>
    );
  }

  const concept = concepts[currentConcept];
  const progress = ((currentConcept + 1) / concepts.length) * 100;

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Chapter 18: Sound
            </h1>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
              Stage 2 of 5
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">
                Concept {currentConcept + 1} of {concepts.length}: {concept.title}
              </span>
              <span className="text-sm font-semibold text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('learn')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                activeMode === 'learn'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>📚</span>
              <span>Learn</span>
            </button>
            <button
              onClick={() => handleModeChange('memorize')}
              disabled={!isMemorizeUnlocked}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                activeMode === 'memorize'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : isMemorizeUnlocked
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>🧠</span>
              <span>Memorize</span>
              {!isMemorizeUnlocked && <span>🔒</span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {activeMode === 'learn' && (
            <>
              {/* Concept Header */}
              <div className={`bg-gradient-to-r ${concept.colorTheme} p-6`}>
                <div className="flex items-center">
                  <span className="text-5xl mr-4 animate-bounce">{concept.emoji}</span>
                  <h2 className="text-2xl font-bold text-white">
                    {concept.title}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">

                {/* Textbook Definition */}
                <div className="bg-white rounded-lg p-6 border-2 border-indigo-300">
                  <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                    <span className="mr-2">📖</span>
                    From Your Textbook:
                  </h3>
                  <p className="text-gray-900 leading-relaxed text-base">
                    {concept.content}
                  </p>
                  
                  {concept.imageUrl && (
                    <div className="mt-6 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm">
                      <img 
                        src={concept.imageUrl} 
                        alt={concept.title}
                        className="w-full h-auto object-cover max-h-[400px]"
                      />
                    </div>
                  )}

                  {concept.videoUrl && (
                    <div className="mt-6 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm aspect-video">
                      <iframe
                        src={concept.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mt-3 italic">
                    Reference: {concept.textbookRef}
                  </p>
                </div>

                {/* Interactive Examples Section */}
                <div className={`${concept.bgColor} rounded-lg p-6 border-2 ${concept.borderColor}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🎯 Real-Life Examples:
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tap an icon to hear the sound!
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {concept.examples.map((example, idx) => {
                      const hasSound = exampleSounds[example.icon];
                      const isPlaying = playingSound === example.icon;

                      return (
                        <button
                          key={idx}
                          onClick={() => hasSound && playExampleSound(example.icon)}
                          disabled={!hasSound}
                          className={`flex items-center p-4 bg-white rounded-lg transition-all ${
                            hasSound
                              ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                              : 'cursor-default'
                          } ${isPlaying ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}
                        >
                          <span className={`text-4xl mr-4 ${isPlaying ? 'animate-pulse' : ''}`}>
                            {example.icon}
                          </span>
                          <span className="text-gray-900 font-medium flex-1 text-left">
                            {example.text}
                          </span>
                          {hasSound && (
                            <span className={`text-sm ${isPlaying ? 'text-indigo-600' : 'text-gray-400'}`}>
                              {isPlaying ? '🔊' : '🔈'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Points */}
                <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ✨ Key Points to Remember:
                  </h3>
                  <ul className="space-y-2">
                    {concept.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2 text-xl">✓</span>
                        <span className="text-gray-900">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border-2 border-pink-300">
                  <p className="text-gray-900 text-lg">
                    {concept.funFact}
                  </p>
                </div>

                {/* Reading Practice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-indigo-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🎤</span>
                    Reading Practice
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Practice reading the definition aloud - it helps you remember the exact textbook wording!
                  </p>

                  <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
                    <p className="text-gray-900 font-medium leading-relaxed">
                      &quot;{concept.content}&quot;
                    </p>
                  </div>

                  {!readingFeedback && !isRecording && !isChecking && (
                    <button
                      onClick={startRecording}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center"
                    >
                      <span className="mr-2">🎤</span>
                      Click to Start Reading
                    </button>
                  )}

                  {isRecording && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-red-600 font-semibold">Recording...</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                      >
                        ⏹ Stop & Check
                      </button>
                    </div>
                  )}

                  {isChecking && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-gray-700">Checking your reading...</p>
                    </div>
                  )}

                  {readingFeedback && readingFeedback.show && (
                    <div className={`p-4 rounded-lg border-2 ${
                      readingFeedback.perfect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <p className={`font-bold mb-2 ${
                        readingFeedback.perfect ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {readingFeedback.perfect ? '✅ Perfect!' : '👍 Good Try!'}
                      </p>
                      <p className="text-gray-900 mb-3">
                        {readingFeedback.message}
                      </p>
                      {readingFeedback.userText && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-sm text-gray-700 mb-1">You said:</p>
                          <p className="text-gray-900 italic">&quot;{readingFeedback.userText}&quot;</p>
                        </div>
                      )}
                      <button
                        onClick={() => setReadingFeedback(null)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                      >
                        {readingFeedback.perfect ? '✓ Done' : '🔄 Try Again'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeMode === 'memorize' && (
            <div className="p-6">
              {renderMemorizeMode()}
            </div>
          )}

          {/* Navigation */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentConcept === 0}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                ← Previous
              </button>

              {currentConcept === concepts.length - 1 ? (
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-semibold"
                >
                  Complete → Chat
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            {concepts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentConcept(index)}
                className={`h-3 w-10 rounded-full transition-all cursor-pointer hover:opacity-80 ${
                  index === currentConcept
                    ? 'bg-indigo-600'
                    : completedConcepts.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              ></button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Click to jump to a concept
          </p>
        </div>
      </div>
    </div>
  );
}
