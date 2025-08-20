import fs from "fs";
import path from "path";

const filesToCopy = ["package.json", "README.md", "LICENSE"];

for (const file of filesToCopy) {
  const src = path.resolve(file);
  const dest = path.resolve("dist", file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  } else {
    console.warn(`⚠️ Skipped ${file}, not found`);
  }
}
