import fs from "fs";
import path from "path";
import { getAuthConfigV4, getAuthConfigV5 } from "./templates/auth.js";
import { writeMiddleware } from "./templates/middlewear.js";
import { autoInstall, rewrite } from "./inquiery.js";

export async function scaffoldAppRouter(
  src: boolean,
  providers: string[],
  storage = false,
  version = "V4" //Defaults to V4 for backwards compatibility
) {
  console.log("📦 Setting up NextAuth.js for App Router...");

  const baseDir = src ? "src" : "";
  const authPath = path.join(
    process.cwd(),
    "pages",
    "api",
    "auth",
    "[...nextauth].ts"
  );
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

  updatePackageJson(storage, version);
  await autoInstall();
  console.log("✅ Dependencies added and installed!");

  //check if middleware file exists and update with your data

  if (fs.existsSync(middlewarePath)) {
    const res = await rewrite(path.parse(middlewarePath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    } else {
      fs.writeFileSync(middlewarePath, writeMiddleware(version));
    }
  } else {
    fs.writeFileSync(middlewarePath, writeMiddleware(version));
  }

  // Create directories

  fs.mkdirSync(path.dirname(authPath), { recursive: true });
  // Write files

  fs.writeFileSync(authPath, getAuthConfigV4(providers, storage));

  writeEnv(providers, storage);

  console.log("✅ App Router setup complete!");
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

  updatePackageJson(storage, "V4");
  await autoInstall();
  console.log("✅ Dependencies added and installed!");


  if (fs.existsSync(middlewarePath)) {
    const res = await rewrite(path.parse(middlewarePath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    } else {
      fs.writeFileSync(middlewarePath, writeMiddleware("V4"));
    }
  } else {
    fs.writeFileSync(middlewarePath, writeMiddleware("V4"));
  }

  fs.mkdirSync(path.dirname(apiPath), { recursive: true });

  fs.writeFileSync(apiPath, getAuthConfigV4(providers, storage));

  writeEnv(providers, storage);
  console.log("✅ Pages Router (NextAuth v4) setup complete!");
}
export function updatePackageJson(storage = false, version = "V4") {
  const packageJsonPath = path.resolve("package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found. Run `npm init` first.");
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  // Ensure dependencies object exists
  packageJson.dependencies = packageJson.dependencies || {};

  // Add NextAuth based on version
  if (!packageJson.dependencies["next-auth"]) {
    if (version === "V5") {
      packageJson.dependencies["next-auth"] = "^5.0.0";
    } else if (version === "V4") {
      packageJson.dependencies["next-auth"] = "latest";
    }
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

  // ✅ Always write at the end
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
