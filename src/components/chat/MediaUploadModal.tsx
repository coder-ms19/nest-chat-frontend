import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface MediaItem {
    id: string;
    file: File;
    previewUrl: string;
    type: 'IMAGE' | 'VIDEO' | 'FILE';
    progress: number;
    uploadData?: any;
}

interface MediaUploadModalProps {
    isOpen: boolean;
    items: MediaItem[];
    onClose: () => void;
    onSend: () => void;
    onRemove: (id: string) => void;
    onAddMore: () => void;
    caption: string;
    onCaptionChange: (val: string) => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
    isOpen,
    items,
    onClose,
    onSend,
    onRemove,
    onAddMore,
    caption,
    onCaptionChange
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!isOpen || items.length === 0) return null;

    const currentItem = items[activeIndex] || items[0];
    const isUploading = items.some(item => item.progress < 100 && item.progress >= 0);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-[#0b141a] flex flex-col md:inset-4 md:rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 text-white z-10">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{activeIndex + 1} / {items.length}</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Main Preview */}
                <div className="flex-1 relative flex items-center justify-center bg-black/20 overflow-hidden px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full flex items-center justify-center p-4 md:p-12"
                        >
                            {currentItem.type === 'IMAGE' ? (
                                <img
                                    src={currentItem.previewUrl}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    alt="preview"
                                />
                            ) : currentItem.type === 'VIDEO' ? (
                                <video
                                    src={currentItem.previewUrl}
                                    controls
                                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                                />
                            ) : (
                                <div className="bg-white/5 p-12 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
                                    <Plus size={48} className="text-blue-400 rotate-45" />
                                    <p className="text-white text-lg">File: {currentItem.file.name}</p>
                                </div>
                            )}

                            {/* Upload Progress Overlay */}
                            {currentItem.progress < 100 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                        <span className="text-white font-bold">{currentItem.progress}%</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {items.length > 1 && (
                        <>
                            <button
                                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                                className="absolute left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setActiveIndex(prev => Math.min(items.length - 1, prev + 1))}
                                className="absolute right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom Bar: Thumbnails & Controls */}
                <div className="bg-[#111b21] p-4 flex flex-col gap-4">
                    {/* Caption Input */}
                    <div className="bg-[#2a3942] rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3 shadow-inner">
                        <input
                            type="text"
                            placeholder="Add a caption..."
                            className="bg-transparent border-none outline-none text-white w-full text-sm"
                            value={caption}
                            onChange={(e) => onCaptionChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 h-16">
                        {/* Thumbnails */}
                        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1">
                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${activeIndex === idx ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-transparent opacity-60'
                                        }`}
                                >
                                    <img src={item.previewUrl} className="w-full h-full object-cover" alt="thumb" />
                                    {item.progress < 100 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="w-1 h-full bg-blue-500" style={{ height: `${item.progress}%` }} />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemove(item.id); if (activeIndex >= items.length - 1) setActiveIndex(Math.max(0, items.length - 2)); }}
                                        className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={onAddMore}
                                className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={onSend}
                            disabled={isUploading}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${isUploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-[#00a884] hover:bg-[#06cf9c] active:scale-95'
                                }`}
                        >
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                                <Send className="w-6 h-6 text-white ml-1" />
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
