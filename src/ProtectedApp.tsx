import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import DietaryPlanPage from './components/pages/DietaryPlanPage';
import FoodLoggingPage from './components/pages/FoodLoggingPage';
import { useChatHistory } from './hooks/useChatHistory';
import { useAuthContext } from './context/AuthContext';

const NewChatHandler: React.FC<{ createNew: () => Promise<string> }> = ({ createNew }) => {
    const navigate = useNavigate();
    React.useEffect(() => {
        const init = async () => {
            const newId = await createNew();
            navigate(`/chat/${newId}`, { replace: true });
        }
        init();
    }, [createNew, navigate]);
    return null;
};

const ProtectedApp: React.FC = () => {
    const { currentUser, logout } = useAuthContext();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // currentUser is guaranteed to exist here by the router logic in App.tsx
    const { 
        conversations, 
        isLoaded, 
        createNewConversation, 
        deleteConversation,
        updateConversationTitle,
        getConversation,
        addMessage,
    } = useChatHistory(currentUser!.id);

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="text-2xl font-semibold text-foreground">Loading Chats...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-foreground md:overflow-hidden">
            <Sidebar 
                conversations={conversations} 
                deleteConversation={deleteConversation}
                updateConversationTitle={updateConversationTitle}
                logout={logout}
                userName={currentUser!.name}
                isMobileOpen={isMobileSidebarOpen}
                setMobileOpen={setIsMobileSidebarOpen}
            />
            <main className="flex-1 flex flex-col overflow-hidden bg-background">
                <Routes>
                    <Route path="/" element={<Navigate to={conversations.length > 0 ? `/chat/${conversations[0].id}` : '/chat'} replace />} />
                    <Route path="/chat" element={<NewChatHandler createNew={createNewConversation} />} />
                    <Route path="/chat/:chatId" element={
                        <DashboardPage 
                            conversations={conversations}
                            getConversation={getConversation} 
                            addMessage={addMessage}
                            updateConversationTitle={updateConversationTitle}
                            deleteConversation={deleteConversation}
                            isLoaded={isLoaded}
                            setMobileSidebarOpen={setIsMobileSidebarOpen}
                        />
                    } />
                    <Route path="/dietary-plan" element={<DietaryPlanPage setMobileSidebarOpen={setIsMobileSidebarOpen} />} />
                    <Route path="/food-logging" element={<FoodLoggingPage setMobileSidebarOpen={setIsMobileSidebarOpen} />} />
                     {/* Add a catch-all to redirect back to the main page for any other path */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default ProtectedApp;
