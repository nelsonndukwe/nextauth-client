import inquirer from "inquirer";
import { execSync } from "child_process";

export async function askSetupQuestions() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "routerType",
      message: "Which Next.js router are you using?",
      choices: ["App Router", "Pages Router"],
    },
    {
      type: "confirm",
      name: "isSrc",
      message: "Is your code inside a src directory?",
      default: false,
    },
    {
      type: "checkbox",
      name: "providers",
      message: "Select authentication providers:",
      choices: [
        { name: "GitHub", value: "github" },
        { name: "Google", value: "google" },
        { name: "Auth0", value: "auth0" },
        { name: "Discord", value: "discord" },
        { name: "Apple", value: "apple" },
        { name: "Twitter", value: "twitter" },
      ],
      validate: (selected) => {
        if (selected.length === 0) {
          return "You must choose at least one provider.";
        }
        return true;
      },
    },
    {
      type: "confirm",
      name: "storage",
      message: "Do you want to use Upstash Redis for session storage?",
      default: false,
    },
  ]);

  console.log("User selections:", answers);
  return answers;
}

export const autoInstall = async () => {
  const { installNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "installNow",
      message: "Do you want to install these dependencies now?",
      default: true,
    },
  ]);

  if (installNow) {
    execSync("npm install", { stdio: "inherit" });
  }
};

export const rewrite = async (filename: string) => {
  const { rewrite } = await inquirer.prompt([
    {
      type: "confirm",
      name: "rewrite",
      message: `Do you want to rewrite ${filename}, all existing content will be lost?`,
      default: false,
    },
  ]);
console.log(`rewrite`, rewrite);
  return rewrite;
};
