import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Yükleme klasörü yoksa oluştur
const uploadDir = './uploads/lawyers';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Dosya türü filtreleme (fotoğraf ve belge için ayrı kontrol)
const fileFilter = (req, file, cb) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const documentTypes = ['application/pdf', ...imageTypes];

  if (file.fieldname === 'profilePhoto') {
    if (!imageTypes.includes(file.mimetype)) {
      return cb(new Error('Profil fotoğrafı sadece JPEG veya PNG formatında olmalıdır!'), false);
    }
  } else if (file.fieldname === 'documents') {
    if (!documentTypes.includes(file.mimetype)) {
      return cb(new Error('Belgeler sadece PDF, JPEG veya PNG formatında olmalıdır!'), false);
    }
  } else {
    return cb(new Error('Geçersiz dosya alanı!'), false);
  }

  cb(null, true);
};

// Disk üzerine dosya kaydetme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Yükleme dizini
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`; // Dosya ismini eşsizleştir
    cb(null, uniqueName);
  }
});

// Multer yapılandırması (5MB limit, filtre, depolama)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Maksimum 5MB
  }
});