import User from '../models/User.js';
import Lawyer from '../models/Lawyer.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendTestMail } from '../utils/sendEmail.js';

// Mevcut kullanıcıdan avukat başvurusu oluşturur
export const registerLawyer = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      licenseNumber, barAssociation, expertiseAreas, experienceYears,
      biography, availableDays, availableStart, availableEnd,
      city, district, priceRange, languages
    } = req.body;

    const duplicate = await Lawyer.findOne({ licenseNumber });
    if (duplicate) {
      return res.status(400).json({ message: 'Bu lisans numarasıyla zaten bir başvuru yapılmış.' });
    }

    const existing = await Lawyer.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: 'Zaten başvuru yapmışsınız.' });
    }

    const normalizedAvailableDays = Array.isArray(availableDays) ? availableDays : [availableDays];

    const profilePhoto = req.files['profilePhoto']?.[0]?.path || null;
    const documents = req.files['documents']?.map(f => f.path) || [];

    const parsedExpertise = typeof expertiseAreas === 'string' ? JSON.parse(expertiseAreas) : expertiseAreas;
    const parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;

    const lawyer = new Lawyer({
      userId,
      licenseNumber,
      barAssociation,
      expertiseAreas: parsedExpertise,
      experienceYears,
      biography,
      availableDays: normalizedAvailableDays,
      availableStart,
      availableEnd,
      location: { city, district },
      priceRange,
      profilePhoto,
      documents,
      languages: parsedLanguages,
      isApproved: false
    });

    await lawyer.save();
    res.status(201).json({ message: 'Başvuru alındı, onay bekleniyor.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Avukat başvurusunu onaylar ve e-posta gönderir
export const approveLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.lawyerId;
    const lawyer = await Lawyer.findById(lawyerId).populate('userId', 'name email');
    if (!lawyer) {
      return res.status(404).json({ message: 'Avukat bulunamadı.' });
    }

    lawyer.isApproved = true;
    await lawyer.save();

    await sendTestMail(
      lawyer.userId.email,
      'Avukat Başvurunuz Onaylandı',
      `Sayın ${lawyer.userId.name}, başvurunuz onaylandı. Artık avukat olarak giriş yapabilirsiniz.`
    );

    res.status(200).json({ message: 'Avukat başarıyla onaylandı.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Avukat başvurusunu reddeder ve kullanıcı rolünü geri alır
export const rejectLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.lawyerId;
    const lawyer = await Lawyer.findById(lawyerId).populate('userId', 'name email role');
    if (!lawyer) {
      return res.status(404).json({ message: 'Avukat bulunamadı.' });
    }

    lawyer.userId.role = 'user';
    await lawyer.userId.save();
    await Lawyer.findByIdAndDelete(lawyerId);

    await sendTestMail(
      lawyer.userId.email,
      'Avukat Başvurunuz Reddedildi',
      `Sayın ${lawyer.userId.name}, maalesef başvurunuz reddedildi. Lütfen bilgilerinizi gözden geçirin.`
    );

    res.status(200).json({ message: 'Avukat reddedildi ve rolü kullanıcı olarak güncellendi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Kayıt + başvuru tek seferde yapılır (tam avukat kaydı)
export const fullRegisterLawyer = async (req, res) => {
  try {
    const {
      name, email, password, phone, birthDate, gender,
      licenseNumber, barAssociation, expertiseAreas, experienceYears,
      biography, availableDays, availableStart, availableEnd,
      city, district, priceRange, languages
    } = req.body;

    const existingUser = await User.findOne({ email });
    let user;

    if (existingUser) {
      const existingLawyer = await Lawyer.findOne({ userId: existingUser._id });
      if (existingLawyer) {
        return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
      }

      existingUser.role = 'lawyer';
      await existingUser.save();
      user = existingUser;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        birthDate,
        gender,
        role: 'lawyer'
      });
    }

    const normalizedAvailableDays = Array.isArray(availableDays) ? availableDays : [availableDays];
    const profilePhoto = req.files['profilePhoto']?.[0]?.path || null;
    const documents = req.files['documents']?.map(f => f.path) || [];

    const parsedExpertise = typeof expertiseAreas === 'string' ? JSON.parse(expertiseAreas) : expertiseAreas;
    const parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;

    const lawyer = new Lawyer({
      userId: user._id,
      licenseNumber,
      barAssociation,
      expertiseAreas: parsedExpertise,
      experienceYears,
      biography,
      availableDays: normalizedAvailableDays,
      availableStart,
      availableEnd,
      location: { city, district },
      priceRange,
      documents,
      profilePhoto,
      languages: parsedLanguages,
      isApproved: false
    });

    await lawyer.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Kayıt başarılı, onay bekleniyor.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Onay bekleyen avukatları listeler
export const getPendingLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ isApproved: false }).populate('userId', 'name email phone birthDate gender role');
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Onaylanmış avukatları listeler
export const getApprovedLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ isApproved: true }).populate('userId', 'name email phone birthDate gender role');
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Avukat ID'sine göre bilgilerini getirir
export const getLawyerById = async (req, res) => {
  try {
    const lawyerId = req.params.lawyerId;
    const lawyer = await Lawyer.findById(lawyerId).populate('userId', 'name email phone birthDate gender role');
    if (!lawyer) {
      return res.status(404).json({ message: 'Avukat bulunamadı.' });
    }
    res.status(200).json(lawyer);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Herkese açık şekilde onaylı avukatları döner
export const getApprovedLawyersPublic = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ isApproved: true }).populate('userId', 'name email phone birthDate gender role');
    res.status(200).json(lawyers);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Giriş yapan avukatın profilini döner
export const getLawyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ userId }).populate('userId', 'name email phone birthDate gender role');
    if (!lawyer) {
      return res.status(404).json({ message: 'Avukat profili bulunamadı' });
    }
    res.status(200).json(lawyer);
  } catch (error) {
    console.error('Avukat profili alınamadı:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Avukat profilini günceller
export const updateLawyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ userId });
    if (!lawyer) {
      return res.status(404).json({ message: 'Avukat profili bulunamadı.' });
    }

    const {
      licenseNumber, barAssociation, expertiseAreas, experienceYears,
      biography, availableDays, availableStart, availableEnd,
      city, district, priceRange, languages 
    } = req.body;

    if (licenseNumber) lawyer.licenseNumber = licenseNumber;
    if (barAssociation) lawyer.barAssociation = barAssociation;
    if (expertiseAreas) lawyer.expertiseAreas = expertiseAreas;
    if (experienceYears) lawyer.experienceYears = experienceYears;
    if (biography) lawyer.biography = biography;
    if (availableDays) lawyer.availableDays = availableDays;
    if (availableStart) lawyer.availableStart = availableStart;
    if (availableEnd) lawyer.availableEnd = availableEnd;
    if (city) lawyer.location.city = city;
    if (district) lawyer.location.district = district;
    if (priceRange) lawyer.priceRange = priceRange;
    if (languages) lawyer.languages = languages;

    const updated = await lawyer.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error('Avukat güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Avukatı ve ilişkili user rolünü siler
export const deleteLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.lawyerId;
    const lawyer = await Lawyer.findById(lawyerId).populate('userId', 'role');
    if (!lawyer) {
      return res.status(404).json({ message: 'Avukat bulunamadı.' });
    }

    lawyer.userId.role = 'user';
    await lawyer.userId.save();
    await Lawyer.findByIdAndDelete(lawyerId);

    res.status(200).json({ message: 'Avukat başarıyla silindi ve rolü user olarak değiştirildi.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};