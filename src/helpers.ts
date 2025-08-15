import fs from "fs";
import path from "path";
import { getAuthConfig } from "./templates/auth";
import { writeMiddleware } from "./templates/middlewear";
import { autoInstall } from "./inquiery";

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
    process.exit(1);
  }
  if (fs.existsSync(routePath)) {
    console.error("Route file already exists. Please remove it first.");
    process.exit(1);
  }

  // Create directories
  fs.mkdirSync(path.dirname(routePath), { recursive: true });

  // Write files
  fs.writeFileSync(authPath, getAuthConfig(providers, storage));
  fs.writeFileSync(
    routePath,
    `import { handlers } from "@/auth";\nexport const { GET, POST } = handlers;`
  );
  fs.writeFileSync(middlewarePath, writeMiddleware());

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
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(apiPath), { recursive: true });

  fs.writeFileSync(apiPath, getAuthConfig(providers, storage));
  fs.writeFileSync(middlewarePath, writeMiddleware());
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
