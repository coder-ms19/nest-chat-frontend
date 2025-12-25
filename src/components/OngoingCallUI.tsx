import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useCall } from '../contexts/CallContext';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

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
        toggleScreenShare,
        isScreenSharing,
        switchCamera,
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
    const [isLocalMain, setIsLocalMain] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const toggleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2 : 1);
    };

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
                        // 1-on-1 Call: Picture-in-Picture Layout
                        <div ref={constraintsRef} className="w-full h-full relative overflow-hidden">
                            {/* Main Video (Full Screen) */}
                            {(() => {
                                // Determine Main Stream
                                const remoteEntry = Array.from(remoteStreams.entries())[0];
                                const remoteUserId = remoteEntry?.[0];
                                const remoteStream = remoteEntry?.[1];

                                const mainStream = isLocalMain ? localStream : remoteStream;
                                const mainKey = isLocalMain ? 'local-main' : `remote-${remoteUserId}`;
                                const mainIsLocal = isLocalMain;

                                return (
                                    <div key={mainKey} className="absolute inset-0 z-0">
                                        <video
                                            ref={(el) => {
                                                if (el) {
                                                    if (mainStream && el.srcObject !== mainStream) {
                                                        el.srcObject = mainStream;
                                                        el.play().catch(err => console.error('Main video autoplay prevented:', err));
                                                    }
                                                    if (mainIsLocal) localVideoRef.current = el;
                                                    else if (remoteUserId) remoteVideoRefs.current.set(remoteUserId, el);
                                                }
                                            }}
                                            autoPlay
                                            playsInline
                                            muted={mainIsLocal} // Mute if showing local stream
                                            className={`w-full h-full object-cover transition-transform duration-300 ${mainIsLocal && isVideoOff ? 'hidden' : ''}`}
                                            style={{ transform: `scale(${zoomLevel})` }}
                                        />
                                        {/* Fallback for blocked camera (Local Main) */}
                                        {mainIsLocal && isVideoOff && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                                <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                                    You
                                                </div>
                                            </div>
                                        )}

                                        {/* Name Overlay */}
                                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full z-10 pointer-events-none">
                                            <span className="text-white font-medium text-lg drop-shadow-md">
                                                {mainIsLocal
                                                    ? 'You'
                                                    : (activeCall.participants.find(p => p.userId === remoteUserId)?.username || 'User')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Floating Video (Draggable & Swappable) */}
                            {(() => {
                                // Determine Small Stream
                                const remoteEntry = Array.from(remoteStreams.entries())[0];
                                const remoteUserId = remoteEntry?.[0];
                                const remoteStream = remoteEntry?.[1];

                                const smallStream = isLocalMain ? remoteStream : localStream;
                                const smallKey = isLocalMain ? `remote-small-${remoteUserId}` : 'local-small';
                                const smallIsLocal = !isLocalMain; // If local is main, small is NOT local.

                                return (
                                    <motion.div
                                        drag
                                        dragConstraints={constraintsRef}
                                        dragElastic={0.1}
                                        dragMomentum={false}
                                        onClick={() => setIsLocalMain(!isLocalMain)}
                                        className="absolute bottom-24 right-4 w-32 h-44 md:w-48 md:h-64 bg-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-white/20 z-20 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                        style={{ touchAction: 'none' }}
                                    >
                                        <video
                                            key={smallKey}
                                            ref={(el) => {
                                                if (el) {
                                                    if (smallStream && el.srcObject !== smallStream) {
                                                        el.srcObject = smallStream;
                                                        el.play().catch(console.error);
                                                    }
                                                    if (smallIsLocal) localVideoRef.current = el;
                                                    else if (remoteUserId) remoteVideoRefs.current.set(remoteUserId, el);
                                                }
                                            }}
                                            autoPlay
                                            playsInline
                                            muted={smallIsLocal} // Mute if showing local stream
                                            className={`w-full h-full object-cover ${smallIsLocal && isVideoOff ? 'hidden' : ''}`}
                                        />

                                        {/* Fallback for blocked camera (Local Small) */}
                                        {smallIsLocal && isVideoOff && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Off</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Name Label for Small View */}
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                            {smallIsLocal ? 'You' : (activeCall.participants.find(p => p.userId === remoteUserId)?.username || 'User')}
                                        </div>
                                    </motion.div>
                                );
                            })()}
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
                <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                    {/* Mute Button */}
                    <button
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${isMuted
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                    </button>

                    {/* Video Toggle Button */}
                    {isVideoCall && (
                        <button
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${isVideoOff
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            onClick={toggleVideo}
                            aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        </button>
                    )}

                    {/* Screen Share Button */}
                    {isVideoCall && (
                        <button
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${isScreenSharing
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            onClick={toggleScreenShare}
                            aria-label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
                        >
                            <MonitorUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </button>
                    )}

                    {/* Switch Camera Button (Mobile) */}
                    {isVideoCall && !isScreenSharing && (
                        <button
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg bg-gray-700 hover:bg-gray-600`}
                            onClick={switchCamera}
                            aria-label="Switch Camera"
                        >
                            <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </button>
                    )}

                    {/* Zoom Button */}
                    {isVideoCall && (
                        <button
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${zoomLevel > 1
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            onClick={toggleZoom}
                            aria-label="Toggle Zoom"
                        >
                            {zoomLevel > 1 ? <ZoomOut className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <ZoomIn className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                        onClick={endCall}
                        aria-label="End call"
                    >
                        <PhoneOff className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};
