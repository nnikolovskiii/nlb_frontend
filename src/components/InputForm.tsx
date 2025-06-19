import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, ArrowRight, Paperclip, Mic, X, Square, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";


// Updated InputFormProps
interface InputFormProps {
  onSubmit: (inputValue: string, effort: string, model: string, imageData?: string) => void;
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
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');

      // Add any additional data needed for the API
      formData.append('effort', effort);
      formData.append('model', model);

      // Convert audio to base64 for the onSubmit function
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result as string;
        // Call the onSubmit function with empty text and the audio data
        onSubmit("", effort, model, base64Audio);
      };
      reader.readAsDataURL(blob);

    } catch (error) {
      console.error('Error sending audio:', error);
      alert('Failed to send audio message. Please try again.');
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
    if (!inputValue.trim() && !selectedImage) return;
    onSubmit(inputValue, effort, model, selectedImage || undefined);
    setInputValue("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-3 sm:mt-4 mb-2 z-10">
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
                  : 'text-gray-600 hover:text-purple-700'
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
          type="button"
          className="p-1.5 sm:p-2 md:p-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
          onClick={handleInputSubmit}
          disabled={(!inputValue.trim() && !selectedImage) || isLoading}
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
        Powered by NLB.
      </p>
    </div>
  );
};
