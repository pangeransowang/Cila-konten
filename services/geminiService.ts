
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, VIDEO_PROMPT_SYSTEM_INSTRUCTION, CILA_PERSONA, MODE_RULES } from "./promptSystem";
import { ImageModelType, ContentMode, VisualStyle, ToolType, CameraAngle, SubjectPose, UserTier } from "../types";

// Helper to init client with user provided key
const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please enter your Google Gemini API Key in the sidebar.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getTrendingTopic = async (apiKey: string, tier: UserTier): Promise<string> => {
  try {
    const ai = getAiClient(apiKey);
    
    // Pro Tier uses Gemini 3 Pro for deeper search understanding
    const model = tier === UserTier.PRO ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: "Find a specific trending lifestyle, fashion, or gen-z topic in Indonesia from the last 7 days. Use deep search to find what is currently viral in Bandung or Jakarta. Return only the topic name and a very brief context.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            context: { type: Type.STRING }
          }
        }
      }
    });

    let text = response.text || "{}";
    // Robust JSON cleaning
    text = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
    }
    
    const data = JSON.parse(text);
    return `${data.topic} (${data.context})`;
  } catch (error) {
    console.error("Error fetching trending topic:", error);
    return "Hujan sore di Braga (Fallback Topic)";
  }
};

export const generateContentPlan = async (
  apiKey: string,
  tier: UserTier,
  topic: string,
  mode: ContentMode,
  visualStyle: VisualStyle,
  cameraAngle: CameraAngle,
  subjectPose: SubjectPose,
  productFocus?: string,
  productImageBase64?: string,
  locationImageBase64?: string
) => {
  const textPrompt = `
    TASK: Generate a complete social media content plan for "Cila" based on the provided inputs.
    
    INPUTS:
    - TOPIC: ${topic}
    - MODE: ${mode}
    - VISUAL STYLE: ${visualStyle}
    - CAMERA ANGLE: ${cameraAngle}
    - SUBJECT POSE: ${subjectPose}
    - PRODUCT FOCUS: ${productFocus || "None/Lifestyle"}
    
    INSTRUCTIONS:
    1. **Caption**: Write an engaging Instagram/TikTok caption. Match the tone of the selected MODE (Sun=Cheerful, Moon=Poetic).
    2. **Image Prompt**: Create a highly detailed, photorealistic image prompt following the 'Angle System' rules in the system instruction. 
       - **CRITICAL**: You MUST enforce the CAMERA ANGLE: "${cameraAngle}" and SUBJECT POSE: "${subjectPose}" in the prompt description.
       - If a **Location Image** is provided, you MUST describe that specific room/setting as the background.
       - If a **Product Image** is provided, incorporate it naturally into the scene.
    3. **Story Idea**: A brief concept for an Instagram Story or Call to Action (CTA).
    
    OUTPUT FORMAT:
    You MUST return a valid JSON object with exactly these keys: "caption", "imagePrompt", "storyIdea".
  `;

  const parts: any[] = [];
  
  // If product image exists, add it to the request
  if (productImageBase64) {
    parts.push({
      inlineData: {
        data: productImageBase64,
        mimeType: 'image/jpeg'
      }
    });
    parts.push({ text: "Reference Product Image provided above." });
  }

  // If location image exists, add it to the request
  if (locationImageBase64) {
    parts.push({
      inlineData: {
        data: locationImageBase64,
        mimeType: 'image/jpeg'
      }
    });
    parts.push({ text: "Reference Location/Room Image provided above (Use this as the background setting)." });
  }

  parts.push({ text: textPrompt });

  try {
    const ai = getAiClient(apiKey);
    
    // Model Selection based on Tier
    const model = tier === UserTier.PRO ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    // Config: Enable Thinking only for Pro Tier
    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            storyIdea: { type: Type.STRING }
          },
          required: ["caption", "imagePrompt", "storyIdea"]
        }
    };

    // Add Thinking Budget for Pro Tier to improve quality
    if (tier === UserTier.PRO) {
        config.thinkingConfig = { thinkingBudget: 2048 }; // Moderate thinking for content plan
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: config
    });

    let rawText = response.text;
    
    // Safety check: sometimes the model returns no text if blocked
    if (!rawText) {
        return {
            caption: "Safety Warning: The content was blocked by AI safety filters. Please try a different topic or wording.",
            imagePrompt: "Blocked by Safety Filters",
            storyIdea: "Blocked"
        };
    }

    // Robust Parsing Logic
    // 1. Remove markdown code blocks
    rawText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    // 2. Find the JSON object boundaries
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    
    if (start !== -1 && end !== -1) {
      rawText = rawText.substring(start, end + 1);
    }

    const json = JSON.parse(rawText);
    
    return {
        caption: json.caption || "No caption generated.",
        imagePrompt: json.imagePrompt || "No prompt generated.",
        storyIdea: json.storyIdea || "No story idea generated."
    };

  } catch (error: any) {
    console.error("Error generating content plan:", error);
    
    // Specific handling for Permission Denied (403)
    const errorMessage = error.message || JSON.stringify(error);
    if (errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED")) {
        return {
            caption: "System Error: Access Denied (403). Your API Key does not have permission to access 'gemini-2.5-flash'. Please check your project settings or try a different key.",
            imagePrompt: "Generation failed due to API permissions.",
            storyIdea: "Error: Permission Denied"
        };
    }

    return {
      caption: `System Error: ${error.message || "Unknown error occurred"}`,
      imagePrompt: "Generation failed due to an error.",
      storyIdea: "Error"
    };
  }
};

