import { Type } from "@google/genai";
import { ai, MODELS } from "./client";

export const parseResumeWithAI = async (text: string) => {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `You are a professional resume parser. Extract information from the text and return it as JSON.
    Ensure you extract "coreCompetencies" and "keyAchievements" into their respective arrays.
    
    Resume Text:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              professionalTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              portfolio: { type: Type.STRING }
            }
          },
          summary: { type: Type.STRING },
          coreCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                jobTitle: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                isCurrent: { type: Type.BOOLEAN },
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
                graduationYear: { type: Type.STRING },
                gpa: { type: Type.STRING },
                relevantCourses: { type: Type.ARRAY, items: { type: Type.STRING } }
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
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                link: { type: Type.STRING }
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
    console.error("Failed to parse Gemini response as JSON", e);
    throw e;
  }
};
