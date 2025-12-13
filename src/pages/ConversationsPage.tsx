import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Sidebar } from '../components/chat/Sidebar';
import { CreateGroupModal } from '../components/chat/CreateGroupModal';

export default function ConversationsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Connect Socket & Fetch Conversations
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
        });

        newSocket.on('message', () => {
            fetchConversations();
        });

        fetchConversations();

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/conversations/user/${user.id}`);
            setConversations(res.data);
        } catch (e) {
            console.error('Failed to fetch conversations', e);
        }
    };

    const handleSelectConversation = (id: string) => {
        navigate(`/chat/${id}`);
    };

    const handleStartChat = async (targetUserId: string) => {
        try {
            const res = await api.post('/conversations', {
                user1Id: user.id,
                user2Id: targetUserId
            });
            await fetchConversations();
            navigate(`/chat/${res.data.id}`);
        } catch (e) {
            console.error('Failed to start chat', e);
        }
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
            {/* Full width sidebar on mobile */}
            <div className="w-full flex-shrink-0">
                <Sidebar
                    conversations={conversations}
                    activeConversationId={null}
                    onSelectConversation={handleSelectConversation}
                    onCreateGroup={() => setIsModalOpen(true)}
                    onStartChat={handleStartChat}
                    currentUser={user}
                />
            </div>

            {isModalOpen && (
                <CreateGroupModal
                    currentUserId={user.id}
                    onClose={() => setIsModalOpen(false)}
                    onCreated={() => {
                        fetchConversations();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
