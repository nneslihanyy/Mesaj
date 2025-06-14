import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import UserService from '../services/UserService';
import '../styles/ContactList.css';

function ContactList({ contacts, selectedContact, onSelectContact, onStartNewChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kişileri arama
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kullanıcı arama
  useEffect(() => {
    if (isSearchingUsers && searchQuery.length >= 2) {
      clearTimeout(searchTimeout);
      
      const timeoutId = setTimeout(async () => {
        setLoading(true);
        try {
          const users = await UserService.searchUsers(searchQuery);
          setSearchResults(users);
        } catch (error) {
          console.error('Kullanıcı arama hatası:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
      
      setSearchTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
    
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchQuery, isSearchingUsers]);

  const handleSearchModeChange = () => {
    setIsSearchingUsers(!isSearchingUsers);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleStartChat = (user) => {
    onStartNewChat(user);
    setIsSearchingUsers(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h2>Mesajlar</h2>
        <button 
          className="new-chat-button" 
          onClick={handleSearchModeChange}
          title={isSearchingUsers ? "Mesajlarıma Dön" : "Yeni Konuşma"}
        >
          {isSearchingUsers ? <FaTimes /> : <FaPlus />}
        </button>
      </div>

      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder={isSearchingUsers ? "Kullanıcı ara..." : "Kişi ara..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="contacts">
        {isSearchingUsers ? (
          // Kullanıcı arama sonuçları
          <>
            {loading && <div className="search-status">Aranıyor...</div>}
            
            {!loading && searchQuery.length < 2 && (
              <div className="search-status">
                En az 2 karakter girin
              </div>
            )}
            
            {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="search-status">
                Kullanıcı bulunamadı
              </div>
            )}
            
            {searchResults.map(user => (
              <div
                key={user._id}
                className="contact user-search-result"
                onClick={() => handleStartChat(user)}
              >
                <div className="contact-avatar">
                  <img 
                    src={`https://i.pravatar.cc/150?u=${user._id}`} 
                    alt={user.name} 
                    className="avatar" 
                  />
                </div>
                <div className="contact-info">
                  <div className="contact-name-time">
                    <h3>{user.name}</h3>
                  </div>
                  <div className="last-message-container">
                    <p className="last-message">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Normal konuşma listesi
          <>
            {filteredContacts.length === 0 ? (
              <div className="no-contacts">
                {contacts.length === 0 
                  ? "Henüz hiç konuşmanız yok"
                  : "Arama kriterine uygun kişi bulunamadı"}
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={`contact ${selectedContact && selectedContact.id === contact.id ? 'selected' : ''}`}
                  onClick={() => onSelectContact(contact)}
                >
                  <div className="contact-avatar">
                    <img src={contact.avatar} alt={contact.name} className="avatar" />
                    <span className={`status-indicator ${contact.online ? 'online' : ''}`}></span>
                  </div>
                  <div className="contact-info">
                    <div className="contact-name-time">
                      <h3>{contact.name}</h3>
                      {contact.lastMessageDate && (
                        <span className="time">{formatTime(contact.lastMessageDate)}</span>
                      )}
                    </div>
                    <div className="last-message-container">
                      <p className="last-message">
                        {contact.lastMessage || "Henüz mesaj yok"}
                      </p>
                      {contact.unread > 0 && (
                        <span className="unread-count">{contact.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  // Bugün ise saat göster
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Bir hafta içindeyse gün adı göster
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    return date.toLocaleDateString('tr-TR', { weekday: 'short' });
  }
  
  // Daha önceyse tarih göster
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default ContactList; 