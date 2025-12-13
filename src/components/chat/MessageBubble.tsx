import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';

import api from '../../api';

interface MessageBubbleProps {
    message: any;
    isMe: boolean;
    isGroup: boolean;
    onUpdate: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, isGroup, onUpdate }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.post(`/conversations/messages/${message.id}/delete`, { userId: message.senderId });
            setShowDeleteModal(false);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Failed to delete message');
        }
    };

    const handleEdit = async () => {
        if (editText.trim() === message.text) {
            setIsEditing(false);
            return;
        }
        setLoading(true);
        try {
            await api.post(`/conversations/messages/${message.id}/edit`, {
                userId: message.senderId,
                text: editText
            });
            setIsEditing(false);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Failed to edit message');
        } finally {
            setLoading(false);
        }
    };

    const senderName = message.sender?.username || 'Unknown';
    const senderInitial = senderName[0]?.toUpperCase() || 'U';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group mb-2 md:mb-3`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`flex gap-1.5 md:gap-2 max-w-[85%] md:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for other users in group */}
                    {!isMe && isGroup && (
                        <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white/10">
                            {senderInitial}
                        </div>
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Sender Name in Group */}
                        {!isMe && isGroup && (
                            <span className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-0.5 md:mb-1 ml-1 tracking-wide">
                                {senderName}
                            </span>
                        )}

                        <div className="relative">
                            {/* Message Bubble */}
                            <div
                                className={`
                                    px-3 py-2 md:px-4 md:py-3 shadow-xl relative transition-all duration-200 backdrop-blur-sm
                                    ${isMe
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md'
                                        : 'bg-gradient-to-br from-[#1e293b] to-[#1a2332] text-slate-100 border border-white/10 rounded-2xl rounded-tl-md'
                                    }
                                    ${isHovered ? 'shadow-2xl scale-[1.01]' : ''}
                                `}
                            >
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[180px] md:min-w-[200px]">
                                        <textarea
                                            className="bg-black/30 text-white text-sm md:text-base rounded-xl px-3 py-2 outline-none border border-white/20 focus:border-white/40 transition-colors resize-none touch-manipulation"
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            autoFocus
                                            rows={3}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleEdit();
                                                }
                                                if (e.key === 'Escape') {
                                                    setIsEditing(false);
                                                }
                                            }}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation"
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                            <button
                                                onClick={handleEdit}
                                                disabled={loading}
                                                className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg text-green-400 transition-colors disabled:opacity-50 touch-manipulation"
                                                title="Save"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                                        {message.text}
                                    </p>
                                )}
                            </div>

                            {/* Actions for My Messages - Mobile Optimized */}
                            {isMe && !isEditing && isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`absolute -top-2 md:-top-3 bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/20 rounded-xl shadow-2xl p-1 flex gap-1 ${isMe ? '-left-1 md:-left-2 transform -translate-x-full' : '-right-1 md:-right-2 transform translate-x-full'
                                        }`}
                                >
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-blue-400 hover:bg-blue-500/20 active:bg-blue-500/30 rounded-lg transition-all hover:scale-110 touch-manipulation"
                                        title="Edit message"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg transition-all hover:scale-110 touch-manipulation"
                                        title="Delete message"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Timestamp */}
                        <span className={`text-[9px] md:text-[10px] mt-0.5 md:mt-1 px-1 ${isMe ? 'text-blue-400/70' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Delete Message?</h3>
                                    <p className="text-sm text-slate-400">This cannot be undone</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6">
                                <p className="text-sm text-slate-300 line-clamp-3">{message.text}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all shadow-lg shadow-red-600/30"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
