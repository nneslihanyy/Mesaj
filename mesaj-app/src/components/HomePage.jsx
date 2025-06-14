import { Link } from 'react-router-dom';
import { FaComments, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="logo-section">
          <FaComments className="logo-icon" />
          <h1>MesajApp</h1>
          <p className="slogan">Güvenli ve hızlı mesajlaşma deneyimi</p>
        </div>
        
        <div className="auth-buttons">
          <Link to="/login" className="auth-button login-button">
            <FaSignInAlt className="button-icon" />
            <span>Giriş Yap</span>
          </Link>
          
          <Link to="/register" className="auth-button register-button">
            <FaUserPlus className="button-icon" />
            <span>Kayıt Ol</span>
          </Link>
        </div>
        
        <div className="features">
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Güvenli Mesajlaşma</h3>
            <p>Uçtan uca şifreleme ile mesajlarınız güvende.</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Hızlı İletişim</h3>
            <p>Anında mesajlaşma ile kesintisiz iletişim.</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🌐</div>
            <h3>Her Yerde Erişim</h3>
            <p>Tüm cihazlarınızdan erişim imkanı.</p>
          </div>
        </div>
        
        <footer className="home-footer">
          <p>© 2024 MesajApp. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  );
}

export default HomePage; 