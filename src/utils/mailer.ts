import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // 465면 true, 587이면 false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject: "하루로그 이메일 인증",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>이메일 인증</h2>
        <p>아래 버튼을 눌러 이메일 인증을 완료해 주세요.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
            이메일 인증하기
          </a>
        </p>
        <p style="color:#666;font-size:12px;">요청하지 않았다면 이 메일을 무시해 주세요.</p>
      </div>
    `,
  });

  logger.info(`[MAIL] sent to=${to} messageId=${info.messageId}`);
}
