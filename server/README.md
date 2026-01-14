# NammaVeedu Server (Express + PostgreSQL + Prisma)

## Getting Started

1. Install dependencies
```
npm install
```

2. Start Postgres (Docker)
```
docker compose up -d
```

3. Set environment
Create `.env` (already added):
```
DATABASE_URL=postgresql://nv:nvpass@localhost:5432/nammaveedu?schema=public
JWT_SECRET=change-me
PORT=4000
```

4. Prisma init & migrate (Phase 2)
```
npx prisma init
npx prisma migrate dev --name init
```

5. Run the API in dev
```
npm run dev
```
Visit http://localhost:4000/health
