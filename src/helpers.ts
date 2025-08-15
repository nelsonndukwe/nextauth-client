import fs from "fs";
import path from "path";
import { getAuthConfig } from "./templates/auth";

// --------- HELPERS ----------
export function scaffoldAppRouter(
  src: boolean,
  providers: string[],
  storage = false
) {
  console.log("📦 Setting up NextAuth.js for App Router...");
  const authPath = path.join(process.cwd(), "src", "auth.ts"); // Create an auth configuration file with the various providers and authentication settings
  const routePath = path.join(
    process.cwd(),
    "src",
    "app",
    "api",
    "auth",
    "[...nextauth]",
    "route.ts"
  ); // Creates a route path for the App Router

  fs.access(authPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        "❌ Auth configuration file already exists. Please remove it first.",
        err.message
      );
      process.exit(1);
    }
  });

  fs.mkdirSync(path.dirname(routePath), { recursive: true });

  fs.access(routePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        "❌ Route Path configuration file already exists. Please remove it first.",
        err.message
      );
      process.exit(1);
    }
  });

  fs.mkdirSync(path.dirname(routePath), { recursive: true });

  fs.writeFileSync(authPath, getAuthConfig(storage));
  fs.writeFileSync(
    routePath,
    `export { handlers as GET, handlers as POST } from "../../../../auth";`
  );

  console.log("✅ App Router setup complete!");
}

export function scaffoldPagesRouter(  providers: string[],
storage = false) {
  console.log("📦 Setting up NextAuth.js for Pages Router...");
  const apiPath = path.join(
    process.cwd(),
    "pages",
    "api",
    "auth",
    "[...nextauth].ts"
  );

  fs.access(apiPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(
        "❌ ApiPath configuration file already exists. Please remove it first.",
        err.message
      );
      process.exit(1);
    }
  });

  fs.mkdirSync(path.dirname(apiPath), { recursive: true });
  fs.writeFileSync(apiPath, getAuthConfig(storage));

  console.log("✅ Pages Router setup complete!");
}
