import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSearch } from './UserSearch';
import { Plus, Users, MessageSquare, Home, LogOut, Search, UserPlus, Trash2, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    conversations: any[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onCreateGroup: () => void;
    onStartChat: (userId: string) => void;
    currentUser: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    onCreateGroup,
    onStartChat,
    currentUser
}) => {
    const [activeTab, setActiveTab] = useState<'chats' | 'explore'>('chats');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const displayName = conv.isGroup
            ? conv.name
            : conv.users?.find((u: any) => u.userId !== currentUser.id)?.user?.username || 'Unknown User';
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="w-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-r border-white/10 flex flex-col h-full shadow-2xl z-20">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="font-bold text-white text-lg tracking-tight">Messages</h1>
                        <p className="text-xs text-slate-400">{conversations.length} conversations</p>
                    </div>
                    <button
                        onClick={onCreateGroup}
                        className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 transition-all duration-200 hover:scale-105"
                        title="Create Group"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-10 pr-4 py-2.5 placeholder-slate-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex bg-[#0f172a] p-1 rounded-xl mt-3 border border-white/5">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'chats'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chats</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'explore'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Explore</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'chats' ? (
                        <motion.div
                            key="chats"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-sm font-medium">
                                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                        </p>
                                        <p className="text-xs mt-1 text-center px-4">
                                            {searchQuery ? 'Try a different search term' : 'Start chatting with someone!'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => {
                                        const otherUser = !conv.isGroup
                                            ? conv.users?.find((u: any) => u.userId !== currentUser.id)
                                            : null;

                                        const displayName = conv.isGroup
                                            ? conv.name
                                            : otherUser?.user?.username || 'Unknown User';

                                        const lastMessage = conv.messages?.[0];
                                        const isActive = activeConversationId === conv.id;

                                        return (
                                            <motion.div
                                                key={conv.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={() => onSelectConversation(conv.id)}
                                                className={`
                                                    group relative p-3 rounded-2xl cursor-pointer transition-all duration-300 
                                                    flex items-start gap-3 border overflow-hidden
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                                        : 'border-transparent hover:bg-white/5 hover:border-white/10'
                                                    }
                                                `}
                                            >
                                                {/* Avatar */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`
                                                        w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base
                                                        shadow-lg transition-transform duration-300 group-hover:scale-105
                                                        ${conv.isGroup
                                                            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                                                            : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500'
                                                        }
                                                    `}>
                                                        {conv.isGroup
                                                            ? <Users className="w-6 h-6" />
                                                            : displayName[0]?.toUpperCase() || 'U'
                                                        }
                                                    </div>
                                                    {/* Online indicator for private chats */}
                                                    {!conv.isGroup && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1e293b] animate-pulse" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className={`
                                                            font-semibold truncate text-sm leading-tight
                                                            ${isActive ? 'text-blue-300' : 'text-slate-100'}
                                                        `}>
                                                            {displayName}
                                                        </h3>
                                                        {lastMessage && (
                                                            <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">
                                                                {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Subtitle */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs text-gray-400 truncate leading-tight">
                                                            {lastMessage?.text || (
                                                                <span className="italic opacity-60">No messages yet</span>
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Group member count */}
                                                    {conv.isGroup && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Users className="w-3 h-3 text-indigo-400" />
                                                            <span className="text-[10px] text-indigo-400 font-medium">
                                                                {conv.users?.length || 0} members
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Active indicator */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                                                )}
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="explore"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <UserSearch onStartChat={onStartChat} currentUserId={currentUser.id} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-blue-600/5 to-purple-600/5 space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20">
                        {currentUser?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{currentUser?.username}</p>
                        <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                    </div>
                    <button
                        onClick={() => {/* Settings modal */ }}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleGoHome}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/30 border border-white/10 text-slate-300 hover:text-blue-400 transition-all duration-200 group"
                        title="Go to Home"
                    >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Home</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-red-600/20 hover:border-red-500/30 border border-white/10 text-slate-300 hover:text-red-400 transition-all duration-200 group"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowLogoutModal(false)}
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
                                    <LogOut className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Confirm Logout</h3>
                                    <p className="text-sm text-slate-400">Are you sure you want to leave?</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                You'll need to log in again to access your messages.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all shadow-lg shadow-red-600/30"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
