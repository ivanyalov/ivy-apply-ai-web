import { Request, Response, NextFunction } from "express";
import { subscriptionService } from "../services/subscription.service";

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Проверяем, что пользователь аутентифицирован
		if (!req.user?.userId) {
			return res.status(401).json({
				error: "Authentication required",
				redirectTo: "/access",
			});
		}

		// Проверяем статус подписки
		const subscriptionStatus = await subscriptionService.getSubscriptionStatus(req.user.userId);

		if (!subscriptionStatus.hasAccess) {
			return res.status(403).json({
				error: "Subscription required",
				redirectTo: "/access",
				subscriptionStatus: {
					hasAccess: subscriptionStatus.hasAccess,
					type: subscriptionStatus.type,
					status: subscriptionStatus.status,
					expiresAt: subscriptionStatus.expiresAt,
					trialUsed: subscriptionStatus.trialUsed,
				},
			});
		}

		// Добавляем информацию о подписке в request для возможного использования
		req.subscription = subscriptionStatus;

		next();
	} catch (error) {
		console.error("Subscription middleware error:", error);
		return res.status(500).json({
			error: "Internal server error",
			redirectTo: "/access",
		});
	}
};

// Расширяем типы для Express Request
declare global {
	namespace Express {
		interface Request {
			subscription?: {
				hasAccess: boolean;
				type: string | null;
				status: string;
				expiresAt: Date | null;
				trialUsed: boolean;
			};
		}
	}
}
