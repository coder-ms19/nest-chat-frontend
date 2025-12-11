import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Crown, UserMinus, Trash2, AlertTriangle, Loader2, Info, UserPlus, Search } from 'lucide-react';
import api from '../../api';

interface GroupDetailsModalProps {
    conversation: any;
    currentUser: any;
    onClose: () => void;
    onUpdate: () => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ conversation, currentUser, onClose, onUpdate }) => {
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToRemove, setUserToRemove] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [addingMembers, setAddingMembers] = useState(false);

    const isOwner = conversation.ownerId === currentUser.id;

    const handleRemoveUser = (user: any) => {
        setUserToRemove(user);
        setShowRemoveModal(true);
    };

    const confirmRemoveUser = async () => {
        if (!userToRemove) return;
        setLoading(true);
        try {
            await api.post(`/conversations/${conversation.id}/remove-user`, {
                userId: userToRemove.userId,
                requesterId: currentUser.id
            });
            setShowRemoveModal(false);
            setUserToRemove(null);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Failed to remove user');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteGroup = async () => {
        setLoading(true);
        try {
            await api.post(`/conversations/${conversation.id}/delete`, { userId: currentUser.id });
            setShowDeleteModal(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to delete group');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersForAdding = async () => {
        try {
            const res = await api.get('/users');
            const existingUserIds = conversation.users.map((u: any) => u.userId);
            setAllUsers(res.data.filter((u: any) => !existingUserIds.includes(u.id)));
            setShowAddMembers(true);
        } catch (e) {
            console.error(e);
            alert('Failed to fetch users');
        }
    };

    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;
        setAddingMembers(true);
        try {
            await api.post(`/conversations/${conversation.id}/add-users`, {
                userIds: selectedUsers,
                requesterId: currentUser.id
            });
            setShowAddMembers(false);
            setSelectedUsers([]);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Failed to add members');
        } finally {
            setAddingMembers(false);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
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
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{conversation.name}</h2>
                                    <p className="text-sm text-slate-400">{conversation.users.length} members</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {isOwner && (
                                <>
                                    <button
                                        onClick={fetchUsersForAdding}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 transition-all"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span className="text-sm font-medium">Add Members</span>
                                    </button>
                                    <button
                                        onClick={handleDeleteGroup}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Delete Group</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">Members</h3>
                        </div>
                        {conversation.users.map((member: any) => {
                            const isGroupOwner = member.userId === conversation.ownerId;
                            const isCurrentUser = member.userId === currentUser.id;
                            const canRemove = isOwner && !isGroupOwner && !isCurrentUser;

                            return (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3"
                                >
                                    {/* Avatar */}
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg
                                        ${isGroupOwner
                                            ? 'bg-gradient-to-br from-yellow-500 to-orange-600 ring-2 ring-yellow-500/50'
                                            : 'bg-gradient-to-br from-blue-600 to-purple-600'
                                        }
                                    `}>
                                        {member.user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-white truncate">
                                                {member.user?.username || 'Unknown'}
                                            </p>
                                            {isGroupOwner && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                                                    <Crown className="w-3 h-3 text-yellow-400" />
                                                    <span className="text-xs font-medium text-yellow-400">Owner</span>
                                                </div>
                                            )}
                                            {isCurrentUser && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 truncate">{member.user?.email || 'No email'}</p>
                                    </div>

                                    {/* Remove Button */}
                                    {canRemove && (
                                        <button
                                            onClick={() => handleRemoveUser(member)}
                                            className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove member"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-gradient-to-r from-indigo-600/5 to-purple-600/5">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Add Members Modal */}
            <AnimatePresence>
                {showAddMembers && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowAddMembers(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                            <UserPlus className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Add Members</h3>
                                            <p className="text-sm text-slate-400">Select users to add</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAddMembers(false)} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-10 pr-4 py-2.5 placeholder-slate-500"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
                                {filteredUsers.map((user) => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${isSelected
                                                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {user.username[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{user.username}</p>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-white/30'}`}>
                                                {isSelected && <X className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-6 border-t border-white/10 flex gap-3">
                                <button onClick={() => setShowAddMembers(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMembers}
                                    disabled={selectedUsers.length === 0 || addingMembers}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    {addingMembers ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    Add {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remove User Confirmation Modal */}
            <AnimatePresence>
                {showRemoveModal && userToRemove && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowRemoveModal(false)}
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
                                    <UserMinus className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Remove Member?</h3>
                                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                Are you sure you want to remove <span className="text-white font-medium">{userToRemove.user?.username}</span> from this group?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRemoveModal(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemoveUser}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Group Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
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
                                    <h3 className="text-lg font-bold text-white">Delete Group?</h3>
                                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                Are you sure you want to permanently delete <span className="text-white font-medium">{conversation.name}</span>? All messages and members will be removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteGroup}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
