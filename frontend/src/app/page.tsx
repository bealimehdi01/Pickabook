"use client";

import { useState } from 'react';
import axios from 'axios';
import { UploadZone } from '@/components/UploadZone';
import { ResultStage } from '@/components/ResultStage';
import { TemplateSelector } from '@/components/TemplateSelector';
import { Button, Card } from '@/components/ui';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'landing' | 'upload' | 'generating' | 'result'>('landing');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setResultImages([]);
    setStep('upload');
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    // Move to next step or trigger generation? 
    // Wait, we need to allow template selection too.
    // Changing flow: Select File -> Set State -> Show "Generate" Button?
    // Or just start generation immediately?
    // The previous flow was "Upload Child Photo" -> Immediately Starts.
    // To support template, we should probably just store it and trigger start manually?
    // OR: We can just let the user change the template BEFORE uploading the main photo.
    // Let's modify the flow slightly: 
    // The UploadZone now just sets the file, and we trigger generation.
    // But since UploadZone triggers onDrop immediately, maybe we should put Template Selector ABOVE/BEFORE it?
    // Yes.
    startGeneration(file);
  };

  const startGeneration = async (childFile: File) => {
    setStep('generating');
    setError(null);
    setResultImages([]);

    const formData = new FormData();
    formData.append('child_photo', childFile);
    if (templateFile) {
      formData.append('template_image', templateFile);
    }

    // Generate 3 variants
    const generateVariant = async () => {
      // Use environment variable or default to localhost
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiBase}/api/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.image_url;
    };

    try {
      // Launch 3 requests
      const promises = [
        generateVariant(),
        generateVariant(),
        generateVariant()
      ];

      const results = await Promise.all(promises);

      setResultImages(results.filter(Boolean));
      setStep('result');

    } catch (err: any) {
      console.error("API call failed. Used URL:", process.env.NEXT_PUBLIC_API_URL || "Default: http://localhost:8000");
      console.error(err);

      let msg = "Magic spell backfired slightly. Please try again.";
      if (!err.response) {
        // Network error (CORS or unreachable)
        msg = "Reference Error: Cannot reach the Backend! \n1. Did you set 'NEXT_PUBLIC_API_URL' in Vercel? \n2. Is the Hugging Face Space 'Running'?";
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;

        // Custom handling for Quota Error
        if (typeof msg === 'string' && msg.includes("ZeroGPU quotas")) {
          msg = "⏳ Magical Recharging Needed! \n\nWe've used up our free magic for the day (ZeroGPU Usage Limit). \nPlease try again in an hour, or check back tomorrow!";
        }
      }

      setError(msg);
      setStep('upload');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center text-center">

        {/* Header / Logo Area */}
        <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-md rounded-2xl mb-6 shadow-sm border border-white/50">
            <span className="text-2xl mr-2">📚</span>
            <span className="font-bold text-slate-800 tracking-tight">Pickabook</span>
          </div>

          {step === 'landing' && (
            <>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 leading-tight">
                Star in your own <br /> magical story.
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Upload a photo and instantly transform into a beautifully illustrated character in our immersive storybooks.
              </p>
              <Button onClick={handleStart} className="text-lg px-8 py-4 h-auto rounded-2xl shadow-xl shadow-indigo-300 hover:shadow-2xl hover:shadow-indigo-400 hover:-translate-y-1 transition-all">
                <Sparkles className="mr-2" /> Create My Character
              </Button>
            </>
          )}
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full transition-all duration-500">

          {step === 'upload' && (
            <div className="animate-in fade-in zoom-in duration-500">

              {/* Template Selector */}
              <TemplateSelector selectedFile={templateFile} onSelect={setTemplateFile} />

              <h3 className="text-lg font-semibold text-slate-700 mb-2">3. Upload Child's Photo (Starts Generation)</h3>
              <UploadZone onFileSelect={handleFileSelect} />

              {error && (
                <div className="mt-8 p-6 bg-red-50 text-red-900 rounded-2xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-bottom duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-lg mb-1">Magical Mishap!</h4>
                      <p className="opacity-90 leading-relaxed">{error}</p>

                      {/* Specific help for Quota issues */}
                      {error.includes("ZeroGPU") && (
                        <div className="mt-4 p-3 bg-white/60 rounded-lg text-sm border border-red-200">
                          <strong>Tip:</strong> The free magic wand needs a recharge (Quota Limit).
                          Try again later (usually resets hourly) or switching to Mock Mode.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <Button variant="ghost" className="mt-6" onClick={() => setStep('landing')}>
                Cancel
              </Button>
            </div>
          )}

          {step === 'generating' && (
            <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
                  <Sparkles className="text-amber-400 animate-spin-slow" size={32} />
                  Weaving Magic...
                </h3>
                <p className="text-slate-500 text-lg mb-6">Creating 3 unique variants for you</p>

                {/* Progress Bar */}
                <div className="w-full max-w-sm mx-auto h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 animate-progress-indeterminate rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <Card className="aspect-[3/4] bg-white/40 border-white/50 p-0 overflow-hidden relative shadow-lg">
                      <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-medium gap-2">
                        <Sparkles className="text-slate-300 animate-pulse" size={24} />
                        <span>Generating Variant {i}...</span>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'result' && resultImages.length > 0 && (
            <ResultStage
              imageUrls={resultImages}
              onRegenerate={handleStart}
              onDownload={async (urls) => {
                for (let i = 0; i < urls.length; i++) {
                  const url = urls[i];
                  try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `pickabook-character-${i + 1}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                  } catch (e) {
                    console.error("Download failed:", e);
                    // Fallback
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `pickabook-character-${i + 1}.png`;
                    link.target = "_blank";
                    link.click();
                  }
                }
              }}
            />
          )}

        </div>
      </div>
    </main>
  );
}
