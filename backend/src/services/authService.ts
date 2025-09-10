import jwt from "jsonwebtoken";
import { UserModel, User } from "../models/User";
import { emailServiceUnisender } from "./emailServiceUnisender";

export class AuthService {
	private userModel: UserModel;
	private readonly JWT_SECRET: string;
	private readonly JWT_EXPIRES_IN: string = "7d";

	constructor() {
		this.userModel = new UserModel();
		this.JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
	}

	async signup(email: string, password: string): Promise<{ user: User; token: string }> {
		console.log("🔍 AuthService.signup called with email:", email);

		try {
			// Check if user already exists
			console.log("🔍 Checking if user exists...");
			const existingUser = await this.userModel.findByEmail(email);
			if (existingUser) {
				console.log("❌ User already exists:", email);
				throw new Error("User already exists");
			}
			console.log("✅ User does not exist, proceeding with creation...");

			// Generate verification token
			const verificationToken = emailServiceUnisender.generateVerificationToken();
			console.log("🔍 Generated verification token");

			// Create new user with verification token
			console.log("🔍 Creating new user...");
			const user = await this.userModel.create(email, password, verificationToken);
			console.log("✅ User created successfully:", { id: user.id, email: user.email });

			// Send verification email
			try {
				await emailServiceUnisender.sendVerificationEmail({
					email: user.email,
					verificationToken,
				});
				console.log("✅ Verification email sent successfully");
			} catch (emailError) {
				console.warn("⚠️ Failed to send verification email, but user was created:", emailError);
				// Продолжаем выполнение, так как пользователь уже создан
			}

			// Generate JWT token
			console.log("🔍 Generating JWT token...");
			const token = this.generateToken(user);
			console.log("✅ JWT token generated successfully");

			return { user, token };
		} catch (error) {
			console.error("❌ AuthService.signup error:", error);
			throw error;
		}
	}

	async signin(email: string, password: string): Promise<{ user: User; token: string }> {
		// Find user by email
		const user = await this.userModel.findByEmail(email);
		if (!user) {
			throw new Error("User not found");
		}

		// Verify password
		const isValidPassword = await this.userModel.verifyPassword(user, password);
		if (!isValidPassword) {
			throw new Error("Invalid password");
		}

		// Generate JWT token
		const token = this.generateToken(user);

		return { user, token };
	}

	async getCurrentUser(userId: string): Promise<User | null> {
		return this.userModel.findById(userId);
	}

	generateToken(user: User): string {
		return jwt.sign(
			{
				userId: user.id,
				email: user.email,
			},
			this.JWT_SECRET,
			{ expiresIn: this.JWT_EXPIRES_IN as any }
		);
	}

	verifyToken(token: string): { userId: string; email: string } {
		try {
			return jwt.verify(token, this.JWT_SECRET) as { userId: string; email: string };
		} catch (error) {
			throw new Error("Invalid token");
		}
	}

	async verifyEmail(verificationToken: string): Promise<{ user: User; message: string }> {
		try {
			console.log(`🔍 Attempting to verify email with token: ${verificationToken}`);

			// Find user by verification token
			const user = await this.userModel.findByVerificationToken(verificationToken);
			if (!user) {
				console.log(`❌ No user found with verification token: ${verificationToken}`);
				throw new Error("Invalid verification token");
			}

			console.log(
				`✅ Found user for verification: ${user.email}, current email_verified: ${user.email_verified}`
			);

			if (user.email_verified) {
				console.log(`⚠️ Email already verified for user: ${user.email}`);
				throw new Error("Email already verified");
			}

			// Mark email as verified
			console.log(`🔍 Marking email as verified for user: ${user.id}`);
			await this.userModel.verifyEmail(user.id);

			// Get updated user data
			const updatedUser = await this.userModel.findById(user.id);
			if (!updatedUser) {
				console.log(`❌ User not found after verification: ${user.id}`);
				throw new Error("User not found after verification");
			}

			console.log(
				`✅ Email verified successfully for user: ${user.email}, new email_verified: ${updatedUser.email_verified}`
			);
			return {
				user: updatedUser,
				message: "Email successfully verified",
			};
		} catch (error) {
			console.error("❌ Email verification failed:", error);
			throw error;
		}
	}

	async resendVerificationEmail(email: string): Promise<{ message: string }> {
		try {
			// Find user by email
			const user = await this.userModel.findByEmail(email);
			if (!user) {
				throw new Error("User not found");
			}

			if (user.email_verified) {
				throw new Error("Email already verified");
			}

			// Generate new verification token
			const verificationToken = emailServiceUnisender.generateVerificationToken();
			await this.userModel.updateVerificationToken(user.id, verificationToken);

			// Send verification email
			await emailServiceUnisender.sendVerificationEmail({
				email: user.email,
				verificationToken,
			});

			console.log(`✅ Verification email resent to: ${email}`);
			return { message: "Verification email sent" };
		} catch (error) {
			console.error("❌ Failed to resend verification email:", error);
			throw error;
		}
	}
}
