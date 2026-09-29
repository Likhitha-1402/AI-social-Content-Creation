# CreatorVerse AI

CreatorVerse AI is a full-stack content creation workspace with an Express/TypeScript backend and a Next.js frontend.

## Project Structure

- `backend/` - Express API, Socket.IO server, Prisma database, and AI integrations
- `frontend/` - Next.js application
- `package.json` - Root scripts for running both services together

## Requirements

- Node.js 20 or newer
- npm

## Installation

From the project root:

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-local-secret"
GEMINI_API_KEY=""
OPENAI_API_KEY=""
CLAUDE_API_KEY=""
PORT=5005
```

The frontend uses `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5005
```

AI keys are optional for starting the application, but AI generation features require the relevant provider key.

## Database Setup

Generate the Prisma client and apply migrations:

```powershell
npm run prisma:generate
npm run prisma:migrate
```

## Run in Development

Start both the backend and frontend from the project root:

```powershell
npm run dev
```

Open the frontend at [http://localhost:3000](http://localhost:3000). The backend API runs at [http://localhost:5005](http://localhost:5005).

To run services separately:

```powershell
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Production Build

```powershell
npm run build
npm run start
```

The backend production server starts after the build. The frontend can be started with:

```powershell
npm run start --prefix frontend
```

## Useful Commands

```powershell
npm run lint --prefix frontend
npm run build --prefix backend
npm run build --prefix frontend
```
