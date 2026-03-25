# NammaVeedu Vercel Deployment Guide

To deploy this project on Vercel, it is recommended to deploy the **Frontend** and the **Backend** as two separate Vercel projects pointing to the same GitHub repository.

## 🚀 1. Deploy the Backend (API)

The backend is located in the `server/` directory and uses Prisma with Express.

1.  **Import the repository** into Vercel.
2.  **Configuration**:
    -   **Project Name**: `nammaveedu-api`
    -   **Root Directory**: `server`
    -   **Framework Preset**: `Other`
    -   **Build Command**: `npx prisma generate` (this ensures the Prisma Client is ready)
    -   **Install Command**: `npm install`
3.  **Environment Variables**:
    -   `DATABASE_URL`: Add your database connection string (PostgreSQL/Supabase/Railway).
    -   `JWT_SECRET`: A secure random string for signing tokens.
    -   `PORT`: `4000` (optional, default is 4000 in code).
4.  **Deploy**. Your API will be live at `https://your-api-url.vercel.app`.

## 🌐 2. Deploy the Frontend (Web App)

The frontend is in the root directory and is a Vite/React application.

1.  **Import the repository** into Vercel again.
2.  **Configuration**:
    -   **Project Name**: `nammaveedu-web`
    -   **Root Directory**: `./` (Root)
    -   **Framework Preset**: `Vite`
    -   **Build Command**: `npm run build`
3.  **Environment Variables**:
    -   `VITE_API_URL`: Use the **Backend URL** from Step 1 (e.g., `https://your-api-url.vercel.app`).
4.  **Deploy**. Your web app will be live at `https://your-web-url.vercel.app`.

## ⚙️ Prisma Setup (Important)

Make sure you have a database hosted somewhere (like Supabase, Neon, or Railway) and that the `DATABASE_URL` is correctly set in the Vercel console.

If you make changes to the database schema, run:
`npx prisma db push --schema=prisma/schema.prisma`
locally or as part of your CI/CD.

## 💡 Why Two Projects?
-   **Easier Management**: Frontend logs and Backend logs are separated.
-   **Environment Variables**: Clean separation of API secrets and Public Vite variables.
-   **Speed**: Faster builds as Vercel only recalculates what's in the specified Root Directory.
