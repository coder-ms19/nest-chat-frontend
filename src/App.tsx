import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import ConversationsPage from './pages/ConversationsPage';
import ChatConversationPage from './pages/ChatConversationPage';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PostsPage from './pages/PostsPage';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Profile routes */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:id" element={<ProfilePage />} />

      {/* Posts page */}
      <Route path="/posts" element={<PostsPage />} />

      {/* New separate pages for mobile-first experience */}
      <Route path="/conversations" element={<ConversationsPage />} />
      <Route path="/chat/:conversationId" element={<ChatConversationPage />} />

      {/* Legacy combined chat page (still works on desktop) */}
      <Route path="/chat" element={<ChatPage />} />

      {/* 404 Not Found - catch all routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
