# Quiz2 Monorepo

This is a TypeScript monorepo containing a React web app and a NestJS server.

## Structure

- `packages/webapp`: React with Vite mobile web application using UnoCSS
- `packages/server`: NestJS API server

## Features

- **UnoCSS**: Instant on-demand Atomic CSS engine for the webapp
- **NestJS Backend**: Robust API server
- **Monorepo Structure**: Shared workspace for easier development
- **TypeScript**: End-to-end type safety

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- Yarn

### Installation

```bash
# Install dependencies
yarn install
```

### Development

To run both the webapp and server in development mode:

```bash
# Start both the server and webapp
yarn dev

# Or run them individually
yarn server dev
yarn webapp dev
```

### Building

```bash
# Build both projects
yarn build
```

## Ports

- React webapp: http://localhost:5173
- NestJS server: http://localhost:3000