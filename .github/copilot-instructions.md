# GitHub Copilot Instructions for chest-idle

## Project Overview

This is a Vue 3 + TypeScript idle game project using Pinia for state management.

## Key Commands

### Development

- `npm run dev` - Start development server (runs continuously)
- `npm run dev:check` - Build in dev mode and exit (for CI/automation)
- `npm run build` - Production build with type checking
- `npm run preview` - Preview production build

### Testing

- `npm test` - Run all tests once (exits after completion)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:ui` - Open Vitest UI

### Code Quality

- `npm run lint` - Lint and auto-fix code
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking
- `npm run verify` - Full verification: type-check → test → lint (recommended for validation)

## Project Structure

```
src/
  ├── components/     # Vue components
  │   ├── __tests__/  # Component tests (100% coverage for key components)
  │   └── modals/     # Modal components
  ├── stores/         # Pinia stores (79% coverage)
  │   └── __tests__/  # Store tests
  ├── utils/          # Utility functions (100% coverage)
  │   └── __tests__/  # Utils tests
  ├── gameConfig/     # Game configuration
  ├── i18n/           # Internationalization (zh/en)
  ├── pages/          # Page components
  └── data/           # Game data (JSON)
```

## Important Patterns

### FixedPoint System

- All numeric values use FixedPoint type (brand type, scale 1000)
- In tests: use `toFixed(value)` for assignments
- In mocks: use literals (e.g., `base: 0` not `base: toFixed(0)`)

### Testing Guidelines

- 314 tests, 16 test files, 73.34% overall coverage
- Use `vitest` with `@vue/test-utils` for components
- Mock gameConfig with `vi.mock('@/gameConfig', ...)`
- Teleport components: use `attachTo: document.body`
- See `docs/TESTING.md` for detailed guidelines

### State Management

- Pinia stores in `src/stores/`
- Use `setActivePinia(createPinia())` in tests
- Stores: action, skill, stat, inventory, consumable, etc.

## Key Files

- `docs/TESTING.md` - Complete testing guide
- `docs/TEST_SUMMARY.md` - Test status and coverage details
- `vitest.config.ts` - Test configuration
- `test/setup.ts` - Global test setup

## Best Practices

1. **For AI Agents**: Use `npm run verify` or `npm test` to validate code, NOT `npm run dev` (it won't exit)
2. **Type Safety**: Always use TypeScript types, avoid `any`
3. **Testing**: Write tests for new features, maintain 70%+ coverage
4. **i18n**: Support both Chinese (zh) and English (en)
5. **Code Style**: Run `npm run lint` before committing

## Notes

- Project uses UnoCSS for styling
- Vue Router for navigation
- Axios for HTTP requests (if needed)
- All tests must pass before merging
