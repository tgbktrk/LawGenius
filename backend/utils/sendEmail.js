import nodemailer from 'nodemailer';

// Test amaçlı e-posta gönderimi yapar (önizleme URL’si döner)
export async function sendTestMail(to, subject, text) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host:   testAccount.smtp.host,
    port:   testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const info = await transporter.sendMail({
    from: '"LawGenius Admin" <no-reply@lawgenius.test>',
    to,
    subject,
    text
  });

  console.log('💌 Önizleme URL:', nodemailer.getTestMessageUrl(info));
}