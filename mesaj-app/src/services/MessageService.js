import { io } from 'socket.io-client';
import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:3000/api';

class MessageService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {
      onNewMessage: null,
      onUserTyping: null,
      onMessageRead: null,
      onUserStatus: null,
      onConnect: null,
      onDisconnect: null,
      onError: null,
    };
  }

  connect() {
    if (this.socket) {
      return;
    }

    const token = AuthService.getToken();
    if (!token) {
      if (this.callbacks.onError) {
        this.callbacks.onError('Bağlantı kurulamadı: Oturum açmanız gerekiyor');
      }
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: {
        token: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
  }

  setupListeners() {
    // Bağlantı durumu dinleyicileri
    this.socket.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu');
      this.isConnected = true;
      if (this.callbacks.onConnect) {
        this.callbacks.onConnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket bağlantısı kapandı: ${reason}`);
      this.isConnected = false;
      if (this.callbacks.onDisconnect) {
        this.callbacks.onDisconnect(reason);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket bağlantı hatası:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('Bağlantı hatası: ' + error.message);
      }
    });

    // Mesaj olayları
    this.socket.on('newMessage', (message) => {
      if (this.callbacks.onNewMessage) {
        this.callbacks.onNewMessage(message);
      }
    });

    this.socket.on('messageRead', (data) => {
      if (this.callbacks.onMessageRead) {
        this.callbacks.onMessageRead(data);
      }
    });

    this.socket.on('userTyping', (data) => {
      if (this.callbacks.onUserTyping) {
        this.callbacks.onUserTyping(data);
      }
    });

    this.socket.on('userStatus', (data) => {
      if (this.callbacks.onUserStatus) {
        this.callbacks.onUserStatus(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // WebSocket olayları için callback fonksiyonları ayarlar
  onNewMessage(callback) {
    this.callbacks.onNewMessage = callback;
    return this;
  }

  onUserTyping(callback) {
    this.callbacks.onUserTyping = callback;
    return this;
  }

  onMessageRead(callback) {
    this.callbacks.onMessageRead = callback;
    return this;
  }

  onUserStatus(callback) {
    this.callbacks.onUserStatus = callback;
    return this;
  }

  onConnect(callback) {
    this.callbacks.onConnect = callback;
    return this;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
    return this;
  }

  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }

  // WebSocket üzerinden mesaj gönderme
  sendMessage(receiverId, text) {
    if (!this.isConnected) {
      if (this.callbacks.onError) {
        this.callbacks.onError('Mesaj gönderilemedi: Bağlantı yok');
      }
      return Promise.reject(new Error('WebSocket bağlantısı yok'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('sendMessage', { receiverId, text }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Mesaj gönderme hatası'));
        }
      });
    });
  }

  // WebSocket üzerinden mesajı okundu olarak işaretleme
  markAsRead(messageId) {
    if (!this.isConnected) {
      return Promise.reject(new Error('WebSocket bağlantısı yok'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('markAsRead', { messageId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Mesaj işaretleme hatası'));
        }
      });
    });
  }

  // WebSocket üzerinden yazma durumunu gönderme
  sendTypingStatus(receiverId, isTyping) {
    if (!this.isConnected) return;

    this.socket.emit('typing', { receiverId, isTyping });
  }

  // HTTP ile konuşmaları getirme
  async getConversations() {
    const response = await axios.get(`${API_URL}/messages/conversations`, {
      headers: { Authorization: `Bearer ${AuthService.getToken()}` },
    });
    return response.data;
  }

  // HTTP ile belirli bir kullanıcı ile olan mesajları getirme
  async getConversation(userId) {
    const response = await axios.get(`${API_URL}/messages/conversation/${userId}`, {
      headers: { Authorization: `Bearer ${AuthService.getToken()}` },
    });
    return response.data;
  }

  // HTTP ile mesaj gönderme (WebSocket bağlantısı yoksa)
  async sendMessageHttp(receiverId, text) {
    const response = await axios.post(
      `${API_URL}/messages`,
      { receiverId, text },
      {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` },
      }
    );
    return response.data;
  }
}

// Singleton instance
const messageService = new MessageService();
export default messageService; 