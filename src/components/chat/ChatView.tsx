'use client';

// FIX: Import React hooks `useState`, `useRef`, and `useEffect` to resolve reference errors.
import React, { useState, useRef, useEffect } from 'react';
import { answerHealthQuestion, generateChatTitle } from '../../services/genkitService';
import type { Message, Conversation } from '../../types';
import { useIsMounted } from '../../hooks/useIsMounted';
import Logo from '../Logo';
import Input from '../ui/Input';
import Button from '../ui/Button';

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-1"></div>
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-2"></div>
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing-3"></div>
  </div>
);

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
    // Basic markdown to HTML conversion for links and grounding sources
    const formattedContent = content
        .replace(/\*Information sourced from: (.*)\*/gim, '<p class="text-sm text-muted-foreground mt-4 !-mb-2"><em>Information sourced from: $1</em></p>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');

    // Only use dangerouslySetInnerHTML if we actually have HTML tags to render
    const needsHtml = /<[a-z][\s\S]*>/i.test(formattedContent);
    
    if (needsHtml) {
        return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
    }
    
    return <>{content}</>;
};


interface ChatViewProps {
    chatId: string;
    conversation: Conversation;
    addMessage: (chatId: string, message: Message) => void;
    updateConversationTitle: (chatId: string, title: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatId, conversation, addMessage, updateConversationTitle }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();
  
  const messages = conversation.messages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    addMessage(chatId, userMessage);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const updatedHistory = [...messages, userMessage];
      
      // Generate title for new chats
      if (updatedHistory.length === 1) {
        generateChatTitle(updatedHistory).then(title => {
            if (title) updateConversationTitle(chatId, title);
        });
      }
      
      const botResponseContent = await answerHealthQuestion(updatedHistory);
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: botResponseContent };
      addMessage(chatId, botMessage);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
      addMessage(chatId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isMounted) {
    return null; // Avoid hydration errors by rendering nothing on the server
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-aurora rounded-lg p-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"></div>
                <Logo className="w-20 h-20 sm:w-28 sm:h-28 mb-4 relative" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground relative">ByteBuddy AI</h2>
            <p className="mt-2 max-w-sm relative text-base sm:text-lg">How can I assist you with your health and wellness goals today?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 sm:gap-4 group animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && <Logo className="w-8 h-8 shrink-0 mt-1" />}
              
              <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div 
                      className={`rounded-xl px-4 py-3 max-w-xl whitespace-pre-wrap prose prose-invert max-w-none ${msg.role === 'assistant' ? 'bg-secondary' : 'text-primary-foreground'}`}
                      style={msg.role === 'user' ? { background: 'var(--gradient-primary)'} : {}}
                  >
                      {msg.role === 'assistant' ? <ChatMessageContent content={msg.content} /> : msg.content}
                  </div>

                  <button 
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="shrink-0 self-start p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Copy message"
                  >
                      {copiedMessageId === msg.id ? <CheckIcon /> : <CopyIcon />}
                  </button>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start gap-4 animate-fade-in-up">
            <Logo className="w-8 h-8 shrink-0 mt-1" />
            <div className="rounded-xl px-4 py-3 bg-secondary flex items-center">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 pt-4 bg-background border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a health question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="px-6 sm:px-8 py-3 text-base h-12"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;