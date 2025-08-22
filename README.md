## Scaffold Auth CLI for Next.js (NextAuth.js)

A tiny, interactive CLI that scaffolds a ready-to-run NextAuth.js setup in your Next.js app. It supports both App Router and Pages Router, NextAuth v4, multiple providers, optional Upstash Redis session storage, and sensible defaults.

---

### Features
- **Interactive setup:** Guided prompts for router, NextAuth version, providers, and storage
- **App Router or Pages Router:** Generates the proper API routes and middleware
- **NextAuth v4:** Template output adapts to your selection
- **Multiple providers:** GitHub, Google, Auth0, Discord, Apple, Twitter, plus Credentials
- **Optional Upstash Redis:** Adds adapter and config when selected
- **Env and deps automation:** Creates .env entries and updates package.json; offers to run install

---

## Installation

### Global install
```bash
npm install -g scaffold-auth
```

### One-off via npx
```bash
npx scaffold-auth init
```

> Works in any existing Next.js project. Recommended Node.js 18+.

---

## Quickstart

```bash
# In your Next.js project root
npx scaffold-auth init
```

You’ll be prompted for:
- **NextAuth.js version:**  V4
- **Router type:** App Router or Pages Router
- **src directory:** Whether your app code lives under `src/`
- **Providers:** GitHub, Google, Auth0, Discord, Apple, Twitter (choose ≥1)
- **Storage:** Whether to use Upstash Redis for session storage

At the end, the CLI updates dependencies, writes files, creates `.env` entries, and offers to run `npm install` for you.

---

## What gets generated

### App Router + NextAuth v4
For v4, NextAuth uses a Pages API route. The CLI creates:
- `pages/api/auth/[...nextauth].ts`: NextAuth v4 config
- `middleware.ts`: Default NextAuth middleware with an example `matcher`

### Pages Router + NextAuth v4
- `pages/api/auth/[...nextauth].ts`: NextAuth v4 config
- `middleware.ts`: Default NextAuth middleware with an example `matcher`

---

## Environment variables
The CLI writes baseline variables to `.env` (creates the file if needed):
- `AUTH_SECRET` — random value
- For each selected provider:
  - `AUTH_<PROVIDER>_ID`
  - `AUTH_<PROVIDER>_SECRET`
- If Upstash Redis storage is enabled:
  - `UPSTASH_REDIS_URL`
  - `UPSTASH_REDIS_TOKEN`

Notes:
- The generated templates reference `NEXTAUTH_SECRET` (v4). Set it in your `.env`.
- The CLI also seeds `AUTH_SECRET` for convenience. You can copy the same value into `NEXTAUTH_SECRET` or generate a new one.

---

## Dependencies the CLI adds
The CLI updates `package.json` (if present) with:
- `next-auth`: `latest version` for V4 (only if not already present)
- `zod`: `latest` (only if not present)
- If storage is enabled:
  - `@auth/upstash-redis-adapter`: `latest`
  - `@upstash/redis`: `latest`

You’ll be prompted to run `npm install` automatically after scaffolding.

---

## Providers
You can select any combination of:
- GitHub, Google, Auth0, Discord, Apple, Twitter
- Credentials provider is included by default

For each selected OAuth provider, fill your real credentials in `.env`:
```bash
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
# etc.
```

The credentials provider includes placeholder logic; replace it with your DB lookup.

---

## Middleware
- **v4:**
  - `middleware.ts` re-exports the default NextAuth middleware
  - Example `config.matcher` protects all nested routes

Adjust `matcher` to fit your app.

---

## Example session flow
- Sign-in pages: The template sets `pages.signIn = "/sign-in"` and `pages.signUp = "/sign-up"`. Create those pages or update the paths.
- Session strategy: JWT
- Example callbacks:
  - Adds an `accessToken` for Google accounts
  - Mirrors `accessToken` to the session

These are sensible defaults you can tailor to your needs.

---

## Commands

### `init`
Scaffolds the NextAuth setup based on your answers.

```bash
# With global install
scaffold-auth init

# Or via npx
npx scaffold-auth init
```

---

## Typical setup steps after scaffolding
1. Fill real provider IDs and secrets in `.env`
2. For v4, set `NEXTAUTH_SECRET` (copy from `AUTH_SECRET` or generate one)
3. Replace the credentials `authorize` logic with your DB/user store
4. Adjust `middleware.ts` `matcher` rules
5. Create your sign-in/sign-up pages or update the `pages` config
6. Run and test your app
   ```bash
   npm install
   npm run dev
   ```

---

## Troubleshooting
- **“File already exists” prompts**: The CLI asks before overwriting. Choose accordingly.
- **Missing `package.json`**: Initialize your project first (`npm init` or `npm create next-app`).
- **Secrets mismatch**: For v4, ensure `NEXTAUTH_SECRET` is set. The CLI seeds `AUTH_SECRET`; set `NEXTAUTH_SECRET` to the same value if desired.

---

## Uninstall (global)
```bash
npm uninstall -g scaffold-auth
```

---

## License
MIT © Nelson Ndukwe  