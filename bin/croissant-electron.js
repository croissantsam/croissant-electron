#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE_ROOT = path.resolve(__dirname, "..");

const ignoredNames = new Set([
  ".DS_Store",
  ".git",
  ".pnpm-store",
  "bin",
  "dist",
  "node_modules",
  "out",
]);

const ignoredFiles = new Set(["npm-debug.log", "yarn-error.log"]);

function usage() {
  console.log(`
Usage:
  npx croissant-electron init <project-name>

Example:
  npx croissant-electron init my-electron-app
`);
}

function toPackageName(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .at(-1)
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidPackageName(name) {
  return /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(name);
}

function copyTemplate(source, destination) {
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredNames.has(entry.name) || ignoredFiles.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyTemplate(sourcePath, destinationPath);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
      fs.chmodSync(destinationPath, fs.statSync(sourcePath).mode);
    }
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value);
}

function updatePackageJson(projectRoot, packageName) {
  const packageJsonPath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(readText(packageJsonPath));

  packageJson.name = packageName;
  packageJson.version = "0.1.0";
  packageJson.description = "An Electron application with React and TypeScript";
  packageJson.homepage = "";
  packageJson.author = "";
  packageJson.private = true;
  packageJson.scripts.postinstall = "electron-builder install-app-deps";

  delete packageJson.bin;
  delete packageJson.files;

  writeText(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let text = readText(filePath);
  for (const [from, to] of replacements) {
    text = text.replaceAll(from, to);
  }
  writeText(filePath, text);
}

function writeProjectReadme(projectRoot, packageName) {
  writeText(
    path.join(projectRoot, "README.md"),
    `# ${packageName}

An Electron application with React, TypeScript, TanStack Router, Tailwind CSS, a
nd shadcn/ui.

## Project Setup

### Install

\`\`\`bash
pnpm install
\`\`\`

### Development

\`\`\`bash
pnpm dev
\`\`\`

### Build

\`\`\`bash
pnpm build
\`\`\`
\n`,
  );
}

function writeProjectDotfiles(projectRoot) {
  writeText(
    path.join(projectRoot, ".gitignore"),
    `node_modules
dist
out
.DS_Store
*.log*
.pnpm-store
.tanstack
`,
  );

  writeText(
    path.join(projectRoot, ".npmrc"),
    `electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-
binaries/
shamefully-hoist=true
`,
  );
}

function init(projectName) {
  const packageName = toPackageName(projectName);

  if (!packageName || !isValidPackageName(packageName)) {
    console.error(`Invalid project name: ${projectName}`);
    process.exit(1);
  }

  const targetDirectory = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDirectory) && fs.readdirSync(targetDirectory).length >
 0) {
    console.error(`Cannot create project in a non-empty directory: ${targetDirectory}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDirectory, { recursive: true });
  copyTemplate(TEMPLATE_ROOT, targetDirectory);

  updatePackageJson(targetDirectory, packageName);
  writeProjectReadme(targetDirectory, packageName);
  writeProjectDotfiles(targetDirectory);

  const replacements = [["croissant-electron", packageName]];
  replaceInFile(path.join(targetDirectory, "electron-builder.yml"), replacements
);
  replaceInFile(path.join(targetDirectory, "dev-app-update.yml"), replacements);

  const cdTarget = path.isAbsolute(projectName) ? targetDirectory : projectName;

  console.log(`Created ${packageName} in ${targetDirectory}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  cd ${cdTarget || "."}`);
  console.log("  pnpm install");
  console.log("  pnpm dev");
}

const [command, projectName] = process.argv.slice(2);

if (command === "--help" || command === "-h") {
  usage();
  process.exit(0);
}

if (command !== "init" || !projectName) {
  usage();
  process.exit(command ? 1 : 0);
}

init(projectName);