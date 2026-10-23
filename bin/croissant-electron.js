#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE_ROOT = path.resolve(__dirname, "..");

const ignoredNames = new Set([
  ".DS_Store",
  ".git",
  ".github",
  ".pnpm-store",
  "bin",
  "dist",
  "node_modules",
  "out",
]);

const ignoredFiles = new Set(["AGENTS.md", "README.md", "npm-debug.log", "yarn-error.log"]);

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
  packageJson.scripts.postinstall = "install-electron && electron-builder install-app-deps";

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

An Electron application with React, TypeScript, TanStack Router, Tailwind CSS, and shadcn/ui.

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

function writeProjectAgentsMd(projectRoot, packageName) {
  writeText(
    path.join(projectRoot, "AGENTS.md"),
    `# ${packageName} - Agent Instructions

## Project Overview

An Electron application with React 19, TypeScript, TanStack Router, Tailwind CSS v4,
shadcn/ui, and Oxlint + Oxfmt. Generated with croissant-electron.

## Project Structure

\`\`\`
${packageName}/
├── build/                  # Electron builder config (entitlements, etc.)
├── resources/              # App icons and assets
├── src/
│   ├── main/               # Main process (Node.js/Electron APIs)
│   │   └── index.ts        # App entry, window creation, IPC
│   ├── preload/            # Preload scripts (secure bridge)
│   │   ├── index.ts        # Preload implementation
│   │   └── index.d.ts      # Type declarations for contextBridge
│   └── renderer/           # Renderer process (React app)
│       ├── index.html      # HTML entry point
│       └── src/
│           ├── main.tsx    # React root, router setup
│           ├── routeTree.gen.ts  # Auto-generated TanStack routes
│           ├── routes/     # File-based routing
│           │   ├── __root.tsx    # Root layout (theme, devtools)
│           │   ├── index.tsx     # Home route
│           │   └── examples/     # Example routes
│           ├── components/ # React components
│           │   ├── ui/     # shadcn/ui components
│           │   ├── theme-provider.tsx
│           │   ├── mode-toggle.tsx
│           │   └── Versions.tsx
│           ├── hooks/      # Custom React hooks
│           ├── lib/        # Utilities (cn, etc.)
│           └── styles/     # Global styles (app.css, Tailwind)
├── components.json         # shadcn/ui configuration
├── electron.vite.config.ts # Vite config for main/preload/renderer
├── electron-builder.yml    # Electron Builder config
├── tsconfig.json           # Base TypeScript config
├── tsconfig.node.json      # Node/TS config for main/preload
├── tsconfig.web.json       # Web/TS config for renderer
└── package.json
\`\`\`

## Key Technologies & Patterns

### Electron Architecture

- **Main process** (\`src/main/index.ts\`): Creates BrowserWindow, handles app lifecycle, IPC
- **Preload script** (\`src/preload/index.ts\`): Secure contextBridge for renderer↔main communication
- **Renderer** (\`src/renderer/\`): React SPA with TanStack Router

### Routing (TanStack Router)

- File-based routing in \`src/renderer/src/routes/\`
- Route tree auto-generated to \`routeTree.gen.ts\`
- Root layout in \`__root.tsx\` wraps all routes with ThemeProvider + DevTools
- Use \`createRootRoute\`, \`createFileRoute\` from \`@tanstack/react-router\`

### Styling

- Tailwind CSS v4 via \`@tailwindcss/vite\` plugin
- Global styles in \`src/renderer/src/styles/app.css\`
- shadcn/ui components use CSS variables for theming
- \`components.json\` defines aliases: \`@/components\`, \`@/lib/utils\`, \`@/components/ui\`, \`@/hooks\`

### Component Library (shadcn/ui)

- Components in \`src/renderer/src/components/ui/\`
- Base style: \`base-nova\` (from components.json)
- Icons: \`lucide-react\`
- Add components via: \`pnpm dlx shadcn@latest add <component>\`

## Development Commands

\`\`\`bash
# Install dependencies
pnpm install

# Development (starts Vite + Electron)
pnpm dev

# Type checking
pnpm run typecheck        # Both node + web
pnpm run typecheck:node   # Main/preload only
pnpm run typecheck:web    # Renderer only

# Linting & Formatting
pnpm run lint             # Oxlint
pnpm run lint:fix         # Oxlint --fix
pnpm run format           # Oxfmt
pnpm run fmt:check        # Oxfmt --check

# Build
pnpm run build            # Typecheck + electron-vite build
pnpm run build:unpack     # Build + electron-builder --dir

# Platform-specific builds
pnpm run build:win        # Windows
pnpm run build:mac        # macOS
pnpm run build:linux      # Linux
\`\`\`

## Code Conventions

### TypeScript

- Strict mode enabled
- Path aliases: \`@/\` → \`src/renderer/src/\`
- Separate tsconfigs for node (main/preload) and web (renderer)

### React

- Functional components with hooks
- TanStack Router for navigation (not React Router)
- Use \`Outlet\` for nested routes

### Electron IPC

- Define types in \`src/preload/index.d.ts\`
- Expose via \`contextBridge.exposeInMainWorld\` in preload
- Call from renderer via \`window.electronAPI.*\`

### Adding shadcn/ui Components

\`\`\`bash
pnpm dlx shadcn@latest add button dialog form
\`\`\`

Components are added to \`src/renderer/src/components/ui/\`

## Important Files to Know

| File                                 | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| \`electron.vite.config.ts\`            | Vite config for all three processes   |
| \`src/main/index.ts\`                  | Main process entry, window management |
| \`src/preload/index.ts\`               | Secure IPC bridge                     |
| \`src/renderer/src/main.tsx\`          | React app bootstrap                   |
| \`src/renderer/src/routes/__root.tsx\` | Root layout (theme, providers)        |
| \`components.json\`                    | shadcn/ui configuration               |
| \`electron-builder.yml\`               | Packaging configuration               |

## Common Tasks

### Add a New Route

Create file in \`src/renderer/src/routes/\` (e.g., \`settings.tsx\`), TanStack Router auto-generates route tree.

### Add a New IPC Channel

1. Add type to \`src/preload/index.d.ts\`
2. Implement in \`src/preload/index.ts\` via \`contextBridge\`
3. Handle in \`src/main/index.ts\` via \`ipcMain.handle\`
4. Call from renderer via \`window.electronAPI.channelName()\`

### Modify Theme

Edit \`src/renderer/src/styles/app.css\` (CSS variables) and \`components.json\` (baseColor).

### Update shadcn/ui Components

\`\`\`bash
pnpm dlx shadcn@latest add -o button  # Overwrite existing
\`\`\`

## Debugging

- **Main process**: VS Code debug config for Electron main
- **Renderer**: DevTools (F12 in dev), React DevTools, TanStack Router DevTools
- **Preload**: Console logs appear in renderer DevTools

## Environment

- Node.js 20+
- pnpm 9+
- macOS/Windows/Linux supported
`,
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
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
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

  if (fs.existsSync(targetDirectory) && fs.readdirSync(targetDirectory).length > 0) {
    console.error(`Cannot create project in a non-empty directory: ${targetDirectory}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDirectory, { recursive: true });
  copyTemplate(TEMPLATE_ROOT, targetDirectory);

  updatePackageJson(targetDirectory, packageName);
  writeProjectReadme(targetDirectory, packageName);
  writeProjectDotfiles(targetDirectory);
  writeProjectAgentsMd(targetDirectory, packageName);

  const replacements = [["croissant-electron", packageName]];
  replaceInFile(path.join(targetDirectory, "electron-builder.yml"), replacements);
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
