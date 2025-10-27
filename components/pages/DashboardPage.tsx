import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import ChatView from '../chat/ChatView';
import type { Conversation, Message } from '../../types';
import Button from '../ui/Button';

const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

interface DashboardPageProps {
    conversations: Conversation[];
    getConversation: (id: string | undefined) => Conversation | null;
    addMessage: (chatId: string, message: Message) => void;
    updateConversationTitle: (chatId: string, title: string) => void;
    deleteConversation: (id: string) => void;
    isLoaded: boolean;
    setMobileSidebarOpen: (isOpen: boolean) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ conversations, getConversation, addMessage, updateConversationTitle, deleteConversation, isLoaded, setMobileSidebarOpen }) => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const conversation = getConversation(chatId);

    // This effect handles navigation safely after a deletion.
    useEffect(() => {
        // If the data is loaded but the current conversation doesn't exist,
        // it means it was just deleted. We should navigate away.
        if (isLoaded && !conversation) {
            const nextTarget = conversations.length > 0 
                ? `/chat/${conversations[0].id}` 
                : '/chat';
            navigate(nextTarget, { replace: true });
        }
    }, [isLoaded, conversation, conversations, navigate]);

    const handleDelete = () => {
        if (chatId) {
            // No confirmation, just delete.
            // The useEffect will handle navigating away.
            deleteConversation(chatId);
        }
    };
    
    // Show a loading/interstitial state while the history is loading,
    // or after a delete before the navigation effect runs.
    if (!conversation) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <h2 className="text-2xl font-heading font-semibold">Loading Chat...</h2>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between p-4 md:p-6 border-b border-border shrink-0 h-20">
                <div className="flex items-center">
                    <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden mr-4 p-2 -ml-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <MenuIcon />
                    </button>
                    <h1 className="text-2xl sm:text-4xl font-heading font-bold truncate pr-4">{conversation.title}</h1>
                </div>
                <Button
                    onClick={handleDelete}
                    variant="destructive-ghost"
                    className="flex items-center gap-2 shrink-0"
                    aria-label="Delete chat"
                >
                    <DeleteIcon />
                    <span className="hidden sm:inline">Delete Chat</span>
                </Button>
            </header>
            <div className="flex-1 overflow-y-auto">
                <ChatView 
                    key={chatId} // Force re-mount on chat change
                    chatId={chatId!} 
                    conversation={conversation}
                    addMessage={addMessage}
                    updateConversationTitle={updateConversationTitle}
                />
            </div>
        </div>
    );
};

export default DashboardPage;