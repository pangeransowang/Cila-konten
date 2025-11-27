
import React, { useState } from 'react';
import { ContentResult, ContentMode, ImageModelType, ToolType } from '../types';
import { generateToolOutput } from '../services/geminiService';

interface ResultCardProps {
  result: ContentResult;
  onGenerateImage: (id: string, model: ImageModelType) => void;
  onGenerateVideoPrompt: (id: string) => void;
  onSave: (result: ContentResult) => void;
  isSun: boolean;
  hasReferenceImage: boolean;
  apiKey: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  result, 
  onGenerateImage, 
  onGenerateVideoPrompt,
  onSave, 
  isSun, 
  hasReferenceImage,
  apiKey
}) => {
  const hasError = result.caption.includes("Error") || result.caption.includes("Safety Warning") || result.caption.includes("System Error");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Tool States
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [toolOutput, setToolOutput] = useState<string>("");
  const [isToolLoading, setIsToolLoading] = useState(false);
  const [userComment, setUserComment] = useState("");

  const copyToClipboard = (text: string, section: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleToolAction = async (tool: ToolType) => {
    if (!apiKey) {
        alert("API Key missing");
        return;
    }
    setActiveTool(tool);
    setToolOutput(""); // Reset output
    
    // For REPLY, we wait for user input first
    if (tool === ToolType.REPLY) return;

    setIsToolLoading(true);
    try {
        const output = await generateToolOutput(apiKey, tool, {
            topic: result.topic,
            caption: result.caption,
            mode: result.mode,
            visualStyle: result.visualStyle
        });
        setToolOutput(output);
    } catch (e) {
        setToolOutput("Failed to load tool.");
    } finally {
        setIsToolLoading(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!userComment.trim()) return;
    if (!apiKey) {
        alert("API Key missing");
        return;
    }
    setIsToolLoading(true);
    try {
        const output = await generateToolOutput(apiKey, ToolType.REPLY, {
            topic: result.topic,
            caption: result.caption,
            mode: result.mode,
            visualStyle: result.visualStyle,
            userComment: userComment
        });
        setToolOutput(output);
    } catch (e) {
        setToolOutput("Failed to generate reply.");
    } finally {
        setIsToolLoading(false);
    }
  };

  return (
    <div className={`mb-12 rounded-3xl overflow-hidden shadow-2xl transition-all ${
      isSun ? 'bg-white shadow-orange-100' : 'bg-slate-800 shadow-indigo-900 border border-indigo-700'
    }`}>
      {/* Header */}
      <div className={`p-4 flex justify-between items-center ${
        isSun ? 'bg-orange-50' : 'bg-slate-900'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{result.mode === ContentMode.SUN ? '☀️' : '🌙'}</span>
          <span className="font-semibold opacity-75">{result.topic}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-400 opacity-50">
             {result.tier} TIER
          </span>
        </div>
        <button
          onClick={() => onSave(result)}
          className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
            isSun ? 'border-orange-200 hover:bg-orange-100' : 'border-indigo-700 hover:bg-indigo-900'
          }`}
        >
          Save Result
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Text Content */}
        <div className="space-y-6">
          {/* Caption Section */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isSun ? 'text-orange-400' : 'text-indigo-400'
            }`}>
              A. Instagram/TikTok Caption
            </h3>
            <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap min-h-[60px] ${
              isSun ? 'bg-gray-50 text-gray-700' : 'bg-slate-900 text-gray-300'
            } ${hasError ? 'border-2 border-red-400 bg-red-50 text-red-700' : ''}`}>
              {result.caption || "Generating caption..."}
            </div>
            <div className="flex justify-end mt-1">
                <button
                    onClick={() => copyToClipboard(result.caption, 'caption')}
                    className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                        isSun ? 'text-orange-500 hover:text-orange-600' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                >
                    {copiedSection === 'caption' ? '✅ Copied!' : '📋 Copy Caption'}
                </button>
            </div>
          </div>

          {/* Story Idea */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isSun ? 'text-orange-400' : 'text-indigo-400'
            }`}>
              C. Story Idea / CTA
            </h3>
            <div className={`p-4 rounded-xl text-sm font-medium min-h-[40px] ${
              isSun ? 'bg-orange-50 text-orange-800' : 'bg-indigo-900/30 text-indigo-200'
            }`}>
              {result.storyIdea || "Generating story..."}
            </div>
            <div className="flex justify-end mt-1">
                <button
                    onClick={() => copyToClipboard(result.storyIdea, 'storyIdea')}
                    className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                        isSun ? 'text-orange-500 hover:text-orange-600' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                >
                    {copiedSection === 'storyIdea' ? '✅ Copied!' : '📋 Copy Story Idea'}
                </button>
            </div>
          </div>

          {/* Video Prompt Result (Appears when available) */}
          {result.videoPrompt && (
            <div className="animate-fade-in">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  isSun ? 'text-blue-500' : 'text-blue-400'
                }`}>
                  D. Technical Video Prompt (Veo/Sora)
                </h3>
                <div className={`p-4 rounded-xl text-xs font-mono leading-relaxed h-48 overflow-y-auto mb-2 border ${
                  isSun ? 'bg-blue-50 text-blue-900 border-blue-100' : 'bg-slate-900 text-blue-200 border-blue-900'
                }`}>
                  {result.videoPrompt}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => copyToClipboard(result.videoPrompt || '', 'videoPrompt')}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                    >
                        {copiedSection === 'videoPrompt' ? '✅ Copied!' : '📋 Copy to Clipboard'}
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* Right: Visual Engine */}
        <div className="space-y-6">
           {/* Prompt Display */}
           <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              isSun ? 'text-orange-400' : 'text-indigo-400'
            }`}>
              B. Image Prompt (Angle System)
            </h3>
            <div className={`p-4 rounded-xl text-xs font-mono leading-relaxed h-48 overflow-y-auto mb-2 ${
              isSun ? 'bg-slate-100 text-slate-600' : 'bg-black/40 text-slate-400'
            }`}>
              {result.imagePrompt || "Generating detailed prompt..."}
            </div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => copyToClipboard(result.imagePrompt, 'imagePrompt')}
                    className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                        isSun ? 'text-orange-500 hover:text-orange-600' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                >
                    {copiedSection === 'imagePrompt' ? '✅ Copied!' : '📋 Copy Prompt'}
                </button>
            </div>
            
            {/* Image Generation Controls */}
            {!result.generatedImageUrl && (
              <div className="flex flex-col gap-3">
                 <div className="flex gap-3">
                    <button
                      onClick={() => onGenerateImage(result.id, ImageModelType.NANO_BANANA)}
                      disabled={result.isGeneratingImage || !hasReferenceImage || hasError}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        isSun 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800'
                      } ${(result.isGeneratingImage || !hasReferenceImage || hasError) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {result.isGeneratingImage ? 'Generating...' : '⚡ Nano Banana'}
                    </button>
                    <button
                      onClick={() => onGenerateImage(result.id, ImageModelType.NANO_BANANA_PRO)}
                      disabled={result.isGeneratingImage || !hasReferenceImage || hasError}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        isSun 
                          ? 'bg-orange-500 text-white hover:bg-orange-600' 
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      } ${(result.isGeneratingImage || !hasReferenceImage || hasError) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {result.isGeneratingImage ? 'Generating...' : '🚀 Banana Pro'}
                    </button>
                 </div>
                 {!hasReferenceImage && <p className="text-[10px] text-center text-red-400 font-bold">Wajib upload wajah Cila untuk generate image.</p>}
                 {hasReferenceImage && <p className="text-[10px] text-center opacity-50">Using loaded face reference</p>}
                 {hasError && <p className="text-[10px] text-center text-red-400">Fix the error above before generating image.</p>}
              </div>
            )}

            {/* Generated Image Result */}
            {result.generatedImageUrl && (
               <div className="space-y-4">
                   <div className="relative group rounded-xl overflow-hidden border-4 border-white/10 shadow-lg">
                     <img src={result.generatedImageUrl} alt="Generated Cila" className="w-full h-auto object-cover" />
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <a 
                          href={result.generatedImageUrl} 
                          download={`cila_${result.topic.substring(0,10)}.png`}
                          className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold"
                        >
                          Download
                        </a>
                     </div>
                   </div>
                   
                   {/* Generate Video Prompt Button - Only shows after image is generated */}
                   <button
                        onClick={() => onGenerateVideoPrompt(result.id)}
                        disabled={result.isGeneratingVideoPrompt}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            isSun 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-blue-900/50 text-blue-300 hover:bg-blue-900'
                        } ${result.isGeneratingVideoPrompt ? 'opacity-50' : ''}`}
                    >
                        {result.isGeneratingVideoPrompt ? (
                            <span>🎥 Writing Script...</span>
                        ) : (
                            <><span>🎥</span> Generate Video Prompt (From Image)</>
                        )}
                   </button>
               </div>
            )}
           </div>
        </div>
      </div>

      {/* Creator Toolkit Toolbar */}
      <div className={`border-t p-4 ${isSun ? 'border-orange-100 bg-orange-50/50' : 'border-indigo-800 bg-slate-900/50'}`}>
         <div className="flex flex-col gap-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>Creator Toolkit 🛠️</h4>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => handleToolAction(ToolType.AUDIO)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                     activeTool === ToolType.AUDIO 
                     ? (isSun ? 'bg-orange-200 border-orange-300 text-orange-800' : 'bg-indigo-700 border-indigo-500 text-white')
                     : (isSun ? 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50' : 'bg-slate-800 border-indigo-800 text-gray-400 hover:bg-indigo-900')
                  }`}
                >
                  🎵 Audio Vibe
                </button>
                <button 
                  onClick={() => handleToolAction(ToolType.REPLY)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                     activeTool === ToolType.REPLY
                     ? (isSun ? 'bg-orange-200 border-orange-300 text-orange-800' : 'bg-indigo-700 border-indigo-500 text-white')
                     : (isSun ? 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50' : 'bg-slate-800 border-indigo-800 text-gray-400 hover:bg-indigo-900')
                  }`}
                >
                  💬 Smart Reply
                </button>
                <button 
                  onClick={() => handleToolAction(ToolType.HASHTAGS)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                     activeTool === ToolType.HASHTAGS
                     ? (isSun ? 'bg-orange-200 border-orange-300 text-orange-800' : 'bg-indigo-700 border-indigo-500 text-white')
                     : (isSun ? 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50' : 'bg-slate-800 border-indigo-800 text-gray-400 hover:bg-indigo-900')
                  }`}
                >
                  #️⃣ Hashtag Expert
                </button>
            </div>

            {/* Tool Output Area */}
            {activeTool && (
                <div className={`mt-2 p-4 rounded-xl text-sm ${
                    isSun ? 'bg-white shadow-sm border border-orange-100' : 'bg-black/30 border border-indigo-900'
                }`}>
                    {/* Input for Reply Tool */}
                    {activeTool === ToolType.REPLY && (
                        <div className="mb-3 flex gap-2">
                           <input 
                             type="text" 
                             value={userComment}
                             onChange={(e) => setUserComment(e.target.value)}
                             placeholder="Paste fan comment here..."
                             className={`flex-1 px-3 py-2 rounded-lg text-xs outline-none border ${
                                isSun ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-slate-800 border-indigo-800 text-gray-200'
                             }`}
                           />
                           <button 
                             onClick={handleGenerateReply}
                             disabled={isToolLoading || !userComment.trim()}
                             className={`px-3 py-2 rounded-lg text-xs font-bold ${
                                isSun ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'
                             } disabled:opacity-50`}
                           >
                             Generate
                           </button>
                        </div>
                    )}

                    {isToolLoading ? (
                        <div className="flex items-center gap-2 opacity-60">
                            <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                            <span className="text-xs">Thinking...</span>
                        </div>
                    ) : toolOutput ? (
                        <div className="animate-fade-in relative group">
                            <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs">{toolOutput}</div>
                            <button
                                onClick={() => copyToClipboard(toolOutput, 'tool')}
                                className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="text-xs bg-black text-white px-2 py-1 rounded">
                                    {copiedSection === 'tool' ? 'Copied' : 'Copy'}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-xs opacity-40 italic">
                            {activeTool === ToolType.REPLY ? 'Waiting for comment input...' : 'Click a tool to generate info.'}
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>

    </div>
  );
};
