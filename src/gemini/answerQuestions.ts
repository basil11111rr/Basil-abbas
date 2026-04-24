import { Type } from "@google/genai";
import { ai, MODELS } from "./client";

export const answerApplicationQuestions = async (questions: string[], resumeData: any, jobData: any) => {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Answer the following job application questions naturally based on the resume and job description.
    
    Questions:
    ${JSON.stringify(questions)}
    
    Resume:
    ${JSON.stringify(resumeData)}
    
    Job:
    ${JSON.stringify(jobData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            answerTips: { type: Type.STRING }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to answer application questions", e);
    throw e;
  }
};
