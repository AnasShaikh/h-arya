'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface DisplayedMessage extends Message {
  displayed: string;
  isTyping: boolean;
}

export default function ChatSession() {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<DisplayedMessage[]>([]);
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


  useEffect(() => {
    setDisplayedMessages((prev) => {
      const prevMap = new Map(prev.map((msg) => [msg.id, msg]));
      return messages.map((message) => {
        const existing = prevMap.get(message.id);
        if (existing) return existing;
        return {
          ...message,
          displayed: message.role === 'assistant' ? '' : message.content,
          isTyping: message.role === 'assistant',
        };
      });
    });
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;

    let i = 0;
    const fullText = last.content;

    setDisplayedMessages((prev) => prev.map((msg) => (
      msg.id === last.id ? { ...msg, displayed: '', isTyping: true } : msg
    )));

    const interval = setInterval(() => {
      i += 1;
      setDisplayedMessages((prev) => prev.map((msg) => {
        if (msg.id !== last.id) return msg;
        return {
          ...msg,
          displayed: fullText.slice(0, i),
          isTyping: i < fullText.length,
        };
      }));

      if (i >= fullText.length) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [messages.length]);

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex flex-col">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <header className="p-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-violet-100 px-6 py-4 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat with H-Arya</h1>
            <p className="text-sm text-gray-700">Stage 3 of 5 • {chapterName || 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isSpeaking) stopSpeaking();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition font-semibold text-sm ${
                voiceEnabled
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              <span>{voiceEnabled ? '🔊' : '🔇'}</span>
              <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-2 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition text-sm font-semibold"
              >
                ⏹ Stop
              </button>
            )}
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition font-semibold text-sm"
            >
              End Chat → Test
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-36">
        <div className="max-w-5xl mx-auto space-y-4">
          {displayedMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animation: 'fadeUp 0.25s ease-out forwards' }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'bg-white text-gray-900 shadow-md border border-violet-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🤖</span>
                    <span className="font-semibold text-violet-600">H-Arya</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.displayed}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start" style={{ animation: 'fadeUp 0.25s ease-out forwards' }}>
              <div className="flex items-center gap-1.5 p-4 bg-white rounded-2xl shadow-sm w-fit border border-violet-100">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length === 1 && suggestedQuestions.length > 0 && (
        <div className="px-4 pb-4">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-violet-100 p-4">
            <p className="text-sm text-gray-700 mb-3 font-medium">💡 Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(q)}
                  className="text-left text-sm p-3 bg-violet-50 hover:bg-violet-100 rounded-2xl text-gray-900 transition border border-violet-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-violet-50 via-violet-50/95 to-transparent">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-violet-100 p-3">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question here... (Press Enter to send)"
              className="flex-1 px-4 py-3 border border-violet-200 rounded-2xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none resize-none text-gray-900 placeholder:text-gray-500"
              rows={2}
              disabled={isLoading}
              maxLength={500}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {messages.length - 1} messages sent
          </p>
        </div>
      </div>
    </div>
  );
}
