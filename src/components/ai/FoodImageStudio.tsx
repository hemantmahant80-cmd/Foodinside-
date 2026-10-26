import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Download,
  RotateCcw,
  Upload,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Video,
  Flame,
  Maximize2
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { AdminModuleTab } from '../../types';

interface FoodImageStudioProps {
  onSendToVideoStudio?: (imageUrl: string) => void;
}

const SAMPLE_PRESET_IMAGES = [
  {
    name: 'Gourmet Truffle Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    editPrompt: 'Add crispy fried onion rings, glowing melted gouda cheese drizzle, and fresh microgreens on a rustic dark slate plate.',
  },
  {
    name: 'Sizzling Wood-Fired Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    editPrompt: 'Add spicy pepperoni slices, burrata cheese in the center, and fresh basil leaves with drizzle of hot honey.',
  },
  {
    name: 'Golden Crisp Loaded Fries',
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
    editPrompt: 'Top with sizzling smoky bacon bits, diced jalapeños, melted sharp cheddar sauce, and chives.',
  },
];

export const FoodImageStudio: React.FC<FoodImageStudioProps> = ({ onSendToVideoStudio }) => {
  const { setActiveTab } = useAdminData();
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState<string>(
    'A mouth-watering gourmet double smashed wagyu cheeseburger with caramelized onions, melted American cheese, crisp pickles, served on a toasted sesame brioche bun with dramatic dark studio lighting and steam rising.'
  );
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit mode source image
  const [editSourceImage, setEditSourceImage] = useState<string>(SAMPLE_PRESET_IMAGES[0].url);
  const [customEditBase64, setCustomEditBase64] = useState<string | null>(null);

  // Handle local image upload for editing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomEditBase64(result);
      setEditSourceImage(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

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

  const handleGenerateOrEdit = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      let base64ToSend: string | undefined = undefined;

      if (mode === 'edit') {
        base64ToSend = customEditBase64 || (await urlToBase64(editSourceImage));
      }

      const res = await fetch('/api/image-generate-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageBase64: base64ToSend,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image with gemini-nano-banana-2.1');
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGeneratedCaption(data.caption || null);
      } else {
        throw new Error('No image was returned from the model.');
      }
    } catch (err: any) {
      console.error('Image Studio Error:', err);
      setError(
        err.message ||
          'Failed to process image. Note that gemini-nano-banana-2.1 requires an enabled key in AI Studio.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimateInVideoStudio = () => {
    if (onSendToVideoStudio && generatedImageUrl) {
      onSendToVideoStudio(generatedImageUrl);
    } else {
      setActiveTab('video_studio' as AdminModuleTab);
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
                gemini-nano-banana-2.1 • 1K/2K High Res
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
                Feature 6: Create & Edit Images
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-orange-500" />
              FoodInside Culinary Image Studio
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl">
              Create hyper-detailed food photography or modify dishes with text prompts using Gemini Nano Banana 2.1. Perfect for digital menus, social marketing, and promotional offers.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/90 border border-slate-700/80">
            <button
              onClick={() => {
                setMode('create');
                setPrompt(
                  'A mouth-watering gourmet double smashed wagyu cheeseburger with caramelized onions, melted American cheese, crisp pickles, served on a toasted sesame brioche bun with dramatic dark studio lighting and steam rising.'
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'create'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Text-to-Image</span>
            </button>
            <button
              onClick={() => {
                setMode('edit');
                setPrompt(SAMPLE_PRESET_IMAGES[0].editPrompt);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'edit'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Image Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Options (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* If edit mode: Choose source image */}
          {mode === 'edit' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-orange-600" />
                    Source Dish Photo to Modify
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select a dish to edit or upload your custom menu photo
                  </p>
                </div>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_PRESET_IMAGES.map((sample, idx) => {
                  const isSelected = editSourceImage === sample.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditSourceImage(sample.url);
                        setCustomEditBase64(null);
                        setPrompt(sample.editPrompt);
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

              {customEditBase64 && (
                <div className="flex items-center gap-3 p-2.5 bg-orange-50/60 rounded-xl border border-orange-200">
                  <img
                    src={customEditBase64}
                    alt="Custom Dish"
                    className="w-14 h-14 object-cover rounded-lg border border-orange-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900">Custom Uploaded Photo</p>
                    <p className="text-[11px] text-slate-500">Ready for editing instructions</p>
                  </div>
                  <button
                    onClick={() => {
                      setCustomEditBase64(null);
                      setEditSourceImage(SAMPLE_PRESET_IMAGES[0].url);
                      setPrompt(SAMPLE_PRESET_IMAGES[0].editPrompt);
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              {mode === 'create' ? 'Prompt (Text-to-Image)' : 'Edit Instructions (Image Editing)'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {mode === 'create'
                  ? 'Describe the recipe, garnish, plating and atmosphere:'
                  : 'Describe changes, additions, garnishes or background alterations:'}
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  mode === 'create'
                    ? 'E.g., Sizzling platter of Paneer Tikka with bell peppers, green mint chutney, smoking charcoal...'
                    : 'E.g., Add melted mozzarella cheese, extra basil, and place on a rustic wooden board...'
                }
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Prompt presets */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Popular Culinary Styles:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Michelin-star modern fine-dining plating',
                  'Dark moody rustic wooden tabletop with warm candlelight',
                  'Vibrant street food stall with fresh cilantro and lime',
                  'Crispy golden fried texture with dipping sauces',
                  'Fresh healthy power bowl with colorful avocado & quinoa',
                ].map((style, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (mode === 'create') {
                        setPrompt(
                          `A gourmet meal prepared in style: ${style}. Hyper-realistic, professional food photography, 8k resolution, appetizing presentation.`
                        );
                      } else {
                        setPrompt(prev => `${prev} Plated in style: ${style}.`);
                      }
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                  >
                    + {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Quality Configuration */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">Aspect Ratio</p>
                  <p className="text-[11px] text-slate-500">Configured in Gemini imageConfig</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['1:1', '16:9', '4:3', '9:16'] as const).map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Resolution Size</p>
                  <p className="text-[11px] text-slate-500">Nano Banana 2.1 HD resolution</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setImageSize('1K')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      imageSize === '1K'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    1K Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSize('2K')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      imageSize === '2K'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    2K Ultra
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Image Studio Notice</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Action Submit */}
            <button
              onClick={handleGenerateOrEdit}
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
                  <span>Synthesizing with gemini-nano-banana-2.1...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Generate Food Photography' : 'Apply Dish Edits'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output High-Res Display (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  Generated Image Preview
                </h3>
                <p className="text-xs text-slate-500">gemini-nano-banana-2.1 output</p>
              </div>

              {generatedImageUrl && (
                <div className="flex items-center gap-1.5">
                  <a
                    href={generatedImageUrl}
                    download={`foodinside-image-${Date.now()}.png`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Download Image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Image Canvas */}
            <div className="my-auto py-4">
              {generatedImageUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
                    <img
                      src={generatedImageUrl}
                      alt="Gemini Nano Banana Generated Food"
                      className="w-full h-auto object-cover max-h-[380px] mx-auto"
                    />

                    {/* Overlay Action to Animate into Video */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <button
                        onClick={handleAnimateInVideoStudio}
                        className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Animate this into Video (Gemini Omni Flash)</span>
                      </button>
                    </div>
                  </div>

                  {generatedCaption && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 italic">
                      &quot;{generatedCaption}&quot;
                    </p>
                  )}

                  {/* Send to Video Studio Action Button */}
                  <button
                    onClick={handleAnimateInVideoStudio}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-orange-400" />
                    <span>Send to Video Studio for Animation →</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Studio Canvas Ready</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Configure your prompt on the left and click &quot;Generate Food Photography&quot; to render with Gemini Nano Banana 2.1.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Model & Specs Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                gemini-nano-banana-2.1
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                {aspectRatio} • {imageSize}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
