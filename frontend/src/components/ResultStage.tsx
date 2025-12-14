"use client";

import { Download, RefreshCw, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { Card, Button, cn } from './ui';
import { useState } from 'react';

interface ResultStageProps {
    imageUrls: string[];
    onRegenerate: () => void;
    onDownload: (urls: string[]) => void;
}

export function ResultStage({ imageUrls, onRegenerate, onDownload }: ResultStageProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set(imageUrls));

    const toggleSelection = (url: string) => {
        const next = new Set(selected);
        if (next.has(url)) next.delete(url);
        else next.add(url);
        setSelected(next);
    };

    const downloadSelected = () => {
        onDownload(Array.from(selected));
    };

    return (
        <div className="w-full max-w-6xl mx-auto animate-in slide-in-from-bottom duration-700">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-4 flex items-center justify-center gap-3">
                    <Sparkles className="text-amber-400" size={32} />
                    Your Magic Collection
                </h2>
                <p className="text-slate-600 text-lg">Select your favorites or download them all!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {imageUrls.map((url, idx) => (
                    <div key={idx} className="group relative transition-all hover:-translate-y-2 duration-300">
                        <Card className={cn(
                            "overflow-hidden cursor-pointer border-4 transition-colors p-0",
                            selected.has(url) ? "border-indigo-500 shadow-indigo-200 shadow-xl" : "border-transparent hover:border-slate-200"
                        )}
                        // We attach onClick to the card container
                        >
                            <div
                                className="aspect-[3/4] relative bg-slate-100"
                                onClick={() => toggleSelection(url)}
                            >
                                <img src={url} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />

                                {/* Selection Indicator */}
                                <div className="absolute top-4 right-4 z-10">
                                    {selected.has(url) ? (
                                        <div className="bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                                            <CheckCircle2 size={24} fill="white" className="text-indigo-600" />
                                        </div>
                                    ) : (
                                        <div className="bg-black/30 text-white rounded-full p-1 backdrop-blur-sm border-2 border-white/50">
                                            <Circle size={24} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <Card className="sticky bottom-6 bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto rounded-2xl">
                <div className="text-slate-600 font-medium">
                    {selected.size} magical {selected.size === 1 ? 'image' : 'images'} selected
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="secondary" onClick={onRegenerate} className="flex-1 md:flex-none">
                        <RefreshCw className="mr-2 h-4 w-4" /> Generate More
                    </Button>
                    <Button
                        onClick={downloadSelected}
                        disabled={selected.size === 0}
                        className="bg-indigo-600 text-white px-8 flex-1 md:flex-none shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download Selected
                    </Button>
                </div>
            </Card>
        </div>
    );
}
