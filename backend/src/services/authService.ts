import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/User';

export class AuthService {
    private userModel: UserModel;
    private readonly JWT_SECRET: string;
    private readonly JWT_EXPIRES_IN: string = '7d';

    constructor() {
        this.userModel = new UserModel();
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    }

    async signup(email: string, password: string): Promise<{ user: User; token: string }> {
        // Check if user already exists
        const existingUser = await this.userModel.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Create new user
        const user = await this.userModel.create(email, password);
        
        // Generate JWT token
        const token = this.generateToken(user);

        return { user, token };
    }

    async signin(email: string, password: string): Promise<{ user: User; token: string }> {
        // Find user by email
        const user = await this.userModel.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify password
        const isValidPassword = await this.userModel.verifyPassword(user, password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = this.generateToken(user);

        return { user, token };
    }

    async getCurrentUser(userId: string): Promise<User | null> {
        return this.userModel.findById(userId);
    }

    private generateToken(user: User): string {
        return jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    verifyToken(token: string): { userId: string; email: string } {
        try {
            return jwt.verify(token, this.JWT_SECRET) as { userId: string; email: string };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
} 