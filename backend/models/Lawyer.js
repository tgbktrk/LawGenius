import mongoose from 'mongoose';

// Avukata ait temel kullanıcı kimliği
const LawyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Baro sicil numarası (harf ve rakam)
  licenseNumber: {
    type: String,
    required: [true, 'Lisans numarası zorunludur.'],
    minlength: 4,
    maxlength: 10,
    match: [/^[a-zA-Z0-9]+$/, 'Lisans numarası sadece harf ve rakam içerebilir.']
  },

  // Kayıtlı olduğu baro
  barAssociation: { type: String, required: true },

  // Uzmanlık alanları
  expertiseAreas: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'En az bir uzmanlık alanı seçilmelidir.'
    },
    required: true
  },

  // Deneyim yılı (0–60 arası, tam sayı)
  experienceYears: {
    type: Number,
    required: true,
    min: [0, 'Deneyim yılı negatif olamaz.'],
    max: [60, 'Deneyim yılı 60\'tan fazla olamaz.'],
    validate: {
      validator: Number.isInteger,
      message: 'Deneyim yılı tam sayı olmalıdır.'
    }
  },

  // Biyografi (50–1000 karakter arası)
  biography: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 1000
  },

  // Uygun olduğu günler (en az bir gün)
  availableDays: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'En az bir uygun gün seçilmelidir.'
    }
  },

  // Uygunluk başlangıç saati (HH:mm)
  availableStart: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Başlangıç saati "HH:mm" formatında olmalıdır.']
  },

  // Uygunluk bitiş saati (HH:mm)
  availableEnd: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Bitiş saati "HH:mm" formatında olmalıdır.']
  },

  // Şehir ve ilçe bilgisi
  location: {
    city: { type: String, required: true },
    district: { type: String, required: true }
  },

  // Ücret aralığı (örn: 1000-5000 TL)
  priceRange: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{1,7}-\d{1,7}( TL| ₺)?$/
      },
      message: 'Ücret aralığı "min-max" formatında olmalıdır. (örn: 1000-5000 TL)'
    }
  },

  // Konuştuğu diller (en az 1 dil)
  languages: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'En az bir dil seçilmelidir.'
    }
  },

  // Profil fotoğrafı (jpg/png formatında)
  profilePhoto: {
    type: String,
    required: true,
    match: /\.(jpg|jpeg|png)$/i
  },

  // Belgeler (en az 1, en fazla 5 dosya)
  documents: {
    type: [String],
    required: true,
    validate: {
      validator: function (docs) {
        return Array.isArray(docs) && docs.length >= 1 && docs.length <= 5 && docs.every(path => typeof path === 'string' && path.length > 0);
      },
      message: 'En az 1, en fazla 5 geçerli belge yüklemelisiniz.'
    }
  },

  // Admin onayı durumu
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

// Lawyer modelini oluştur ve dışa aktar
const Lawyer = mongoose.model('Lawyer', LawyerSchema);
export default Lawyer;