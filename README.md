# LawGenius

LawGenius, bireyler ve küçük işletmeler için yapay zeka destekli bir hukuk danışmanlığı platformudur. Kullanıcılar, chatbot aracılığıyla hukuki sorularına hızlı yanıtlar alabilir, gerektiğinde gerçek avukatlarla birebir iletişim kurabilir.

---

## 📁 Proje Yapısı

```
FinalThesis/
├── backend/           # Node.js & FastAPI backend
├── frontend/          # Angular frontend
├── node_modules/
├── screenshots/       # Ekran görüntüleri
└── README.md
```

---

## 🚀 Özellikler

- 🤖 AI destekli hukuk danışmanı (OpenAI + Fine-tuned Türkçe hukuk modeli)
- 👥 Kullanıcılar ile avukatlar arasında özel mesajlaşma sistemi
- 🔐 JWT ile kimlik doğrulama ve rol tabanlı yetkilendirme
- 🌐 Çok dilli arayüz (Türkçe ve İngilizce)
- 📊 Chat geçmişi, konuşma yönetimi, avukat başvuru sistemi

---

## 📦 Kullanılan Teknolojiler

- **Frontend:** Angular, TypeScript
- **Backend:** Node.js (Express), FastAPI
- **Veritabanı:** MongoDB
- **AI:** OpenAI API, Mistral-7B (LoRA)
- **Kimlik Doğrulama:** JWT, Role-based Access Control

---

## 🛠️ Kurulum

### 1. Reponun klonlanması

```bash
git clone https://github.com/tgbktrk/LawGenius.git
cd LawGenius
```

### 2. Ortam dosyalarının hazırlanması

- `backend/.env` ve `frontend/.env` dosyalarını oluşturun
- İçerik için `backend/.env.example` ve `frontend/.env.example` şablonlarını kullanabilirsiniz

### 3. Frontend kurulumu

```bash
cd frontend
npm install
ng serve
```

### 4. Backend (Node.js) kurulumu

```bash
cd backend
npm install
node server.js
```

## 📷 Ekran Görüntüleri

## 👤 Kullanıcı Paneli Ekran Görüntüleri

### Ana Sayfa
![Ana Sayfa](screenshots/home.png)

### Kayıt Olma Ekranı
![Kayıt Olma](screenshots/register.png)

### Giriş Ekranı
![Giriş](screenshots/login.png)

### Şifre Sıfırlama – Adım 1: E-posta Girme
![Şifre Sıfırlama 1](screenshots/reset_password.png)

### Şifre Sıfırlama – Adım 2: Yeni Şifre Belirleme
![Şifre Sıfırlama 2](screenshots/reset_password_2.png)

### Profil Bilgileri Güncelleme
![Profil Düzenleme](screenshots/edit_profile.png)

### Onaylı Avukat Listesi (Hukuki Danışmanlık Sayfası)
![Avukat Listesi](screenshots/legal_advice.png)

### Avukat Filtreleme Özelliği
![Avukat Filtreleme](screenshots/legal_advice_filter.png)

### Avukat ile Mesajlaşma – Kullanıcı İlk Mesaj
![Avukatla Mesajlaşma](screenshots/chat_with_lawyer.png)

### Avukat Yanıtları – Görüşme Akışı
![Avukat Yanıtı](screenshots/chat_with_lawyer_2.png)

### Chatbot ile Yapay Zeka Destekli Danışmanlık
![Chatbot](screenshots/chat_with_bot.png)

### Kullanıcının Sohbet Geçmişi
![Chatbot Geçmişi](screenshots/chat_list_user.png)

### Sohbet Geçmişi – Chatbot
![Chatbot Sohbet Geçmişi](screenshots/chat_history_with_bot.png)

### Premium Üyelik Sayfası
![Premium](screenshots/premium.png)

### Çıkış Menüsü
![Çıkış Menüsü](screenshots/logout.png)

---

## ⚖️ Avukat Paneli Ekran Görüntüleri

### Avukat Başvuru Formu
![Avukat Başvuru Formu](screenshots/lawyer_apply.png)

### Avukat Mesaj Listesi
![Avukat Mesaj Listesi](screenshots/chat_list_lawyer.png)

---

## 🛠️ Admin Paneli Ekran Görüntüleri

### Onay Bekleyen Avukatlar
![Onay Bekleyen Avukatlar](screenshots/pending_lawyers.png)

### Avukat Başvuru Detayı
![Avukat Başvuru Detayı](screenshots/pending_lawyer_detail.png)

### Onaylı Avukatlar Listesi
![Onaylı Avukatlar](screenshots/lawyer_list.png)

### Avukat Detay Sayfası
![Avukat Detayı](screenshots/lawyer_detail.png)

### Kullanıcılar Listesi
![Kullanıcı Listesi](screenshots/user_list.png)

### Kullanıcı Detay Sayfası
![Kullanıcı Detayı](screenshots/user_detail.png)

---

## 📌 Notlar

- `.env` gibi gizli dosyalar `.gitignore` ile korunmaktadır
- AI özelliklerini kullanmak için OpenAI API anahtarınızı `.env` dosyasına girmeniz gereklidir
- Türkçe hukuk modeli ile çalışmak için LoRA ağırlıkları ayrıca yüklenmelidir
