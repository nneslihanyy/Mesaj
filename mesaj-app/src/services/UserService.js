import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:3000/api';

class UserService {
  async searchUsers(query) {
    try {
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${AuthService.getToken()}` },
      });
      return response.data;
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      throw error;
    }
  }
  
  async getUserById(userId) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` },
      });
      return response.data;
    } catch (error) {
      console.error('Kullanıcı bilgisi getirme hatası:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService; 