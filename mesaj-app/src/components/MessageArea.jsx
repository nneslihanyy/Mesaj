import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';
import '../styles/MessageArea.css';

function MessageArea({ contact, messages, onSendMessage, onTyping, isTyping }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      // Yazma durumunu iptal et
      handleTypingStop();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Yazma durumunu gönder
    if (!typingTimerRef.current) {
      onTyping(true);
    }
    
    // Yazma zamanlayıcısını sıfırla
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(handleTypingStop, 1000);
  };
  
  const handleTypingStop = () => {
    onTyping(false);
    typingTimerRef.current = null;
  };

  return (
    <div className="message-area">
      <div className="message-header">
        <div className="contact-info">
          <img src={contact.avatar} alt={contact.name} className="avatar" />
          <div>
            <h3>{contact.name}</h3>
            <span className={`status ${contact.online ? 'online' : 'offline'}`}>
              {contact.online ? 'Çevrimiçi' : 'Çevrimdışı'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">
              {msg.text}
              <span className="message-timestamp">{msg.timestamp}</span>
              {msg.sender === 'user' && (
                <span className="message-status">
                  {msg.pending ? (
                    <i className="status-icon pending">⏱</i>
                  ) : msg.read ? (
                    <i className="status-icon read">✓✓</i>
                  ) : (
                    <i className="status-icon delivered">✓</i>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Yazıyor göstergesi */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="message-input">
        <button type="button" className="attachment-btn">
          <FaPaperclip />
        </button>
        
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={message}
          onChange={handleChange}
        />
        
        <button type="button" className="emoji-btn">
          <FaSmile />
        </button>
        
        <button 
          type="submit" 
          className="send-btn"
          disabled={!message.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default MessageArea; 