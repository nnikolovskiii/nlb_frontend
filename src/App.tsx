import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { WelcomeScreen } from "@/components/WelcomeScreen.tsx";

import mascotNLB from '/src/assets/mascot.png';

// SVG Icon for the password visibility toggle
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// SVG Icon for the slashed eye (password hidden)
const EyeOffIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.673.126 2.463.363m7.137 7.137A10.04 10.04 0 0112 19c-1.02 0-2-.187-2.905-.533M4.893 4.893A10.04 10.04 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.04 10.04 0 01-2.096 4.093M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 2l20 20" />
    </svg>
);

// NLB Banka Logo SVG
const NlbLogo = ({ className, textColor = "black" }: { className?: string; textColor?: string }) => (
    <svg className={className} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="45" fontFamily="Poppins, sans-serif" fontSize="40" fontWeight="bold" fill={textColor}>
            <tspan >NLB Banka</tspan>
            <tspan> </tspan>
        </text>
    </svg>
);

// Login Form Component
const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    // For now, just simulate successful login
    if (username && password) {
      onLogin();
    }
  };

  return (
    <div className="bg-gray-50 font-sans flex items-center justify-center min-h-screen">
      <div className="w-full max-w-6xl m-4 md:m-8">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Left Side: Login Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <div>
              <div className="mb-8">
                <NlbLogo className="h-10" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Добредојдовте</h1>
              <p className="text-gray-600 mb-8">Најавете се со своите податоци</p>

              <form noValidate onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="sr-only">Корисничко име</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Корисничко име"
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6e3bce] transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="relative mb-6">
                  <label htmlFor="password" className="sr-only">Лозинка</label>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    placeholder="Лозинка"
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6e3bce] transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                   <button 
                    type="button" 
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-[#4A00E0]"
                    aria-label="Toggle password visibility"
                   >
                     {passwordVisible ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                   </button>
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    className="w-full bg-[#4A00E0] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#5821c3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6e3bce] transition-all duration-300"
                  >
                    Најави се
                  </button>
                </div>
              </form>

              <div className="text-center">
                <a href="#" className="font-semibold text-[#4A00E0] hover:underline">
                  Заборавена лозинка?
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Branding & Image */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#4A00E0] to-[#4A00E0] p-8 sm:p-12 flex flex-col items-center justify-center text-center text-white rounded-l-none md:rounded-l-2xl">
              <div className="flex flex-col items-center justify-center h-full">
                  <NlbLogo className="h-16 mb-4" textColor="white" />
                  <p className="text-3xl tracking-tight leading-tight">
                      Вашиот дигитален банкар <span className="font-bold">24/7</span>
                  </p>
                  <img
                      src={mascotNLB} alt="NLB Mascot"
                      className="w-full max-w-sm mt-8"
                      onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x480/ffffff/cccccc?text=Mascot'; }}
                  />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const thread = useStream<{
    messages: Message[];
    initial_search_query_count: number;
    max_research_loops: number;
    reasoning_model: string;
  }>({
    apiUrl: import.meta.env.DEV
      ? "https://d24b-46-217-10-43.ngrok-free.app"
      : "http://localhost:8123",
    assistantId: "agent",
    messagesKey: "messages",
    onFinish: (event: any) => {
      console.log(event);
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [thread.messages]);

  const handleSubmit = useCallback(
    (submittedInputValue: string, effort: string, model: string, mediaData?: string) => {
      // Check if it's audio data by looking for audio MIME type in base64 string
      const isAudioData = mediaData && mediaData.startsWith('data:audio');
      const isImageData = mediaData && !isAudioData;

      if (!submittedInputValue.trim() && !mediaData) return;

      // convert effort to, initial_search_query_count and max_research_loops
      // low means max 1 loop and 1 query
      // medium means max 3 loops and 3 queries
      // high means max 10 loops and 5 queries
      let initial_search_query_count = 0;
      let max_research_loops = 0;
      switch (effort) {
        case "low":
          initial_search_query_count = 1;
          max_research_loops = 1;
          break;
        case "medium":
          initial_search_query_count = 3;
          max_research_loops = 3;
          break;
        case "high":
          initial_search_query_count = 5;
          max_research_loops = 10;
          break;
      }

      // Create message content based on whether we have text, image, audio, or combinations
      let messageContent: string | { text?: string; image?: string; audio?: string };

      if (isImageData && submittedInputValue.trim()) {
        // Both image and text
        messageContent = {
          text: submittedInputValue,
          image: mediaData
        };
      } else if (isAudioData && submittedInputValue.trim()) {
        // Both audio and text
        messageContent = {
          text: submittedInputValue,
          audio: mediaData
        };
      } else if (isImageData) {
        // Only image
        messageContent = {
          image: mediaData
        };
      } else if (isAudioData) {
        // Only audio
        messageContent = {
          audio: mediaData
        };
      } else {
        // Only text
        messageContent = submittedInputValue;
      }

      const newMessages: Message[] = [
        ...(thread.messages || []),
        {
          type: "human",
          content: messageContent,
          id: Date.now().toString(),
        },
      ];
      thread.submit({
        messages: newMessages,
        initial_search_query_count: initial_search_query_count,
        max_research_loops: max_research_loops,
        reasoning_model: model,
      });
    },
    [thread]
  );

  const handleCancel = useCallback(() => {
    thread.stop();
    window.location.reload();
  }, [thread]);

  // Handle request for personalized assistant
  const handlePersonalizedAssistantRequest = () => {
    setShowLoginForm(true);
  };

  // Handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLoginForm(false);
  };

  // If login form should be shown
  if (showLoginForm) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen antialiased bg-white text-gray-800">
      <main className="flex-1 flex flex-col overflow-hidden w-full px-2 sm:px-4 md:max-w-4xl md:mx-auto">
        <WelcomeScreen
          handleSubmit={handleSubmit}
          isLoading={thread.isLoading}
          onCancel={handleCancel}
          messages={thread.messages}
          scrollAreaRef={scrollAreaRef}
          onPersonalizedAssistantRequest={handlePersonalizedAssistantRequest}
          isAuthenticated={isAuthenticated}
        />
      </main>
    </div>
  );
}
