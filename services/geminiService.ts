
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askKrishiAssistant = async (prompt: string, language: string, history: any[] = []) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.parts[0].text }] })),
        { role: 'user', parts: [{ text: `Answer in ${language}: ${prompt}` }] }
      ],
      config: {
        systemInstruction: "You are Krishi Connect AI, an expert agricultural assistant in India. Provide practical, sustainable, and scientifically accurate farming advice.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Krishi Assistant Error:", error);
    return "I am having trouble connecting to the knowledge base. Please try again later.";
  }
};

export const detectCropDisease = async (base64Image: string, language: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Analyze this crop image and identify potential diseases or nutrient deficiencies in ${language}. Provide a clear diagnosis and organic/chemical treatment steps.` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Disease Detection Error:", error);
    return "Failed to analyze image. Please ensure the crop tissue is clearly visible.";
  }
};

export const fetchLiveMandiData = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Fetch current Mandi (APMC) prices for: ${query}. Return as JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              crop: { type: Type.STRING },
              mandi: { type: Type.STRING },
              price: { type: Type.NUMBER },
              trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
              change: { type: Type.NUMBER },
              lastUpdated: { type: Type.STRING }
            },
            required: ["crop", "mandi", "price", "trend", "change", "lastUpdated"]
          }
        }
      }
    });
    const data = JSON.parse(response.text || "[]");
    return { data, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error) {
    console.error("Mandi Data Error:", error);
    return { data: [], sources: [] };
  }
};

export const fetchRealTimeThreats = async (userLat?: number, userLon?: number) => {
  try {
    const locationContext = userLat && userLon ? `specifically at coordinates ${userLat}, ${userLon}` : 'in various regions of India';
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `SEARCH AND VERIFY CURRENT NEWS. Find active, confirmed, and imminent natural disasters (Flood, Earthquake, Cyclone, Heatwave) or agricultural threats (Locusts, Hailstorms) ${locationContext}. 
      1. ONLY include alerts confirmed by official news or government bodies (IMD, NDMA). 
      2. Provide a 'title' in Hindi and 'description' in Hindi.
      3. For every threat, provide exactly 3 actionable 'actions' (solutions) in Hindi. 
      4. Ensure 'isConfirmed' is true only if there is a verified news report.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['weather', 'pest', 'disease', 'market', 'disaster'] },
              severity: { type: Type.STRING, enum: ['critical', 'urgent', 'standard'] },
              title: { type: Type.STRING, description: 'Title in Hindi' },
              description: { type: Type.STRING, description: 'Short description in Hindi' },
              location: { type: Type.STRING },
              radius: { type: Type.NUMBER, description: 'Radius in KM' },
              timestamp: { type: Type.STRING },
              expectedTime: { type: Type.STRING },
              isConfirmed: { type: Type.BOOLEAN },
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER },
              impactAssessment: {
                type: Type.OBJECT,
                properties: {
                  crops: { type: Type.ARRAY, items: { type: Type.STRING } },
                  potentialDamage: { type: Type.STRING },
                  financialRisk: { type: Type.STRING }
                }
              },
              actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 specific solutions in Hindi' }
            },
            required: ["id", "category", "severity", "title", "description", "isConfirmed", "latitude", "longitude", "actions"]
          }
        }
      },
    });

    const data = JSON.parse(response.text || "[]");
    return { data, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error) {
    console.error("Fetch Threats Error:", error);
    return { data: [], sources: [] };
  }
};

export const getCropWeatherAdvisory = async (location: string, crops: string[], language: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search current weather for ${location}. Provide a crop-specific protection advisory for ${crops.join(', ')} in ${language}. 
      Include specific actionable steps for irrigation, pesticide timing, or harvesting based on the 3-day forecast.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text;
  } catch (error) {
    console.error("Weather Advisory Error:", error);
    return "Weather data currently unavailable.";
  }
};

export const predictMandiPrices = async (crop: string, mandi: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Predict the price trend for ${crop} in ${mandi} for the next 7-30 days based on seasonal trends, weather forecasts, and current market arrivals. Return as JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortTermTrend: { type: Type.STRING, enum: ['Rising', 'Falling', 'Stable'] },
            forecastText: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            predictedMax: { type: Type.NUMBER },
            factors: { type: Type.ARRAY, items: { type: Type.STRING } },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  predictedPrice: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["shortTermTrend", "forecastText", "confidence", "predictedMax", "factors", "chartData"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return { data, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error) {
    console.error("Price Prediction Error:", error);
    return { data: null, sources: [] };
  }
};

export const searchAgriExperts = async (type: 'csc' | 'officer' | 'bank', location: string) => {
  try {
    const prompt = type === 'csc' 
      ? `List verified Common Service Centres (CSC) near ${location}.` 
      : type === 'officer' 
      ? `Find agricultural extension officers or block development officers contact info near ${location}.` 
      : `Find bank managers specializing in KCC or agricultural loans in ${location}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt} Return as JSON array.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              operator: { type: Type.STRING },
              address: { type: Type.STRING },
              phone: { type: Type.STRING },
              designation: { type: Type.STRING },
              district: { type: Type.STRING },
              bank: { type: Type.STRING },
              branch: { type: Type.STRING },
              specialization: { type: Type.STRING },
              availability: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              distance: { type: Type.STRING }
            }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "[]");
    return { data, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (error) {
    console.error("Expert Search Error:", error);
    return { data: [], sources: [] };
  }
};
