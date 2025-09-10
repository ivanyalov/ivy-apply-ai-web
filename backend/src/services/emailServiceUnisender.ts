import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
	tls?: {
		rejectUnauthorized: boolean;
	};
	pool?: boolean;
	debug?: boolean;
	logger?: boolean;
	connectionTimeout?: number;
	greetingTimeout?: number;
	socketTimeout?: number;
}

interface VerificationEmailData {
	email: string;
	verificationToken: string;
	userFirstName?: string;
}

export class EmailServiceUnisender {
	private transporter: nodemailer.Transporter;
	private frontendUrl: string;

	constructor() {
		// Загружаем переменные окружения
		dotenv.config();

		// Настройка SMTP для Unisender
		const emailConfig: EmailConfig = {
			host: process.env.UNISENDER_SMTP_HOST || "smtp.go2.unisender.ru",
			port: parseInt(process.env.UNISENDER_SMTP_PORT || "587"),
			secure: false, // TLS соединение
			auth: {
				user: process.env.UNISENDER_SMTP_USER || "",
				pass: process.env.UNISENDER_SMTP_PASS || "",
			},
			// Настройки TLS для Unisender
			tls: {
				rejectUnauthorized: false,
			},
			// Добавляем таймауты для стабильности
			connectionTimeout: 60000, // 60 секунд
			greetingTimeout: 30000, // 30 секунд
			socketTimeout: 60000, // 60 секунд
			// Настройки для отладки (можно отключить в продакшене)
			debug: false,
			logger: false,
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
            <html lang="ru">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Подтверждение email адреса</title>
                <style>
                    body { 
                        font-family: 'Inter', 'Manrope', 'Helvetica Neue', sans-serif; 
                        line-height: 1.6; 
                        color: #111827; 
                        margin: 0; 
                        padding: 0; 
                        background-color: #ffffff;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 20px auto; 
                        background-color: #ffffff;
                        border-radius: 16px;
                        border: 2px solid #e5e7eb;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header { 
                        background: linear-gradient(135deg, #A51C30 0%, #991b1b 100%);
                        color: white; 
                        padding: 40px 30px; 
                        text-align: center; 
                        border-bottom: 2px solid #ffffff;
                    }
                    .header h1 { 
						color: white;
                        margin: 0; 
                        font-size: 32px; 
                        font-weight: 700; 
                        letter-spacing: -0.025em;
                    }
                    .header p { 
						color: white;
                        margin: 12px 0 0 0; 
                        opacity: 0.9; 
                        font-size: 16px;
                        font-weight: 500;
                    }
                    .content { 
                        padding: 40px 30px; 
                        background-color: #ffffff;
                    }
                    .content h2 { 
                        color: #111827; 
                        margin-top: 0; 
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 20px;
                    }
                    .content p { 
                        color: #4b5563; 
                        font-size: 16px;
                        line-height: 1.7;
                        margin-bottom: 16px;
                    }
                    .button { 
                        display: inline-block; 
                        background: linear-gradient(135deg, #A51C30 0%, #991b1b 100%);
                        color: white; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 12px; 
                        margin: 25px 0;
                        font-weight: 600;
                        font-size: 16px;
                        text-align: center;
                        border: 2px solid #991b1b;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                    }
                    .button:hover { 
                        transform: translateY(-2px); 
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
                    }
                    .link-box { 
                        background-color: #f9fafb; 
                        padding: 16px; 
                        border-radius: 12px;
                        border-left: 4px solid #A51C30;
                        margin: 20px 0;
                        word-break: break-all;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        border: 2px solid #e5e7eb;
                    }
                    .footer { 
                        padding: 30px; 
                        text-align: center; 
                        color: #6b7280; 
                        font-size: 14px;
                        background-color: #f9fafb;
                        border-top: 2px solid #e5e7eb;
                    }
                    .warning { 
                        background-color: #fef3c7; 
                        border: 2px solid #f59e0b; 
                        color: #92400e; 
                        padding: 16px; 
                        border-radius: 12px; 
                        margin: 20px 0;
                    }
                    .warning strong { 
                        color: #92400e;
                        font-weight: 600;
                    }
                    .warning ul { 
                        margin: 12px 0; 
                        padding-left: 20px; 
                    }
                    .warning li { 
                        margin-bottom: 8px;
                        color: #92400e;
                    }
                    .brand-accent {
                        color: #A51C30;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Ivy Apply AI</h1>
                        <p>Подтверждение email адреса</p>
                    </div>
                    <div class="content">
                        <h2>Добро пожаловать в <span class="brand-accent">Ivy Apply AI</span>!</h2>
                        <p>Здравствуйте${userFirstName ? `, ${userFirstName}` : ""}!</p>
                        <p>Благодарим вас за регистрацию в нашей системе. Для завершения процесса регистрации и активации вашего аккаунта необходимо подтвердить ваш email адрес.</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Подтвердить email адрес</a>
                        </div>
                        
                        <p><strong>Альтернативный способ:</strong> Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку вашего браузера:</p>
                        <div class="link-box">${verificationUrl}</div>
                        
                        <div class="warning">
                            <strong>⚠️ Важная информация:</strong>
                            <ul>
                                <li>Ссылка действительна в течение 24 часов</li>
                                <li>Не передавайте эту ссылку третьим лицам</li>
                                <li>Если вы не регистрировались на нашем сайте, проигнорируйте это письмо</li>
                            </ul>
                        </div>
                        
                        <p>После подтверждения email вы сможете получить доступ ко всем функциям <span class="brand-accent">Ivy Apply AI</span>.</p>
                    </div>
                    <div class="footer">
                        <p><strong>Ivy Apply AI</strong> - Ваш помощник в поступлении в университеты</p>
                        <p>© 2025 Ivy Apply AI. Все права защищены.</p>
                        <p style="font-size: 12px; margin-top: 15px; color: #9ca3af;">
                            Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.<br>
                            Для связи с поддержкой: <a href="mailto:support@ivy-apply.com" style="color: #A51C30;">support@ivy-apply.com</a><br>
                            Сайт: <a href="https://www.ivy-apply.com" style="color: #A51C30;">www.ivy-apply.com</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

		const textContent = `
Добро пожаловать в Ivy Apply AI!

Здравствуйте${userFirstName ? `, ${userFirstName}` : ""}!

Благодарим вас за регистрацию в нашей системе. Для завершения процесса регистрации и активации вашего аккаунта необходимо подтвердить ваш email адрес.

ПОДТВЕРЖДЕНИЕ EMAIL АДРЕСА
==========================

Перейдите по следующей ссылке для подтверждения:
${verificationUrl}

ВАЖНАЯ ИНФОРМАЦИЯ:
- Ссылка действительна в течение 24 часов
- Не передавайте эту ссылку третьим лицам
- Если вы не регистрировались на нашем сайте, проигнорируйте это письмо

После подтверждения email вы сможете получить доступ ко всем функциям Ivy Apply AI.

---
Ivy Apply AI - Ваш помощник в поступлении в университеты
© 2025 Ivy Apply AI. Все права защищены.

Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
Для связи с поддержкой: support@ivy-apply.com
Сайт: https://www.ivy-apply.com
        `;

		const mailOptions = {
			from: `"Ivy Apply AI" <${
				process.env.UNISENDER_FROM_EMAIL || process.env.UNISENDER_SMTP_USER + "@go2.unisender.ru"
			}>`,
			to: email,
			subject: "Подтверждение email адреса - Ivy Apply AI",
			text: textContent,
			html: htmlContent,
			// Улучшенные заголовки для избежания спам-фильтров
			headers: {
				"List-Unsubscribe": `<mailto:unsubscribe@ivy-apply.com?subject=unsubscribe>`,
				"X-Mailer": "Ivy Apply AI Email Service via Unisender",
				"X-Priority": "3",
				"X-MSMail-Priority": "Normal",
				Importance: "normal",
				"Message-ID": `<${uuidv4()}@ivy-apply.com>`,
				Date: new Date().toUTCString(),
				"Reply-To": "support@ivy-apply.com",
				"Return-Path": `${
					process.env.UNISENDER_FROM_EMAIL || process.env.UNISENDER_SMTP_USER + "@go2.unisender.ru"
				}`,
			},
			// Дополнительные настройки
			priority: "normal" as const,
			encoding: "utf-8",
		};

		try {
			await this.transporter.sendMail(mailOptions);
			console.log(`✅ Verification email sent via Unisender to: ${email}`);
		} catch (error) {
			console.error(`❌ Failed to send verification email via Unisender to ${email}:`, error);
			throw new Error("Failed to send verification email via Unisender");
		}
	}

	/**
	 * Проверяет подключение к SMTP серверу Unisender
	 */
	async verifyConnection(): Promise<boolean> {
		try {
			await this.transporter.verify();
			console.log("✅ Unisender SMTP connection verified");
			return true;
		} catch (error) {
			console.error("❌ Unisender SMTP connection failed:", error);
			return false;
		}
	}

	/**
	 * Тестирует отправку письма через Unisender
	 */
	async testEmail(toEmail: string): Promise<boolean> {
		try {
			const testMailOptions = {
				from: `"Ivy Apply AI" <${
					process.env.UNISENDER_FROM_EMAIL || process.env.UNISENDER_SMTP_USER + "@go2.unisender.ru"
				}>`,
				to: toEmail,
				subject: "Тестовое письмо от Ivy Apply AI (Unisender)",
				text: "Это тестовое письмо для проверки работы email сервиса через Unisender.",
				html: `
					<html>
						<head>
							<style>
								body { 
									font-family: 'Inter', 'Manrope', 'Helvetica Neue', sans-serif; 
									line-height: 1.6; 
									color: #111827; 
									margin: 0; 
									padding: 20px; 
									background-color: #ffffff;
								}
								.container { 
									max-width: 600px; 
									margin: 0 auto; 
									background-color: #ffffff;
									border-radius: 16px;
									border: 2px solid #e5e7eb;
									box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
									overflow: hidden;
								}
								.header { 
									background: linear-gradient(135deg, #A51C30 0%, #991b1b 100%);
									color: white; 
									padding: 30px; 
									text-align: center; 
									border-bottom: 2px solid #ffffff;
								}
								.header h1 { 
									margin: 0; 
									font-size: 28px; 
									font-weight: 700; 
									letter-spacing: -0.025em;
								}
								.content { 
									padding: 30px; 
									background-color: #ffffff;
								}
								.content h2 { 
									color: #111827; 
									margin-top: 0; 
									font-size: 20px;
									font-weight: 700;
									margin-bottom: 16px;
								}
								.content p { 
									color: #4b5563; 
									font-size: 16px;
									line-height: 1.7;
									margin-bottom: 12px;
								}
								.brand-accent {
									color: #A51C30;
									font-weight: 600;
								}
								.unisender-badge {
									background-color: #e0f2fe;
									color: #0277bd;
									padding: 8px 16px;
									border-radius: 8px;
									font-size: 14px;
									font-weight: 600;
									display: inline-block;
									margin-top: 10px;
								}
							</style>
						</head>
						<body>
							<div class="container">
								<div class="header">
									<h1>Ivy Apply AI</h1>
								</div>
								<div class="content">
									<h2>Тестовое письмо</h2>
									<p>Это тестовое письмо от <span class="brand-accent">Ivy Apply AI</span> для проверки работы email сервиса.</p>
									<p><strong>Время отправки:</strong> ${new Date().toLocaleString("ru-RU")}</p>
									<p>Если вы получили это письмо, значит email сервис работает корректно!</p>
									<div class="unisender-badge">📧 Отправлено через Unisender</div>
								</div>
							</div>
						</body>
					</html>
				`,
				headers: {
					"X-Mailer": "Ivy Apply AI Email Service via Unisender",
					"X-Priority": "3",
					"Message-ID": `<${uuidv4()}@ivy-apply.com>`,
					Date: new Date().toUTCString(),
					"Reply-To": "support@ivy-apply.com",
				},
			};

			await this.transporter.sendMail(testMailOptions);
			console.log(`✅ Test email sent successfully via Unisender to: ${toEmail}`);
			return true;
		} catch (error) {
			console.error(`❌ Failed to send test email via Unisender to ${toEmail}:`, error);
			return false;
		}
	}
}

// Создаем экземпляр сервиса Unisender
let emailServiceUnisenderInstance: EmailServiceUnisender | null = null;

export const getEmailServiceUnisender = (): EmailServiceUnisender => {
	if (!emailServiceUnisenderInstance) {
		emailServiceUnisenderInstance = new EmailServiceUnisender();
	}
	return emailServiceUnisenderInstance;
};

export const emailServiceUnisender = getEmailServiceUnisender();
