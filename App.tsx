import React, { useState, useEffect } from 'react';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage } from './types';
import ImageViewer from './components/ImageViewer';
import ApiKeySettings from './components/ApiKeySettings';
import { Sparkles, Image as ImageIcon, Search, Loader2, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedImage || showSettings) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, showSettings]);

  const handleGenerate = async (searchPrompt: string = prompt) => {
    if (!searchPrompt.trim()) return;
    
    setLoading(true);
    setError(null);
    // If regenerating from viewer, we don't clear images immediately to keep context behind modal
    // but if new search, we clear.
    if (!selectedImage) {
      setImages([]);
    }

    try {
      const newImages = await generateWallpapers(searchPrompt);
      setImages(newImages);
      // Close viewer if it was open (since we have new set)
      if (selectedImage) {
        setSelectedImage(null);
      }
    } catch (err: any) {
      setError(err.message || "이미지를 생성하는 도중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${image.base64}`;
    link.download = `wallpaper-${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const samplePrompts = [
    "서정적인 도시의 밤거리",
    "파스텔톤 구름 위 성",
    "사이버펑크 서울",
    "비 오는 날의 숲속",
    "미니멀리즘 기하학 패턴"
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            AI 배경화면
          </h1>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="설정"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-4 max-w-md mx-auto w-full">
        
        {/* Empty State */}
        {!loading && images.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center mt-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-32 h-32 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800">
              <ImageIcon size={48} className="text-neutral-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">나만의 배경화면 만들기</h2>
              <p className="text-neutral-400 text-sm">
                원하는 분위기나 키워드를 입력하면<br/>
                AI가 4가지 버전의 배경화면을 만들어드립니다.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {samplePrompts.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPrompt(s);
                    handleGenerate(s);
                  }}
                  className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <Loader2 size={40} className="text-indigo-500 animate-spin" />
            <p className="text-neutral-400 text-sm animate-pulse">
              환상적인 배경화면을 그리고 있습니다...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm my-8 break-keep">
            {error}
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          {images.map((image) => (
            <div 
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/5 active:scale-[0.98] transition-all duration-200"
            >
              <img 
                src={`data:image/jpeg;base64,${image.base64}`} 
                alt="AI Generated Wallpaper" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </main>

      {/* Input Area (Bottom Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-950/80 backdrop-blur-xl border-t border-white/5 z-40">
        <div className="max-w-md mx-auto w-full relative">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 몽환적인 우주 풍경"
              className="w-full h-12 pl-4 pr-12 rounded-full bg-neutral-900 border border-neutral-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-neutral-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 p-2 rounded-full bg-indigo-600 text-white disabled:bg-neutral-800 disabled:text-neutral-600 transition-colors hover:bg-indigo-500"
            >
              {loading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18} />}
            </button>
          </form>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ApiKeySettings onClose={() => setShowSettings(false)} />
      )}

      {/* Full Screen Viewer */}
      <ImageViewer 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)}
        onDownload={handleDownload}
        onRegenerate={() => handleGenerate(selectedImage?.prompt || prompt)}
        isRegenerating={loading}
      />
    </div>
  );
};

export default App;