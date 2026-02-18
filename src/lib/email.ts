'use server';
import nodemailer from 'nodemailer';

// 从环境变量读取配置
const QQ_EMAIL = process.env.QQ_EMAIL; // QQ邮箱
const QQ_EMAIL_AUTH_CODE = process.env.QQ_EMAIL_AUTH_CODE; // QQ邮箱SMTP授权码

// 校验环境变量
if (!QQ_EMAIL || !QQ_EMAIL_AUTH_CODE) {
  throw new Error('请配置QQ邮箱环境变量：QQ_EMAIL和QQ_EMAIL_AUTH_CODE');
}

// 创建QQ邮箱发送器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true, // 开启SSL
    auth: {
      user: QQ_EMAIL,
      pass: QQ_EMAIL_AUTH_CODE,
    },
  });
};

// 发送注册验证码邮件
export async function sendRegisterVerifyEmail(toEmail: string, username: string, code: string) {
  const transporter = createTransporter();
  
  // 自定义邮件
  const emailContent = {
    from: `"你的网站名称" <${QQ_EMAIL}>`,
    to: toEmail,
    subject: '【注册验证码】你的验证码已生成',
    html: `
      <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <h3>亲爱的 ${username}，你好！</h3>
        <p>你正在进行注册操作，本次验证码为：</p>
        <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #165DFF; text-align: center;">${code}</div>
        <p>验证码有效期5分钟，请及时使用，请勿泄露给他人！</p>
        <p>如果非你本人操作，请忽略此邮件。</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(emailContent);
    return { success: true };
  } catch (error) {
    console.error('QQ邮箱发送验证码失败：', error);
    return { success: false, error: (error as Error).message };
  }
}