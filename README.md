# chest-idle

A Vue 3 idle game built with **TypeScript + TSX** and **UnoCSS**.

## Tech Stack

- **Vue 3.5** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **TSX** - JSX syntax for Vue (no `.vue` SFC files)
- **UnoCSS** - Instant on-demand atomic CSS engine
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vue I18n** - Internationalization

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) with these extensions:

- [UnoCSS](https://marketplace.visualstudio.com/items?itemName=antfu.unocss) - UnoCSS intellisense
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Code linting
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatting
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally) - i18n management

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with ESLint

```sh
pnpm lint
```

### Format with Prettier

```sh
pnpm format
```

## Testing

This project has comprehensive test coverage:

```sh
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Open Vitest UI
pnpm test:ui

### End-to-end (Playwright)

This project includes a basic Playwright E2E test setup. To run them:

```bash
# Install browsers (first time only)
pnpm exec playwright install

# Run Playwright E2E tests
pnpm run test:e2e
```
```

## Documentation

See [docs/README.md](docs/README.md) for project documentation.

## Contributing Guidelines

### Time Unit Convention

**All time/duration values in this project must use seconds as the base unit.**

- Variable and field names must include a unit suffix: `Seconds`, `Sec`, or `SecondsFixed` (for FixedPoint values)
- Examples: `durationSeconds`, `attackIntervalSeconds`, `remainingSecondsFixed`
- Only convert to milliseconds at the UI rendering layer when absolutely necessary (e.g., `seconds * 1000`)
- JSON config files should also use `*Seconds` field names with values in seconds

## UnoCSS Inspector

Open `http://localhost:5173/__unocss/` while dev server is running to inspect UnoCSS classes.
