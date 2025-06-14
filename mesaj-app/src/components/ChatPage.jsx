import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactList from './ContactList';
import MessageArea from './MessageArea';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';
import '../styles/ChatPage.css';

function ChatPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [userStatus, setUserStatus] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // WebSocket ve konuşmaları başlat
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // WebSocket bağlantısını kur
    MessageService
      .onConnect(() => {
        console.log('WebSocket bağlandı');
        fetchConversations();
      })
      .onDisconnect(() => {
        console.log('WebSocket bağlantısı kesildi');
      })
      .onError((error) => {
        console.error('WebSocket hatası:', error);
      })
      .onNewMessage(handleNewMessage)
      .onMessageRead(handleMessageRead)
      .onUserTyping(handleUserTyping)
      .onUserStatus(handleUserStatus)
      .connect();
    
    // Component temizliğinde WebSocket bağlantısını kapat
    return () => {
      MessageService.disconnect();
    };
  }, [navigate]);

  // Konuşmaları getir
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const conversationData = await MessageService.getConversations();
      
      const contactsData = conversationData.map(conversation => ({
        id: conversation.userId,
        name: conversation.name,
        avatar: `https://i.pravatar.cc/150?u=${conversation.userId}`,
        lastMessage: conversation.lastMessage,
        lastMessageDate: conversation.lastMessageDate,
        unread: conversation.unread || 0,
        online: userStatus[conversation.userId] === 'online',
      }));
      
      setContacts(contactsData);
      
      if (contactsData.length > 0 && !selectedContact) {
        setSelectedContact(contactsData[0]);
        fetchMessages(contactsData[0].id);
      }
    } catch (error) {
      console.error('Konuşmalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Belirli bir kullanıcı ile olan mesajları getir
  const fetchMessages = async (userId) => {
    try {
      const messageData = await MessageService.getConversation(userId);
      
      setMessages(prev => ({
        ...prev,
        [userId]: messageData.map(msg => ({
          id: msg._id,
          text: msg.text,
          sender: msg.sender === userId ? 'contact' : 'user',
          timestamp: formatMessageTimestamp(msg.createdAt),
          read: msg.read,
        })),
      }));
    } catch (error) {
      console.error(`${userId} ile olan mesajlar yüklenirken hata:`, error);
    }
  };

  // Yeni bir konuşma başlat
  const handleStartNewChat = async (user) => {
    // Kontrol et: bu kullanıcı zaten kontaklarımda mı?
    const existingContact = contacts.find(contact => contact.id === user._id);
    
    if (existingContact) {
      setSelectedContact(existingContact);
      if (!messages[existingContact.id]) {
        fetchMessages(existingContact.id);
      }
      return;
    }
    
    // Yeni bir kontak oluştur
    const newContact = {
      id: user._id,
      name: user.name,
      avatar: `https://i.pravatar.cc/150?u=${user._id}`,
      lastMessage: '',
      unread: 0,
      online: userStatus[user._id] === 'online',
    };
    
    // Kontak listesine ekle
    setContacts(prev => [newContact, ...prev]);
    
    // Yeni kontağı seç
    setSelectedContact(newContact);
    
    // Boş mesaj listesini oluştur
    setMessages(prev => ({
      ...prev,
      [user._id]: [],
    }));
  };

  // Zaman damgasını formatla
  const formatMessageTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      // Bugün
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      // Dün
      return 'Dün';
    } else {
      // Daha önce
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Yeni mesaj olayını işle
  const handleNewMessage = (message) => {
    const userId = message.senderId === AuthService.getCurrentUser().user.id ?
      message.receiverId : message.senderId;
    
    // Mesajlar listesini güncelle
    setMessages(prev => {
      const updatedMessages = { ...prev };
      
      if (!updatedMessages[userId]) {
        updatedMessages[userId] = [];
      }
      
      updatedMessages[userId].push({
        id: message.id,
        text: message.text,
        sender: message.senderId === AuthService.getCurrentUser().user.id ? 'user' : 'contact',
        timestamp: formatMessageTimestamp(message.createdAt),
        read: message.read,
      });
      
      return updatedMessages;
    });
    
    // Kişi listesini güncelle
    setContacts(prev => {
      const updatedContacts = [...prev];
      const contactIndex = updatedContacts.findIndex(c => c.id === userId);
      
      if (contactIndex !== -1) {
        const updatedContact = { ...updatedContacts[contactIndex] };
        updatedContact.lastMessage = message.text;
        updatedContact.lastMessageDate = message.createdAt;
        
        // Mesaj karşı taraftan geliyorsa ve seçili kişi değilse okunmamış sayısını artır
        if (message.senderId === userId && (!selectedContact || selectedContact.id !== userId)) {
          updatedContact.unread = (updatedContact.unread || 0) + 1;
        }
        
        updatedContacts[contactIndex] = updatedContact;
      } else {
        // Yeni kişi, henüz listede yok
        // Burada API'den kullanıcı bilgisini almak gerekebilir
      }
      
      return updatedContacts;
    });
  };

  // Mesaj okundu olayını işle
  const handleMessageRead = (data) => {
    setMessages(prev => {
      const allMessages = { ...prev };
      
      // Tüm konuşmaları kontrol et
      for (const userId in allMessages) {
        const messages = allMessages[userId];
        const messageIndex = messages.findIndex(msg => msg.id === data.messageId);
        
        if (messageIndex !== -1) {
          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            read: true,
          };
          
          allMessages[userId] = updatedMessages;
          break;
        }
      }
      
      return allMessages;
    });
  };

  // Kullanıcı yazıyor olayını işle
  const handleUserTyping = (data) => {
    if (data.isTyping) {
      setTypingStatus(prev => ({ ...prev, [data.userId]: true }));
      
      // 3 saniye sonra yazma durumunu temizle
      setTimeout(() => {
        setTypingStatus(prev => ({ ...prev, [data.userId]: false }));
      }, 3000);
    } else {
      setTypingStatus(prev => ({ ...prev, [data.userId]: false }));
    }
  };

  // Kullanıcı durum değişikliği olayını işle
  const handleUserStatus = (data) => {
    setUserStatus(prev => ({ ...prev, [data.userId]: data.status }));
    
    // Kişi listesini güncelle
    setContacts(prev => {
      return prev.map(contact => {
        if (contact.id === data.userId) {
          return { ...contact, online: data.status === 'online' };
        }
        return contact;
      });
    });
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    
    // Bu kişiye ait mesajlar henüz yüklenmemişse getir
    if (!messages[contact.id]) {
      fetchMessages(contact.id);
    }
    
    // Mesajları okundu olarak işaretle
    if (contact.unread > 0) {
      MessageService.markConversationAsRead(contact.id);
      
      // UI'da okunmamış sayısını sıfırla
      setContacts(contacts.map(c => {
        if (c.id === contact.id) {
          return { ...c, unread: 0 };
        }
        return c;
      }));
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedContact) return;
    
    try {
      // Mesajı WebSocket ile gönder (veya HTTP ile yedek seçenek)
      if (MessageService.isConnected) {
        await MessageService.sendMessage(selectedContact.id, text);
      } else {
        await MessageService.sendMessageHttp(selectedContact.id, text);
      }
      
      // UI'da yeni mesajı göster (WebSocket olayını beklemeden)
      // Bu, gerçek mesaj yerine geçici bir gösterim olabilir
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pending: true,
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), tempMessage],
      }));
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      // Hata durumunda kullanıcıya bildir
    }
  };

  const handleTyping = (isTyping) => {
    if (selectedContact) {
      MessageService.sendTypingStatus(selectedContact.id, isTyping);
    }
  };

  if (loading && contacts.length === 0) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="chat-page">
      <ContactList 
        contacts={contacts} 
        selectedContact={selectedContact} 
        onSelectContact={handleContactSelect}
        onStartNewChat={handleStartNewChat}
      />
      {selectedContact && (
        <MessageArea 
          contact={selectedContact}
          messages={messages[selectedContact.id] || []}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          isTyping={typingStatus[selectedContact.id]}
        />
      )}
    </div>
  );
}

export default ChatPage; 