export const generateCilaImage = async (
  apiKey: string,
  tier: UserTier,
  prompt: string,
  referenceImageBase64: string,
  modelType: ImageModelType
): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // We use the reference image to ensure Cila's face is consistent
    if (referenceImageBase64) {
      parts.push({
        inlineData: {
            data: referenceImageBase64,
            mimeType: 'image/jpeg' 
        }
      });
      parts.push({ text: `Generate a new photorealistic image based on this reference. ${prompt} Ensure high fidelity and 8k resolution.` });
    } else {
      parts.push({ text: prompt });
    }

    const ai = getAiClient(apiKey);
    
    // Tier Override: If user is PRO, we force the high-quality model regardless of button click if they want
    // But for now, we respect the button click (Nano Banana vs Pro), but we ensure Pro tier users get access to the Pro model.
    // However, if Free tier users try to use Pro model, we could restrict it.
    
    // Note: 'gemini-3-pro-image-preview' (Banana Pro) creates higher quality images.
    
    const response = await ai.models.generateContent({
      model: modelType,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
      
      const textPart = response.candidates[0].content.parts.find(p => p.text);
      if (textPart?.text) {
        throw new Error(`AI Model Refusal: ${textPart.text}`);
      }
    }
    
    throw new Error("No image data returned from AI provider. The content might have been blocked or is invalid.");

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateVideoPrompt = async (
  apiKey: string,
  tier: UserTier,
  topic: string,
  imagePrompt: string,
  caption: string
): Promise<string> => {
  const textPrompt = `
    Create a highly technical video prompt (Grandpa Structure) based on this content:
    TOPIC: ${topic}
    IMAGE PROMPT CONTEXT: ${imagePrompt}
    CAPTION CONTEXT: ${caption}
    
    The user wants to animate the scene described above. Use the strict formula provided in the system instruction.
  `;

  try {
    const ai = getAiClient(apiKey);
    
    // Pro Tier uses Gemini 3 Pro with thinking for better video directing
    const model = tier === UserTier.PRO ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    const config: any = {
         systemInstruction: VIDEO_PROMPT_SYSTEM_INSTRUCTION,
    };

    if (tier === UserTier.PRO) {
        config.thinkingConfig = { thinkingBudget: 1024 };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: textPrompt,
      config: config
    });

    return response.text || "Failed to generate video prompt.";
  } catch (error) {
    console.error("Error generating video prompt:", error);
    throw error;
  }
};

export const generateToolOutput = async (
  apiKey: string,
  tool: ToolType,
  context: { topic: string; caption: string; mode: ContentMode; visualStyle: VisualStyle; userComment?: string }
): Promise<string> => {
  const ai = getAiClient(apiKey);
  let prompt = "";

  switch (tool) {
    case ToolType.AUDIO:
      prompt = `
        Based on the caption: "${context.caption}" and the visual style: "${context.visualStyle}", 
        Suggest 3 trending audio vibes or music types for TikTok/Reels that fit the "${context.mode}" mode.
        Format as a bulleted list with brief reasoning for each.
      `;
      break;
    case ToolType.HASHTAGS:
      prompt = `
        Generate a curated set of 30 hashtags for Instagram/TikTok based on the topic: "${context.topic}".
        Include a mix of high-volume, niche specific, and Indonesian local hashtags.
        Format them as a single block of text separated by spaces.
      `;
      break;
    case ToolType.REPLY:
      prompt = `
        You are Cila (Persona: ${CILA_PERSONA}).
        Current Mode: ${context.mode} (${context.mode === 'SUN' ? 'Cheerful, bright' : 'Poetic, soft'}).
        A fan commented: "${context.userComment}".
        Write a short, engaging reply to this comment in your character. Use appropriate emojis.
      `;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a helper tool for Cila's content engine. ${MODE_RULES}`,
      }
    });
    return response.text || "Tool generation failed.";
  } catch (error) {
    console.error(`Error in tool ${tool}:`, error);
    return "Failed to generate tool output.";
  }
};
