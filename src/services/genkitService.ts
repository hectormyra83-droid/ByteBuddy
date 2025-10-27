import type { Message, DietaryPlanRequest } from '../types';

// Generic fetch function to communicate with our backend proxy
async function fetchFromGenAIProxy(task: string, payload: any): Promise<any> {
    const response = await fetch('/api/genai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch from GenAI proxy' }));
        throw new Error(errorData.error || 'An unknown error occurred');
    }
    
    const data = await response.json();
    return data.result;
}

export const answerHealthQuestion = async (history: Message[]): Promise<string> => {
    return fetchFromGenAIProxy('answerHealthQuestion', { history });
};

export const generateChatTitle = async (history: Message[]): Promise<string> => {
    const result = await fetchFromGenAIProxy('generateChatTitle', { history });
    return result || "New Chat";
}

export const generateDietaryPlan = async (request: DietaryPlanRequest): Promise<string> => {
    return fetchFromGenAIProxy('generateDietaryPlan', { request });
};

export const analyzeLoggedFood = async (food: string): Promise<string> => {
    return fetchFromGenAIProxy('analyzeLoggedFood', { food });
};
