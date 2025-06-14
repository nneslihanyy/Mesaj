# 📩 Mesajlaşma Uygulaması

Gerçek zamanlı iletişim sağlayan WebSocket tabanlı bir mesajlaşma uygulamasıdır. Backend tarafı **NestJS**, frontend tarafı ise **React** ve **Vite** ile geliştirilmiştir. Kullanıcı kimlik doğrulaması JWT ile sağlanmakta olup, mesajlar WebSocket üzerinden canlı olarak iletilmektedir.

## 🚀 Özellikler

- ✅ JWT ile kullanıcı kimlik doğrulama
- 📦 Mongoose (MongoDB) ile veri yönetimi
- 🔌 WebSocket (Socket.IO) ile gerçek zamanlı mesajlaşma
- 👤 Kullanıcı kayıt / giriş işlemleri
- 💬 Gerçek zamanlı sohbet arayüzü (React)
- ⚡ Vite ile hızlı geliştirme deneyimi

---

## 📁 Proje Yapısı

```bash
.
├── mesaj-api/     # NestJS backend
├── mesaj-app/     # React frontend
🛠️ Kurulum
1. Backend (NestJS)
cd mesaj-api
npm install
Ortam Değişkenleri (.env)
.env dosyası oluşturun ve aşağıdaki gibi yapılandırın:
MONGO_URI=mongodb://localhost:27017/mesaj-db
JWT_SECRET=supersecretkey
PORT=5000

Başlatma
# Geliştirme
npm run start:dev

# Derlenmiş haliyle başlatmak için
npm run build
npm run start:prod

2. Frontend (React + Vite)
cd mesaj-app
npm install

Ortam Değişkenleri
.env dosyası oluşturun ve aşağıdaki gibi tanımlayın:
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

Başlatma
# Geliştirme
npm run dev

# Üretim için
npm run build
npm run preview
```
📦 Kullanılan Teknolojiler
Backend:
NestJS
MongoDB + Mongoose
Passport + JWT
Socket.IO

Frontend:
React 19
React Router v7
Socket.IO Client
Axios
Vite


✅ Çalışma Prensibi
Kullanıcı kayıt olur / giriş yapar → JWT alınır.

React frontend, bu JWT ile WebSocket bağlantısı kurar.

Gerçek zamanlı mesajlar, Socket.IO üzerinden iletilir.

Mesajlar hem frontend'de görüntülenir hem de backend'de MongoDB'ye kaydedilir.

🧪 Test
NestJS tarafında birim testler Jest ile yazılmıştır:
npm run test

📝 Lisans
Bu proje UNLICENSED lisansı ile yayınlanmıştır. Kişisel veya eğitim amaçlı kullanabilirsiniz.

✨ Katkıda Bulunmak
Pull request'ler veya öneriler her zaman memnuniyetle karşılanır! 🎉











