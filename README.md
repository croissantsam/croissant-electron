# croissant-electron

A boilerplate for Electron, React, TypeScript, TanStack Router, Tailwind CSS, and shadcn/ui.

Based on [electron-vite](https://electron-vite.org/) ([github.com/alex8088/electron-vite](https://github.com/alex8088/electron-vite)).

## Features

- ⚡️ **Vite** powered - use the same way as Vite
- 🛠 **Pre-configured** with sensible defaults optimized for Electron
- 💡 **Optimized asset handling** for Electron main process
- 🚀 **Fast HMR & hot reloading**
- 🔥 **Isolated build** for multi-entry application development
- ✨ **Simplified multi-threading** development
- 🔒 **Compile code to v8 bytecode** to protect source code
- 🔌 **Easy to debug** in IDEs such as VSCode or WebStorm
- 📦 **Out-of-the-box support** for TypeScript, React, TanStack Router, Tailwind CSS, and shadcn/ui

## Create a project

```bash
npx croissant-electron init my-electron-app
cd my-electron-app
pnpm install
pnpm dev
```

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Configuration

The project uses `electron.vite.config.ts` for configuration. The config file supports three entry points:

```typescript
// electron.vite.config.ts
export default {
  main: {
    // vite config options for main process
  },
  preload: {
    // vite config options for preload scripts
  },
  renderer: {
    // vite config options for renderer process
  },
};
```

## Project Structure

```
src/
├── main/           # Main process code
│   └── index.ts
├── preload/        # Preload scripts
│   └── index.ts
└── renderer/       # Renderer process (React app)
    ├── index.html
    └── src/
        ├── main.tsx
        ├── routes/         # TanStack Router routes
        ├── components/     # shadcn/ui components
        ├── hooks/          # Custom React hooks
        ├── lib/            # Utility functions
        └── styles/         # Global styles
```

## Tech Stack

- **Electron** - Cross-platform desktop apps
- **Vite** - Next generation frontend tooling
- **React** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - Type-safe routing
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful, accessible components

## License

MIT
