// @ts-nocheck
import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { subscriptionService } from "../services/subscription.service";
import { getSubscriptionByUserId, updateSubscription } from "../models/Subscription";
import { AuthService } from "../services/authService";

const router = Router();

// Sign up and start trial
router.post("/signup-trial", (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}
	subscriptionService
		.signupAndStartTrial(email, password)
		.then(({ user, subscription }) => {
			const authSvc = new AuthService();
			const token = authSvc.generateToken(user);
			res.status(201).json({ user: { id: user.id, email: user.email }, token, subscription });
		})
		.catch((error) => {
			if (error.message === "User already exists") {
				return res.status(409).json({ error: error.message });
			}
			console.error("Signup and trial error:", error);
			res.status(500).json({ error: "Failed to signup and start trial" });
		});
});

router.post("/start-trial", authMiddleware, (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	subscriptionService
		.startTrial(userId)
		.then((subscription) => {
			res.json({
				message: "Trial started successfully",
				expiresAt: subscription.expiresAt,
			});
		})
		.catch((error) => {
			if (
				error instanceof Error &&
				(error.message === "User already has an active subscription or trial." ||
					error.message === "User has already used their trial period.")
			) {
				res.status(400).json({ error: error.message });
			} else {
				console.error("Error starting trial:", error);
				res.status(500).json({ error: "Failed to start trial" });
			}
		});
});

// Cancel subscription
router.post("/cancel", authMiddleware, (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		return res.status(401).json({ error: "Not authenticated" });
	}

	getSubscriptionByUserId(userId)
		.then((subscription) => {
			if (!subscription || !subscription.id) {
				return res.status(404).json({ error: "Subscription not found" });
			}
			return updateSubscription(subscription.id, { status: "cancelled" });
		})
		.then(() => {
			res.json({ message: "Subscription cancelled" });
		})
		.catch((error) => {
			console.error("Cancel subscription error:", error);
			res.status(500).json({ error: "Failed to cancel subscription" });
		});
});

// Change subscription type
router.post("/change", authMiddleware, (req, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	const { planType } = req.body;

	getSubscriptionByUserId(userId)
		.then((subscription) => {
			if (!subscription || !subscription.id) {
				return res.status(404).json({ error: "Subscription not found" });
			}
			// This route is now only for upgrading to premium
			if (planType === "premium") {
				return updateSubscription(subscription.id, { planType: "premium" });
			}
			return res.status(400).json({ error: "Invalid plan type for this route" });
		})
		.then(() => {
			res.json({ message: "Subscription type changed" });
		})
		.catch((error) => {
			console.error("Change subscription error:", error);
			res.status(500).json({ error: "Failed to change subscription type" });
		});
});

// Get subscription status
router.get("/status", authMiddleware, async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	if (!userId) {
		res.status(401).json({ error: "User not authenticated" });
		return;
	}

	try {
		const status = await subscriptionService.getSubscriptionStatus(userId);

		// Получаем дополнительную информацию о подписке
		const subscription = await getSubscriptionByUserId(userId);

		const response = {
			...status,
			cloudPaymentsTransactionId: subscription?.cloudPaymentsTransactionId || null,
			cloudPaymentsSubscriptionId: subscription?.cloudPaymentsSubscriptionId || null,
			lastChecked: new Date().toISOString(),
		};

		res.json(response);
	} catch (error) {
		console.error("Error getting subscription status:", error);
		res.status(500).json({ error: "Failed to get subscription status" });
	}
});

export default router;
