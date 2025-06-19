import React, { useState } from 'react';
import { Shield, Paperclip, Mic, ArrowRight, Menu, ArrowUpRight } from 'lucide-react';

// Helper component for SVG Icons to avoid repetition
const IconWrapper = ({ children, className = "" }) => (
    <div className={`flex items-center justify-center ${className}`}>
        {children}
    </div>
);

// Suggestion Card Component
const SuggestionCard = ({ title, description, onClick }) => (
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

interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string,
    effort: string,
    model: string
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
}) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [inputValue, setInputValue] = useState('');
    const [effort] = useState("medium");
    const [model] = useState("gemini-2.5-flash-preview-04-17");

    const handleInputSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;
        handleSubmit(inputValue, effort, model);
        setInputValue("");
    };

    const suggestionData = [
        {
            title: "Штедни<br/>книшки",
            description: "Get tailored advice on increasing property visibility and driving sales."
        },
        {
            title: "Кредитни<br/>картички",
            description: "Learn expert negotiation tips to close deals effectively."
        },
        {
            title: "Општо<br/>допшто",
            description: "Discover the best marketing strategies to showcase your properties."
        },
        {
            title: "Трала<br/>лкала",
            description: "Need help with something else? Ask away, and we'll guide you."
        }
    ];

    return (
        <div className="relative w-full h-full bg-white font-sans text-gray-800 flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
            {/* Background Gradient Blur Effect */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[300px] bg-gradient-to-b from-purple-200/50 via-purple-100/50 to-purple-500/50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

            {/* Header Section */}
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 mb-1 sm:mb-2">
                <div className="flex items-center gap-1 sm:gap-3">
                    <IconWrapper className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-700 rounded-full text-white">
                        <Shield size={16} className="sm:hidden" />
                        <Shield size={20} className="hidden sm:block md:hidden" />
                        <Shield size={24} className="hidden md:block" />
                    </IconWrapper>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 hidden sm:block">Нела</h1>
                </div>

                {/* Custom Segmented Control */}
                <div className="hidden md:flex items-center p-1 bg-gray-100 rounded-full border-2 border-gray-200/80">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${activeTab === 'basic' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-500'}`}
                    >
                        Основен
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${activeTab === 'custom' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-500'}`}
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

            {/* Main Content */}
            <main className="w-full max-w-5xl mx-auto flex-grow flex flex-col items-center justify-center text-center py-2 sm:py-4 md:py-6 z-10 min-h-0">
                <div className="relative mb-3 sm:mb-6 pt-12 sm:pt-16">
                     <IconWrapper className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-purple-700 rounded-full text-white shadow-2xl shadow-purple-200">
                        <Shield size={28} className="sm:hidden" />
                        <Shield size={32} className="hidden sm:block md:hidden" />
                        <Shield size={40} className="hidden md:block" />
                    </IconWrapper>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900">
                        Како може да ви <span className="text-purple-700">помогнеме</span>?
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
                                // Extract plain text from HTML title
                                const plainTitle = card.title.replace(/<br\/>|<br>|<\/br>/g, ' ').replace(/<[^>]*>/g, '');
                                handleSubmit(plainTitle, effort, model);
                            }}
                        />
                    ))}
                </div>
            </main>

            {/* Input Bar */}
            <footer className="w-full max-w-4xl mx-auto mt-3 sm:mt-4 mb-2 z-10">
                <div className="relative flex items-center w-full p-1 sm:p-2 bg-gray-100/80 backdrop-blur-sm rounded-full border border-gray-200/80 shadow-lg">
                    <button className="p-1.5 sm:p-2 md:p-3 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors">
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
                    <button className="p-1.5 sm:p-2 md:p-3 text-gray-600 hover:text-purple-700 transition-colors">
                        <Mic size={16} className="sm:hidden" />
                        <Mic size={18} className="hidden sm:block md:hidden" />
                        <Mic size={22} className="hidden md:block" />
                    </button>
                    <button 
                        className="p-1.5 sm:p-2 md:p-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
                        onClick={handleInputSubmit}
                        disabled={!inputValue.trim() || isLoading}
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
                    Powered by Remora.
                </p>
            </footer>
        </div>
    );
};
