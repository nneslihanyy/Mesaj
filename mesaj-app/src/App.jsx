import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import ChatPage from './components/ChatPage';
import AuthService from './services/AuthService';
import './App.css';

// Özel route component
function PrivateRoute({ element }) {
  if (!AuthService.isAuthenticated()) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }
  
  // Kullanıcı giriş yapmışsa istenilen sayfayı göster
  return element;
}

function App() {
  useEffect(() => {
    // Token kontrolü
    AuthService.checkTokenExpiration();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<PrivateRoute element={<ChatPage />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
