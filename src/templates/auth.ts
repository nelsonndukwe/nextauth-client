export const getAuthConfig = (providers: string[], storage?: boolean) => {
  // Build imports
  const providerImports = providers
    .map((provider) => {
      const importName = provider.charAt(0).toUpperCase() + provider.slice(1);
      return `import ${importName} from "next-auth/providers/${provider}";`;
    })
    .join("\n");

  // Build provider array
  const providerArray = providers
    .map((provider) => {
      const name = provider.charAt(0).toUpperCase() + provider.slice(1);
      return `${name},`;
    })
    .join(",\n    ");

  return `
  declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

  
  import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
${providerImports}
import { object, string } from "zod";
import "next-auth/jwt";

import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const signInSchema = object({
  email: string().email("Invalid email").min(1, "Email is required"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: UpstashRedisAdapter(redis),
  providers: [
   ${providerArray}

    // Credentials provider for email/password login
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) throw new Error("Missing credentials");

        const { email, password } = signInSchema.parse(credentials);

        // TODO: Implement actual DB lookup here
        const user = await new Promise((err, resolve) => {
          setTimeout(() => {}, 300);
        });

        if (!user) throw new Error("Invalid credentials");
        return user;
      },
    }),
  ],

  callbacks: {
    authorized: async ({ auth }) => !!auth,
    jwt({ token, trigger, session, account }) {
      if (trigger === "update") token.name = session.user.name;
      if (account?.provider === "google") {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;
      return session;
    },
  },
  basePath: "/auth",
  session: { strategy: "jwt" },
  experimental: { enableWebAuthn: true },
});
`;
};
