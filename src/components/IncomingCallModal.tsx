import React, { useEffect } from 'react';
import { useCall } from '../contexts/CallContext';
import { playRingtone, stopRingtone } from '../utils/sounds';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, X } from 'lucide-react';

export const IncomingCallModal: React.FC = () => {
    const { incomingCall, acceptCall, rejectCall } = useCall();

    // Play ringtone when incoming call appears
    useEffect(() => {
        if (incomingCall) {
            playRingtone();
        }

        return () => {
            stopRingtone();
        };
    }, [incomingCall]);

    if (!incomingCall) return null;

    const isVideoCall = incomingCall.callType.includes('VIDEO');
    const isGroupCall = incomingCall.callType.includes('GROUP');

    const handleAccept = () => {
        stopRingtone();
        acceptCall();
    };

    const handleReject = () => {
        stopRingtone();
        rejectCall();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
                {/* Background Wave Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[80px] animate-pulse delay-75" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm mx-4 bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center"
                >
                    {/* Status Badge */}
                    <div className="mb-8 flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                        </span>
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Incoming {isVideoCall ? 'Video' : 'Audio'} Call
                        </span>
                    </div>

                    {/* Caller Info */}
                    <div className="relative mb-8 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse" />
                        <div className="relative w-32 h-32 rounded-full ring-4 ring-[#1a1a2e] overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            {incomingCall.initiator.avatarUrl ? (
                                <img
                                    src={incomingCall.initiator.avatarUrl}
                                    alt={incomingCall.initiator.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-bold text-white">
                                    {incomingCall.initiator.username.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                        {incomingCall.initiator.username}
                        {isGroupCall && <span className="text-sm font-normal text-slate-400 block mt-1">(Group Call)</span>}
                    </h2>
                    <p className="text-slate-400 text-sm mb-12 text-center">
                        {isVideoCall ? "wants to start a video call" : "wants to start a voice call"}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-6 w-full">
                        <button
                            onClick={handleReject}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#2a2a3e] hover:bg-red-500/10 hover:border-red-500/50 border border-transparent transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <X className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-slate-400 group-hover:text-red-400">Decline</span>
                        </button>

                        <button
                            onClick={handleAccept}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#2a2a3e] hover:bg-green-500/10 hover:border-green-500/50 border border-transparent transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {isVideoCall ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                            </div>
                            <span className="text-sm font-medium text-slate-400 group-hover:text-green-400">Accept</span>
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
