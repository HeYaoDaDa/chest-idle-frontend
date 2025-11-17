# Testing Guide

本项目使用 Vitest 作为测试框架，支持单元测试和集成测试。

## 快速开始

### 安装依赖

首次运行测试前，请先安装依赖：

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时推荐）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 使用 UI 界面运行测试
npm run test:ui
```

## 项目结构

测试文件位于被测试文件的同级 `__tests__` 目录中：

```
src/
  utils/
    __tests__/
      fixedPoint.spec.ts
      amount.spec.ts
      format.spec.ts
  stores/
    __tests__/
      notification.spec.ts
      actionQueue.spec.ts
      inventory.spec.ts
```

## 测试覆盖范围

### 已完成

- ✅ **Utils 纯函数测试** (100% 覆盖)

  - `fixedPoint.ts`: 定点数转换、四则运算、比较、取整
  - `amount.ts`: 无限数量处理、递减逻辑
  - `format.ts`: 数字、百分比、时长格式化

- ✅ **Stores 状态管理测试** (79.11% 覆盖)

  - `notification.ts`, `action.ts`, `skill.ts`, `stat.ts` - 100% 覆盖
  - `chestPoint.ts`, `consumable.ts`, `app.ts`, `equippedItem.ts` - 100% 覆盖
  - `actionQueue.ts` - 95.53% 覆盖
  - `inventory.ts` - 63.1% 覆盖
  - `actionRunner.ts` - 跳过（依赖 requestAnimationFrame）

- ✅ **组件测试** (68.25% 覆盖)
  - `ConsumableSlot.tsx` - 100% 覆盖
  - `ModalBox.tsx` - 100% 覆盖
  - `ActionQueue.tsx` - 93.84% 覆盖

### 待优化

以下模块可继续提升覆盖率：

- `inventory.ts` - 目前 63.1%，可添加更多边界情况测试
- Modal 子组件 - ActionModalBox, ChestModalBox 等
- `actionRunner.ts` - 依赖 requestAnimationFrame，建议重构或 E2E 测试

## 编写测试指南

### 基本结构

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('feature name', () => {
  beforeEach(() => {
    // 每个测试前重置 Pinia
    setActivePinia(createPinia())
  })

  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = doSomething(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Mock 技巧

#### 时间相关

```typescript
import { vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

it('should auto-remove after duration', () => {
  // ... setup
  vi.advanceTimersByTime(2000)
  // ... assert
})
```

#### 随机性

```typescript
vi.spyOn(Math, 'random').mockReturnValue(0.5)
```

#### 浏览器 API

```typescript
vi.spyOn(performance, 'now').mockReturnValue(1000)
```

## 测试配置

测试配置在以下文件中：

- `vitest.config.ts`: Vitest 主配置
- `test/setup.ts`: 全局测试 setup（Pinia、i18n、虚拟模块 mock）

## CI/CD 集成

在 CI 中运行测试的推荐配置：

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 常见问题

### Q: 测试中如何处理 i18n？

A: `test/setup.ts` 已经配置了轻量级 i18n 实例，可直接使用。如需自定义，使用 `createTestI18n()` 工厂函数。

### Q: 测试中如何处理路由？

A: 使用 `vue-router` 的 `createMemoryHistory` 创建测试路由实例：

```typescript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    /* ... */
  ],
})
```

### Q: 如何调试失败的测试？

A: 使用 `test:ui` 命令打开可视化界面，或在测试中添加 `console.log()` 查看中间状态。

## 项目测试统计

- **测试文件**: 16 个
- **测试用例**: 314 个
- **整体覆盖率**: 73.34%
- **Utils 覆盖率**: 100%
- **Stores 覆盖率**: 79.11%
- **Components 覆盖率**: 68.25%

详细统计请查看 [TEST_SUMMARY.md](TEST_SUMMARY.md)。

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
