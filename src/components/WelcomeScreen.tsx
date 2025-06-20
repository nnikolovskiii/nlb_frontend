import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, ArrowRight, Menu, ArrowUpRight, X, Square, AlertCircle } from 'lucide-react';
import nlbLogo from '../assets/nlb.png';


// Helper component for SVG Icons to avoid repetition
interface IconWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ children, className = "" }) => (
    <div className={`flex items-center justify-center ${className}`}>
        {children}
    </div>
);

// Suggestion Card Component
interface SuggestionCardProps {
    title: string;
    description: string;
    onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, description, onClick }) => (
    <div 
        className="relative p-2 sm:p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full cursor-pointer"
        onClick={onClick}
    >
        <div className="flex flex-col justify-between h-full">
            <div>
                <h3 className="text-sm sm:text-lg md:text-xl font-medium text-gray-700 leading-tight" dangerouslySetInnerHTML={{ __html: title }}></h3>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2 line-clamp-2 hidden sm:block">{description}</p>
            </div>
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full border border-gray-400 text-gray-500 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <ArrowUpRight size={12} className="sm:hidden" />
                <ArrowUpRight size={14} className="hidden sm:block md:hidden" />
                <ArrowUpRight size={16} className="hidden md:block" />
            </div>
        </div>
    </div>
);

import { ChatMessagesView } from "@/components/ChatMessagesView.tsx";
import type { Message } from "@langchain/langgraph-sdk";


interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string,
    effort: string,
    model: string,
    mediaData?: string
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
  messages: Message[];
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onPersonalizedAssistantRequest?: () => void;
  isAuthenticated?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
  messages,
  scrollAreaRef,
  onPersonalizedAssistantRequest,
  isAuthenticated = false,
}) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [inputValue, setInputValue] = useState('');
    const [effort] = useState("medium");
    const [model] = useState("gemini-2.5-flash-preview-04-17");
    const [showChat, setShowChat] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
    const [isCheckingPermission, setIsCheckingPermission] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Check microphone permissions on component mount
    useEffect(() => {
      const checkMicrophonePermission = async () => {
        try {
          // Check if the browser supports the permissions API
          if (navigator.permissions && navigator.permissions.query) {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });

            setMicPermission(permissionStatus.state as "granted" | "denied" | "prompt");

            // Listen for permission changes
            permissionStatus.onchange = () => {
              setMicPermission(permissionStatus.state as "granted" | "denied" | "prompt");
            };
          } else {
            // Fallback for browsers that don't support the permissions API
            setMicPermission("prompt");
          }
        } catch (error) {
          console.error('Error checking microphone permission:', error);
          setMicPermission("prompt");
        }
      };

      checkMicrophonePermission();
    }, []);

    // Function to request microphone permissions
    const requestMicrophonePermission = async (): Promise<boolean> => {
      setIsCheckingPermission(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // If we get here, permission was granted
        setMicPermission("granted");

        // Release the stream immediately since we're just checking permissions
        stream.getTracks().forEach(track => track.stop());

        setIsCheckingPermission(false);
        return true;
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setMicPermission("denied");
        setIsCheckingPermission(false);
        return false;
      }
    };

    // Function to handle starting and stopping voice recording
    const toggleRecording = async () => {
      if (isRecording) {
        // Stop recording
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
      } else {
        // If permission is denied, show alert and return
        if (micPermission === "denied") {
          alert('Microphone access is denied. Please enable microphone access in your browser settings.');
          return;
        }

        // If permission status is unknown or prompt, request permission first
        if (micPermission === "prompt") {
          const permissionGranted = await requestMicrophonePermission();
          if (!permissionGranted) {
            alert('Could not access microphone. Please check your permissions.');
            return;
          }
        }

        // Start recording
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setAudioBlob(audioBlob);

            // Stop all tracks in the stream to release the microphone
            stream.getTracks().forEach(track => track.stop());

            // Send the audio immediately after recording stops
            sendAudioMessage(audioBlob);
          };

          mediaRecorder.start();
          setIsRecording(true);
        } catch (error) {
          console.error('Error accessing microphone:', error);
          setMicPermission("denied");
          alert('Could not access microphone. Please check your permissions.');
        }
      }
    };

    // Function to send the recorded audio
    const sendAudioMessage = async (blob: Blob) => {
      try {
        // Convert audio to base64 for the handleSubmit function
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result as string;
          // Call the handleSubmit function with empty text and the audio data
          handleSubmit("", effort, model, base64Audio);
          setShowChat(true);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error sending audio:', error);
        alert('Failed to send audio message. Please try again.');
      }
    };

    // Handle tab change
    const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      // If user wants to access personalized assistant and is not authenticated
      if (tab === 'custom' && !isAuthenticated && onPersonalizedAssistantRequest) {
        onPersonalizedAssistantRequest();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() && !selectedImage && !audioBlob) return;

        // If we have audio data, use that
        if (audioBlob) {
            // Convert audio to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64Audio = reader.result as string;
                handleSubmit(inputValue, effort, model, base64Audio);
                setInputValue("");
                setSelectedImage(null);
                setAudioBlob(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setShowChat(true);
            };
            reader.readAsDataURL(audioBlob);
        } else {
            // Otherwise use text and/or image
            handleSubmit(inputValue, effort, model, selectedImage || undefined);
            setInputValue("");
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setShowChat(true);
        }
    };

    const suggestionData = [
        {
            title: "Штедни<br/>книжки",
            description: "Дознај ги видовите на штедни книжки и пронајди ја најдобрата опција за твоите заштеди."
        },
        {
            title: "Кредитни<br/>картички",
            description: "Спореди кредитни картички според камати, бенефиции и трошоци – и избери ја најсоодветната за тебе."
        },
        {
            title: "Типови <br/> кредити",
            description: "Разгледај ги различните банкарски кредити – станбен, потрошувачки, студентски и повеќе."
        },
        {
            title: "Дигитално<br/> банкарство",
            description: "Научи како да користиш мобилно и електронско банкарство за побрзи и побезбедни трансакции."
        }
    ];

    return (
        <div className="relative w-full h-screen bg-white font-sans text-gray-800 flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
            {/* Background Gradient Blur Effect */}
            {/* <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[300px] bg-gradient-to-b from-purple-200/50 via-purple-100/50 to-purple-500/50 rounded-full blur-3xl opacity-40 pointer-events-none"></div> */}

            {/* Header Section */}
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 mb-1 sm:mb-2">
                <div className="flex items-center gap-1 sm:gap-3">
                    <IconWrapper className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-indigo-950 rounded-full text-white overflow-hidden">
                        <img src={nlbLogo} alt="NLB Logo" className="w-full h-full object-cover" />
                    </IconWrapper>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 hidden sm:block">Нела</h1>
                </div>

                {/* Custom Segmented Control */}
                <div className="hidden md:flex items-center p-1 bg-gray-100 rounded-full border-2 border-gray-200/80">
                    <button
                        onClick={() => handleTabChange('basic')}
                        className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${activeTab === 'basic' ? 'bg-indigo-950 text-white shadow-lg' : 'text-gray-500'}`}
                    >
                        Основен
                    </button>
                    <button
                        onClick={() => handleTabChange('custom')}
                        className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${activeTab === 'custom' ? 'bg-indigo-950 text-white shadow-lg' : 'text-gray-500'}`}
                    >
                        Персонализиран асистент
                    </button>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                     <button className="p-1.5 sm:p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                        <Menu size={16} className="sm:hidden" />
                        <Menu size={20} className="hidden sm:block md:hidden" />
                        <Menu size={24} className="hidden md:block" />
                    </button>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto">
                {showChat || messages.length > 0 ? (
                    <ChatMessagesView
                        messages={messages}
                        isLoading={isLoading}
                        scrollAreaRef={scrollAreaRef}
                        onSubmit={handleSubmit}
                        onCancel={onCancel}
                    />
                ) : (
                    <>
                        {/* Main Content */}
                        <main className="w-full max-w-5xl mx-auto flex-grow flex flex-col items-center justify-center text-center py-2 sm:py-4 md:py-6 z-10 min-h-0">
                            <div className="relative mb-3 sm:mb-6">
                                <IconWrapper className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-950 rounded-full text-white shadow-2xl shadow-purple-200 overflow-hidden mx-auto mb-4">
                                    <img src={nlbLogo} alt="NLB Logo" className="w-full h-full object-cover" />
                                </IconWrapper>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900">
                                    Како може да ви <span className="text-indigo-900">помогнеме</span>?
                                </h2>
                                <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
                                    Впишете прашање или изберете тема за да продолжите.
                                </p>
                            </div>

                            {/* Suggestion Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full max-w-full">
                                {suggestionData.map((card, index) => (
                                    <SuggestionCard
                                        key={index}
                                        title={card.title}
                                        description={card.description}
                                        onClick={() => {
                                            const plainTitle = card.title.replace(/<br\/>|<br>|<\/br>/g, ' ').replace(/<[^>]*>/g, '');
                                            handleSubmit(plainTitle, effort, model);
                                            setShowChat(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </main>
                    </>
                )}
            </div>

            {/* Input Bar */}
            <footer className="w-full max-w-4xl mx-auto mt-3 sm:mt-4 mb-2 z-10">
                {selectedImage && (
                    <div className="mb-2 relative">
                        <div className="relative inline-block">
                            <img 
                                src={selectedImage} 
                                alt="Selected" 
                                className="max-h-32 rounded-lg border border-gray-300" 
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {isRecording && (
                    <div className="mb-2 flex items-center justify-center">
                        <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <span className="mr-2">Recording in progress</span>
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-100"></div>
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="relative flex items-center w-full p-1 sm:p-2 bg-gray-100/80 backdrop-blur-sm rounded-full border border-gray-200/80 shadow-lg">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button 
                        type="button"
                        className="p-1.5 sm:p-2 md:p-3 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors"
                        onClick={handleAttachClick}
                    >
                        <Paperclip size={16} className="sm:hidden" />
                        <Paperclip size={18} className="hidden sm:block md:hidden" />
                        <Paperclip size={22} className="hidden md:block" />
                    </button>
                    <input
                        type="text"
                        placeholder="Внесете прашање..."
                        className="flex-grow bg-transparent px-2 sm:px-4 text-sm sm:text-base text-gray-700 placeholder-gray-500 focus:outline-none"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleInputSubmit();
                            }
                        }}
                    />
                    <button 
                        type="button"
                        className={`p-1.5 sm:p-2 md:p-3 transition-colors ${
                          isCheckingPermission 
                            ? 'text-yellow-500 animate-pulse' 
                            : isRecording 
                              ? 'text-red-600 animate-pulse' 
                              : micPermission === "denied"
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-600 hover:text-indigo-950'
                        }`}
                        onClick={toggleRecording}
                        disabled={isCheckingPermission}
                        title={
                          micPermission === "denied" 
                            ? "Microphone access denied. Click to try again." 
                            : isRecording 
                              ? "Stop recording" 
                              : "Start voice recording"
                        }
                    >
                        {isCheckingPermission ? (
                          <>
                            <div className="animate-spin">
                              <Mic size={16} className="sm:hidden" />
                              <Mic size={18} className="hidden sm:block md:hidden" />
                              <Mic size={22} className="hidden md:block" />
                            </div>
                          </>
                        ) : isRecording ? (
                          <>
                            <Square size={16} className="sm:hidden" />
                            <Square size={18} className="hidden sm:block md:hidden" />
                            <Square size={22} className="hidden md:block" />
                          </>
                        ) : micPermission === "denied" ? (
                          <>
                            <AlertCircle size={16} className="sm:hidden" />
                            <AlertCircle size={18} className="hidden sm:block md:hidden" />
                            <AlertCircle size={22} className="hidden md:block" />
                          </>
                        ) : (
                          <>
                            <Mic size={16} className="sm:hidden" />
                            <Mic size={18} className="hidden sm:block md:hidden" />
                            <Mic size={22} className="hidden md:block" />
                          </>
                        )}
                    </button>
                    <button
                        className="p-1.5 sm:p-2 md:p-3 bg-indigo-950 text-white rounded-full hover:bg-indigo-950 transition-colors"
                        onClick={handleInputSubmit}
                        disabled={(!inputValue.trim() && !selectedImage && !audioBlob) || isLoading}
                    >
                        <ArrowRight size={16} className="sm:hidden" />
                        <ArrowRight size={18} className="hidden sm:block md:hidden" />
                        <ArrowRight size={22} className="hidden md:block" />
                    </button>
                </div>
                {isLoading && (
                    <button
                        className="mt-1 sm:mt-2 p-1.5 sm:p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors mx-auto block"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
                <p className="text-xs text-gray-500 text-center mt-1 sm:mt-2">
                    Powered by NLB.
                </p>
            </footer>
        </div>
    );
};
