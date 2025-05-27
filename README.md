# Ivy Apply AI

## Project Overview
Ivy Apply AI is a GPT-style AI assistant to help users with university admissions. It features document uploads, unlimited questions, and smart feedback.

## Core Stack
- Frontend: React (TypeScript) with Feature-Sliced Design (FSD) architecture.
- Backend: Express.js (TypeScript).
- Database: Supabase (PostgreSQL)
- AI Assistant: Coze + Jules
- Payments: YooKassa API
- Hosting: AWS

## Directory Structure
- `/frontend`: Contains the React (TypeScript) frontend application.
  - `/frontend/src/`: Adheres to Feature-Sliced Design (FSD) with layers like `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- `/backend`: Contains the Express.js (TypeScript) backend application.

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm (comes with Node.js) or yarn

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. To generate Tailwind CSS (if not running in watch mode via dev server): `npm run build:css` (Note: `npm start` often includes a watch mode for CSS changes, but this script is available for manual builds: `tailwindcss -i ./src/app/input.css -o ./src/app/output.css --watch`)
4. Start the development server: `npm start` (This usually runs React app and watches for Tailwind CSS changes if configured via PostCSS)

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Build the TypeScript code: `npm run build` (compiles to `dist/` directory)
4. Start the production server: `npm start` (runs compiled code from `dist/index.js`)
   OR
   Run in development mode (with auto-reloading): `npm run dev` (uses `nodemon` and `ts-node`)

## AI Assistant Integration
Details about Coze + Jules integration will be added here.

## Payment Gateway
Integration with YooKassa API for subscriptions.
