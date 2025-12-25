import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// WebRTC Configuration
const RTC_CONFIGURATION: RTCConfiguration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
        },
        {
            urls: 'stun:stun1.l.google.com:19302',
        },
        // Add TURN server for production
        // {
        //   urls: 'turn:your-turn-server.com:3478',
        //   username: 'username',
        //   credential: 'password',
        // },
    ],
    iceCandidatePoolSize: 10,
};

export interface CallParticipant {
    userId: string;
    username: string;
    avatarUrl?: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
}

export interface ActiveCall {
    callId: string;
    callType: 'AUDIO_1TO1' | 'VIDEO_1TO1' | 'AUDIO_GROUP' | 'VIDEO_GROUP';
    initiator?: CallParticipant;
    participants: CallParticipant[];
    status: 'calling' | 'ringing' | 'active' | 'ended';
}

export interface IncomingCall {
    callId: string;
    callType: 'AUDIO_1TO1' | 'VIDEO_1TO1' | 'AUDIO_GROUP' | 'VIDEO_GROUP';
    initiator: CallParticipant;
    conversationId?: string;
}

export const useWebRTC = (userId: string, username: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Peer connections for each participant (userId -> RTCPeerConnection)
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const iceCandidateQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const pendingOffers = useRef<Map<string, RTCSessionDescriptionInit>>(new Map());

    /**
     * Initialize Socket.IO connection
     */
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const newSocket = io(`${API_URL}/call`, {
            transports: ['websocket'],
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        newSocket.on('connect', () => {
            console.log('Connected to call namespace');
            newSocket.emit('identify', { userId, username });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId, username]);

    /**
     * Setup socket event listeners
     */
    useEffect(() => {
        if (!socket) return;

        // Incoming call
        socket.on('call:incoming', (data: IncomingCall) => {
            console.log('Incoming call:', data);
            setIncomingCall(data);
        });

        // Call accepted
        socket.on('call:accepted', ({ username }) => {
            console.log('Call accepted by:', username);
            setActiveCall((prev) =>
                prev
                    ? {
                        ...prev,
                        status: 'active',
                    }
                    : null
            );
        });

        // Call rejected
        socket.on('call:rejected', ({ userId: rejectedUserId, reason }) => {
            console.log('Call rejected by:', rejectedUserId, reason);
            setActiveCall(null);
            cleanupCall();
        });

        // Call ended
        socket.on('call:ended', ({ endedBy, duration }) => {
            console.log('Call ended by:', endedBy, 'Duration:', duration);
            setActiveCall(null);
            cleanupCall();
        });

        // WebRTC Signaling: Receive offer
        socket.on('call:offer', async ({ fromUserId, offer }) => {
            console.log('Received offer from:', fromUserId);
            // Store the offer to process after user accepts call and has media
            pendingOffers.current.set(fromUserId, offer);
            console.log('Stored offer from:', fromUserId, 'Will process after accepting call');
        });

        // WebRTC Signaling: Receive answer
        socket.on('call:answer', async ({ fromUserId, answer }) => {
            console.log('Received answer from:', fromUserId);
            await handleReceiveAnswer(fromUserId, answer);
        });

        // WebRTC Signaling: Receive ICE candidate
        socket.on('call:ice-candidate', async ({ fromUserId, candidate }) => {
            console.log('Received ICE candidate from:', fromUserId);
            await handleReceiveIceCandidate(fromUserId, candidate);
        });

        // Participant muted
        socket.on('call:participant-muted', ({ userId: mutedUserId, isMuted }) => {
            console.log('Participant muted:', mutedUserId, isMuted);
            // Update UI to show muted status
        });

        // Participant video toggled
        socket.on('call:participant-video-toggled', ({ userId: toggledUserId, isVideoOff }) => {
            console.log('Participant video toggled:', toggledUserId, isVideoOff);
            // Update UI to show video status
        });

        // Group call: participant joined
        socket.on('group-call:participant-joined', ({ participant, allParticipants }) => {
            console.log('Participant joined:', participant);
            setActiveCall((prev) =>
                prev
                    ? {
                        ...prev,
                        participants: allParticipants,
                    }
                    : null
            );
            // Establish peer connection with new participant
            if (participant.userId !== userId) {
                createPeerConnection(participant.userId, true);
            }
        });

        // Group call: participant left
        socket.on('group-call:participant-left', ({ userId: leftUserId }) => {
            console.log('Participant left:', leftUserId);
            closePeerConnection(leftUserId);
        });

        return () => {
            socket.off('call:incoming');
            socket.off('call:accepted');
            socket.off('call:rejected');
            socket.off('call:ended');
            socket.off('call:offer');
            socket.off('call:answer');
            socket.off('call:ice-candidate');
            socket.off('call:participant-muted');
            socket.off('call:participant-video-toggled');
            socket.off('group-call:participant-joined');
            socket.off('group-call:participant-left');
        };
    }, [socket, userId]);

    /**
     * Get user media (camera/microphone)
     */
    const getUserMedia = async (isVideo: boolean) => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: isVideo
                    ? {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 30 },
                    }
                    : false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    };

    /**
     * Create peer connection for a participant
     */
    const createPeerConnection = useCallback(
        (participantUserId: string, isInitiator: boolean, stream?: MediaStream, callId?: string) => {
            if (peerConnections.current.has(participantUserId)) {
                return peerConnections.current.get(participantUserId)!;
            }

            const pc = new RTCPeerConnection(RTC_CONFIGURATION);

            // Use provided stream or fall back to localStream
            const mediaStream = stream || localStream;

            // Add local stream tracks
            if (mediaStream) {
                console.log('Adding tracks to peer connection for:', participantUserId);
                mediaStream.getTracks().forEach((track) => {
                    console.log('Adding track:', track.kind, track.label);
                    pc.addTrack(track, mediaStream);
                });
            } else {
                console.warn('No media stream available when creating peer connection');
            }

            // Handle incoming tracks
            pc.ontrack = (event) => {
                console.log('Received remote track from:', participantUserId, event.track.kind);
                const [remoteStream] = event.streams;
                setRemoteStreams((prev) => new Map(prev).set(participantUserId, remoteStream));
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && socket && (callId || activeCall)) {
                    socket.emit('call:ice-candidate', {
                        callId: callId || activeCall!.callId,
                        targetUserId: participantUserId,
                        candidate: event.candidate.toJSON(),
                    });
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log('Connection state:', pc.connectionState, 'for', participantUserId);
                if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                    closePeerConnection(participantUserId);
                }
            };

            peerConnections.current.set(participantUserId, pc);

            // If initiator, create and send offer
            if (isInitiator) {
                createAndSendOffer(participantUserId, pc, callId);
            }

            return pc;
        },
        [localStream, socket, activeCall]
    );

    /**
     * Create and send offer
     */
    const createAndSendOffer = async (participantUserId: string, pc: RTCPeerConnection, callId?: string) => {
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log('Created offer for:', participantUserId);

            const currentCallId = callId || activeCall?.callId;

            if (socket && currentCallId) {
                console.log('Sending offer to backend, callId:', currentCallId);
                socket.emit('call:offer', {
                    callId: currentCallId,
                    targetUserId: participantUserId,
                    offer: { type: offer.type, sdp: offer.sdp },
                });
            } else {
                console.error('Cannot send offer - socket or callId missing', { socket: !!socket, callId: currentCallId });
            }
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    };

    /**
     * Handle received offer
     */
    /**
     * Handle received offer
     */
    const handleReceiveOffer = async (fromUserId: string, offer: RTCSessionDescriptionInit, stream?: MediaStream, callId?: string) => {
        try {
            console.log('Handling offer from:', fromUserId);
            const mediaStream = stream || localStream;
            console.log('Local stream available:', !!mediaStream);
            console.log('Local stream tracks:', mediaStream?.getTracks().length);

            // Use passed callId or fallback to activeCall
            const currentCallId = callId || activeCall?.callId;

            const pc = createPeerConnection(fromUserId, false, mediaStream || undefined, currentCallId);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Process queued ICE candidates
            const queuedCandidates = iceCandidateQueue.current.get(fromUserId) || [];
            for (const candidate of queuedCandidates) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            iceCandidateQueue.current.delete(fromUserId);

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log('Created answer for:', fromUserId);

            if (socket && currentCallId) {
                socket.emit('call:answer', {
                    callId: currentCallId,
                    targetUserId: fromUserId,
                    answer: { type: answer.type, sdp: answer.sdp },
                });
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    /**
     * Handle received answer
     */
    const handleReceiveAnswer = async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
        try {
            const pc = peerConnections.current.get(fromUserId);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));

                // Process queued ICE candidates
                const queuedCandidates = iceCandidateQueue.current.get(fromUserId) || [];
                for (const candidate of queuedCandidates) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                iceCandidateQueue.current.delete(fromUserId);
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    /**
     * Handle received ICE candidate
     */
    const handleReceiveIceCandidate = async (
        fromUserId: string,
        candidate: RTCIceCandidateInit
    ) => {
        try {
            const pc = peerConnections.current.get(fromUserId);
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                // Queue candidate if remote description not set yet
                const queue = iceCandidateQueue.current.get(fromUserId) || [];
                queue.push(candidate);
                iceCandidateQueue.current.set(fromUserId, queue);
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    };

    /**
     * Close peer connection
     */
    const closePeerConnection = (participantUserId: string) => {
        const pc = peerConnections.current.get(participantUserId);
        if (pc) {
            pc.close();
            peerConnections.current.delete(participantUserId);
        }
        setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(participantUserId);
            return newMap;
        });
    };

    /**
     * Initiate a call
     */
    const initiateCall = async (
        recipientIds: string[],
        callType: 'AUDIO_1TO1' | 'VIDEO_1TO1' | 'AUDIO_GROUP' | 'VIDEO_GROUP',
        conversationId?: string
    ) => {
        if (!socket) {
            throw new Error('Socket not connected');
        }

        try {
            // Get user media
            const isVideo = callType.includes('VIDEO');
            const stream = await getUserMedia(isVideo);

            // Emit initiate call event
            socket.emit(
                'call:initiate',
                {
                    recipientIds,
                    callType,
                    conversationId,
                },
                (response: any) => {
                    if (response.error) {
                        throw new Error(response.error);
                    }

                    setActiveCall({
                        callId: response.call.callId,
                        callType,
                        participants: response.call.participants,
                        status: 'calling',
                    });

                    // For 1-to-1 calls, immediately create peer connection with the stream and callId
                    if (callType.includes('1TO1') && recipientIds.length === 1) {
                        createPeerConnection(recipientIds[0], true, stream, response.call.callId);
                    }
                }
            );
        } catch (error) {
            console.error('Error initiating call:', error);
            throw error;
        }
    };

    /**
     * Accept incoming call
     */
    const acceptCall = async () => {
        if (!socket || !incomingCall) {
            return;
        }

        try {
            // Get user media FIRST
            const isVideo = incomingCall.callType.includes('VIDEO');
            const stream = await getUserMedia(isVideo);

            console.log('Got media stream, now processing call');

            // Emit accept event
            socket.emit('call:accept', { callId: incomingCall.callId }, (response: any) => {
                if (response.error) {
                    throw new Error(response.error);
                }

                setActiveCall({
                    callId: incomingCall.callId,
                    callType: incomingCall.callType,
                    initiator: incomingCall.initiator,
                    participants: [incomingCall.initiator],
                    status: 'active',
                });

                setIncomingCall(null);

                // Now process the pending offer with the stream
                const pendingOffer = pendingOffers.current.get(incomingCall.initiator.userId);
                if (pendingOffer) {
                    console.log('Processing pending offer from:', incomingCall.initiator.userId);
                    pendingOffers.current.delete(incomingCall.initiator.userId);
                    handleReceiveOffer(incomingCall.initiator.userId, pendingOffer, stream, incomingCall.callId);
                } else {
                    console.warn('No pending offer found for:', incomingCall.initiator.userId);
                    // Fallback: create peer connection anyway
                    createPeerConnection(incomingCall.initiator.userId, false, stream, incomingCall.callId);
                }
            });
        } catch (error) {
            console.error('Error accepting call:', error);
            throw error;
        }
    };

    /**
     * Reject incoming call
     */
    const rejectCall = (reason?: string) => {
        if (!socket || !incomingCall) {
            return;
        }

        socket.emit('call:reject', {
            callId: incomingCall.callId,
            reason,
        });

        setIncomingCall(null);
    };

    /**
     * End active call
     */
    const endCall = () => {
        if (!socket || !activeCall) {
            return;
        }

        socket.emit('call:end', { callId: activeCall.callId });
        cleanupCall();
    };

    /**
     * Toggle mute
     */
    const toggleMute = () => {
        if (!localStream || !socket || !activeCall) {
            return;
        }

        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);

            socket.emit('call:toggle-mute', {
                callId: activeCall.callId,
                isMuted: !audioTrack.enabled,
            });
        }
    };

    /**
     * Toggle video
     */
    const toggleVideo = () => {
        if (!localStream || !socket || !activeCall) {
            return;
        }

        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);

            socket.emit('call:toggle-video', {
                callId: activeCall.callId,
                isVideoOff: !videoTrack.enabled,
            });
        }
    };

    /**
     * Cleanup call resources
     */
    const cleanupCall = () => {
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }

        // Close all peer connections
        peerConnections.current.forEach((pc) => pc.close());
        peerConnections.current.clear();

        // Clear remote streams
        setRemoteStreams(new Map());

        // Reset state
        setActiveCall(null);
        setIsMuted(false);
        setIsVideoOff(false);
    };

    return {
        socket,
        localStream,
        remoteStreams,
        activeCall,
        incomingCall,
        isMuted,
        isVideoOff,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
    };
};
