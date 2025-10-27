import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types';

export const useChatHistory = (userEmail: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Create a stable storage key based on the user's email
  const STORAGE_KEY = userEmail ? `bytebuddy_chat_history_${userEmail}` : null;

  // Load state from local storage when the user changes (STORAGE_KEY changes)
  useEffect(() => {
    // If there's no user, clear state and mark as loaded.
    if (!STORAGE_KEY) {
      setConversations([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      setConversations(storedHistory ? JSON.parse(storedHistory) : []);
    } catch (error) {
      console.error("Failed to load chat history from local storage:", error);
      setConversations([]);
    } finally {
        setIsLoaded(true);
    }
  }, [STORAGE_KEY]);

  // Memoized save function that depends on the current STORAGE_KEY
  const saveHistory = useCallback((conversationsToSave: Conversation[]) => {
    if (!STORAGE_KEY) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationsToSave));
    } catch (error)        {
        console.error("Failed to save chat history to local storage:", error);
    }
  }, [STORAGE_KEY]);
  
  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    };
    setConversations(prev => {
        const updatedConversations = [newConversation, ...prev];
        saveHistory(updatedConversations);
        return updatedConversations;
    });
    return newConversation.id;
  }, [saveHistory]);
  
  const getConversation = useCallback((id: string | undefined): Conversation | null => {
    if (!id) return null;
    return conversations.find(c => c.id === id) || null;
  }, [conversations]);

  const addMessage = useCallback((chatId: string, message: Message) => {
    setConversations(prev => {
        const updatedConversations = prev.map(c =>
            c.id === chatId ? { ...c, messages: [...c.messages, message] } : c
        );
        saveHistory(updatedConversations);
        return updatedConversations;
    });
  }, [saveHistory]);
  
  const updateConversationTitle = useCallback((chatId: string, title: string) => {
    setConversations(prev => {
        const updatedConversations = prev.map(c =>
            c.id === chatId ? { ...c, title } : c
        );
        saveHistory(updatedConversations);
        return updatedConversations;
    });
  }, [saveHistory]);
  
  const deleteConversation = useCallback((chatId: string) => {
    setConversations(prev => {
      const updatedConversations = prev.filter(c => c.id !== chatId);
      saveHistory(updatedConversations);
      return updatedConversations;
    });
  }, [saveHistory]);

  return { 
    conversations, 
    isLoaded,
    createNewConversation, 
    getConversation, 
    addMessage, 
    updateConversationTitle,
    deleteConversation,
  };
};
