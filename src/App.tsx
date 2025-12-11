import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<ChatPage />} />

      {/* 404 Not Found - catch all routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
