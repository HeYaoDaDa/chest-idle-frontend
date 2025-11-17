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
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with ESLint

```sh
npm run lint
```

### Format with Prettier

```sh
npm run format
```

## Testing

This project has comprehensive test coverage (73.34%):

```sh
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open Vitest UI
npm run test:ui
```

See [docs/TESTING.md](docs/TESTING.md) for detailed testing guide.

## Documentation

- [Testing Guide](docs/TESTING.md) - Complete testing documentation
- [Test Summary](docs/TEST_SUMMARY.md) - Test coverage and statistics

## UnoCSS Inspector

Open `http://localhost:5173/__unocss/` while dev server is running to inspect UnoCSS classes.
