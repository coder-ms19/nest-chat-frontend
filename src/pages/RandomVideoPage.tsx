import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    Search,
    User,
    SwitchCamera,
    SkipForward
} from 'lucide-react';
import { useRandomCall } from '../contexts/RandomCallContext';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};

const RandomVideoPage = () => {
    const { setRandomCallActive, setRandomCallSearching, setRandomCallIdle } = useRandomCall();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<'idle' | 'searching' | 'connected'>('idle');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [partnerName, setPartnerName] = useState('Stranger');

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const [isSwapped, setIsSwapped] = useState(false);

    // Initialize Socket
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const newSocket = io(`${API_URL}/random-chat`, {
            transports: ['websocket'],
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        setSocket(newSocket);
        socketRef.current = newSocket;

        return () => {
            newSocket.disconnect();
            // Reset global state when leaving the page
            setRandomCallIdle();
        };
    }, [setRandomCallIdle]);

    // Initialize Media
    const initMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Error accessing media:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        initMedia();
        return () => {
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, []); // Run once on mount

    // WebRTC & Socket Events
    useEffect(() => {
        if (!socket) return;

        socket.on('waiting-for-partner', () => {
            setStatus('searching');
            setRandomCallSearching();
        });

        socket.on('match-found', async ({ role, partnerName }) => {
            console.log('Match found! Role:', role);
            setStatus('connected');
            setPartnerName(partnerName);
            setRandomCallActive(partnerName);

            // Create PeerConnection
            const pc = new RTCPeerConnection(RTC_CONFIG);
            peerConnection.current = pc;

            // Add local tracks
            if (localStream) {
                localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
            }

            // Handle remote tracks
            pc.ontrack = (event) => {
                const [remote] = event.streams;
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remote;
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('signal-ice-candidate', { candidate: event.candidate });
                }
            };

            if (role === 'initiator') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('signal-offer', { offer });
            }
        });

        socket.on('signal-offer', async ({ offer }) => {
            const pc = peerConnection.current;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('signal-answer', { answer });
        });

        socket.on('signal-answer', async ({ answer }) => {
            const pc = peerConnection.current;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('signal-ice-candidate', async ({ candidate }) => {
            const pc = peerConnection.current;
            if (!pc) return;
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on('match-ended', () => {
            setStatus('idle');
            setRandomCallIdle();
            handleEndCall(false); // Don't notify server, they told us
            alert('The stranger disconnected.');
        });

        return () => {
            socket.off('waiting-for-partner');
            socket.off('match-found');
            socket.off('signal-offer');
            socket.off('signal-answer');
            socket.off('signal-ice-candidate');
            socket.off('match-ended');
        };
    }, [socket, localStream]);

    const handleStartSearch = () => {
        if (!socket) return;
        setStatus('searching');
        setRandomCallSearching();
        socket.emit('find-partner');
    };

    const handleEndCall = (notifyServer = true) => {
        if (notifyServer && socket) {
            socket.emit('leave-pool');
        }

        // Close PC
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setStatus('idle');
        setPartnerName('Stranger');
        setRandomCallIdle();
    };

    const handleNext = () => {
        // Disconnect current
        handleEndCall(true);
        // Small delay to ensure state reset before searching again
        setTimeout(() => {
            handleStartSearch();
        }, 300);
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const newVideoState = !isVideoOff;
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !newVideoState; // If video is off, enable track
            });
            setIsVideoOff(newVideoState);

            // Force refresh video element to ensure it displays properly
            if (localVideoRef.current && !newVideoState) {
                localVideoRef.current.srcObject = null;
                setTimeout(() => {
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = localStream;
                    }
                }, 10);
            }
        }
    };

    const switchCamera = async () => {
        if (!localStream) return;

        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        console.log('Switching camera to:', newFacingMode);

        try {
            // Get new video stream
            const constraints = {
                video: {
                    facingMode: newFacingMode
                }
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            const newVideoTrack = newStream.getVideoTracks()[0];

            // Update local stream state
            const oldVideoTrack = localStream.getVideoTracks()[0];
            if (oldVideoTrack) oldVideoTrack.stop();

            const newLocalStream = new MediaStream([
                newVideoTrack,
                ...localStream.getAudioTracks()
            ]);

            setLocalStream(newLocalStream);

            // Force update local video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = newLocalStream;
            }

            // Replace track in PeerConnection sender
            if (peerConnection.current) {
                const senders = peerConnection.current.getSenders();
                const videoSender = senders.find(s => s.track?.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(newVideoTrack);
                }
            }

            setFacingMode(newFacingMode);

        } catch (err) {
            console.error('Error switching camera:', err);
            // Fallback: try without exact constraint or just log error
        }
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#09090b] text-white flex flex-col items-center justify-center sm:p-4">

            {/* Background Ambience (Desktop Only) */}
            <div className="hidden sm:block absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Main Container */}
            <div className={`
                z-10 w-full flex flex-col relative transition-all duration-300
                h-full sm:h-auto sm:aspect-video sm:max-w-5xl sm:bg-black/40 sm:backdrop-blur-xl 
                sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl sm:overflow-hidden
            `}>

                {/* Header / Top Bar */}
                <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent sm:bg-none pointer-events-none">
                    <div className="pointer-events-auto">
                        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-md">
                            Random Connect
                        </h1>
                        <div className={`flex items-center gap-2 mt-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 w-fit
                            ${status === 'connected' ? 'border-green-500/30' : 'border-white/10'}
                        `}>
                            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : status === 'searching' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-xs font-medium text-white/90">
                                {status === 'connected' ? partnerName : status === 'searching' ? 'Searching...' : 'Idle'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video Area */}
                <div
                    ref={containerRef}
                    className="relative w-full h-full sm:rounded-3xl overflow-hidden bg-gray-900"
                    style={{ touchAction: 'none' }}
                >

                    {/* Remote Video (Main Layer) */}
                    <div
                        onClick={() => isSwapped && setIsSwapped(false)}
                        className={`absolute inset-0 w-full h-full z-0 transition-transform duration-300 ${isSwapped ? 'scale-95 opacity-50 blur-sm' : 'scale-100'}`}
                    >
                        {status === 'connected' ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                                onLoadedMetadata={(e) => {
                                    e.currentTarget.play().catch(console.error);
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-black/80">
                                {status === 'searching' ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-ping"></div>
                                            <Search className="relative w-16 h-16 mb-4 text-purple-400" />
                                        </div>
                                        <p className="text-xl font-medium text-purple-200">Looking for someone...</p>
                                        <p className="text-sm text-purple-400/60 mt-2">Hang tight!</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <User className="w-20 h-20 mb-4 opacity-20" />
                                        <div className="text-center space-y-2">
                                            <p className="text-2xl font-semibold opacity-80">Ready to Connect?</p>
                                            <p className="text-sm opacity-50">Click "Find Stranger" to start</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Local Video (Floating PiP) */}
                    {/* 
                        If NOT swapped: Remote is Main (z-0), Local is PiP (z-20)
                        If swapped: Local is Main (z-0), Remote is PiP (z-20)
                    */}

                    <motion.div
                        layout
                        drag
                        dragConstraints={containerRef}
                        dragElastic={0.1}
                        whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                        onClick={() => setIsSwapped(!isSwapped)}
                        className={`
                            absolute z-20 overflow-hidden shadow-2xl border border-white/20 bg-black/80 cursor-grab active:cursor-grabbing
                            top-4 right-4 
                            w-[120px] h-[180px] sm:w-[150px] sm:h-[100px] md:w-[240px] md:h-[160px] lg:w-[320px] lg:h-[213px]
                            rounded-xl
                            ${isSwapped ? 'ring-2 ring-purple-500' : ''}
                        `}
                    >
                        {/* 
                            Logic Check: 
                            If !isSwapped: Main=Remote, PiP=Local
                            If isSwapped: Main=Local, PiP=Remote
                         */}
                        {(!isSwapped ? !isVideoOff : status === 'connected') ? (
                            <video
                                ref={!isSwapped ? localVideoRef : remoteVideoRef}
                                autoPlay
                                muted={!isSwapped} // Always mute local video preview
                                playsInline
                                className={`w-full h-full object-cover ${!isSwapped ? 'transform scale-x-[-1]' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                {!isSwapped ? (
                                    <VideoOff className="w-8 h-8 text-gray-400" />
                                ) : (
                                    <User className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                        )}

                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] sm:text-xs font-medium border border-white/10">
                            {!isSwapped ? 'You' : partnerName}
                        </div>
                    </motion.div>

                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-4 z-30 pb-10 sm:pb-6">

                    {/* Main Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">

                        <button
                            onClick={toggleMute}
                            className={`p-4 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-lg ${isMuted
                                    ? 'bg-white text-black hover:bg-gray-200'
                                    : 'bg-white/10 hover:bg-white/20 border border-white/10'
                                }`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-lg ${isVideoOff
                                    ? 'bg-white text-black hover:bg-gray-200'
                                    : 'bg-white/10 hover:bg-white/20 border border-white/10'
                                }`}
                        >
                            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </button>

                        <button
                            onClick={switchCamera}
                            className="md:hidden p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                        >
                            <SwitchCamera className="w-6 h-6" />
                        </button>

                        {/* Call Actions */}
                        {status === 'idle' ? (
                            <button
                                onClick={handleStartSearch}
                                className="px-8 py-4 bg-purple-600 rounded-full font-bold text-lg shadow-lg shadow-purple-600/40 hover:bg-purple-500 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                <span>Find</span>
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleEndCall(true)}
                                    className="p-4 rounded-full bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all backdrop-blur-md"
                                    title="Stop"
                                >
                                    <PhoneOff className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="px-6 py-4 rounded-full bg-white text-black font-bold text-lg shadow-lg hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <span>Next</span>
                                    <SkipForward className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};


export default RandomVideoPage;
