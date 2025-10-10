# Augen Auf OpenMRS Frontend Module

A bare-bones OpenMRS 3 frontend module.

## Prerequisites

This project uses Yarn 4 with Corepack. You need Node.js 16.9+ or 14.19+.

### Install Yarn

1. Enable Corepack (included with Node.js 16.9+):
```bash
corepack enable
```

2. If you don't have Corepack, install it first:
```bash
npm install -g corepack
corepack enable
```

3. The correct Yarn version (4.10.3) will be automatically installed when you run `yarn install`

Alternatively, install Yarn globally without Corepack:
```bash
npm install -g yarn
```

Note: When using Corepack, the project's `packageManager` field in `package.json` ensures everyone uses the same Yarn version.

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Start development server:
```bash
yarn start
```

3. The module will be available at the route `/augen-auf`

## Structure

- `src/index.ts` - Module entry point
- `src/root.component.tsx` - Main React component
- `src/config-schema.ts` - Configuration schema
- `src/routes.json` - Route definitions
