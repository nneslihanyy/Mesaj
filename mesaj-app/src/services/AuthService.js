import axios from 'axios';

// Dinamik port değerine göre API URL'ini ayarla
const API_URL = 'http://localhost:3000/api';

const AuthService = {
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Kayıt işlemi sırasında bir hata oluştu';
    }
  },

  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.access_token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Giriş sırasında bir hata oluştu';
    }
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  getToken() {
    const user = this.getCurrentUser();
    return user?.access_token;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
  
  checkTokenExpiration() {
    const user = this.getCurrentUser();
    if (!user) return;
    
    // JWT'nin geçerlilik süresini kontrol et
    // Normalde bir JWT'nin exp claim'i olur, ama basit bir yaklaşım olarak
    // user verisindeki bir zaman damgasına bakabiliriz
    
    // Örnek olarak, user nesnesinde bir expiresAt değeri olduğunu varsayalım
    // Eğer böyle bir değer yoksa, şimdilik basit bir kontrol yapıyoruz
    
    try {
      // JWT token'ını decode et ve expiration süresini kontrol et
      // Bu basit bir yaklaşım, gerçek uygulamada daha güvenli bir yöntem kullanılmalı
      const token = this.getToken();
      if (!token) return;
      
      // JWT'nin süresinin dolup dolmadığını kontrol et
      // Süre dolduysa kullanıcıyı çıkış yaptır
      if (this.isTokenExpired(token)) {
        console.log('Token süresi dolmuş, çıkış yapılıyor...');
        this.logout();
      }
    } catch (error) {
      console.error('Token kontrolü sırasında hata:', error);
      // Hata durumunda güvenli tarafta olmak için logout yap
      this.logout();
    }
  },
  
  isTokenExpired(token) {
    try {
      // JWT tokeninin payload kısmını çıkar
      // Bu basit bir kontrol, gerçek uygulamada daha güvenli bir yöntem kullanılmalı
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { exp } = JSON.parse(jsonPayload);
      
      // Eğer exp değeri varsa, şu anki zaman ile karşılaştır
      if (exp) {
        // exp saniye cinsinden, Date.now() milisaniye cinsinden
        return Date.now() >= exp * 1000;
      }
      
      return false;
    } catch (e) {
      console.error('Token kontrolü sırasında hata:', e);
      // Hata durumunda, güvenli tarafta olalım ve token'ın süresinin dolduğunu varsayalım
      return true;
    }
  }
};

export default AuthService; 