import fs from "fs";
import path from "path";
import { getAuthConfigV4, getAuthConfigV5 } from "./templates/auth";
import { writeMiddleware } from "./templates/middlewear";
import { autoInstall, rewrite } from "./inquiery";

export async function scaffoldAppRouter(
  src: boolean,
  providers: string[],
  storage = false,
  version: string
) {
  console.log("📦 Setting up NextAuth.js for App Router...");

  const baseDir = src ? "src" : "";
  const authPath =
    version === "V5"
      ? path.join(process.cwd(), "auth.ts")
      : path.join(process.cwd(), "pages", "api", "auth", "[...nextauth].ts");
  const routePath = path.join(
    process.cwd(),
    baseDir,
    "app",
    "api",
    "auth",
    "[...nextauth]",
    "route.ts"
  );
  const middlewarePath = path.resolve("middleware.ts");

  // Check if files already exist
  if (fs.existsSync(authPath)) {
    const res = await rewrite(path.parse(authPath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    }
  }
  if (fs.existsSync(routePath)) {
    const res = await rewrite(path.parse(routePath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    }
  }

  //check if middleware file exists and update with your data

  if (fs.existsSync(middlewarePath)) {
    const res = await rewrite(path.parse(middlewarePath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    } else {
      fs.writeFileSync(middlewarePath, writeMiddleware());
    }
  } else {
    fs.writeFileSync(middlewarePath, writeMiddleware());
  }

  // Create directories
  fs.mkdirSync(path.dirname(routePath), { recursive: true });

  // Write files

  if (version === "V5") {
    fs.writeFileSync(authPath, getAuthConfigV5(providers, storage));
  } else {
    fs.writeFileSync(authPath, getAuthConfigV4(providers, storage));
  }

  fs.writeFileSync(
    routePath,
    `import { handlers } from "@/auth";\nexport const { GET, POST } = handlers;`
  );
  writeEnv(providers, storage);
  updatePackageJson(storage);

  console.log("✅ App Router setup complete!");
  autoInstall();
}

export async function scaffoldPagesRouter(
  providers: string[],
  storage = false
) {
  console.log("📦 Setting up NextAuth.js v4 for Pages Router...");

  const apiPath = path.join(
    process.cwd(),
    "pages",
    "api",
    "auth",
    "[...nextauth].ts"
  );
  const middlewarePath = path.resolve("middleware.ts");

  if (fs.existsSync(apiPath)) {
    const res = await rewrite(path.parse(apiPath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    }
  }

  if (fs.existsSync(middlewarePath)) {
    const res = await rewrite(path.parse(middlewarePath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    } else {
      fs.writeFileSync(middlewarePath, writeMiddleware());
    }
  } else {
    fs.writeFileSync(middlewarePath, writeMiddleware());
  }

  fs.mkdirSync(path.dirname(apiPath), { recursive: true });

  fs.writeFileSync(apiPath, getAuthConfigV4(providers, storage));

  writeEnv(providers, storage);
  updatePackageJson(storage);

  console.log("✅ Pages Router (NextAuth v4) setup complete!");
  autoInstall();
}
export function updatePackageJson(storage = false) {
  const packageJsonPath = path.resolve("package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found. Run `npm init` first.");
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  // Ensure dependencies object exists
  packageJson.dependencies = packageJson.dependencies || {};

  // Add NextAuth (required)
  if (!packageJson.dependencies["next-auth"]) {
    packageJson.dependencies["next-auth"] = "5.0.0";
  }

  // Add Zod
  if (!packageJson.dependencies["zod"]) {
    packageJson.dependencies["zod"] = "latest";
  }

  // Add storage adapter if selected
  if (storage) {
    packageJson.dependencies["@auth/upstash-redis-adapter"] = "latest";
    packageJson.dependencies["@upstash/redis"] = "latest";
  }

  // Write changes back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(
    "📦 package.json updated! Run `npm install` to install new dependencies."
  );
}

const writeEnv = (providers: string[], storage: boolean) => {
  const envPath = path.resolve(".env");

  // Base AUTH_SECRET
  fs.writeFileSync(
    envPath,
    `AUTH_SECRET=${Math.random().toString(36).substring(2, 15)}\n`
  );

  // Storage variables
  if (storage) {
    fs.writeFileSync(envPath, `UPSTASH_REDIS_URL=your-upstash-url\n`, {
      flag: "a",
    });
    fs.writeFileSync(envPath, `UPSTASH_REDIS_TOKEN=your-upstash-token\n`, {
      flag: "a",
    });
  }

  // Provider credentials
  providers.forEach((provider: string) => {
    const upper = provider.toUpperCase();
    fs.writeFileSync(
      envPath,
      `AUTH_${upper}_ID=dummy-${Math.random()
        .toString(36)
        .substring(2, 15)}\n` +
        `AUTH_${upper}_SECRET=dummy-${Math.random()
          .toString(36)
          .substring(2, 15)}\n`,
      { flag: "a" }
    );
  });
};
