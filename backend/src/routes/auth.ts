// @ts-nocheck
import express, {Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authService = new AuthService();

// Sign up route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { user, token } = await authService.signup(email, password);
        
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email
            },
            token
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'User already exists') {
                return res.status(409).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sign in route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { user, token } = await authService.signin(email, password);
        
        res.json({
            user: {
                id: user.id,
                email: user.email
            },
            token
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'User not found' || error.message === 'Invalid password') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user route
router.get('/me', authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await authService.getCurrentUser(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 