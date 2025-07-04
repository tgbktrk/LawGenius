// Ortam değişkenlerini yükler
import dotenv from 'dotenv';
dotenv.config();

// Gerekli modüller
import { OpenAI } from 'openai';
import axios from 'axios';
import { franc } from 'franc';
import User from '../models/User.js';
import Message from '../models/Message.js';

// OpenAI ve Mistral API yapılandırması
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MISTRAL_URL = process.env.MISTRAL_API_URL;

// Soru-cevap isteğini yöneten ana fonksiyon
export const handleAsk = async (req, res) => {
  const { question, country, model = 'openai', conversationId = null } = req.body;
  const lowerModel = model.toLowerCase();

  // Soru ve ülke bilgisi zorunlu
  if (!question || !country) {
    return res.status(400).json({ error: 'chat.errors.missing_params' });
  }

  // 1) Kullanıcı kimliği ve kota kontrolü
  const userId = req.user?.id;
  let isPremium = false;
  let usedThisMonth = 0;
  const FREE_QUOTA = parseInt(process.env.FREE_QUOTA) || 100;

  if (userId) {
    const u = await User.findById(userId);
    if (u) {
      isPremium = !!u.isPremium;
      usedThisMonth = u.openAiUsedThisMonth || 0;
    }
  }

  // 2) Sorunun hukuki olup olmadığını kontrol et
  let verdict = 'yes';
  try {
    const check = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Classify as "yes" or "no".' },
        { role: 'user', content: `Law-related? Answer "yes"/"no": "${question}"` }
      ],
      temperature: 0
    });
    verdict = check.choices[0].message.content
      .trim()
      .toLowerCase()
      .split(/[^a-z]+/)[0] || 'yes';
  } catch {
    verdict = 'yes'; // Hata durumunda varsayılan olarak evet kabul et
  }

  if (verdict !== 'yes') {
    return res.status(403).json({ error: 'chat.errors.only_legal' });
  }

  // 3) Sistem prompt’u oluştur
  const systemPrompt = country === 'TR'
    ? `Sen bir Türk hukuk uzmanısın. Cevabı Türkçe ver: ${question}`
    : `You are a legal expert. Answer in user's language: ${question}`;

  // 4.a) Mistral AI ile yanıt oluşturma
  if (lowerModel === 'mistralai') {
    try {
      const { data } = await axios.post(
        `${MISTRAL_URL}/ask`,
        { messages: [ question ] },
        { timeout: 200000 }
      );

      // Mesaj veritabanına kaydedilir
      if (userId && conversationId) {
        await Message.create({
          conversationId,
          senderId: userId,
          senderRole: 'Chatbot',
          content: data.answer,
          modelUsed: 'mistralai'
        });
      }

      return res.json({ reply: data.answer });
    } catch (err) {
      console.error("🔴 Mistral API hatası:", {
        status: err.response?.status,
        body: err.response?.data,
        msg: err.message
      });
      return res.status(500).json({ error: 'chat.errors.server_unreachable' });
    }
  }

  // 4.b) OpenAI ile yanıt oluşturma
  if (lowerModel === 'openai') {
    if (!userId) {
      return res.status(403).json({ error: 'chat.errors.login_required' });
    }

    // Kota kontrolü (premium değilse)
    if (!isPremium && usedThisMonth >= FREE_QUOTA) {
      return res.status(429).json({ error: 'chat.errors.limit_exhausted' });
    }

    // Kullanım sayısı artırılır
    if (!isPremium) {
      await User.findByIdAndUpdate(userId, { $inc: { openAiUsedThisMonth: 1 } });
    }

    try {
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7
      });

      const replyText = resp.choices[0].message.content;

      // Mesaj kaydedilir
      await Message.create({
        conversationId,
        senderId: userId,
        senderRole: 'Chatbot',
        content: replyText,
        modelUsed: 'openai'
      });

      return res.json({ reply: replyText });
    } catch {
      return res.status(500).json({ error: 'chat.errors.server_unreachable' });
    }
  }

  // 5) Geçersiz model durumu
  return res.status(400).json({ error: 'chat.errors.invalid_model' });
};