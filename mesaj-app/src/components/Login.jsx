import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import '../styles/Auth.css';

function Login({ onAuthChange }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    
    // API hatasını temizle
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        await AuthService.login(formData);
        if (onAuthChange) {
          onAuthChange(true);
        }
        navigate('/chat');
      } catch (error) {
        setApiError(error.toString());
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Ana Sayfa
        </Link>
        
        <div className="auth-header">
          <h2>MesajApp'a Giriş Yap</h2>
          <p>Hesabınıza giriş yaparak mesajlaşmaya devam edin</p>
        </div>
        
        {apiError && (
          <div className="api-error-message">
            {apiError}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="E-posta adresiniz"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Şifreniz"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Beni hatırla</label>
            </div>
            <a href="#" className="forgot-password">Şifremi unuttum</a>
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              'Giriş Yapılıyor...'
            ) : (
              <>
                <FaSignInAlt className="button-icon" />
                Giriş Yap
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Hesabınız yok mu? <Link to="/register">Kayıt ol</Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 