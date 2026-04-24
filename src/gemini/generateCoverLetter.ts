import { ai, MODELS } from "./client";

export const generateCoverLetter = async (resumeData: any, jobData: any) => {
  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: `Write a compelling, human-sounding cover letter for the following job application.
    
    Candidate:
    ${JSON.stringify(resumeData)}
    
    Job:
    ${JSON.stringify(jobData)}`,
    config: {
      systemInstruction: "You are an expert career coach. Write a natural, personalized cover letter. Avoid AI buzzwords."
    }
  });

  return response.text;
};
