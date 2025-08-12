import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

interface VerificationEmailData {
	email: string;
	verificationToken: string;
	userFirstName?: string;
}

export class EmailService {
	private transporter: nodemailer.Transporter;
	private frontendUrl: string;

	constructor() {
		// Настройка SMTP (используйте ваш провайдер)
		const emailConfig: EmailConfig = {
			host: process.env.SMTP_HOST || "smtp.gmail.com",
			port: parseInt(process.env.SMTP_PORT || "587"),
			secure: false, // true для 465, false для других портов
			auth: {
				user: process.env.SMTP_USER || "",
				pass: process.env.SMTP_PASS || "", // Для Gmail используйте App Password
			},
		};

		this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
		this.transporter = nodemailer.createTransport(emailConfig);
	}

	/**
	 * Генерирует уникальный токен верификации
	 */
	generateVerificationToken(): string {
		return uuidv4();
	}

	/**
	 * Отправляет письмо с верификацией email
	 */
	async sendVerificationEmail({
		email,
		verificationToken,
		userFirstName,
	}: VerificationEmailData): Promise<void> {
		const verificationUrl = `${this.frontendUrl}/verify?token=${verificationToken}`;

		const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Подтверждение email</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc143c; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .button { 
                        display: inline-block; 
                        background-color: #dc143c; 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Ivy Apply AI</h1>
                    </div>
                    <div class="content">
                        <h2>Подтверждение email адреса</h2>
                        <p>Здравствуйте${userFirstName ? `, ${userFirstName}` : ""}!</p>
                        <p>Спасибо за регистрацию в Ivy Apply AI. Для завершения регистрации необходимо подтвердить ваш email адрес.</p>
                        <p>Нажмите на кнопку ниже для подтверждения:</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Подтвердить email</a>
                        </p>
                        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
                        <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px;">${verificationUrl}</p>
                        <p><strong>Важно:</strong> Ссылка действительна в течение 24 часов.</p>
                        <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Ivy Apply AI. Все права защищены.</p>
                        <p>Это автоматически сгенерированное письмо, не отвечайте на него.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

		const textContent = `
Здравствуйте${userFirstName ? `, ${userFirstName}` : ""}!

Спасибо за регистрацию в Ivy Apply AI. Для завершения регистрации необходимо подтвердить ваш email адрес.

Перейдите по ссылке для подтверждения:
${verificationUrl}

Ссылка действительна в течение 24 часов.

Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

© 2025 Ivy Apply AI
        `;

		const mailOptions = {
			from: `"Ivy Apply AI" <${process.env.SMTP_USER}>`,
			to: email,
			subject: "Подтверждение email адреса - Ivy Apply AI",
			text: textContent,
			html: htmlContent,
		};

		try {
			await this.transporter.sendMail(mailOptions);
			console.log(`✅ Verification email sent to: ${email}`);
		} catch (error) {
			console.error(`❌ Failed to send verification email to ${email}:`, error);
			throw new Error("Failed to send verification email");
		}
	}

	/**
	 * Проверяет подключение к SMTP серверу
	 */
	async verifyConnection(): Promise<boolean> {
		try {
			await this.transporter.verify();
			console.log("✅ SMTP connection verified");
			return true;
		} catch (error) {
			console.error("❌ SMTP connection failed:", error);
			return false;
		}
	}
}

export const emailService = new EmailService();
