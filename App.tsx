import React, { useState, useCallback, useEffect } from 'react';
import { Leaf, Loader2, Sparkles, AlertCircle, Scan, Camera, Brain, Search } from 'lucide-react';
import { PlantAnalysisResult } from './types';
import { analyzePlantImage } from './services/geminiService';
import PlantDetails from './components/PlantDetails';
import { ImageUploader } from './components/ImageUploader';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingStages = [
    { text: "Scanning botanical structure...", icon: Scan },
    { text: "Analyzing plant features...", icon: Brain },
    { text: "Identifying species...", icon: Search },
    { text: "Compiling Ayurvedic data...", icon: Sparkles },
  ];

  // Handle Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Cycle through loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingStages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleImageSelect = useCallback(async (base64Image: string) => {
    setSelectedImage(base64Image);
    setResult(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const analysisData = await analyzePlantImage(base64Image);
      setResult(analysisData);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetApp = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 selection:bg-ayur-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center md:justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={resetApp}>
            <div className="bg-ayur-100 p-1.5 rounded-lg">
               <Leaf className="h-6 w-6 text-ayur-700" />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-ayur-900">
              VedaVision <span className="text-ayur-600 font-sans text-xs uppercase tracking-widest ml-1">AI</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
        {!selectedImage && (
          <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 flex flex-col justify-center min-h-[60vh]">
            
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-ayur-900">
                Namaste.
              </h2>
              <p className="text-stone-500 text-lg">
                Identify medicinal plants, millets, and pulses instantly with AI.
              </p>
            </div>
            
            <div className="bg-white p-2 rounded-3xl shadow-xl shadow-stone-200/50 border border-white">
              <div className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
                 <ImageUploader onImageSelect={handleImageSelect} />
              </div>
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Image & Status */}
              <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-24 space-y-6">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-[6px] border-white aspect-[3/4] lg:aspect-auto lg:h-[500px] bg-stone-100 group">
                      <img 
                        src={selectedImage} 
                        alt="Uploaded plant" 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Scanning Animation Overlay */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl bg-stone-900/10">
                          {/* Blur Backdrop */}
                          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-500"></div>
                          
                          {/* Grid Pattern */}
                          <div className="absolute inset-0 opacity-20" 
                               style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px'}}>
                          </div>
                          
                          {/* Laser Scan Line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-ayur-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-scan z-0"></div>
                          
                          {/* Center Card */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                            <div className="bg-black/70 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-in zoom-in duration-300 flex flex-col items-center max-w-xs w-full">
                              
                              {/* Icon Circle */}
                              <div className="relative mb-5">
                                <div className="absolute inset-0 bg-ayur-500/30 blur-xl rounded-full animate-pulse"></div>
                                <div className="relative bg-stone-900 p-4 rounded-full border border-white/10 shadow-inner">
                                   {React.createElement(loadingStages[loadingStep].icon, { 
                                       className: "w-8 h-8 text-ayur-400 animate-pulse transition-all duration-300" 
                                   })}
                                </div>
                                {/* Spinner Ring */}
                                <div className="absolute inset-0 -m-1.5 border-2 border-t-ayur-500 border-r-transparent border-b-ayur-500/30 border-l-transparent rounded-full animate-spin-slow"></div>
                              </div>
                
                              {/* Text */}
                              <h3 className="text-white font-medium text-lg mb-1 tracking-wide transition-all duration-300 min-h-[1.75rem]">
                                {loadingStages[loadingStep].text}
                              </h3>
                              <p className="text-stone-400 text-xs uppercase tracking-widest mb-4">Processing</p>
                              
                              {/* Progress Indicators */}
                              <div className="flex gap-2">
                                {loadingStages.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                            idx === loadingStep ? 'w-8 bg-ayur-500' : 
                                            idx < loadingStep ? 'w-1.5 bg-ayur-500/50' : 'w-1.5 bg-stone-700'
                                        }`}
                                    />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-8">
                {error && (
                   <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start space-x-4 shadow-sm animate-in slide-in-from-bottom-2">
                     <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                     <div>
                       <h3 className="text-lg font-bold text-red-900">Analysis Error</h3>
                       <p className="text-red-700 mt-1 mb-4">{error}</p>
                       <button 
                        onClick={resetApp}
                        className="px-5 py-2 bg-white text-red-700 border border-red-200 rounded-lg hover:bg-red-50 font-semibold text-sm transition-colors shadow-sm"
                       >
                         Try Again
                       </button>
                     </div>
                   </div>
                )}

                {!isAnalyzing && result && (
                  <PlantDetails data={result} />
                )}

                {isAnalyzing && (
                  <div className="space-y-8 animate-pulse">
                    {/* Header Skeleton */}
                    <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-3 w-2/3">
                          <div className="h-10 bg-stone-200 rounded-lg w-3/4"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-stone-100 rounded-full w-24"></div>
                            <div className="h-6 bg-stone-100 rounded-full w-32"></div>
                          </div>
                        </div>
                        <div className="h-10 bg-stone-100 rounded-full w-40"></div>
                      </div>
                      <div className="h-20 bg-stone-50 rounded-xl w-full mb-8"></div>
                      <div className="grid grid-cols-4 gap-4">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="h-20 bg-stone-100 rounded-2xl"></div>
                         ))}
                      </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-80 bg-stone-200 rounded-3xl opacity-70"></div>
                        <div className="h-80 bg-stone-200 rounded-3xl opacity-70"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Floating Action Button for New Scan */}
            {!isAnalyzing && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 z-50 animate-in slide-in-from-bottom-4">
                <button
                  onClick={resetApp}
                  className="flex items-center gap-2 bg-ayur-900 text-white px-6 py-3.5 rounded-full shadow-xl shadow-ayur-900/30 hover:scale-105 hover:bg-black transition-all duration-300 font-medium"
                >
                  <Scan className="w-5 h-5" />
                  <span>Scan New Plant</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-ayur-50 to-stone-100 animate-out fade-out duration-700 fill-mode-forwards" style={{animationDelay: '2000ms'}}>
      <div className="relative">
        <div className="absolute inset-0 bg-ayur-200 blur-3xl opacity-50 rounded-full animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-ayur-100 mb-6 animate-in zoom-in duration-700">
           <Leaf className="w-16 h-16 text-ayur-600" />
        </div>
      </div>
      <h1 className="text-3xl font-serif font-bold text-ayur-900 mb-2 animate-in slide-in-from-bottom-4 duration-700 delay-150">VedaVision</h1>
      <p className="text-stone-500 tracking-widest text-xs uppercase animate-in slide-in-from-bottom-4 duration-700 delay-300">Powered by AI</p>
    </div>
  );
}