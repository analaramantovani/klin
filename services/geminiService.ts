import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScanResult, ShoeCandidate } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    leftShoe: {
      type: Type.OBJECT,
      properties: {
        detectedNumber: { type: Type.STRING, description: "The numeric size found on the left shoe sole." },
        confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
        bbox: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Normalized bounding box [ymin, xmin, ymax, xmax]" }
      },
      required: ["confidence"],
    },
    rightShoe: {
      type: Type.OBJECT,
      properties: {
        detectedNumber: { type: Type.STRING, description: "The numeric size found on the right shoe sole." },
        confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
        bbox: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Normalized bounding box [ymin, xmin, ymax, xmax]" }
      },
      required: ["confidence"],
    },
    notes: { type: Type.STRING, description: "Short explanation of issues if any." }
  },
};

export const analyzeShoeImage = async (base64Image: string): Promise<Partial<ScanResult>> => {
  const startTime = performance.now();

  try {
    const model = "gemini-2.5-flash"; // High speed model
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this image of a pair of shoes. 
            Task:
            1. Identify the left shoe and the right shoe.
            2. Read the numeric size printed on the sole of each shoe.
            3. Prioritize Brazilian (BR) sizes which are typically integers between 13 and 39.
            4. Ignore EU or US labels if a standalone number in the 13-39 range is present.
            5. Return null for detectedNumber if no clear number is visible or if it is out of 13-39 range.
            `
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2, // Low temperature for deterministic OCR
      },
    });

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);
    const textResponse = response.text;
    
    if (!textResponse) throw new Error("No response from AI");

    const data = JSON.parse(textResponse);

    // Map AI response to our app's internal ScanResult structure
    // Note: We synthesize some ROI data since we are doing full-image analysis for speed
    
    const leftVal = data.leftShoe?.detectedNumber || null;
    const rightVal = data.rightShoe?.detectedNumber || null;
    
    // Logic: Left and Right must be equal, present, and within range 13-39
    const leftNum = parseInt(leftVal || "0", 10);
    const rightNum = parseInt(rightVal || "0", 10);

    const isValidRange = (n: number) => n >= 13 && n <= 39;
    
    const leftValid = isValidRange(leftNum);
    const rightValid = isValidRange(rightNum);

    const match = leftValid && rightValid && (leftVal === rightVal);
    
    let status: 'OK' | 'ERROR' | 'WARNING' = 'OK';
    let notes = data.notes || "";

    if (!match) {
        status = 'ERROR';
        if (!leftValid && !rightValid) {
            status = 'WARNING'; // Likely no shoes detected
            notes = "Não detectamos tamanho BR (13-39). Reposicione.";
        } else if (leftVal !== rightVal) {
            notes = "Mismatch: Tamanhos diferentes detectados.";
        } else {
             notes = "Tamanhos fora do padrão BR (13-39).";
        }
    }

    return {
      match,
      processing_time_ms: processingTime,
      notes: notes,
      status: status,
      left: {
        roi: [0, 0, 0, 0], // Placeholder for AI coordinates
        candidates: leftVal ? [{ value: leftVal, confidence: data.leftShoe.confidence }] : [],
        chosen: leftVal,
        confidence: data.leftShoe?.confidence || 0
      },
      right: {
        roi: [0, 0, 0, 0], // Placeholder
        candidates: rightVal ? [{ value: rightVal, confidence: data.rightShoe.confidence }] : [],
        chosen: rightVal,
        confidence: data.rightShoe?.confidence || 0
      }
    };

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};
