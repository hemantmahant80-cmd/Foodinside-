import React, { useState } from 'react';
import {
  Video,
  Film,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

const SAMPLE_FOOD_IMAGES = [
  {
    name: 'Truffle Bacon Cheeseburger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    prompt: 'Cinematic slow-motion shot: hot steam gently rising from the toasted brioche bun, melted aged cheddar slowly stretching down the chargrilled patty, appetizing studio food lighting.',
  },
  {
    name: 'Artisan Wood-Fired Margherita Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    prompt: 'Camera pushes in close: bubbly mozzarella cheese bubbling with golden brown spots, fresh basil leaves gently vibrating, smoke rising from the wood-fired crust.',
  },
  {
    name: 'Royal Hyderabadi Dum Biryani',
    url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    prompt: 'Aromatic steam rising from tender spiced basmati rice and succulent saffron marinated pieces, fresh coriander and crispy fried onions fluttering in gentle breeze.',
  },
  {
    name: 'Peri-Peri Crispy Loaded Fries',
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
    prompt: 'Golden crispy fries sizzling, warm creamy cheese sauce flowing smoothly over the top, sprinkled spicy peri-peri dust drifting in dramatic lighting.',
  },
];

export const FoodVideoStudio: React.FC = () => {
  const { menuItems } = useAdminData();
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_FOOD_IMAGES[0].url);
  const [customBase64, setCustomBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(SAMPLE_FOOD_IMAGES[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomBase64(result);
      setSelectedImage(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Convert image URL to base64 for API call
  const urlToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:image')) {
      return url;
    }
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerateVideo = async () => {
    setError(null);
    setIsGenerating(true);
    setProgressStep('Preparing image frame & motion keypoints...');

    try {
      setProgressStep('Encoding high-resolution dish textures...');
      const imageBase64 = customBase64 || (await urlToBase64(selectedImage));

      setProgressStep('Calling gemini-omni-1.1-flash via Interactions API...');
      const res = await fetch('/api/animate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          prompt,
          aspectRatio,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to animate video with Gemini Omni Flash.');
      }

      if (data.videoData) {
        setGeneratedVideoUrl(data.videoData);
        setProgressStep('Video generated successfully!');
      } else {
        throw new Error('No video data received from the server.');
      }
    } catch (err: any) {
      console.error('Video animation error:', err);
      setError(
        err.message ||
          'Failed to render video. Note that gemini-omni-1.1-flash requires video generation support on your API key.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-bold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Interactions API • gemini-omni-1.1-flash
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-semibold">
                Feature 4: Animate Images into Video
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-orange-500" />
              FoodInside Cinematic Video Studio
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl">
              Turn static food photos into mouth-watering, hyper-realistic motion videos for marketing, social reels, and digital menu screens with Google Gemini Omni Flash.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Aspect Ratio</p>
              <p className="text-xs font-bold text-orange-400">{aspectRatio === '16:9' ? '16:9 Widescreen' : '9:16 Shorts/Reels'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Photo & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Pick or Upload Image */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-orange-600" />
                  1. Choose Source Food Dish Photo
                </h3>
                <p className="text-xs text-slate-500">
                  Select a flagship recipe or upload your own high-res kitchen photo
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preset Samples */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_FOOD_IMAGES.map((sample, idx) => {
                const isSelected = selectedImage === sample.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(sample.url);
                      setCustomBase64(null);
                      setPrompt(sample.prompt);
                    }}
                    className={`group relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-orange-600 ring-2 ring-orange-500/30 scale-[1.02]'
                        : 'border-slate-200 hover:border-orange-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-white line-clamp-1">
                        {sample.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom upload preview if any */}
            {customBase64 && (
              <div className="flex items-center gap-3 p-2.5 bg-orange-50/60 rounded-xl border border-orange-200">
                <img
                  src={customBase64}
                  alt="Custom Dish"
                  className="w-14 h-14 object-cover rounded-lg border border-orange-300 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Custom Uploaded Dish</p>
                  <p className="text-[11px] text-slate-500">Ready to animate with Gemini Omni Flash</p>
                </div>
                <button
                  onClick={() => {
                    setCustomBase64(null);
                    setSelectedImage(SAMPLE_FOOD_IMAGES[0].url);
                    setPrompt(SAMPLE_FOOD_IMAGES[0].prompt);
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* 2. Motion Prompt & Format */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-orange-600" />
              2. Animation Dynamics & Camera Motion Prompt
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cinematic Motion Instructions:
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe how the dish should move (e.g., rising steam, bubbling cheese, sauce pouring, slow tracking camera push)..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Quick Prompt Ideas */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quick Culinary Motion Ideas:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Appetizing hot steam rising + slow zoom-in',
                  'Sizzling sauce bubbling with herbs fluttering',
                  'Melted cheese pull in golden lighting',
                  'Cinematic 360 food turntable spin',
                ].map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Output Video Format</p>
                <p className="text-[11px] text-slate-500">Interactions API supported dimensions</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  16:9 Widescreen
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  9:16 Shorts / Reels
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Video Generation Notice</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isGenerating
                  ? 'bg-orange-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/25 active:scale-98'
              }`}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>{progressStep || 'Rendering with Gemini Omni Flash...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Cinematic Dish Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Video Player & Frame Inspection (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Play className="w-4 h-4 text-orange-600" />
                  Generated Video Player
                </h3>
                <p className="text-xs text-slate-500">Live rendered high-definition video</p>
              </div>

              {generatedVideoUrl && (
                <a
                  href={generatedVideoUrl}
                  download={`foodinside-animation-${Date.now()}.mp4`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save MP4</span>
                </a>
              )}
            </div>

            {/* Video or Preview Area */}
            <div className="my-auto py-4">
              {generatedVideoUrl ? (
                <div
                  className={`relative rounded-xl overflow-hidden bg-black mx-auto shadow-2xl border border-slate-900 ${
                    aspectRatio === '9:16' ? 'max-w-[280px] aspect-9/16' : 'w-full aspect-video'
                  }`}
                >
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`relative rounded-xl overflow-hidden bg-slate-950 mx-auto flex flex-col items-center justify-center p-6 text-center border border-slate-800 ${
                    aspectRatio === '9:16' ? 'max-w-[280px] aspect-9/16' : 'w-full aspect-video'
                  }`}
                >
                  {/* Background reference image preview with blur */}
                  <img
                    src={selectedImage}
                    alt="Current Selected Dish"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
                  />
                  <div className="relative z-10 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600/90 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-600/30">
                      <Film className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">Video Ready to Render</p>
                    <p className="text-xs text-slate-300 max-w-xs">
                      Click &quot;Generate Cinematic Dish Video&quot; to animate this dish into video using Gemini Omni Flash.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Specs Footnote */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Interactions API (`output_video`)
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                {aspectRatio === '16:9' ? '1920x1080 • MP4' : '1080x1920 • MP4'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
