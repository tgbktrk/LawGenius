import mongoose from 'mongoose';
const { Schema } = mongoose;

// Kullanıcı şeması tanımı
const UserSchema = new Schema({
  // Kullanıcının adı
  name: {
    type: String,
    required: true,
  },
  // E-posta adresi (benzersiz)
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Telefon numarası (isteğe bağlı)
  phone: {
    type: String,
  },
  // Doğum tarihi
  birthDate: {
    type: Date,
  },
  // Cinsiyet: 'male' veya 'female', Türkçe girişler normalize edilir
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
    set: v => {
      if (v === 'Kadın') return 'female';
      if (v === 'Erkek') return 'male';
      return v;
    }
  },
  // Şifre (bcrypt ile hashlenmiş)
  password: {
    type: String,
    required: true,
  },
  // Rol: 'user', 'lawyer' veya 'admin'
  role: {
    type: String,
    enum: ['user', 'lawyer', 'admin'],
    default: 'user',
  },
  // Premium üyelik bilgisi
  isPremium: {
    type: Boolean,
    default: false,
  },
  // Bu ay OpenAI kullanım sayısı
  openAiUsedThisMonth: {
    type: Number,
    default: 0,
  },
  // Kullanıcının OpenAI aylık kotası
  openAiQuota: {
    type: Number,
    default: 100,
  },
  // Soft delete durumu
  isDeleted: {
    type: Boolean,
    default: false,
  },
  // Silinme tarihi
  deletedAt: {
    type: Date,
  }
}, {
  timestamps: true // createdAt ve updatedAt otomatik olarak eklenir
});

// Sanal alan: silinen kullanıcı/avukat için görünüm adı
UserSchema.virtual('displayName').get(function() {
  if (this.isDeleted) {
    return this.role === 'lawyer'
      ? 'Silinmiş Avukat'
      : 'Silinmiş Kullanıcı';
  }
  return this.name;
});

// JSON çıktısında virtual alanları da dahil et
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Modeli dışa aktar
export default mongoose.model('User', UserSchema);