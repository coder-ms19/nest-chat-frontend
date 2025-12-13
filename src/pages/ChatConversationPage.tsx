import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { ChatArea } from '../components/chat/ChatArea';

export default function ChatConversationPage() {
    const navigate = useNavigate();
    const { conversationId } = useParams<{ conversationId: string }>();
    const [user, setUser] = useState<any>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);

    const activeConversationIdRef = useRef<string | null>(null);

    // Initialize User
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);
    }, [navigate]);

    // Connect Socket
    useEffect(() => {
        if (!user) return;

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl, {
            autoConnect: true,
            auth: {
                token: localStorage.getItem('token')
            }
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket');
            newSocket.emit('join', user.username);
            if (conversationId) {
                newSocket.emit('join-conversation', conversationId);
            }
        });

        newSocket.on('message', (msg: any) => {
            setMessages((prev) => {
                if (msg.conversationId === activeConversationIdRef.current) {
                    if (prev.find(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                }
                return prev;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, conversationId]);

    // Load conversation and messages
    useEffect(() => {
        if (!conversationId || !user) return;

        activeConversationIdRef.current = conversationId;

        const loadConversation = async () => {
            try {
                // Fetch conversation details
                const convRes = await api.get(`/conversations/user/${user.id}`);
                const conv = convRes.data.find((c: any) => c.id === conversationId);
                setConversation(conv);

                // Fetch messages
                const messagesRes = await api.get(`/conversations/${conversationId}`);
                setMessages(messagesRes.data);

                // Join conversation room
                socket?.emit('join-conversation', conversationId);
            } catch (e) {
                console.error('Failed to load conversation', e);
                navigate('/conversations');
            }
        };

        loadConversation();
    }, [conversationId, user, socket, navigate]);

    const refreshMessages = async () => {
        if (conversationId) {
            try {
                const res = await api.get(`/conversations/${conversationId}`);
                setMessages(res.data);
            } catch (e) {
                console.error('Failed to fetch messages', e);
            }
        }
    };

    const handleSendMessage = (text: string) => {
        if (!socket || !conversationId || !user) return;
        socket.emit('send-message', {
            conversationId,
            senderId: user.id,
            text
        });
    };

    const handleBack = () => {
        navigate('/conversations');
    };

    if (!user || !conversation) return null;

    return (
        <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
            <div className="w-full flex flex-col min-w-0">
                <ChatArea
                    conversation={conversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUser={user}
                    onRefresh={refreshMessages}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
