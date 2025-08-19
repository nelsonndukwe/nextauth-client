export const getAuthConfigV5 = (providers: string[], storage?: boolean) => {
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
      return `${name}({
      clientId: process.env.AUTH_${name.toUpperCase()}_ID!,
      clientSecret: process.env.AUTH_${name.toUpperCase()}_SECRET!,
    })`;
    })
    .join(",\n    ");

  let storageBaseData: string;

  if (storage) {
    storageBaseData = `import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});
`;
  } else {
    storageBaseData = "";
  }

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

  
import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
${providerImports}
import { object, email,  string } from "zod";
import "next-auth/jwt";

${storageBaseData}

export const signInSchema = object({
  email: email("Invalid email").min(1, "Email is required"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
 adapter: ${storage ? "UpstashRedisAdapter(redis)" : undefined},
  providers: [
   ${providerArray},

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
        const user:User | null = await new Promise((resolve) => {
           setTimeout(() => {
            if (email === "@example.com" && password === "password123") {
              resolve({ id: "1", name: "Example User", email });
            } else {
              resolve(null);
            }
          }, 300);
        });

         if (!user) {
         throw new Error("User not found");
          return null;
        }
        return user;
      },
    }),
  ],

  callbacks: {
 async signIn({ account, profile }) {
      if (account && profile) {
        if (account.provider === "google") {
          if (profile.email) {
            return true;
          }
          return false; // block all other emails
        }
      }
      return true; // fallback allow for other providers
    },    jwt({ token, trigger, session, account }) {
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
  session: { strategy: "jwt" },
    pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    error: "/auth/error",
  },
      secret: process.env.NEXTAUTH_SECRET,
});
`;
};





export const getAuthConfigV4 = (providers: string[], storage?: boolean) => {
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
      return `${name}({
      clientId: process.env.AUTH_${name.toUpperCase()}_ID!,
      clientSecret: process.env.AUTH_${name.toUpperCase()}_SECRET!,
    })`;
    })
    .join(",\n    ");

  let storageBaseData: string;

  if (storage) {
    storageBaseData = `import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});
`;
  } else {
    storageBaseData = "";
  }

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

  
// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
${providerImports}
import { object, email, string } from "zod";
import "next-auth/jwt";

${storageBaseData}

export const signInSchema = object({
  email: email("Invalid email").min(1, "Email is required"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const authOptions: NextAuthOptions = {
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: ${storage ? "UpstashRedisAdapter(redis)" : "undefined"},
  providers: [
    ${providerArray},

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
        const user: User | null = await new Promise((resolve) => {
          setTimeout(() => {
            if (email === "@example.com" && password === "password123") {
              resolve({ id: "1", name: "Example User", email });
            } else {
              resolve(null);
            }
          }, 300);
        });

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account && profile) {
        if (account.provider === "google") {
          if (profile.email) {
            return true;
          }
          return false;
        }
      }
      return true;
    },
    async jwt({ token, trigger, session, account }) {
      if (trigger === "update") token.name = session.user?.name;
      if (account?.provider === "google") {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
`;
};
