<div align="center">

# 🥐 croissant-electron

### The Ultimate Modern Electron + React 19 Boilerplate & CLI Generator

**Build ultra-fast, cross-platform desktop applications with React 19, TypeScript, TanStack Router, Tailwind CSS v4, shadcn/ui, and Rust-powered tooling.**

[![npm version](https://img.shields.io/npm/v/croissant-electron?color=blue&style=flat-square)](https://www.npmjs.com/package/croissant-electron)
[![npm downloads](https://img.shields.io/npm/dm/croissant-electron?style=flat-square&color=green)](https://www.npmjs.com/package/croissant-electron)
[![GitHub license](https://img.shields.io/github/license/croissantsam/croissant-electron?style=flat-square)](https://github.com/croissantsam/croissant-electron/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/croissantsam/croissant-electron?style=flat-square)](https://github.com/croissantsam/croissant-electron)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen?style=flat-square)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/croissantsam/croissant-electron/pulls)

[Quick Start](#-quick-start) • [Features](#-features) • [Why croissant-electron?](#-why-croissant-electron) • [Comparison](#-comparison-matrix) • [Architecture](#-project-structure) • [Documentation](#-guides--how-to)

</div>

---

## 🌟 Overview

**croissant-electron** is an open-source boilerplate and project scaffolding tool designed to eliminate Electron fatigue. While most Electron starters are still trapped in legacy tooling (Webpack, React 18, React Router v6, ESLint, and Tailwind v3), **croissant-electron** provides a modern, production-ready stack for desktop app development:

- ⚡️ **Vite 8 & Electron 44+** powered by `electron-vite` for sub-millisecond HMR.
- ⚛️ **React 19 & TypeScript Strict Mode** for bleeding-edge UI performance and type safety.
- 🗂️ **TanStack Router** for 100% type-safe, file-based routing and search parameter validation.
- 🎨 **Tailwind CSS v4 & shadcn/ui** (Base Nova style) with OKLCH tokens and built-in dark mode.
- 🦀 **Oxlint & Oxfmt** (Rust-based) for lightning-fast linting and formatting (50x faster than ESLint + Prettier).
- 🔒 **Secure-by-Design Architecture** using `contextBridge` with zero Node.js leaks in the renderer process.
- 📦 **Automated Cross-Platform Packaging** via `electron-builder` and `electron-updater` for macOS (Universal, DMG), Windows (NSIS), and Linux (AppImage, deb).

---

## 🚀 Quick Start

### Create a new project using the CLI

You can generate a new, fully configured Electron application in seconds with zero configuration:

```bash
npx croissant-electron init my-desktop-app
```

Then navigate into your project and start developing:

```bash
cd my-desktop-app
pnpm install
pnpm dev
```

### Or clone directly from GitHub

```bash
git clone https://github.com/croissantsam/croissant-electron.git my-app
cd my-app
pnpm install
pnpm dev
```

---

## ✨ Features

| Feature                              | Description                                                                                                                   |
| :----------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| ⚡️ **Instant HMR & Fast Rebuilds**   | Powered by [electron-vite](https://electron-vite.org/) and Vite 8 for fast main-process restarts and renderer hot-reloading.  |
| ⚛️ **React 19 Ready**                | Built with React 19 and modern concurrent features, suspense, and functional hooks.                                           |
| 🗂️ **Type-Safe File-Based Routing**  | Integrated with **TanStack Router**. Add a file in `src/renderer/src/routes/` and routes are automatically generated.         |
| 🎨 **Tailwind CSS v4 + shadcn/ui**   | Next-generation styling with the new CSS-first Tailwind v4 engine and accessible, unstyled primitives from Base UI & Radix.   |
| 🦀 **Rust Tooling (Oxlint + Oxfmt)** | Sub-second linting and formatting without ESLint/Prettier overhead or dependency bloat.                                       |
| 🔒 **Enterprise-Grade Security**     | Hardened Electron settings with `contextIsolation: true`, `nodeIntegration: false`, and strict IPC type safety.               |
| 🛡 **V8 Bytecode Compilation**        | Protect your proprietary source code by compiling main and preload scripts directly to V8 bytecode during build.              |
| 🔄 **Auto-Updater Included**         | Configured with `electron-updater` for differential updates across Windows, macOS, and Linux.                                 |
| 📦 **Automated CI/CD**               | GitHub Actions workflows included for weekly dependency updates, type checking, build validation, and automated npm releases. |

---

## 🥊 Comparison Matrix

Why choose **croissant-electron** over traditional templates like `electron-react-boilerplate` or vanilla `create-electron`?

| Feature / Tool         |        croissant-electron        |  Official electron-vite template   | electron-react-boilerplate (ERB) |
| :--------------------- | :------------------------------: | :--------------------------------: | :------------------------------: |
| **Electron Version**   |    **Electron 44+ (Latest)**     |            Electron 39             |          Electron 30-33          |
| **Frontend Framework** |           **React 19**           |              React 19              |             React 18             |
| **Router**             | **TanStack Router (File-based)** |           None (Manual)            |  React Router v6 (Config-based)  |
| **Component Library**  |    **shadcn/ui (Base Nova)**     |                None                |               None               |
| **CSS Engine**         |       **Tailwind CSS v4**        |     Vanilla CSS / CSS Modules      |    Tailwind v3 / CSS Modules     |
| **Linter & Formatter** |    **Oxlint + Oxfmt (Rust)**     |         ESLint + Prettier          |        ESLint + Prettier         |
| **Dark Mode**          | **Built-in (`theme-provider`)**  |               Manual               |              Manual              |
| **CLI Scaffolder**     |  `npx croissant-electron init`   | `npm create @quick-start/electron` |         `git clone` only         |
| **HMR Speed**          |       **< 10ms (Vite 8)**        |            Fast (Vite)             |          Slow (Webpack)          |

---

## 📂 Project Structure

```
croissant-electron/
├── bin/                          # CLI project generator
├── build/                        # Packaging assets (entitlements, icons)
├── resources/                    # App icons (icon.icns, icon.ico, icon.png)
├── src/
│   ├── main/                     # Electron Main Process (Node.js)
│   │   └── index.ts              # Window creation, app lifecycle, IPC handlers
│   ├── preload/                  # Secure Preload Bridge (contextBridge)
│   │   ├── index.ts              # Expose safe APIs to window.electronAPI
│   │   └── index.d.ts            # TypeScript definitions for window
│   └── renderer/                 # Electron Renderer Process (React SPA)
│       ├── index.html            # HTML entry point
│       └── src/
│           ├── main.tsx          # React application root & router setup
│           ├── routeTree.gen.ts  # Auto-generated TanStack route tree
│           ├── routes/           # File-based routes
│           │   ├── __root.tsx    # Root layout (ThemeProvider, DevTools, Outlet)
│           │   ├── index.tsx     # Homepage route ("/")
│           │   └── examples/     # Example routes & pages
│           ├── components/       # Reusable React components
│           │   ├── ui/           # shadcn/ui components (Button, Dialog, Form...)
│           │   ├── mode-toggle.tsx
│           │   └── theme-provider.tsx
│           ├── hooks/            # Custom hooks
│           ├── lib/              # Utilities (cn, helpers)
│           └── styles/           # Global styles & Tailwind v4 theme
├── components.json               # shadcn/ui configuration
├── electron.vite.config.ts       # Vite config for Main, Preload, and Renderer
├── electron-builder.yml          # Desktop packaging configuration
├── package.json
└── tsconfig.json
```

---

## 🛠️ Available Scripts

| Command             | Description                                                                                 |
| :------------------ | :------------------------------------------------------------------------------------------ |
| `pnpm dev`          | Starts the Vite dev server and launches Electron with hot-reloading                         |
| `pnpm build`        | Runs type checking and builds main, preload, and renderer processes                         |
| `pnpm build:unpack` | Builds the app and packages it into an unpacked directory for testing                       |
| `pnpm build:mac`    | Packages the application for macOS (`.dmg`, `.zip`, Universal binary)                       |
| `pnpm build:win`    | Packages the application for Windows (`.exe` NSIS installer, portable)                      |
| `pnpm build:linux`  | Packages the application for Linux (`.AppImage`, `.deb`)                                    |
| `pnpm typecheck`    | Validates TypeScript types across both Node (main/preload) and Web (renderer)               |
| `pnpm lint`         | Runs [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) across all files in milliseconds |
| `pnpm format`       | Formats files with [Oxfmt](https://oxc.rs/)                                                 |

---

## 📖 Guides & How-To

### 1. Adding a New Route (TanStack Router)

Routes are automatically recognized based on files in `src/renderer/src/routes/`.

To create a new `/settings` page, simply add `src/renderer/src/routes/settings.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2">Manage your app preferences.</p>
    </div>
  );
}
```

The route tree in `routeTree.gen.ts` will regenerate automatically when you save!

### 2. Adding shadcn/ui Components

All shadcn/ui components are fully supported using the `base-nova` style and Tailwind v4. Add any component via the CLI:

```bash
pnpm dlx shadcn@latest add dialog form input card
```

Components will be placed in `src/renderer/src/components/ui/` ready for import.

### 3. Adding Secure IPC Channels

Electron communication should always go through `contextBridge`:

**1. Define your API type** in `src/preload/index.d.ts`:

```ts
export interface ElectronAPI {
  ping: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

**2. Expose the API** in `src/preload/index.ts`:

```ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping"),
});
```

**3. Handle the event** in `src/main/index.ts`:

```ts
import { ipcMain } from "electron";

ipcMain.handle("ping", () => "pong");
```

**4. Call it from your React component**:

```tsx
const reply = await window.electronAPI.ping();
console.log(reply); // "pong"
```

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><strong>Why use TanStack Router instead of React Router?</strong></summary>

TanStack Router is 100% type-safe from the ground up. It automatically validates URLs, search parameters, loaders, and nested layouts at compile-time. If you rename a route or pass the wrong query parameter, TypeScript will throw an error immediately, eliminating broken links and runtime navigation bugs in desktop apps.
</details>

<details>
<summary><strong>Why Oxlint + Oxfmt instead of ESLint + Prettier?</strong></summary>

Oxlint and Oxfmt are written in Rust. They run 50x to 100x faster than traditional ESLint and Prettier setups, requiring zero heavy plugin chains while catching common React, TypeScript, and JSX issues instantly.
</details>

<details>
<summary><strong>Can I package my app for Windows and Linux from macOS?</strong></summary>

Yes! `electron-builder` supports multi-target builds. Run `pnpm build:win` or `pnpm build:linux` (or use GitHub Actions for native multi-platform CI/CD runners).
</details>

<details>
<summary><strong>Does croissant-electron support dark mode?</strong></summary>

Yes. It comes with a pre-configured `ThemeProvider` in `src/renderer/src/components/theme-provider.tsx` supporting `light`, `dark`, and `system` modes using Tailwind CSS v4 variables.
</details>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project: `https://github.com/croissantsam/croissant-electron`
2. Create your Feature Branch: `git checkout -b feature/AmazingFeature`
3. Commit your Changes: `git commit -m 'feat: add AmazingFeature'`
4. Push to the Branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📝 License

Distributed under the **MIT License**. See [LICENSE](file:///Users/sam/Dev/croissantlabs/croissant-electron/LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/croissantsam">croissantsam</a></sub>
</div>
