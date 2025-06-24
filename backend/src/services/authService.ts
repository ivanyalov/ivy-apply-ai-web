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
        console.log('🔍 AuthService.signup called with email:', email);
        
        try {
            // Check if user already exists
            console.log('🔍 Checking if user exists...');
            const existingUser = await this.userModel.findByEmail(email);
            if (existingUser) {
                console.log('❌ User already exists:', email);
                throw new Error('User already exists');
            }
            console.log('✅ User does not exist, proceeding with creation...');

            // Create new user
            console.log('🔍 Creating new user...');
            const user = await this.userModel.create(email, password);
            console.log('✅ User created successfully:', { id: user.id, email: user.email });
            
            // Generate JWT token
            console.log('🔍 Generating JWT token...');
            const token = this.generateToken(user);
            console.log('✅ JWT token generated successfully');

            return { user, token };
        } catch (error) {
            console.error('❌ AuthService.signup error:', error);
            throw error;
        }
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

    generateToken(user: User): string {
        return jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN as any }
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