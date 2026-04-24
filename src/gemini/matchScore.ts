import { Type } from "@google/genai";
import { ai, MODELS } from "./client";

export const calculateMatchScore = async (resumeData: any, jobData: any) => {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Analyze how well the resume matches the job description.
    
    Resume:
    ${JSON.stringify(resumeData)}
    
    Job:
    ${JSON.stringify(jobData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          matchLevel: { type: Type.STRING },
          matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse match score", e);
    throw e;
  }
};
