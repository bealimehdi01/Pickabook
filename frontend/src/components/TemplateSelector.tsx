"use client";

import { useState, useRef } from 'react';
import { Card, Button } from './ui';
import { ImageIcon } from 'lucide-react';

interface TemplateSelectorProps {
    selectedFile: File | null;
    onSelect: (file: File | null) => void;
}

export function TemplateSelector({ selectedFile, onSelect }: TemplateSelectorProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onSelect(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const clear = () => {
        onSelect(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">2. Choose Story Template (Optional)</h3>
            <div className="flex gap-4">
                <Card className="flex-1 p-4 flex flex-col items-center justify-center border-2 border-indigo-100 bg-white/50 cursor-pointer hover:border-indigo-300 transition-all relative overflow-hidden group h-32"
                >
                    <div className="text-center" onClick={() => inputRef.current?.click()}>
                        {preview ? (
                            <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <ImageIcon size={24} className="mb-1" />
                                <span className="text-sm">Default Story</span>
                            </div>
                        )}

                        {/* Overlay text if custom selected */}
                        {preview && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs py-1">
                                Custom Selected
                            </div>
                        )}
                    </div>

                    {/* Default indicator if not custom */}
                    {!preview && (
                        <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            DEFAULT
                        </div>
                    )}

                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFile}
                    />
                </Card>

                {preview && (
                    <Button variant="ghost" onClick={clear} className="h-full self-center">
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
