//Güncel server.js (ESM, dotenv, modüler yapı)

import dotenv from 'dotenv';
dotenv.config(); // .env dosyasını yükle

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Route dosyalarını içe aktar
import authRoutes         from './routes/authRoutes.js';
import aiRoutes           from './routes/aiRoutes.js';
import lawyerRoutes       from './routes/lawyerRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

const app = express();

// —————————————————————————————————
//  Middleware tanımları
// —————————————————————————————————
app.use(cors({
  origin: true,
  methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// —————————————————————————————————
//  Route tanımlamaları
// —————————————————————————————————
app.use('/api/auth',     authRoutes);
app.use('/api',          aiRoutes);             // Örn: /api/ask
app.use('/api/lawyers',  lawyerRoutes);
app.use('/api/users',    userRoutes);
app.use('/api',          conversationRoutes);

// —————————————————————————————————
//  MongoDB bağlantısı
// —————————————————————————————————
mongoose.connect('mongodb://localhost:27017/LawGeniusDB')
  .then(()  => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// —————————————————————————————————
//  Sunucuyu başlat
// —————————————————————————————————
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});