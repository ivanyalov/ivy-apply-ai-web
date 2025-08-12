// @ts-nocheck
import express, { Router, Request, Response } from "express";
import { AuthService } from "../services/authService";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const authService = new AuthService();

// Sign up route
router.post("/signup", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const { user, token } = await authService.signup(email, password);

		res.status(201).json({
			user: {
				id: user.id,
				email: user.email,
				email_verified: user.email_verified,
			},
			token,
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === "User already exists") {
				return res.status(409).json({ error: error.message });
			}
		}
		res.status(500).json({ error: "Internal server error" });
	}
});

// Sign in route
router.post("/signin", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const { user, token } = await authService.signin(email, password);

		res.json({
			user: {
				id: user.id,
				email: user.email,
				email_verified: user.email_verified,
			},
			token,
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === "User not found" || error.message === "Invalid password") {
				return res.status(401).json({ error: "Invalid credentials" });
			}
		}
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get current user route
router.get("/me", authMiddleware, async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		const user = await authService.getCurrentUser(req.user.userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({
			user: {
				id: user.id,
				email: user.email,
				email_verified: user.email_verified,
			},
		});
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
});

// Email verification route
router.get("/verify/:token", async (req, res) => {
	try {
		const { token } = req.params;

		if (!token) {
			return res.status(400).json({ error: "Verification token is required" });
		}

		const result = await authService.verifyEmail(token);

		res.json({
			message: result.message,
			user: {
				id: result.user.id,
				email: result.user.email,
				email_verified: result.user.email_verified,
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === "Invalid verification token") {
				return res.status(404).json({ error: "Invalid or expired verification token" });
			}
			if (error.message === "Email already verified") {
				return res.status(409).json({ error: "Email already verified" });
			}
		}
		res.status(500).json({ error: "Internal server error" });
	}
});

// Resend verification email route
router.post("/resend-verification", async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ error: "Email is required" });
		}

		const result = await authService.resendVerificationEmail(email);

		res.json({ message: result.message });
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === "User not found") {
				return res.status(404).json({ error: "User not found" });
			}
			if (error.message === "Email already verified") {
				return res.status(409).json({ error: "Email already verified" });
			}
		}
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
