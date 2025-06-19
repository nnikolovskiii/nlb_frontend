import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, ArrowRight, Paperclip, Mic } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";


// Updated InputFormProps
interface InputFormProps {
  onSubmit: (inputValue: string, effort: string, model: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasHistory: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  hasHistory,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [effort] = useState("medium");
  const [model] = useState("gemini-2.5-flash-preview-04-17");

  const handleInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    onSubmit(inputValue, effort, model);
    setInputValue("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-3 sm:mt-4 mb-2 z-10">
      <div className="relative flex items-center w-full p-1 sm:p-2 bg-gray-100/80 backdrop-blur-sm rounded-full border border-gray-200/80 shadow-lg">
        <button 
          type="button"
          className="p-1.5 sm:p-2 md:p-3 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors"
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
          className="p-1.5 sm:p-2 md:p-3 text-gray-600 hover:text-purple-700 transition-colors"
        >
          <Mic size={16} className="sm:hidden" />
          <Mic size={18} className="hidden sm:block md:hidden" />
          <Mic size={22} className="hidden md:block" />
        </button>
        <button 
          type="button"
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
      {hasHistory && (
        <div className="flex justify-center mt-1 sm:mt-2">
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer rounded-full px-4"
            variant="default"
            onClick={() => window.location.reload()}
          >
            <SquarePen size={16} className="mr-2" />
            Ново прашање
          </Button>
        </div>
      )}
      <p className="text-xs text-gray-500 text-center mt-1 sm:mt-2">
        Powered by Remora.
      </p>
    </div>
  );
};
