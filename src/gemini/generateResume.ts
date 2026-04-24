import { Type } from "@google/genai";
import { ai, MODELS } from "./client";

export const generateTailoredResume = async (resumeData: any, jobData: any) => {
  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: `You are a world-class resume writer. Tailor the following resume for the specific job listing.
    
    CRITICAL: YOU MUST FOLLOW THE STRUCTURE OF THE ATTACHED MASTER BLUEPRINT.
    Return JSON with EXACTLY these sections:
    1. contactInfo (include name, professionalTitles (array), email, phone, location, linkedin)
    2. professionalSummary
    3. coreCompetencies (Exhaustive list of skills/capabilities)
    4. keyAchievements (High-impact results)
    5. workExperience (Standard bullets)
    6. education
    7. skills (Array of {name, level})
    8. certifications
    9. additionalInfo (languages, awards)
    
    Candidate Resume:
    ${JSON.stringify(resumeData)}
    
    Job Listing:
    ${JSON.stringify(jobData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING },
          resumeSections: {
            type: Type.OBJECT,
            properties: {
              contactInfo: { 
                type: Type.OBJECT, 
                properties: { 
                  name: { type: Type.STRING }, 
                  professionalTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  email: { type: Type.STRING }, 
                  phone: { type: Type.STRING }, 
                  location: { type: Type.STRING },
                  linkedin: { type: Type.STRING }
                } 
              },
              professionalSummary: { type: Type.STRING },
              coreCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              workExperience: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    jobTitle: { type: Type.STRING }, 
                    company: { type: Type.STRING }, 
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING }, 
                    endDate: { type: Type.STRING }, 
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } } 
                  } 
                } 
              },
              education: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    degree: { type: Type.STRING }, 
                    institution: { type: Type.STRING }, 
                    location: { type: Type.STRING },
                    graduationYear: { type: Type.STRING } 
                  } 
                } 
              },
              skills: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    name: { type: Type.STRING }, 
                    level: { type: Type.STRING } 
                  } 
                } 
              },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              additionalInfo: {
                type: Type.OBJECT,
                properties: {
                  languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  awards: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          },
          optimizationNotes: { type: Type.STRING }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to generate tailored resume", e);
    throw e;
  }
};
