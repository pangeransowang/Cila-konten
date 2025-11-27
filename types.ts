
export enum ContentMode {
  SUN = 'SUN',
  MOON = 'MOON'
}

export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO'
}

export enum ImageModelType {
  NANO_BANANA = 'gemini-2.5-flash-image',
  NANO_BANANA_PRO = 'gemini-3-pro-image-preview'
}

export enum VisualStyle {
  DEFAULT = 'Default',
  CINEMATIC = 'Cinematic',
  MINIMALIST = 'Minimalist',
  PLAYFUL = 'Playful',
  SPICY = 'Spicy',
  UGC = 'UGC (Raw)',
  LUXURY = 'Luxury'
}

export enum CameraAngle {
  DEFAULT = 'Default (AI Decides)',
  EYE_LEVEL = 'Eye Level',
  LOW_ANGLE = 'Low Angle (Heroic)',
  HIGH_ANGLE = 'High Angle (Cute)',
  OVERHEAD = 'Overhead (Flat Lay)',
  DUTCH_ANGLE = 'Dutch Angle (Dynamic)',
  SELFIE_POV = 'Selfie (POV)',
  WIDE_SHOT = 'Wide Shot',
  CLOSE_UP = 'Close Up'
}

export enum SubjectPose {
  DEFAULT = 'Default (AI Decides)',
  STANDING = 'Standing / Posing',
  SITTING = 'Sitting / Relaxed',
  WALKING = 'Walking / Moving',
  CANDID = 'Candid / Looking Away',
  SELFIE = 'Taking a Selfie',
  PRODUCT_SHOWCASE = 'Holding Product',
  DANCING = 'Dancing / Dynamic',
  EATING = 'Eating / Drinking',
  READING = 'Reading a Book',
  INTERACTING_PRODUCT = 'Interacting with Product (Active)'
}

export enum ToolType {
  AUDIO = 'AUDIO',
  REPLY = 'REPLY',
  HASHTAGS = 'HASHTAGS'
}

export interface ContentResult {
  id: string;
  topic: string;
  mode: ContentMode;
  visualStyle: VisualStyle;
  caption: string;
  imagePrompt: string;
  storyIdea: string;
  generatedImageUrl?: string;
  isGeneratingImage?: boolean;
  videoPrompt?: string;
  isGeneratingVideoPrompt?: boolean;
  tier: UserTier;
}

export interface GenerationParams {
  topic: string;
  mode: ContentMode;
  visualStyle: VisualStyle;
  cameraAngle: CameraAngle;
  subjectPose: SubjectPose;
  productFocus?: string;
  productImageBase64?: string;
  referenceImageBase64?: string;
  locationImageBase64?: string;
}

export interface TrendingTopicResponse {
  topic: string;
  context: string;
}
