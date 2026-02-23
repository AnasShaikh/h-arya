'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatSession() {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chapterName, setChapterName] = useState('');
  const [subject, setSubject] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    initializeChat();
  }, [router]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const name = sessionStorage.getItem('name') || 'Student';

      // Fetch chapter details first
      const chapterResponse = await fetch(`/api/chapter/${params.id}`, {
        headers: { 'x-user-id': userId || '' }
      });
      const chapterData = await chapterResponse.json();
      const chapter = chapterData.chapter;

      // Set chapter info
      setChapterName(chapter.chapterName);
      setSubject(chapter.subject);

      // Create chat session
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId || '0'),
          chapterId: parseInt(params.id as string),
          subject: chapter.subject,
          chapter: chapter.chapterName
        })
      });

      const data = await response.json();
      setSessionId(data.sessionId);

      // Add welcome message with dynamic chapter name
      setMessages([{
        id: 0,
        role: 'assistant',
        content: `Hi ${name}! 👋 I'm your AI tutor for ${chapter.chapterName}. You've completed the Explanation stage - great job! Now ask me anything about ${chapter.chapterName}. I can help clarify concepts, explain examples, or guide you through practice problems!`,
        timestamp: new Date().toISOString()
      }]);

      // Generate suggested questions for this chapter
      generateSuggestedQuestions(chapter.chapterName);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const generateSuggestedQuestions = async (chapterName: string) => {
    try {
      const response = await fetch('/api/chat/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterName })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to generic questions
      setSuggestedQuestions([
        `What are the main concepts in ${chapterName}?`,
        `Can you explain a key concept from this chapter?`,
        `Give me an example related to ${chapterName}`,
        `What should I focus on for exams?`
      ]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !sessionId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message to UI
    const newUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const userId = sessionStorage.getItem('userId');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId || '0'),
          sessionId,
          message: userMessage,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Add AI response to UI
      const aiMessage: Message = {
        id: data.messageId || Date.now() + 1,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Voice disabled temporarily
      // setTimeout(() => {
      //   if (voiceEnabled) {
      //     speakText(data.response);
      //   }
      // }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Call ElevenLabs TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('TTS failed');

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.play();

      // Store audio ref for stopping
      (window as Window & typeof globalThis & { currentAudio: HTMLAudioElement | null }).currentAudio = audio;
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    const typedWindow = window as Window & typeof globalThis & { currentAudio: HTMLAudioElement | null };
    if (typedWindow.currentAudio) {
      typedWindow.currentAudio.pause();
      typedWindow.currentAudio = null;
    }
    setIsSpeaking(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this chat session and move to the Test stage?')) {
      return;
    }

    try {
      const userId = sessionStorage.getItem('userId');

      // Mark stage 3 complete
      await fetch(`/api/chapter/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId || '0'),
          stageCompleted: 3,
          score: 100
        })
      });

      // End session in database
      if (sessionId) {
        await fetch(`/api/chat/session/${sessionId}`, {
          method: 'PATCH'
        });
      }

      router.push(`/chapter/${params.id}/test`);
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save progress.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat with H-Arya</h1>
            <p className="text-sm text-gray-700">Stage 3 of 5 • {chapterName || 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Voice Toggle */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking) stopSpeaking();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold text-sm ${
                voiceEnabled 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{voiceEnabled ? '🔊' : '🔇'}</span>
              <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                ⏹ Stop
              </button>
            )}
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
            >
              End Chat → Test
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-md border border-gray-200'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🤖</span>
                    <span className="font-semibold text-indigo-600">H-Arya</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && suggestedQuestions.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-700 mb-3 font-medium">💡 Try asking:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(q)}
                  className="text-left text-sm p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-gray-900 transition border border-indigo-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your question here... (Press Enter to send)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-900 placeholder:text-gray-500"
            rows={2}
            disabled={isLoading}
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          {messages.length - 1} messages sent
        </p>
      </div>
    </div>
  );
}
