import User from '../models/User.js';

// Sistemdeki tüm kullanıcıları (sadece 'user' rolünde olanları) getirir
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password'); // şifre hariç tüm bilgileri getir
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Belirli bir kullanıcıyı ID üzerinden getirir
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Giriş yapan kullanıcının profil bilgilerini günceller
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, birthDate, gender } = req.body;

    const updateFields = { name, email, phone, gender }; // sadece gelen alanları al

    if (birthDate !== undefined) {
      updateFields.birthDate = new Date(birthDate); // tarih formatına çevir
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true } // yeni veriyi döndür, validasyonları çalıştır
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Kullanıcı güncellenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// ID ile kullanıcıyı tamamen siler
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};