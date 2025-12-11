import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import api from '../../api';

interface CreateGroupModalProps {
    currentUserId: string;
    onClose: () => void;
    onCreated: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ currentUserId, onClose, onCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setAllUsers(res.data.filter((u: any) => u.id !== currentUserId));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) {
            alert('Please enter a group name and select at least one member');
            return;
        }

        setCreating(true);
        try {
            await api.post('/conversations/group', {
                name: groupName,
                ownerId: currentUserId,
                userIds: [currentUserId, ...selectedUsers]
            });
            onCreated();
        } catch (e) {
            console.error(e);
            alert('Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Create Group</h2>
                                <p className="text-sm text-slate-400">Add members to start chatting</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Group Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Group Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
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
                </div>

                {/* Selected Users Count */}
                {selectedUsers.length > 0 && (
                    <div className="px-4 py-3 bg-blue-600/10 border-b border-blue-500/20">
                        <p className="text-sm text-blue-400 font-medium flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>
                )}

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <Search className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-medium">No users found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const isSelected = selectedUsers.includes(user.id);
                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => toggleUser(user.id)}
                                    className={`
                                        group p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }
                                    `}
                                >
                                    {/* Avatar */}
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:scale-105
                                        ${isSelected
                                            ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                                            : 'bg-gradient-to-br from-slate-600 to-slate-700'
                                        }
                                    `}>
                                        {user.username[0]?.toUpperCase()}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{user.username}</p>
                                        <p className="text-sm text-slate-400 truncate">{user.email}</p>
                                    </div>

                                    {/* Checkbox */}
                                    <div className={`
                                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                        ${isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-white/30 group-hover:border-white/50'
                                        }
                                    `}>
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!groupName.trim() || selectedUsers.length === 0 || creating}
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Group
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
