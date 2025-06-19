import type React from "react";
import type { Message } from "@langchain/langgraph-sdk";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Copy, CopyCheck } from "lucide-react";
import nela from '../assets/nela.png';


import { useState, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import nlbLogo from "@/assets/nlb.png";

// Markdown component props type from former ReportView
type MdComponentProps = {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

// Markdown components (from former ReportView.tsx)
const mdComponents = {
  h1: ({ className, children, ...props }: MdComponentProps) => (
    <h1 className={cn("text-2xl font-bold mt-4 mb-2", className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: MdComponentProps) => (
    <h2 className={cn("text-xl font-bold mt-3 mb-2", className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: MdComponentProps) => (
    <h3 className={cn("text-lg font-bold mt-3 mb-1", className)} {...props}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }: MdComponentProps) => (
    <p className={cn("mb-3 leading-7", className)} {...props}>
      {children}
    </p>
  ),
  a: ({ className, children, href, ...props }: MdComponentProps) => (
    <Badge className="text-xs mx-0.5">
      <a
        className={cn("text-blue-400 hover:text-blue-300 text-xs", className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    </Badge>
  ),
  ul: ({ className, children, ...props }: MdComponentProps) => (
    <ul className={cn("list-disc pl-6 mb-3", className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }: MdComponentProps) => (
    <ol className={cn("list-decimal pl-6 mb-3", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }: MdComponentProps) => (
    <li className={cn("mb-1", className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ className, children, ...props }: MdComponentProps) => (
    <blockquote
      className={cn(
        "border-l-4 border-neutral-600 pl-4 italic my-3 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: MdComponentProps) => (
    <code
      className={cn(
        "bg-neutral-900 rounded px-1 py-0.5 font-mono text-xs",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ className, children, ...props }: MdComponentProps) => (
    <pre
      className={cn(
        "bg-neutral-900 p-3 rounded-lg overflow-x-auto font-mono text-xs my-3",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ className, ...props }: MdComponentProps) => (
    <hr className={cn("border-neutral-600 my-4", className)} {...props} />
  ),
  table: ({ className, children, ...props }: MdComponentProps) => (
    <div className="my-3 overflow-x-auto">
      <table className={cn("border-collapse w-full", className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ className, children, ...props }: MdComponentProps) => (
    <th
      className={cn(
        "border border-neutral-600 px-3 py-2 text-left font-bold",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: MdComponentProps) => (
    <td
      className={cn("border border-neutral-600 px-3 py-2", className)}
      {...props}
    >
      {children}
    </td>
  ),
};

// Props for HumanMessageBubble
interface HumanMessageBubbleProps {
  message: Message;
  mdComponents: typeof mdComponents;
}

// HumanMessageBubble Component
const HumanMessageBubble: React.FC<HumanMessageBubbleProps> = ({
  message,
  mdComponents,
}) => {
  // Helper function to render message content
  const renderContent = () => {
    if (typeof message.content === "string") {
      return (
        <ReactMarkdown components={mdComponents}>
          {message.content}
        </ReactMarkdown>
      );
    } else {
      // Handle object content (could be image + text or just image)
      const content = message.content as any;
      return (
        <div className="flex flex-col gap-2">
          {content.image && (
            <div className="mb-2">
              <img 
                src={content.image} 
                alt="Attached image" 
                className="max-w-full rounded-lg"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          {content.text && (
            <ReactMarkdown components={mdComponents}>
              {content.text}
            </ReactMarkdown>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-end max-w-full sm:max-w-2xl">
      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
        <span className="font-bold text-xs sm:text-sm text-gray-800">Јас</span>
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Y</div>
      </div>
      <div className="bg-[rgba(40,0,123,0.8)] text-white p-2 sm:p-3 rounded-2xl border border-purple-900 text-sm sm:text-base">
        {renderContent()}
      </div>
    </div>
  );
};

// Props for AiMessageBubble
interface AiMessageBubbleProps {
  message: Message;
  isLastMessage: boolean;
  isOverallLoading: boolean;
  mdComponents: typeof mdComponents;
  handleCopy: (text: string, messageId: string) => void;
  copiedMessageId: string | null;
}

// AiMessageBubble Component
const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  message,
  isLastMessage,
  isOverallLoading,
  mdComponents,
  handleCopy,
  copiedMessageId,
}) => {

  // SVG Icons for the message actions
  const ThumbsUpIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-6.14A2 2 0 0016.28 8H14z"></path>
    </svg>
  );

  const ThumbsDownIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15v-5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-6.14A2 2 0 0016.28 8H14M6 21h4"></path>
    </svg>
  );

  const CopyIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>
  );

  // Helper function to render message content
  const renderContent = () => {
    if (typeof message.content === "string") {
      return (
        <ReactMarkdown components={mdComponents}>
          {message.content}
        </ReactMarkdown>
      );
    } else {
      // Handle object content (could be image + text or just image)
      const content = message.content as any;
      return (
        <div className="flex flex-col gap-2">
          {content.image && (
            <div className="mb-2">
              <img 
                src={content.image} 
                alt="Attached image" 
                className="max-w-full rounded-lg"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          {content.text && (
            <ReactMarkdown components={mdComponents}>
              {content.text}
            </ReactMarkdown>
          )}
          {!content.image && !content.text && (
            <ReactMarkdown components={mdComponents}>
              {JSON.stringify(content)}
            </ReactMarkdown>
          )}
        </div>
      );
    }
  };

  // Get content for copying
  const getContentForCopy = () => {
    if (typeof message.content === "string") {
      return message.content;
    } else {
      const content = message.content as any;
      if (content.text) {
        return content.text;
      }
      return JSON.stringify(message.content);
    }
  };

  return (
    <div className="flex items-start gap-2 sm:gap-4">
      <img className="w-10 h-10 sm:w-14 sm:h-14 rounded-full"src={nela} alt="Nela Logo"/>
      <div className="flex flex-col items-start w-full max-w-full sm:max-w-4xl">
        <span className="font-bold text-sm text-gray-800 mb-1 sm:mb-2">Нела</span>
        <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-lg w-full">
          <div className="text-sm sm:text-base leading-relaxed">
            {renderContent()}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button className="p-1 hover:bg-gray-200 rounded-full">
            <ThumbsUpIcon />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded-full">
            <ThumbsDownIcon />
          </button>
          <button 
            className="p-1 hover:bg-gray-200 rounded-full"
            onClick={() => handleCopy(getContentForCopy(), message.id!)}
          >
            {copiedMessageId === message.id ? <CopyCheck className="w-4 h-4 text-green-500" /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (inputValue: string, effort: string, model: string) => void;
  onCancel: () => void;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
}: ChatMessagesViewProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="p-2 sm:p-3 md:p-6 space-y-2 sm:space-y-3 w-full mx-auto pt-8 sm:pt-12 md:pt-16">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            return (
              <div key={message.id || `msg-${index}`} className="space-y-2 sm:space-y-3">
                <div
                  className={`flex items-start gap-2 sm:gap-3 ${
                    message.type === "human" ? "justify-end" : ""
                  }`}
                >
                  {message.type === "human" ? (
                    <HumanMessageBubble
                      message={message}
                      mdComponents={mdComponents}
                    />
                  ) : (
                    <AiMessageBubble
                      message={message}
                      isLastMessage={isLast}
                      isOverallLoading={isLoading} // Pass global loading state
                      mdComponents={mdComponents}
                      handleCopy={handleCopy}
                      copiedMessageId={copiedMessageId}
                    />
                  )}
                </div>
              </div>
            );
          })}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1].type === "human") && (
              <div className="flex items-start gap-2 sm:gap-4 mt-3">
                <img className="w-10 h-10 sm:w-14 sm:h-14 rounded-full" src="https://assets.stickpng.com/images/6294b87c5417451478546b84.png" alt="Аватар на Нела" />
                <div className="flex flex-col items-start w-full max-w-full sm:max-w-4xl">
                  <span className="font-bold text-sm text-gray-800 mb-1 sm:mb-2">Нела</span>
                  <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-lg w-full">
                    <div className="flex items-center justify-start h-full text-sm sm:text-base">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-400 mr-2" />
                      <span>Обработка на прашањето...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </ScrollArea>
      {/* <InputForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        onCancel={onCancel}
        hasHistory={messages.length > 0}
      /> */}
    </div>
  );
}
