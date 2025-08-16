import {
	createSubscription,
	getSubscriptionByUserId,
	updateSubscription,
} from "../models/Subscription";
import { AuthService } from "./authService";
import { UserModel } from "../models/User";

export class SubscriptionService {
	async startTrial(userId: string) {
		const userModel = new UserModel();

		// Проверяем, использовал ли пользователь уже пробный период
		const user = await userModel.findById(userId);
		if (!user) {
			throw new Error("User not found.");
		}

		if (user.trial_used) {
			throw new Error("User has already used their trial period.");
		}

		const existingSubscription = await getSubscriptionByUserId(userId);
		if (existingSubscription && existingSubscription.status === "active") {
			throw new Error("User already has an active subscription or trial.");
		}

		// Отмечаем, что пользователь использовал пробный период
		await userModel.markTrialUsed(userId);

		return await createSubscription({
			userId,
			status: "active",
			planType: "trial",
			startDate: new Date(),
			expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 дня для пробного периода
		});
	}

	async getSubscriptionStatus(userId: string) {
		const userModel = new UserModel();
		const user = await userModel.findById(userId);
		const subscription = await getSubscriptionByUserId(userId);

		if (
			!subscription ||
			subscription.status === "unsubscribed" ||
			subscription.status === "cancelled"
		) {
			return {
				hasAccess: false,
				type: subscription?.planType || null,
				status: subscription?.status || "unsubscribed",
				expiresAt: subscription?.expiresAt || null,
				trialUsed: user?.trial_used || false,
			};
		}

		const now = new Date();
		if (subscription.expiresAt && subscription.expiresAt <= now) {
			// Subscription has expired, update status
			if (subscription.id) {
				await updateSubscription(subscription.id, { status: "unsubscribed" });
			}
			return {
				hasAccess: false,
				type: subscription.planType,
				status: "unsubscribed",
				expiresAt: subscription.expiresAt,
				trialUsed: user?.trial_used || false,
			};
		}

		const hasAccess = subscription.status === "active";

		return {
			hasAccess,
			type: subscription.planType,
			status: subscription.status,
			expiresAt: subscription.expiresAt,
			trialUsed: user?.trial_used || false,
		};
	}

	async signupAndStartTrial(email: string, password: string) {
		const authService = new AuthService();
		const { user } = await authService.signup(email, password);
		const subscription = await this.startTrial(user.id);
		return { user, subscription };
	}
}

export const subscriptionService = new SubscriptionService();
