# CI/CD Workflow for Ivy Apply AI Web

## Local Development

- Run the backend: `cd backend && npm install && npm run dev` (or your backend start command)
- Run the frontend: `cd frontend && npm install && npm run dev`

## Production Build & Deployment

1. **Build the Frontend**
   - `cd frontend`
   - `npm run build`

2. **Update Backend Static Files**
   - From the project root, run:
     - `npm run update-frontend-build`
   - This will copy the latest frontend build from `frontend/dist` to `backend/resources/dist`.

3. **Start the Backend in Production**
   - `cd backend`
   - `npm install` (if not already done)
   - `npm run start` (or your production start command)

## Notes
- The backend serves the frontend from `backend/resources/dist`.
- Any time you update the frontend, repeat steps 1 and 2.
- The `update-frontend-build` script uses `rimraf` to clean the old build and `cpy-cli` to copy the new build.
- For CI/CD pipelines, automate these steps as needed. 