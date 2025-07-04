// Gerekli modüller
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Lawyer from '../models/Lawyer.js';

// Yeni kullanıcı kaydı
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, birthDate, gender } = req.body;

    // E-posta daha önce kullanılmış mı kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Şifre hash'leniyor
    const hashed = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluşturuluyor ve veritabanına kaydediliyor
    const user = new User({ name, email, password: hashed, role, phone, birthDate, gender });
    await user.save();

    // JWT token oluşturuluyor
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Yanıt olarak token ve kullanıcı bilgileri dönülüyor
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        role: user.role,
        isPremium: user.isPremium,
        openAiUsedThisMonth: user.openAiUsedThisMonth,
        openAiQuota: user.openAiQuota,
        isApproved: user.isApproved
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Kullanıcı girişi
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı veritabanında aranıyor
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Şifre doğrulaması
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Avukat ise onay kontrolü yapılır
    if (user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: user._id });
      if (!lawyer || !lawyer.isApproved) {
        return res.status(403).json({ message: 'Hesabınız henüz onaylanmadı. Lütfen admin onayını bekleyin.' });
      }
    }

    // JWT token oluşturuluyor
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Yanıt olarak token ve kullanıcı bilgileri dönülüyor
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        role: user.role,
        isPremium: user.isPremium,
        openAiUsedThisMonth: user.openAiUsedThisMonth,
        openAiQuota: user.openAiQuota,
        isApproved: user.isApproved
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// E-posta adresi sistemde kayıtlı mı kontrolü
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User exists' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Şifre sıfırlama
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Kullanıcı bulunuyor
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'email_not_found' });
    }

    // Yeni şifre eskiyle aynı mı kontrolü
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({ message: 'same_as_old_password' });
    }

    // Şifre güncelleniyor
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'reset_success' });
  } catch (err) {
    console.error('[resetPassword ERROR]', err);
    return res.status(500).json({ message: 'server_error' });
  }
};

// Kullanıcının kendi hesabını silmesi
export const deleteOwnAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Avukatsa önce avukat kaydı silinir
    if (req.user.role === 'lawyer') {
      await Lawyer.deleteOne({ userId });
    }

    // Kullanıcı kaydı silinir
    await User.findByIdAndDelete(userId);
    return res.json({ message: 'Hesabınız başarıyla silindi.' });
  } catch (err) {
    console.error('[deleteOwnAccount ERROR]', err);
    return res.status(500).json({ error: 'Sunucu hatası. Hesap silinemedi.' });
  }
};

// Kullanıcıyı premium yap
export const upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    user.isPremium = true;
    await user.save();

    return res.json({ message: 'Premium’a yükseltildiniz.', isPremium: true });
  } catch (err) {
    console.error('[upgradeToPremium ERROR]', err);
    return res.status(500).json({ message: 'Sunucu hatası. Premium’a geçilemedi.' });
  }
};