'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Concept {
  id: number;
  title: string;
  emoji: string;
  colorTheme: string;
  bgColor: string;
  borderColor: string;
  content: string;
  pageReference: string;
  examples: Array<{ icon: string; text: string }>;
  keyPoints: string[];
  funFact: string;
  textbookRef: string;
}

export default function Explanation() {
  const params = useParams();
  const router = useRouter();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentConcept, setCurrentConcept] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
      setCurrentConcept(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentConcept > 0) {
      setCurrentConcept(prev => prev - 1);
    }
  };

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

      // Calculate similarity (simple word matching)
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
          message: 'Perfect reading! You used exact textbook wording. This will help you score full marks in exams!',
          userText: data.transcription
        });
      } else if (similarity >= 85) {
        setReadingFeedback({
          show: true,
          perfect: false,
          message: 'Good try! For full marks, try to match the textbook wording more closely.',
          userText: data.transcription
        });
      } else {
        setReadingFeedback({
          show: true,
          perfect: false,
          message: 'Keep practicing! Focus on using the exact words from the textbook.',
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
      
      // Mark stage 2 as complete
      await fetch(`/api/chapter/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId || '0'),
          stageCompleted: 2,
          score: 100 // Completion of explanation
        })
      });

      // Navigate to chat session
      router.push(`/chapter/${params.id}/chat`);
    } catch (error) {
      console.error('Error completing explanation:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Explanation - Learning Concepts
            </h1>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
              Stage 2 of 5
            </span>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">
                Concept {currentConcept + 1} of {concepts.length}
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
        </div>

        {/* Concept Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Colorful Header */}
          <div className={`bg-gradient-to-r ${concept.colorTheme} p-6`}>
            <div className="flex items-center">
              <span className="text-6xl mr-4 animate-bounce">{concept.emoji}</span>
              <h2 className="text-3xl font-bold text-white">
                {concept.title}
              </h2>
            </div>
          </div>

          <div className="p-8">
            {/* Visual Animation/Illustration */}
            <div className={`mb-6 ${concept.bgColor} rounded-xl p-8 border-2 ${concept.borderColor}`}>
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">
                  {concept.emoji}
                </div>
                <p className="text-gray-900 font-semibold text-lg">
                  {concept.title}
                </p>
              </div>
            </div>

            {/* Textbook Definition */}
            <div className="bg-white rounded-lg p-6 mb-6 border-2 border-indigo-300">
              <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                <span className="mr-2">📖</span>
                From Your Textbook:
              </h3>
              <p className="text-gray-900 leading-relaxed text-base">
                {concept.content}
              </p>
              <p className="text-sm text-gray-600 mt-3 italic">
                Reference: {concept.textbookRef}
              </p>
            </div>

            {/* Examples Section */}
            <div className={`${concept.bgColor} rounded-lg p-6 mb-6 border-2 ${concept.borderColor}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🎯 Real-Life Examples:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {concept.examples.map((example, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-white rounded-lg">
                    <span className="text-3xl mr-3">{example.icon}</span>
                    <span className="text-gray-900 font-medium">{example.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-6 border-2 border-yellow-300">
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
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-pink-300">
              <p className="text-gray-900 text-lg">
                {concept.funFact}
              </p>
            </div>

            {/* Reading Practice Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-indigo-300">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🎤</span>
                Reading Practice (Optional)
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Practice reading this definition aloud - it will help you remember the exact textbook wording for exams!
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
                    ⏹ Stop & Check My Reading
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
                    {readingFeedback.perfect ? '✅ Perfect Reading!' : '👍 Good Try!'}
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
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setReadingFeedback(null)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                    >
                      {readingFeedback.perfect ? '✓ Done' : '🔄 Try Again'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6">
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentConcept === 0}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                ← Previous Concept
              </button>

              {currentConcept === concepts.length - 1 ? (
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
                >
                  Complete Explanation → Chat Session
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-semibold"
                >
                  Next Concept →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            {concepts.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full transition-all ${
                  index === currentConcept
                    ? 'bg-indigo-600'
                    : index < currentConcept
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
          <p className="text-sm text-gray-800 mt-2">
            {currentConcept < concepts.length - 1
              ? 'Click "Next Concept" to continue'
              : 'All concepts covered! Ready for practice?'}
          </p>
        </div>
      </div>
    </div>
  );
}
