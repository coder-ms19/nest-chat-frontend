import React, { useEffect } from 'react';
import { useCall } from '../contexts/CallContext';
import { playRingtone, stopRingtone } from '../utils/sounds';

export const IncomingCallModal: React.FC = () => {
    const { incomingCall, acceptCall, rejectCall } = useCall();

    // Play ringtone when incoming call appears
    useEffect(() => {
        if (incomingCall) {
            playRingtone();
        }

        // Stop ringtone when component unmounts or call ends
        return () => {
            stopRingtone();
        };
    }, [incomingCall]);

    if (!incomingCall) {
        return null;
    }

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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center z-[10000] animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-10 max-w-md w-[90%] shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-400">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-white text-2xl font-semibold mb-2">
                        Incoming {isVideoCall ? 'Video' : 'Audio'} Call
                    </h2>
                    {isGroupCall && (
                        <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-xl text-xs font-medium">
                            Group
                        </span>
                    )}
                </div>

                {/* Caller Info */}
                <div className="text-center mb-10">
                    {incomingCall.initiator.avatarUrl ? (
                        <img
                            src={incomingCall.initiator.avatarUrl}
                            alt={incomingCall.initiator.username}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/30 mx-auto mb-5 animate-pulse shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-semibold text-white mx-auto mb-5 border-4 border-white/30 animate-pulse">
                            {incomingCall.initiator.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h3 className="text-white text-3xl font-bold mb-2">
                        {incomingCall.initiator.username}
                    </h3>
                    <p className="text-white/90 text-base">
                        {isVideoCall ? '📹 Video Call' : '📞 Voice Call'}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-5 justify-center">
                    <button
                        className="flex flex-col items-center gap-2 p-5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg min-w-[80px]"
                        onClick={handleReject}
                        aria-label="Reject call"
                    >
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M23 1L1 23M1 1l22 22" />
                        </svg>
                        <span className="text-sm font-semibold">Decline</span>
                    </button>

                    <button
                        className="flex flex-col items-center gap-2 p-5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg min-w-[80px]"
                        onClick={handleAccept}
                        aria-label="Accept call"
                    >
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        <span className="text-sm font-semibold">Accept</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
