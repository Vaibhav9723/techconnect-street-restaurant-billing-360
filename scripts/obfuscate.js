import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "fs";
import path from "path";

const buildPath = path.resolve("dist/public/assets");

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    stringArray: true,
    rotateStringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    disableConsoleOutput: true,
  });

  fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
  console.log("✔ Obfuscated:", filePath);
}

// Verify folder exists
if (!fs.existsSync(buildPath)) {
  console.error("❌ dist/public/assets not found");
  process.exit(1);
}

const files = fs.readdirSync(buildPath);

// Obfuscate ALL JS files
files.forEach((file) => {
  if (file.endsWith(".js")) {
    const fullPath = path.join(buildPath, file);
    obfuscateFile(fullPath);
  }
});
