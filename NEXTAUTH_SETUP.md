# NextAuth.js v5 Setup Summary

This document describes the NextAuth.js v5 (beta) authentication implementation for Ordeal Web.

## Files Created

### 1. `/src/lib/auth.ts`
- NextAuth configuration file
- Exports: `handlers`, `auth`, `signIn`, `signOut`
- Uses PrismaAdapter for database persistence
- Configured providers:
  - GitHub (GITHUB_ID, GITHUB_SECRET)
  - Google (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Session callback adds user.id to the session

### 2. `/src/app/api/auth/[...nextauth]/route.ts`
- NextAuth API route handler
- Exports GET and POST handlers
- Handles all authentication flows

### 3. `/src/middleware.ts`
- Route protection middleware
- Protected routes: `/dashboard/:path*` and `/eval/:path*`
- Redirects unauthenticated users to `/login`

### 4. `/src/app/login/page.tsx`
- Login page component
- Dark theme (Ordeal brand colors)
- Two OAuth buttons:
  - GitHub (dark gray button)
  - Google (orange accent button)
- Responsive card design
- Privacy notice included

## Environment Variables Required

Add these to your `.env.local`:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_ID=your-github-oauth-client-id
GITHUB_SECRET=your-github-oauth-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

## Setup Instructions

### 1. Install Required Dependencies
The project already has `next-auth@^5.0.0-beta.30` and `@prisma/client` installed.
You may need to install: `@auth/prisma-adapter`

```bash
npm install @auth/prisma-adapter
```

### 2. Get OAuth Credentials

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth apps
2. Create new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

#### Google OAuth
1. Go to Google Cloud Console
2. Create new project and enable Google+ API
3. Create OAuth 2.0 credentials (Web Application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### 3. Database Migration
The Prisma schema already includes User, Account, Session, and VerificationToken models needed by NextAuth.
Run: `npm run db:push`

### 4. Start Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000/login` to test authentication.

## Database Schema
The Prisma schema supports:
- User accounts with email, name, image
- OAuth accounts linked to users
- Sessions for active user sessions
- Verification tokens for email verification

## Security Features
- No passwords stored (OAuth only)
- Session tokens with secure defaults
- CSRF protection
- Secure callback URL redirects
- Environment variable protection

## Usage

### In Components
```typescript
import { auth } from "@/lib/auth";

// In Server Components
const session = await auth();
if (session) {
  const userId = session.user.id;
}
```

### Sign Out
```typescript
import { signOut } from "@/lib/auth";

// In Client Components
const handleSignOut = async () => {
  await signOut({ redirectTo: "/" });
};
```

## Customization

- Modify `/src/app/login/page.tsx` to change login page styling
- Update `/src/middleware.ts` to add/remove protected routes
- Adjust session callback in `/src/lib/auth.ts` to add custom session properties
