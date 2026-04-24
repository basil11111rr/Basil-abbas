import { Type } from "@google/genai";
import { ai, MODELS } from "./client";

export const parseJobWithAI = async (text: string) => {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `You are an expert job listing parser. Extract information from the job listing and return it as JSON.
    
    Job Listing:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          jobType: { type: Type.STRING },
          salaryRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER, nullable: true },
              max: { type: Type.NUMBER, nullable: true },
              currency: { type: Type.STRING },
              period: { type: Type.STRING }
            }
          },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          applicationQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          jobDescription: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini job response", e);
    throw e;
  }
};
