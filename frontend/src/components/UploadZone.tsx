"use client";

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card, Button, cn } from './ui';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragOver(true);
        } else if (e.type === "dragleave") {
            setIsDragOver(false);
        }
    }, []);

    const validateAndSetFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith('image/')) {
            setError("Please upload an image file (JPG, PNG)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be under 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onFileSelect(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setPreview(null);
        setError(null);
    };

    if (preview) {
        return (
            <Card className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden shadow-lg mb-6 group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        onClick={clearFile}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <X size={16} />
                    </button>
                </div>
                <p className="text-slate-500 font-medium mb-2">Photo ready for magic!</p>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "border-2 border-dashed transition-all duration-200 min-h-[300px] flex flex-col items-center justify-center cursor-pointer group",
            isDragOver ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50",
            error ? "border-red-400 bg-red-50/50" : ""
        )}>
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="image-upload"
            />
            <label htmlFor="image-upload" className="flex flex-col items-center w-full h-full p-8 cursor-pointer">
                <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors",
                    isDragOver ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                )}>
                    <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2 text-center">
                    {isDragOver ? "Drop it here!" : "Upload your photo"}
                </h3>
                <p className="text-slate-500 text-center max-w-xs mb-6">
                    Drag & drop a clear photo of the child, or click to browse.
                </p>
                {error && (
                    <p className="text-red-500 text-sm font-medium bg-red-100 px-3 py-1 rounded-full animate-bounce">
                        {error}
                    </p>
                )}
            </label>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload')?.click()}
                className="absolute inset-0 w-full h-full z-10"
            />
        </Card>
    );
}
