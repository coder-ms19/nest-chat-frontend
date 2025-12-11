import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { MessageBubble } from './MessageBubble';
import { Send, MoreVertical, Trash2, ArrowLeft, Info, UserPlus, Users, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GroupDetailsModal } from './GroupDetailsModal';
import api from '../../api';

interface ChatAreaProps {
    conversation: any;
    messages: any[];
    onSendMessage: (text: string) => void;
    currentUser: any;
    onRefresh: () => void;
    onBack?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ conversation, messages, onSendMessage, currentUser, onRefresh, onBack }) => {
    const [text, setText] = useState('');
    const [showAdminMenu, setShowAdminMenu] = useState(false);
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteAction, setDeleteAction] = useState<'delete' | 'leave' | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSendMessage(text);
        setText('');
    };

    const handleDeleteGroup = () => {
        setDeleteAction('delete');
        setShowDeleteModal(true);
        setShowAdminMenu(false);
    };

    const handleLeaveGroup = () => {
        setDeleteAction('leave');
        setShowDeleteModal(true);
        setShowAdminMenu(false);
    };

    const confirmDelete = async () => {
        try {
            if (deleteAction === 'delete') {
                await api.post(`/conversations/${conversation.id}/delete`, { userId: currentUser.id });
            } else if (deleteAction === 'leave') {
                await api.post(`/conversations/${conversation.id}/remove-user`, {
                    userId: currentUser.id,
                    requesterId: currentUser.id
                });
            }
            setShowDeleteModal(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert(`Failed to ${deleteAction} group`);
        }
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0a0a0f] text-slate-500 gap-6 p-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                        <Send className="w-16 h-16 text-blue-500" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-white mb-2">Select a conversation</p>
                    <p className="text-sm text-slate-400">Choose a chat from the sidebar to start messaging</p>
                </div>
            </div>
        );
    }

    const otherUser = !conversation.isGroup
        ? conversation.users.find((u: any) => u.userId !== currentUser.id)?.user
        : null;

    const title = conversation.isGroup ? conversation.name : otherUser?.username;

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0f172a] to-[#0a0a0f] h-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl opacity-50" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Header */}
            <div className="h-16 md:h-18 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl z-20 shadow-lg relative">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="md:hidden text-white hover:bg-white/10 p-2 rounded-xl transition-all flex-shrink-0 border border-white/10"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white font-medium shadow-lg ring-2 ring-white/20 ${conversation.isGroup
                            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500'
                            }`}>
                            {conversation.isGroup ? <Users className="w-6 h-6" /> : title?.[0]?.toUpperCase()}
                        </div>
                        {!conversation.isGroup && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-white text-base md:text-lg tracking-tight truncate">{title}</h2>
                        {conversation.isGroup ? (
                            <span className="text-xs text-indigo-400 font-medium tracking-wide flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {conversation.users.length} members
                            </span>
                        ) : (
                            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Online
                            </span>
                        )}
                    </div>
                </div>

                {conversation.isGroup && (
                    <div className="relative">
                        <button
                            onClick={() => setShowAdminMenu(!showAdminMenu)}
                            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20"
                        >
                            <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {showAdminMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
                                >
                                    <button
                                        onClick={() => { setShowGroupDetails(true); setShowAdminMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-all flex items-center gap-3"
                                    >
                                        <Info size={16} className="flex-shrink-0" />
                                        <span>Group Info</span>
                                    </button>

                                    {conversation.ownerId === currentUser.id && (
                                        <button
                                            onClick={() => { setShowGroupDetails(true); setShowAdminMenu(false); }}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-purple-400 transition-all flex items-center gap-3"
                                        >
                                            <UserPlus size={16} className="flex-shrink-0" />
                                            <span>Add Members</span>
                                        </button>
                                    )}

                                    <div className="h-px bg-white/10 my-2" />

                                    {conversation.ownerId === currentUser.id ? (
                                        <button
                                            onClick={handleDeleteGroup}
                                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition-all flex items-center gap-3"
                                        >
                                            <Trash2 size={16} className="flex-shrink-0" />
                                            <span>Delete Group</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleLeaveGroup}
                                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition-all flex items-center gap-3"
                                        >
                                            <ArrowLeft size={16} className="flex-shrink-0" />
                                            <span>Leave Group</span>
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 z-10 scrollbar-thin scrollbar-thumb-gray-700">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                        <MessageBubble
                            key={msg.id || index}
                            message={msg}
                            isMe={msg.senderId === currentUser.id}
                            isGroup={conversation.isGroup}
                            onUpdate={onRefresh}
                        />
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 bg-gradient-to-r from-blue-600/5 to-purple-600/5 backdrop-blur-xl border-t border-white/10 z-10">
                <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                    <input
                        className="flex-1 bg-[#0f172a] border border-white/10 text-white text-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all px-4 md:px-5 py-3 md:py-3.5 shadow-inner placeholder-gray-500"
                        placeholder="Type your message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="rounded-2xl w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transform active:scale-95 transition-all p-0 flex-shrink-0"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                </div>
            </div>

            {/* Group Details Modal */}
            {showGroupDetails && (
                <GroupDetailsModal
                    conversation={conversation}
                    currentUser={currentUser}
                    onClose={() => setShowGroupDetails(false)}
                    onUpdate={onRefresh}
                />
            )}

            {/* Delete/Leave Confirmation Modal */}
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
                                    <h3 className="text-lg font-bold text-white">
                                        {deleteAction === 'delete' ? 'Delete Group?' : 'Leave Group?'}
                                    </h3>
                                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                {deleteAction === 'delete'
                                    ? 'All messages and members will be removed permanently. Are you sure you want to delete this group?'
                                    : 'You will no longer have access to this group\'s messages. Are you sure you want to leave?'
                                }
                            </p>
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
                                    {deleteAction === 'delete' ? 'Delete' : 'Leave'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
