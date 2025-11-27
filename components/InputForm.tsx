import React, { useRef } from 'react';
import { ContentMode, VisualStyle, CameraAngle, SubjectPose } from '../types';

interface InputFormProps {
  topic: string;
  setTopic: (t: string) => void;
  mode: ContentMode;
  setMode: (m: ContentMode) => void;
  visualStyle: VisualStyle;
  setVisualStyle: (v: VisualStyle) => void;
  cameraAngle: CameraAngle;
  setCameraAngle: (a: CameraAngle) => void;
  subjectPose: SubjectPose;
  setSubjectPose: (p: SubjectPose) => void;
  productFocus: string;
  setProductFocus: (p: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onGetTrending: () => void;
  isGettingTrending: boolean;
  onImageUpload: (base64: string) => void;
  hasReferenceImage: boolean;
  productImageBase64: string | null;
  setProductImageBase64: (base64: string | null) => void;
  locationImageBase64: string | null;
  setLocationImageBase64: (base64: string | null) => void;
  generationCount: number;
  setGenerationCount: (n: number) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  topic,
  setTopic,
  mode,
  setMode,
  visualStyle,
  setVisualStyle,
  cameraAngle,
  setCameraAngle,
  subjectPose,
  setSubjectPose,
  productFocus,
  setProductFocus,
  onGenerate,
  isGenerating,
  onGetTrending,
  isGettingTrending,
  onImageUpload,
  hasReferenceImage,
  productImageBase64,
  setProductImageBase64,
  locationImageBase64,
  setLocationImageBase64,
  generationCount,
  setGenerationCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const isSun = mode === ContentMode.SUN;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'reference' | 'product' | 'location') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const pureBase64 = base64String.split(',')[1];
        if (type === 'reference') {
            onImageUpload(pureBase64);
        } else if (type === 'product') {
            setProductImageBase64(pureBase64);
        } else if (type === 'location') {
            setLocationImageBase64(pureBase64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`rounded-3xl p-6 mb-8 shadow-xl transition-all duration-500 ${
      isSun ? 'bg-white shadow-orange-100/50' : 'bg-slate-800/50 shadow-indigo-900/50 border border-indigo-800'
    }`}>
      
      {/* Reference Image Section - Mandatory */}
      <div className="mb-8 p-4 border-2 border-dashed rounded-xl border-opacity-40 border-gray-400 flex flex-col items-center justify-center bg-opacity-10 bg-gray-500">
        <label className="mb-2 font-semibold text-sm opacity-80">Reference Face (Cila) - Required</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, 'reference')} 
          ref={fileInputRef}
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
             hasReferenceImage 
             ? 'bg-green-500 text-white' 
             : (isSun ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700')
          }`}
        >
          {hasReferenceImage ? "✅ Face Reference Loaded" : "📤 Upload Cila's Face"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Topic, Style, & Product */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 opacity-75">Topik Konten</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Review kopi di Braga..."
                className={`flex-1 px-4 py-3 rounded-xl outline-none ring-2 ring-transparent transition-all ${
                  isSun 
                    ? 'bg-orange-50 focus:ring-orange-300 text-slate-800 placeholder-slate-400' 
                    : 'bg-slate-900 focus:ring-indigo-500 text-white placeholder-slate-600'
                }`}
              />
              <button
                onClick={onGetTrending}
                disabled={isGettingTrending}
                className={`px-3 py-3 rounded-xl font-medium transition-all text-xs md:text-sm whitespace-nowrap border-2 ${
                  isSun
                    ? 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200'
                    : 'bg-indigo-900 text-indigo-300 border-indigo-700 hover:bg-indigo-800'
                }`}
              >
                {isGettingTrending ? "Searching..." : "🚀 Free Mode Tier"}
              </button>
            </div>
            <p className="text-[10px] mt-1 opacity-60 ml-1">Free Mode Tier: Auto-fetch trending topic (7 days).</p>
          </div>

          {/* Visual Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-2 opacity-75">Visual Style</label>
                <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                    className={`w-full px-4 py-3 rounded-xl outline-none ring-2 ring-transparent transition-all appearance-none cursor-pointer ${
                    isSun 
                        ? 'bg-orange-50 focus:ring-orange-300 text-slate-800' 
                        : 'bg-slate-900 focus:ring-indigo-500 text-white'
                    }`}
                >
                    {Object.values(VisualStyle).map(style => (
                        <option key={style} value={style}>{style}</option>
                    ))}
                </select>
             </div>
             
             <div>
                <label className="block text-sm font-medium mb-2 opacity-75">Camera Angle</label>
                <select
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value as CameraAngle)}
                    className={`w-full px-4 py-3 rounded-xl outline-none ring-2 ring-transparent transition-all appearance-none cursor-pointer ${
                    isSun 
                        ? 'bg-orange-50 focus:ring-orange-300 text-slate-800' 
                        : 'bg-slate-900 focus:ring-indigo-500 text-white'
                    }`}
                >
                    {Object.values(CameraAngle).map(angle => (
                        <option key={angle} value={angle}>{angle}</option>
                    ))}
                </select>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-2 opacity-75">Subject Pose</label>
                <select
                    value={subjectPose}
                    onChange={(e) => setSubjectPose(e.target.value as SubjectPose)}
                    className={`w-full px-4 py-3 rounded-xl outline-none ring-2 ring-transparent transition-all appearance-none cursor-pointer ${
                    isSun 
                        ? 'bg-orange-50 focus:ring-orange-300 text-slate-800' 
                        : 'bg-slate-900 focus:ring-indigo-500 text-white'
                    }`}
                >
                    {Object.values(SubjectPose).map(pose => (
                        <option key={pose} value={pose}>{pose}</option>
                    ))}
                </select>
             </div>

             <div>
                <label className="block text-sm font-medium mb-2 opacity-75">Produk (Text)</label>
                <input
                    type="text"
                    value={productFocus}
                    onChange={(e) => setProductFocus(e.target.value)}
                    placeholder="e.g. Botol Skincare..."
                    className={`w-full px-4 py-3 rounded-xl outline-none ring-2 ring-transparent transition-all ${
                    isSun 
                        ? 'bg-orange-50 focus:ring-orange-300 text-slate-800 placeholder-slate-400' 
                        : 'bg-slate-900 focus:ring-indigo-500 text-white placeholder-slate-600'
                    }`}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Image Upload */}
            <div>
                <label className="block text-sm font-medium mb-2 opacity-75">Product Image (Optional)</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'product')} 
                    ref={productInputRef}
                    className="hidden"
                />
                <div className={`flex items-center gap-2 p-2 rounded-xl border ${
                    isSun ? 'border-orange-100 bg-orange-50' : 'border-indigo-800 bg-slate-900'
                }`}>
                    <button 
                        onClick={() => productInputRef.current?.click()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                            isSun ? 'bg-white shadow text-orange-600' : 'bg-indigo-800 text-white'
                        }`}
                    >
                        {productImageBase64 ? "Change" : "Upload"}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                        {productImageBase64 ? (
                            <span className="text-xs text-green-500 font-medium truncate block">Attached</span>
                        ) : (
                            <span className="text-xs opacity-50 truncate block">None</span>
                        )}
                    </div>

                    {productImageBase64 && (
                        <button 
                            onClick={() => {
                                setProductImageBase64(null);
                                if (productInputRef.current) productInputRef.current.value = '';
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Location Image Upload */}
            <div>
                <label className="block text-sm font-medium mb-2 opacity-75">Cila Room (Location)</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'location')} 
                    ref={locationInputRef}
                    className="hidden"
                />
                <div className={`flex items-center gap-2 p-2 rounded-xl border ${
                    isSun ? 'border-orange-100 bg-orange-50' : 'border-indigo-800 bg-slate-900'
                }`}>
                    <button 
                        onClick={() => locationInputRef.current?.click()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                            isSun ? 'bg-white shadow text-orange-600' : 'bg-indigo-800 text-white'
                        }`}
                    >
                        {locationImageBase64 ? "Change" : "Upload"}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                        {locationImageBase64 ? (
                            <span className="text-xs text-green-500 font-medium truncate block">Attached</span>
                        ) : (
                            <span className="text-xs opacity-50 truncate block">None</span>
                        )}
                    </div>

                    {locationImageBase64 && (
                        <button 
                            onClick={() => {
                                setLocationImageBase64(null);
                                if (locationInputRef.current) locationInputRef.current.value = '';
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
          </div>

        </div>

        {/* Right Column: Mode Toggle & Action */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 opacity-75">Mode</label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-opacity-20 bg-gray-500">
              <button
                onClick={() => setMode(ContentMode.SUN)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                  mode === ContentMode.SUN
                    ? 'bg-white text-orange-500 shadow-md'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <span>☀️</span> Sun Mode
              </button>
              <button
                onClick={() => setMode(ContentMode.MOON)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                  mode === ContentMode.MOON
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <span>🌙</span> Moon Mode
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
               <label className="text-xs font-semibold opacity-60">JUMLAH GENERASI (VARIASI)</label>
               <div className="flex bg-gray-500/10 rounded-lg p-1 gap-1">
                  {[1, 2, 3, 4].map(num => (
                    <button 
                      key={num}
                      onClick={() => setGenerationCount(num)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-all ${
                        generationCount === num 
                          ? (isSun ? 'bg-white text-orange-600 shadow' : 'bg-indigo-600 text-white shadow') 
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
               </div>
            </div>

            <button
              onClick={onGenerate}
              disabled={!topic || isGenerating || !hasReferenceImage}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                isSun
                  ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-orange-200'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-900'
              }`}
            >
              {isGenerating ? `Crafting ${generationCount} Variations...` : "Generate Content ✨"}
            </button>
          </div>
          {!hasReferenceImage && <p className="text-xs text-center text-red-400">Wajib upload wajah Cila dulu untuk generate.</p>}
        </div>
      </div>
    </div>
  );
};