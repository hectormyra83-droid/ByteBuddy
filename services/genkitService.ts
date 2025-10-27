import { GoogleGenAI } from "@google/genai";
import type { Message, DietaryPlanRequest } from '../types';

// FIX: Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const answerHealthQuestion = async (history: Message[]): Promise<string> => {
    // FIX: Map the application's message history to the format expected by the Gemini API,
    // converting the 'assistant' role to 'model'.
    const contents = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // FIX: Call `ai.models.generateContent` for chat, providing history and system instruction, and enabling Google Search grounding.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: 'You are ByteBuddy, a helpful AI assistant focused on health and wellness. Provide informative and safe advice, but always remind the user to consult a healthcare professional for medical issues. Keep your answers concise and easy to understand.',
            tools: [{ googleSearch: {} }],
        },
    });
    
    // FIX: Extract the text response directly from the `text` property and append grounding sources.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let groundingText = '';
    if (groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .map(chunk => chunk.web)
            .filter(web => web && web.uri)
            .map(web => `[${web.title || web.uri}](${web.uri})`);
        
        if (sources.length > 0) {
            const uniqueSources = [...new Set(sources)];
            groundingText = `\n\n---\n*Information sourced from: ${uniqueSources.join(', ')}*`;
        }
    }
    
    return response.text + groundingText;
};

export const generateChatTitle = async (history: Message[]): Promise<string> => {
    const userQuestion = history.find(m => m.role === 'user')?.content || '';
    if (!userQuestion) return "New Chat";

    const prompt = `Based on the following user question, create a short and concise title of no more than 5 words. Only return the title text.
    
    Question: "${userQuestion}"
    
    Title:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.replace(/["']/g, "").trim(); // Clean up quotes and whitespace
}


export const generateDietaryPlan = async (request: DietaryPlanRequest): Promise<string> => {
    const { age, gender, height, weight, units, activityLevel, goal, dietaryRestrictions, usualFoods, eatingHabits } = request;
    
    const prompt = `
      Create a comprehensive, balanced, and healthy 7-day dietary plan based on the detailed user profile below.

      **User Profile:**
      - **Age:** ${age}
      - **Gender:** ${gender}
      - **Height:** ${height} ${units === 'metric' ? 'cm' : 'inches'}
      - **Weight:** ${weight} ${units === 'metric' ? 'kg' : 'lbs'}
      - **Primary Goal:** ${goal.replace('_', ' ')}
      - **Activity Level:** ${activityLevel.replace('_', ' ')}
      - **Dietary Restrictions or Allergies:** ${dietaryRestrictions || 'None'}
      - **Typical Foods Eaten:** ${usualFoods}
      - **Current Eating Habits:** ${eatingHabits}

      **Instructions for the Plan:**
      1.  **Duration:** The plan must cover a full 7 days (Day 1 to Day 7).
      2.  **Completeness:** For each day, provide specific and varied meal suggestions for Breakfast, Lunch, Dinner, and at least one Snack. Do not use placeholders like "(similar balanced meals)".
      3.  **Personalization:** The meal suggestions should be tailored to the user's primary goal (e.g., calorie deficit for weight loss, protein-rich for muscle gain).
      4.  **Practicality:** Suggest meals that are practical and reasonably easy to prepare.
      5.  **Disclaimer:** **Crucially**, start the entire response with a clear disclaimer in brackets, like this: [Disclaimer: This is an AI-generated dietary plan and is not a substitute for professional medical advice. Consult with a registered dietitian or healthcare provider before making significant changes to your diet.]
      6.  **Formatting:** Use Markdown for clear formatting. Use headings for each day (e.g., "### Day 1") and bullet points for meals.

      Generate the 7-day plan now based on these instructions.
    `;
    
    // FIX: Call `ai.models.generateContent` with a detailed prompt for a dietary plan.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

export const analyzeLoggedFood = async (food: string): Promise<string> => {
    const prompt = `
        You are an expert dietary health assistant. Your task is to analyze the user's logged meal and provide nutritional insights using up-to-date information from Google Search. The tone should be helpful, encouraging, and organized.

        **User's Meal:**
        "${food}"

        **Instructions:**
        1.  **Nutritional Insights:** Under the heading "### Nutritional Insights", provide a clear, estimated nutritional breakdown. Use a bulleted list for the following:
            *   **Calories:** Estimated amount.
            *   **Protein:** Estimated amount.
            *   **Carbohydrates:** Estimated amount.
            *   **Fats:** Estimated amount.
            *   **Key Nutrients:** Mention any other significant vitamins, minerals, or nutritional aspects (e.g., high in fiber, sodium, or sugar).
        2.  **Health Assessment:** Under the heading "### Health Assessment", briefly assess the meal's healthiness in a constructive, non-judgmental paragraph.
        3.  **Healthier Alternatives:** If the meal has unhealthy aspects, provide 1-2 specific and practical healthier alternatives under the heading "### Healthier Alternatives". For each alternative, use a bulleted list to explain why it's a better choice. If the meal is already healthy, commend the user and suggest another similar healthy option.
        4.  **Formatting:** Strictly use Markdown. Use "###" for headings and "*" for bullet points.
        5.  **Disclaimer:** **Crucially**, start the entire response with a clear disclaimer in brackets, like this: [Disclaimer: This is an AI-generated nutritional analysis and is not a substitute for professional medical advice. Consult with a registered dietitian for personalized guidance.]

        Generate the analysis now based on these instructions.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let groundingText = '';
    if (groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .map(chunk => chunk.web)
            .filter(web => web && web.uri)
            .map(web => `[${web.title || web.uri}](${web.uri})`);
        
        if (sources.length > 0) {
            const uniqueSources = [...new Set(sources)];
            groundingText = `\n\n---\n*Information sourced from: ${uniqueSources.join(', ')}*`;
        }
    }
    
    return response.text + groundingText;
};