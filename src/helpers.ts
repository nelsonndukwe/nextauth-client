import fs from "fs";
import path from "path";
import { getAuthConfig } from "./templates/auth";
import { writeMiddleware } from "./templates/middlewear";
import { autoInstall, rewrite } from "./inquiery";

export function scaffoldAppRouter(
  src: boolean,
  providers: string[],
  storage = false
) {
  console.log("📦 Setting up NextAuth.js for App Router...");

  const baseDir = src ? "src" : "";
  const authPath = path.join(process.cwd(), "auth.ts");
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
    console.error(
      "Auth configuration file already exists. Please remove it first."
    );

    const res = rewrite(path.parse(authPath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    }
  }
  if (fs.existsSync(routePath)) {
    console.error("Route file already exists. Please remove it first.");

    const res = rewrite(path.parse(routePath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    }
  }

  //check if middleware file exists and update with your data

  if (fs.existsSync(middlewarePath)) {
    const res = rewrite(path.parse(middlewarePath).name);
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
  fs.writeFileSync(authPath, getAuthConfig(providers, storage));
  fs.writeFileSync(
    routePath,
    `import { handlers } from "@/auth";\nexport const { GET, POST } = handlers;`
  );

  updatePackageJson(providers, storage);

  console.log("✅ App Router setup complete!");
  autoInstall();
}

export function scaffoldPagesRouter(providers: string[], storage = false) {
  console.log("📦 Setting up NextAuth.js for Pages Router...");

  const apiPath = path.join(
    process.cwd(),
    "pages",
    "api",
    "auth",
    "[...nextauth].ts"
  );
  const middlewarePath = path.resolve("middleware.ts");

  if (fs.existsSync(apiPath)) {
    console.error("❌ API route already exists. Please remove it first.");
    const res = rewrite(path.parse(apiPath).name);
    if (!res) {
      console.log("Exiting without changes.");
      process.exit(1);
    }
    process.exit(1);
  }

  //check if middleware file exists and update with your data

  if (fs.existsSync(middlewarePath)) {
    const res = rewrite(path.parse(middlewarePath).name);
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

  fs.writeFileSync(apiPath, getAuthConfig(providers, storage));
  updatePackageJson(providers, storage);
  console.log("✅ Pages Router setup complete!");

  autoInstall();
}

export function updatePackageJson(providers: string[], storage = false) {
  const packageJsonPath = path.resolve("package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found. Run `npm init` first.");
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  console.log(`packageJson`, packageJson);
  // Ensure dependencies object exists
  packageJson.dependencies = packageJson.dependencies || {};

  // Add NextAuth (required)
  packageJson.dependencies["next-auth"] = "^5.0.0";

  // Add selected providers
  providers.forEach((provider) => {
    packageJson.dependencies[`@auth/${provider}`] = "latest";
  });

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
