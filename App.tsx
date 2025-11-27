
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { ContentMode, ContentResult, ImageModelType, VisualStyle, CameraAngle, SubjectPose, UserTier } from './types';
import { generateContentPlan, getTrendingTopic, generateCilaImage, generateVideoPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<ContentMode>(ContentMode.SUN);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(VisualStyle.DEFAULT);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CameraAngle.DEFAULT);
  const [subjectPose, setSubjectPose] = useState<SubjectPose>(SubjectPose.DEFAULT);
  const [productFocus, setProductFocus] = useState('');
  const [productImageBase64, setProductImageBase64] = useState<string | null>(null);
  const [locationImageBase64, setLocationImageBase64] = useState<string | null>(null);
  
  const [referenceFace, setReferenceFace] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(1);
  
  // API Key & Tier Management
  const [apiKey, setApiKey] = useState('');
  const [tier, setTier] = useState<UserTier>(UserTier.FREE);
  
  const [results, setResults] = useState<ContentResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingTrending, setIsGettingTrending] = useState(false);

  const checkApiKey = () => {
    if (!apiKey) {
        alert("⚠️ Please enter your API Key in the Sidebar first!");
        return false;
    }
    return true;
  };

  const handleGetTrending = async () => {
    if (!checkApiKey()) return;
    setIsGettingTrending(true);
    const trend = await getTrendingTopic(apiKey, tier);
    setTopic(trend);
    setIsGettingTrending(false);
  };

  const handleGenerate = async () => {
    if (!checkApiKey()) return;
    if (!referenceFace) {
        alert("Please upload a reference face image of Cila first.");
        return;
    }

    setIsGenerating(true);
    try {
      // Define a rotation of angles to use if the user selected "Default"
      const angleRotation = [
        CameraAngle.EYE_LEVEL,
        CameraAngle.LOW_ANGLE,
        CameraAngle.HIGH_ANGLE,
        CameraAngle.DUTCH_ANGLE
      ];

      // Create an array of promises based on generationCount
      const promises = Array.from({ length: generationCount }, (_, index) => {
        const effectiveAngle = cameraAngle === CameraAngle.DEFAULT
            ? angleRotation[index % angleRotation.length]
            : cameraAngle;

        return generateContentPlan(
            apiKey,
            tier,
            topic, 
            mode, 
            visualStyle, 
            effectiveAngle,
            subjectPose,
            productFocus, 
            productImageBase64 || undefined, 
            locationImageBase64 || undefined
        );
      });
      
      const plans = await Promise.all(promises);
      
      const newResults: ContentResult[] = plans.map((plan) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        topic: topic,
        mode: mode,
        visualStyle: visualStyle,
        caption: plan.caption, 
        imagePrompt: plan.imagePrompt,
        storyIdea: plan.storyIdea,
        tier: tier
      }));

      setResults(prev => [...newResults, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate content plan. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (resultId: string, modelType: ImageModelType) => {
    if (!checkApiKey()) return;
    if (!referenceFace) return;

    setResults(prev => prev.map(r => r.id === resultId ? { ...r, isGeneratingImage: true } : r));

    try {
      const result = results.find(r => r.id === resultId);
      if (!result) return;

      const imageUrl = await generateCilaImage(apiKey, result.tier, result.imagePrompt, referenceFace, modelType);
      
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, generatedImageUrl: imageUrl, isGeneratingImage: false } : r));
    } catch (error: any) {
      alert(`Image generation failed: ${error.message}`);
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, isGeneratingImage: false } : r));
    }
  };
  
  const handleGenerateVideoPrompt = async (resultId: string) => {
    if (!checkApiKey()) return;
    setResults(prev => prev.map(r => r.id === resultId ? { ...r, isGeneratingVideoPrompt: true } : r));

    try {
        const result = results.find(r => r.id === resultId);
        if (!result) return;

        const videoPrompt = await generateVideoPrompt(apiKey, result.tier, result.topic, result.imagePrompt, result.caption);
        
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, videoPrompt: videoPrompt, isGeneratingVideoPrompt: false } : r));
    } catch (error) {
        alert("Video prompt generation failed.");
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, isGeneratingVideoPrompt: false } : r));
    }
  };

  const handleSave = (result: ContentResult) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cila_content_${result.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Layout 
        mode={mode}
        apiKey={apiKey}
        setApiKey={setApiKey}
        tier={tier}
        setTier={setTier}
    >
      <InputForm
        topic={topic}
        setTopic={setTopic}
        mode={mode}
        setMode={setMode}
        visualStyle={visualStyle}
        setVisualStyle={setVisualStyle}
        cameraAngle={cameraAngle}
        setCameraAngle={setCameraAngle}
        subjectPose={subjectPose}
        setSubjectPose={setSubjectPose}
        productFocus={productFocus}
        setProductFocus={setProductFocus}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        onGetTrending={handleGetTrending}
        isGettingTrending={isGettingTrending}
        onImageUpload={setReferenceFace}
        hasReferenceImage={!!referenceFace}
        productImageBase64={productImageBase64}
        setProductImageBase64={setProductImageBase64}
        locationImageBase64={locationImageBase64}
        setLocationImageBase64={setLocationImageBase64}
        generationCount={generationCount}
        setGenerationCount={setGenerationCount}
      />

      <div className="space-y-8">
        {results.map(result => (
          <ResultCard
            key={result.id}
            result={result}
            onGenerateImage={handleGenerateImage}
            onGenerateVideoPrompt={handleGenerateVideoPrompt}
            onSave={handleSave}
            isSun={mode === ContentMode.SUN}
            hasReferenceImage={!!referenceFace}
            apiKey={apiKey}
          />
        ))}
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-20 opacity-40">
           <div className="text-6xl mb-4">✨</div>
           <p className="text-xl font-light">Ready to create magic for Cila?</p>
           <p className="text-sm">
             {!apiKey ? "Enter your API Key in the sidebar to start." : "Select a topic or use Free Mode Tier to begin."}
           </p>
        </div>
      )}
    </Layout>
  );
};

export default App;
