import express, { Express, Request, Response, NextFunction } from "express";
import path from "path"; // Import path module
import chatRoutes from "./routes/chat";
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import conversationRoutes from "./routes/conversation.routes";
import { pool } from "./config/database";
import { initializeDatabase, testDatabaseConnection } from "./db_utils";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000; // Backend typically runs on a different port e.g. 8000

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies


// Enable CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
		return;
	}
	next();
});

// Enable static file serving
app.use("/legal", express.static(path.join(__dirname, "../public/legal")));

// Root endpoint
// app.get('/', (req: Request, res: Response) => {
//   res.json({ message: 'Ivy Apply AI Backend (Express.js + TypeScript)' });
// });

// API Routes
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/conversation", conversationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

// Content Security Policy for CloudPayments - TEMPORARILY PERMISSIVE FOR TESTING
app.use((req: Request, res: Response, next: NextFunction): void => {
	// Very permissive CSP for testing
	const cspHeader = "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; frame-src *; frame-ancestors *; style-src * 'unsafe-inline'; font-src *; img-src *; object-src *; base-uri *; form-action *;";
	
	console.log("Setting PERMISSIVE CSP header:", cspHeader);
	res.setHeader("Content-Security-Policy", cspHeader);
	next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something broke!" });
});

// Serve frontend build
app.use(express.static(path.join(__dirname, "../resources/dist")));

// Fallback: serve index.html for any unknown route (for SPA routing)
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../resources/dist/index.html"));
});

// Initialize database and start server
async function startServer() {
	try {
		// Test database connection
		await testDatabaseConnection();

		// Initialize database tables (only creates if they don't exist)
		await initializeDatabase();

		// Start the server
		app.listen(port, () => {
			console.log(`Backend server is running at http://localhost:${port}`);
			console.log("Database is ready - existing data will be preserved");
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
