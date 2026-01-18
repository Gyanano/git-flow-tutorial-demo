import { GoogleGenAI } from "@google/genai";
import { GitState } from "../types";

export const explainGitState = async (state: GitState): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Gemini API Key is missing. Please configure it to get AI insights.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Summarize state for the prompt
        const branchSummary = Object.values(state.branches)
            .map(b => `- ${b.name} (${b.type}): pointing to ${b.headCommitId}`)
            .join('\n');
            
        const recentLog = state.logs.slice(-5).join('\n');

        const prompt = `
        You are an expert Git instructor. Explain the current state of this Git Flow repository to a student.
        
        Current Branches:
        ${branchSummary}

        Recent Action Logs:
        ${recentLog}

        Current HEAD is on: ${state.currentBranch}

        Provide a concise, encouraging, and educational summary (max 3 sentences) of what just happened and what the repository looks like now. Focus on the "Why" of Git Flow.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "I couldn't generate an explanation right now.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Unable to connect to the AI assistant.";
    }
};
