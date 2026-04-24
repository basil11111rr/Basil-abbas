import { Type } from "@google/genai";
import { ai, MODELS } from "./client";

export const generateInterviewPrep = async (resumeData: any, jobData: any) => {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Generate 5 interview questions and prep frameworks for this job application.
    
    Resume:
    ${JSON.stringify(resumeData)}
    
    Job:
    ${JSON.stringify(jobData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                questionType: { type: Type.STRING },
                whyTheyAsk: { type: Type.STRING },
                idealAnswerFramework: { type: Type.STRING },
                exampleAnswer: { type: Type.STRING },
                doNot: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to generate interview prep", e);
    throw e;
  }
};
