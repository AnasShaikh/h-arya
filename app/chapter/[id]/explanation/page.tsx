'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import InteractiveElement from '../../../components/InteractiveElement';

interface Example {
  icon: string;
  text: string;
  sound?: string;
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

type LearningMode = 'learn' | 'memorize';
type MemorizeSection = 'flashcards' | 'fillblanks' | 'longanswers' | 'mnemonics' | 'audio';

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

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentConcept, setCurrentConcept] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [memorizeCards, setMemorizeCards] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardSlideDirection, setCardSlideDirection] = useState<1 | -1>(1);
  const [longAnswers, setLongAnswers] = useState<Array<{ question: string; modelAnswer: string; keyPoints: string[]; marks?: number }>>([]);
  const [currentLongAnswer, setCurrentLongAnswer] = useState(0);
  const [studentLongAnswer, setStudentLongAnswer] = useState('');
  const [showModelLongAnswer, setShowModelLongAnswer] = useState(false);
  const [activeMode, setActiveMode] = useState<LearningMode>('learn');
  const [activeMemorizeSection, setActiveMemorizeSection] = useState<MemorizeSection>('flashcards');
  const [completedConcepts, setCompletedConcepts] = useState<Set<number>>(new Set());
  const [isMemorizeUnlocked, setIsMemorizeUnlocked] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [interactiveElement, setInteractiveElement] = useState<any>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [readingFeedback, setReadingFeedback] = useState<{show: boolean; perfect: boolean; message: string; userText?: string} | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) { router.push('/login'); return; }
    loadContent();
  }, [router, params.id]);

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
      const normalized = (data.concepts || []).map((c: Record<string, unknown>) => ({
        ...c,
        keyPoints: Array.isArray(c.keyPoints)
          ? (c.keyPoints as Array<string | {text: string}>).map(kp => typeof kp === 'string' ? kp : kp.text)
          : [],
        examples: Array.isArray(c.examples)
          ? (c.examples as Array<{icon?: string; text: string}>).map(ex => ({ icon: ex.icon || '📌', text: ex.text }))
          : [],
      }));
      setConcepts(normalized);
      if (!Array.isArray(normalized) || normalized.length === 0) {
        setContentError('This chapter explanation content is not ready yet.');
      } else {
        setContentError(null);
      }

      const cardsFromExercise = Array.isArray(data?.textbookExercise?.qaCards)
        ? data.textbookExercise.qaCards
            .filter((c: Record<string, unknown>) => c?.question && c?.answer)
            .map((c: Record<string, unknown>) => ({ question: String(c.question), answer: String(c.answer) }))
        : [];
      const cardsFromTest = Array.isArray(data?.test)
        ? data.test
            .filter((q: Record<string, unknown>) => q?.question && q?.explanation)
            .map((q: Record<string, unknown>) => ({ question: String(q.question), answer: String(q.explanation) }))
        : [];
      const cards = cardsFromExercise.length > 0 ? cardsFromExercise : cardsFromTest;
      const launchCards = cards.slice(0, 20);
      setMemorizeCards(launchCards);

      const longAns = Array.isArray(data?.textbookExercise?.longAnswers)
        ? data.textbookExercise.longAnswers
            .filter((x: Record<string, unknown>) => x?.question && x?.modelAnswer)
            .map((x: Record<string, unknown>) => ({
              question: String(x.question),
              modelAnswer: String(x.modelAnswer),
              keyPoints: Array.isArray(x.keyPoints) ? x.keyPoints.map(String) : [],
              marks: typeof x.marks === 'number' ? x.marks : undefined,
            }))
        : [];
      setLongAnswers(longAns.slice(0, 10));
      setIsMemorizeUnlocked(launchCards.length > 0 || longAns.length > 0);
      if (data.interactiveElement) setInteractiveElement(data.interactiveElement);
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
    if (currentConcept > 0) { setCurrentConcept(prev => prev - 1); setReadingFeedback(null); }
  };

  const handleModeChange = (mode: LearningMode) => {
    if (mode === 'memorize' && !isMemorizeUnlocked) return;
    setActiveMode(mode);
  };

  const playExampleSound = (icon: string) => {
    const soundPath = exampleSounds[icon];
    if (!soundPath) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setPlayingSound(icon);
    const audio = new Audio(soundPath);
    audioRef.current = audio;
    audio.play().catch(() => console.log('Sound not available:', soundPath));
    audio.onended = () => setPlayingSound(null);
    setTimeout(() => setPlayingSound(null), 2000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (e) => audioChunks.push(e.data);
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
    if (mediaRecorder && mediaRecorder.state === 'recording') { mediaRecorder.stop(); setIsRecording(false); }
  };

  const checkReading = async (audioBlob: Blob) => {
    setIsChecking(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      const response = await fetch('/api/speech-to-text', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      const userText = data.transcription.toLowerCase().trim();
      const expectedText = concepts[currentConcept].content.toLowerCase().trim();
      const userWords = userText.split(/\s+/);
      const expectedWords = expectedText.split(/\s+/);
      let matches = 0;
      expectedWords.forEach(word => { if (userWords.includes(word)) matches++; });
      const similarity = (matches / expectedWords.length) * 100;
      if (similarity >= 95) {
        setReadingFeedback({ show: true, perfect: true, message: 'Perfect reading! You used exact textbook wording.', userText: data.transcription });
      } else if (similarity >= 85) {
        setReadingFeedback({ show: true, perfect: false, message: 'Good try! Try to match the textbook wording more closely.', userText: data.transcription });
      } else {
        setReadingFeedback({ show: true, perfect: false, message: 'Keep practicing! Focus on the exact words from the textbook.', userText: data.transcription });
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
        body: JSON.stringify({ userId: parseInt(userId || '0'), stageCompleted: 2, score: 100 })
      });
      router.push(`/chapter/${params.id}/chat`);
    } catch (error) {
      console.error('Error completing explanation:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  const handleInteractiveComplete = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;
    await fetch(`/api/chapter/${params.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: parseInt(userId || '0'), stageCompleted: 6 })
    });
  };


  const navigateFlashcard = (direction: 1 | -1) => {
    if (memorizeCards.length === 0 || isAnimating) return;

    setCardSlideDirection(direction);
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentCard((prev) => {
        if (direction === -1) {
          return prev === 0 ? memorizeCards.length - 1 : prev - 1;
        }
        return (prev + 1) % memorizeCards.length;
      });
      setIsCardFlipped(false);
      setIsAnimating(false);
    }, 140);
  };

  // ============ MEMORIZE MODE ============

  const renderMemorizeMode = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-violet-50 rounded-2xl border border-violet-100">
        {[
          { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
          { id: 'fillblanks', label: 'Recall', icon: '✏️' },
          { id: 'longanswers', label: 'Long Ans.', icon: '📝' },
          { id: 'mnemonics', label: 'Tricks', icon: '🧠' },
          { id: 'audio', label: 'Audio', icon: '🔊' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveMemorizeSection(section.id as MemorizeSection)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeMemorizeSection === section.id
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-violet-600 hover:bg-violet-100'
            }`}
          >
            <span className="block text-base">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-200">

        {activeMemorizeSection === 'flashcards' && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Textbook Answer Flashcards</h3>
            <p className="text-sm text-gray-500 mb-6">Tap the card to flip and reveal the model answer.</p>
            {memorizeCards.length === 0 ? (
              <p className="text-sm text-gray-400">No flashcards available for this chapter yet.</p>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div
                  className={`max-w-2xl mx-auto cursor-pointer transition-all duration-150 ${
                    isAnimating
                      ? `${cardSlideDirection === 1 ? 'translate-x-3' : '-translate-x-3'} opacity-0 scale-95`
                      : 'translate-x-0 opacity-100 scale-100'
                  }`}
                  style={{ perspective: '1000px' }}
                  onClick={() => setIsCardFlipped(prev => !prev)}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      minHeight: '220px',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', width: '100%', minHeight: '220px' }}
                      className="bg-white rounded-2xl p-8 shadow-lg border-2 border-violet-200 flex flex-col justify-between"
                    >
                      <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-violet-100 text-violet-700">
                        ❓ Question
                      </span>
                      <p className="text-lg font-medium text-gray-900 flex-1 flex items-center">
                        {memorizeCards[currentCard]?.question}
                      </p>
                      <p className="text-xs text-violet-400 mt-4 text-center">Tap to reveal answer</p>
                    </div>

                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        position: 'absolute',
                        width: '100%',
                        minHeight: '220px',
                        transform: 'rotateY(180deg)',
                      }}
                      className="bg-violet-50 rounded-2xl p-8 shadow-lg border-2 border-violet-400 flex flex-col justify-between"
                    >
                      <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-green-100 text-green-700">
                        ✅ Model Answer
                      </span>
                      <p className="text-lg font-medium text-gray-900 flex-1 flex items-center">
                        {memorizeCards[currentCard]?.answer}
                      </p>
                      <p className="text-xs text-violet-400 mt-4 text-center">Tap to see question</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => navigateFlashcard(-1)}
                    className="px-5 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">
                    ← Prev
                  </button>
                  <span className="text-sm font-semibold text-violet-600 bg-violet-50 px-4 py-1.5 rounded-full border border-violet-200">
                    {currentCard + 1} / {memorizeCards.length}
                  </span>
                  <button onClick={() => navigateFlashcard(1)}
                    className="px-5 py-2 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMemorizeSection === 'fillblanks' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Recall Drill</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">Try to recall the answer before revealing it.</p>
            {memorizeCards.length === 0 ? (
              <p className="text-sm text-gray-400 text-center">No recall prompts available yet.</p>
            ) : (
              <div className="max-w-2xl mx-auto bg-white border-2 border-violet-200 rounded-2xl p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Prompt</span>
                <p className="text-lg font-semibold text-gray-900 mt-2 mb-4">{memorizeCards[currentCard]?.question}</p>
                <p className="text-sm text-gray-500 mb-4">Recall your answer, then tap to reveal.</p>
                <details className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <summary className="cursor-pointer font-semibold text-violet-700 select-none">▶ Reveal model answer</summary>
                  <p className="mt-3 text-gray-800 leading-relaxed">{memorizeCards[currentCard]?.answer}</p>
                </details>
              </div>
            )}
          </div>
        )}

        {activeMemorizeSection === 'longanswers' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Long Answer Practice</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">Practice textbook-style long answers for exam scoring.</p>
            {longAnswers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center">No long-answer prompts available yet.</p>
            ) : (
              <div className="max-w-3xl mx-auto bg-white border-2 border-violet-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-violet-500">
                    Question {currentLongAnswer + 1} of {longAnswers.length}
                  </span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                    {longAnswers[currentLongAnswer]?.marks ?? 5} marks
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 leading-snug">
                  {longAnswers[currentLongAnswer]?.question}
                </p>
                <textarea
                  value={studentLongAnswer}
                  onChange={(e) => setStudentLongAnswer(e.target.value)}
                  placeholder="Write your full textbook-style answer here..."
                  className="w-full min-h-[140px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 text-gray-900 resize-none transition"
                />
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setShowModelLongAnswer((p) => !p)}
                    className="px-5 py-2 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition">
                    {showModelLongAnswer ? 'Hide answer' : '👁 Reveal model answer'}
                  </button>
                  <button onClick={() => { setCurrentLongAnswer((p) => (p === 0 ? longAnswers.length - 1 : p - 1)); setStudentLongAnswer(''); setShowModelLongAnswer(false); }}
                    className="px-5 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">
                    ← Prev
                  </button>
                  <button onClick={() => { setCurrentLongAnswer((p) => (p + 1) % longAnswers.length); setStudentLongAnswer(''); setShowModelLongAnswer(false); }}
                    className="px-5 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">
                    Next →
                  </button>
                </div>
                {showModelLongAnswer && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 space-y-3">
                    <p className="font-bold text-violet-700">Model answer (textbook-style)</p>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{longAnswers[currentLongAnswer]?.modelAnswer}</p>
                    {Array.isArray(longAnswers[currentLongAnswer]?.keyPoints) && longAnswers[currentLongAnswer].keyPoints.length > 0 && (
                      <div className="pt-3 border-t border-violet-200">
                        <p className="font-semibold text-sm text-gray-700 mb-2">✅ Must-include points:</p>
                        <ul className="space-y-1">
                          {longAnswers[currentLongAnswer].keyPoints.map((kp, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-700">
                              <span className="text-green-500 mr-2 font-bold">•</span>{kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeMemorizeSection === 'mnemonics' && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Memory Tricks</h3>
            <p className="text-sm text-gray-500 mb-6">Remember key facts easily</p>
            <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow border-2 border-violet-200 text-left">
              <div className="mb-3">
                <span className="text-2xl font-extrabold text-violet-600">VIM</span>
                <span className="text-gray-500 ml-2 text-sm">= Vibration Is Must (for sound)</span>
              </div>
              <div className="text-4xl mb-2">🎸 → 〰️ → 👂</div>
              <p className="text-gray-600 text-sm">Guitar string vibrates → creates sound waves → reaches your ear</p>
            </div>
          </div>
        )}

        {activeMemorizeSection === 'audio' && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🔊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Listen & Repeat</h3>
            <p className="text-sm text-gray-400">Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );

  // ============ LOADING ============

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading chapter content...</p>
        </div>
      </div>
    );
  }

  if (contentError || concepts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-6 text-center shadow-lg">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Explanation not available yet</h2>
          <p className="text-sm text-gray-600 mb-5">{contentError || 'This chapter does not have explanation concepts yet.'}</p>
          <button
            onClick={() => router.push(`/chapter/${params.id}`)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Back to Chapter
          </button>
        </div>
      </div>
    );
  }

  const concept = concepts[currentConcept];
  const progress = ((currentConcept + 1) / concepts.length) * 100;

  // ============ MAIN RENDER ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto py-8">

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-violet-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-lg">📚</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Explanation</h1>
                <p className="text-xs text-gray-500">Stage 2 of 5</p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-200">
              {currentConcept + 1} / {concepts.length} concepts
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-gray-700 truncate pr-4">{concept.title}</span>
              <span className="text-sm font-bold text-violet-600 shrink-0">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => handleModeChange('learn')}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                activeMode === 'learn'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>📚</span> Learn
            </button>
            <button
              onClick={() => handleModeChange('memorize')}
              disabled={!isMemorizeUnlocked}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                activeMode === 'memorize'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-200'
                  : isMemorizeUnlocked
                  ? 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
              }`}
            >
              <span>🧠</span> Memorize {!isMemorizeUnlocked && <span>🔒</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-violet-100">

          {activeMode === 'learn' && (
            <>
              {/* Concept Header */}
              <div className={`bg-gradient-to-r ${concept.colorTheme} p-6`}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl drop-shadow">{concept.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-extrabold text-white leading-tight">{concept.title}</h2>
                    <p className="text-white/70 text-sm mt-0.5">{concept.pageReference && `📄 ${concept.pageReference}`}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* Textbook Content */}
                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
                  <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📖</span> From Your Textbook
                  </h3>
                  <p className="text-gray-900 leading-relaxed text-base">{concept.content}</p>

                  {concept.imageUrl && (
                    <div className="mt-5 rounded-xl overflow-hidden border border-indigo-100 shadow-sm">
                      <img src={concept.imageUrl} alt={concept.title} className="w-full h-auto object-cover max-h-[400px]" />
                    </div>
                  )}
                  {concept.videoUrl && (
                    <div className="mt-5 rounded-xl overflow-hidden border border-indigo-100 shadow-sm aspect-video">
                      <iframe src={concept.videoUrl} className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  )}
                  <p className="text-xs text-indigo-400 mt-3 italic">Ref: {concept.textbookRef}</p>
                </div>

                {/* Examples */}
                <div className={`${concept.bgColor} rounded-2xl p-5 border ${concept.borderColor}`}>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>🎯</span> Real-Life Examples
                    <span className="text-xs font-normal text-gray-400 normal-case">(tap icon for sound)</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {concept.examples.map((example, idx) => {
                      const hasSound = !!exampleSounds[example.icon];
                      const isPlaying = playingSound === example.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => hasSound && playExampleSound(example.icon)}
                          disabled={!hasSound}
                          className={`flex items-center p-3 bg-white rounded-xl transition-all ${
                            hasSound ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]' : 'cursor-default'
                          } ${isPlaying ? 'ring-2 ring-violet-500 shadow-md' : ''}`}
                        >
                          <span className={`text-3xl mr-3 ${isPlaying ? 'animate-pulse' : ''}`}>{example.icon}</span>
                          <span className="text-gray-800 font-medium flex-1 text-left text-sm">{example.text}</span>
                          {hasSound && <span className="text-sm">{isPlaying ? '🔊' : '🔈'}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Points */}
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                  <h3 className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>✨</span> Key Points to Remember
                  </h3>
                  <ul className="space-y-2">
                    {concept.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </span>
                        <span className="text-gray-800 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-200">
                  <p className="text-sm font-bold text-pink-600 uppercase tracking-widest mb-2">💡 Fun Fact</p>
                  <p className="text-gray-800 leading-relaxed text-sm">{concept.funFact}</p>
                </div>

                {/* Reading Practice */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-indigo-200">
                  <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>🎤</span> Reading Practice
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Reading aloud builds memory for exact textbook wording.</p>
                  <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                    <p className="text-gray-800 font-medium leading-relaxed text-sm">&quot;{concept.content}&quot;</p>
                  </div>
                  {!readingFeedback && !isRecording && !isChecking && (
                    <button onClick={startRecording}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl hover:opacity-90 transition font-semibold flex items-center justify-center gap-2">
                      <span>🎤</span> Start Reading
                    </button>
                  )}
                  {isRecording && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-semibold text-sm">Recording...</span>
                      </div>
                      <button onClick={stopRecording}
                        className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold text-sm">
                        ⏹ Stop & Check
                      </button>
                    </div>
                  )}
                  {isChecking && (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Checking your reading...</p>
                    </div>
                  )}
                  {readingFeedback?.show && (
                    <div className={`p-4 rounded-xl border-2 ${readingFeedback.perfect ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                      <p className={`font-bold mb-1 text-sm ${readingFeedback.perfect ? 'text-green-700' : 'text-orange-700'}`}>
                        {readingFeedback.perfect ? '✅ Perfect!' : '👍 Good Try!'}
                      </p>
                      <p className="text-gray-700 text-sm mb-3">{readingFeedback.message}</p>
                      {readingFeedback.userText && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">You said:</p>
                          <p className="text-gray-700 italic text-sm">&quot;{readingFeedback.userText}&quot;</p>
                        </div>
                      )}
                      <button onClick={() => setReadingFeedback(null)}
                        className="mt-3 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition text-sm font-semibold">
                        {readingFeedback.perfect ? '✓ Done' : '🔄 Try Again'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeMode === 'memorize' && (
            <div className="p-6">{renderMemorizeMode()}</div>
          )}

          {/* Navigation */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentConcept === 0}
                className="px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition font-semibold text-sm"
              >
                ← Previous
              </button>

              {currentConcept === concepts.length - 1 ? (
                activeMode === 'learn' ? (
                  <button onClick={() => setActiveMode('memorize')}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 transition font-semibold text-sm shadow-lg shadow-purple-200">
                    Continue → Memorize
                  </button>
                ) : (
                  <button onClick={handleComplete}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition font-semibold text-sm shadow-lg shadow-green-200">
                    Complete → Chat ✓
                  </button>
                )
              ) : (
                <button onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition font-semibold text-sm shadow-lg shadow-violet-200">
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {concepts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentConcept(index)}
                className={`h-2.5 rounded-full transition-all cursor-pointer hover:opacity-80 ${
                  index === currentConcept ? 'w-8 bg-violet-600' : completedConcepts.has(index) ? 'w-5 bg-green-500' : 'w-5 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Tap to jump to any concept</p>
        </div>

        {interactiveElement && (
          <div className="mt-6">
            <InteractiveElement element={interactiveElement} onComplete={handleInteractiveComplete} />
          </div>
        )}
      </div>
    </div>
  );
}
