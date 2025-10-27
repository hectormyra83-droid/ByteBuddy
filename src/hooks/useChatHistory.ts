import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Conversation, Message } from '../types';

export const useChatHistory = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to map Supabase's numeric IDs to string IDs used in the app's types.
  const mapSupabaseDataToConversations = (data: any[]): Conversation[] => {
    return data.map(convo => ({
      id: String(convo.id), // Convert bigint to string
      title: convo.title,
      messages: convo.messages?.map((msg: any) => ({
        id: String(msg.id), // Convert bigint to string
        role: msg.role,
        content: msg.content,
      })) || [],
    }));
  };

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setIsLoaded(true);
      return;
    }

    const fetchHistory = async () => {
      setIsLoaded(false);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*, messages(*, conversation_id)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setConversations(mapSupabaseDataToConversations(data));
      } catch (error) {
        console.error("Failed to load chat history from Supabase:", error);
        setConversations([]);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchHistory();
  }, [userId]);
  
  const createNewConversation = useCallback(async (): Promise<string> => {
    if (!userId) throw new Error("User not authenticated");
    
    const newConversationData = {
        user_id: userId,
        title: 'New Chat',
    };

    const { data, error } = await supabase
        .from('conversations')
        .insert(newConversationData)
        .select('id, title')
        .single();
    
    if (error) throw error;

    const newConversation: Conversation = {
        id: String(data.id), // Convert bigint to string
        title: data.title,
        messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  }, [userId]);
  
  const getConversation = useCallback((id: string | undefined): Conversation | null => {
    if (!id) return null;
    return conversations.find(c => c.id === id) || null;
  }, [conversations]);

  const addMessage = useCallback(async (chatId: string, message: Message) => {
    if (!userId) throw new Error("User not authenticated");

    // Optimistically update the UI. The client-generated ID is temporary for the key.
    setConversations(prev => prev.map(c =>
      c.id === chatId ? { ...c, messages: [...c.messages, message] } : c
    ));

    // The 'id' column in the 'messages' table is a database-generated bigint.
    // Do not send the client-generated 'id' in the insert payload.
    const { error } = await supabase.from('messages').insert({
      conversation_id: chatId,
      user_id: userId,
      role: message.role,
      content: message.content,
    });
    
    if (error) {
      console.error("Failed to save message:", error);
      // In a real-world app, you might want to roll back the optimistic update here.
    }
  }, [userId]);
  
  const updateConversationTitle = useCallback(async (chatId: string, title: string) => {
    setConversations(prev => prev.map(c =>
        c.id === chatId ? { ...c, title } : c
    ));
    
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', chatId);

    if (error) {
        console.error("Failed to update title:", error);
        // Optionally handle rollback of UI state
    }
  }, []);
  
  const deleteConversation = useCallback(async (chatId: string) => {
    setConversations(prev => prev.filter(c => c.id !== chatId));
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', chatId);

    if (error) {
        console.error("Failed to delete conversation:", error);
        // Optionally handle rollback of UI state
    }
  }, []);

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
