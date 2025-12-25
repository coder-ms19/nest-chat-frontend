import React, { useEffect, useRef } from 'react';
import { useCall } from '../contexts/CallContext';

export const OngoingCallUI: React.FC = () => {
    const {
        activeCall,
        localStream,
        remoteStreams,
        isMuted,
        isVideoOff,
        toggleMute,
        toggleVideo,
        endCall,
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    // Attach local stream to video element
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('Attaching local stream to video element');
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(err => console.error('Local video autoplay prevented:', err));
        }
    }, [localStream]);

    // Attach remote streams to video/audio elements
    useEffect(() => {
        console.log('Remote streams updated, count:', remoteStreams.size);
        remoteStreams.forEach((stream, userId) => {
            const element = remoteVideoRefs.current.get(userId);
            if (element && element.srcObject !== stream) {
                console.log('Attaching remote stream for user:', userId, 'tracks:', stream.getTracks().length);
                element.srcObject = stream;
                // Force play for audio elements
                element.play().catch(err => console.log('Autoplay prevented:', err));
            }
        });
    }, [remoteStreams]);

    if (!activeCall) {
        return null;
    }

    const isVideoCall = activeCall.callType.includes('VIDEO');
    const isGroupCall = activeCall.callType.includes('GROUP');
    const remoteStreamCount = remoteStreams.size;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-[9999] flex flex-col">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-md px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white text-xl font-semibold">
                            {isGroupCall
                                ? `Group ${isVideoCall ? 'Video' : 'Audio'} Call`
                                : activeCall.initiator?.username || 'Call'}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">
                            {activeCall.status === 'calling' && '📞 Calling...'}
                            {activeCall.status === 'ringing' && '📞 Ringing...'}
                            {activeCall.status === 'active' && '🟢 Connected'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Video Content */}
            <div className="flex-1 overflow-hidden relative bg-black">
                {isVideoCall ? (
                    remoteStreamCount === 1 ? (
                        // 1-on-1 Call: Picture-in-Picture Layout
                        <div className="w-full h-full relative">
                            {/* Remote User (Full Screen) */}
                            {Array.from(remoteStreams.entries()).map(([userId]) => (
                                <div key={userId} className="absolute inset-0 z-0">
                                    <video
                                        ref={(el) => {
                                            if (el) {
                                                remoteVideoRefs.current.set(userId, el);
                                                const stream = remoteStreams.get(userId);
                                                if (stream && el.srcObject !== stream) {
                                                    console.log('Immediately attaching stream to video for:', userId);
                                                    el.srcObject = stream;
                                                    el.play().catch(err => console.error('Video autoplay prevented:', err));
                                                }
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Name Overlay */}
                                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                                        <span className="text-white font-medium text-lg drop-shadow-md">
                                            {activeCall.participants.find((p) => p.userId === userId)?.username || 'User'}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Local User (Floating PiP) */}
                            <div className="absolute bottom-24 right-4 w-32 h-44 md:w-48 md:h-64 bg-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-white/20 z-10 transition-all hover:scale-105 origin-bottom-right">
                                <video
                                    ref={(el) => {
                                        localVideoRef.current = el;
                                        if (el && localStream) {
                                            el.srcObject = localStream;
                                            el.play().catch(console.error);
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                                />
                                {isVideoOff && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">Off</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Group Call: Grid Layout
                        <div
                            className={`h-full p-4 grid gap-4 ${remoteStreamCount === 0
                                ? 'grid-cols-1'
                                : remoteStreamCount <= 4
                                    ? 'grid-cols-2'
                                    : 'grid-cols-2 lg:grid-cols-3'
                                }`}
                        >
                            {/* Remote videos */}
                            {Array.from(remoteStreams.entries()).map(([userId]) => (
                                <div
                                    key={userId}
                                    className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-white/5"
                                >
                                    <video
                                        ref={(el) => {
                                            if (el) {
                                                remoteVideoRefs.current.set(userId, el);
                                                const stream = remoteStreams.get(userId);
                                                if (stream && el.srcObject !== stream) {
                                                    el.srcObject = stream;
                                                    el.play().catch(err => console.error('Video autoplay prevented:', err));
                                                }
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg z-10">
                                        <span className="text-white text-sm font-medium">
                                            {activeCall.participants.find((p) => p.userId === userId)?.username || 'User'}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Local video (In Grid) */}
                            <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-white/5">
                                <video
                                    ref={(el) => {
                                        localVideoRef.current = el;
                                        if (el && localStream) {
                                            el.srcObject = localStream;
                                            el.play().catch(console.error);
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg">
                                    <span className="text-white text-sm font-medium">
                                        You {isVideoOff && '(Camera Off)'}
                                    </span>
                                </div>
                                {isVideoOff && (
                                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                            You
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    // Audio-only view
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-center relative z-10">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-5xl font-bold mb-6 mx-auto shadow-2xl animate-pulse ring-8 ring-purple-500/20">
                                {activeCall.initiator?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h2 className="text-white text-3xl font-bold mb-2 tracking-tight">
                                {activeCall.initiator?.username || 'User'}
                            </h2>
                            <p className="text-indigo-300 text-lg font-medium">Audio Call</p>
                        </div>

                        {/* Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
                        </div>

                        {/* Hidden audio elements for remote streams */}
                        {Array.from(remoteStreams.entries()).map(([userId]) => (
                            <audio
                                key={userId}
                                ref={(el) => {
                                    if (el) {
                                        remoteVideoRefs.current.set(userId, el as any);
                                        const stream = remoteStreams.get(userId);
                                        if (stream && el.srcObject !== stream) {
                                            el.srcObject = stream;
                                            el.play().catch(err => console.log('Audio autoplay prevented:', err));
                                        }
                                    }
                                }}
                                autoPlay
                                playsInline
                                className="hidden"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-black/40 backdrop-blur-md px-6 py-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-4">
                    {/* Mute Button */}
                    <button
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${isMuted
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>

                    {/* Video Toggle Button */}
                    {isVideoCall && (
                        <button
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${isVideoOff
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            onClick={toggleVideo}
                            aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? (
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                        onClick={endCall}
                        aria-label="End call"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="white"
                            stroke="none"
                        >
                            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
