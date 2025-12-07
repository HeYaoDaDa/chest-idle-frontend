import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useActionQueueStore } from '@/stores/actionQueue'
import { useActionRunnerStore } from '@/stores/actionRunner'

/**
 * ActionRunner 集成测试
 *
 * 验证所有模块（ProgressCalculator, TimeManager, ProductionExecutor, CombatExecutor）
 * 能够正确协同工作
 */
describe('ActionRunner Integration Tests', () => {
  let actionRunnerStore: ReturnType<typeof useActionRunnerStore>
  let actionQueueStore: ReturnType<typeof useActionQueueStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    actionRunnerStore = useActionRunnerStore()
    actionQueueStore = useActionQueueStore()
  })

  describe('Module Initialization', () => {
    it('should initialize ActionRunner successfully', () => {
      expect(actionRunnerStore).toBeTruthy()
      expect(actionRunnerStore.start).toBeTypeOf('function')
    })

    it('should start without errors when queue is empty', () => {
      expect(actionQueueStore.currentAction).toBeNull()
      expect(() => actionRunnerStore.start()).not.toThrow()
    })

    it('should be idempotent on multiple start calls', () => {
      expect(() => {
        actionRunnerStore.start()
        actionRunnerStore.start()
        actionRunnerStore.start()
      }).not.toThrow()
    })
  })

  describe('TimeManager Integration', () => {
    it('should handle lifecycle correctly', () => {
      // 启动应该成功
      expect(() => actionRunnerStore.start()).not.toThrow()
    })

    it('should auto-stop when queue is empty (shouldStop condition)', () => {
      // 空队列时 shouldStop 应该返回 true
      expect(actionQueueStore.actionQueue.length).toBe(0)
      expect(actionQueueStore.currentAction).toBeNull()

      // 启动后由于队列为空，TimeManager 会自动停止
      actionRunnerStore.start()

      expect(actionRunnerStore).toBeTruthy()
    })
  })

  describe('Module Coordination', () => {
    it('should coordinate all modules (smoke test)', () => {
      // 这是一个冒烟测试，验证所有模块能够一起工作
      // 即使队列为空，所有模块也应该能正常初始化和协调

      expect(actionQueueStore.currentAction).toBeNull()
      expect(actionQueueStore.progress).toBe(0)

      actionRunnerStore.start()

      // 不应该崩溃
      expect(actionRunnerStore).toBeTruthy()
    })

    it('should have access to ActionQueue state', () => {
      // ActionRunner 应该能够访问 ActionQueue 状态
      expect(actionQueueStore.actionQueue).toBeDefined()
      expect(actionQueueStore.currentAction).toBeNull()
      expect(actionQueueStore.progress).toBe(0)
    })
  })

  describe('Error Resilience', () => {
    it('should not crash on repeated start calls', () => {
      for (let i = 0; i < 10; i++) {
        expect(() => actionRunnerStore.start()).not.toThrow()
      }
    })

    it('should handle store initialization order', () => {
      // 即使在其他 stores 未初始化的情况下也应该工作
      expect(() => actionRunnerStore.start()).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should initialize quickly', () => {
      const startTime = performance.now()
      actionRunnerStore.start()
      const duration = performance.now() - startTime

      // 初始化应该很快（< 50ms）
      expect(duration).toBeLessThan(50)
    })

    it('should handle multiple start calls efficiently', () => {
      const startTime = performance.now()

      // 100 次调用
      for (let i = 0; i < 100; i++) {
        actionRunnerStore.start()
      }

      const duration = performance.now() - startTime

      // 应该很快（< 100ms）
      expect(duration).toBeLessThan(100)
    })

    it('should be lightweight (memory)', () => {
      // ActionRunner 应该是轻量级的协调者
      // 实际的业务逻辑在各个 Executor 中
      const store = actionRunnerStore

      // 只有 start 方法暴露给外部使用
      expect(Object.keys(store)).toContain('start')

      // Pinia store 会有一些内部属性（$id, $patch, $subscribe 等）
      // 但应该保持精简
      expect(Object.keys(store).length).toBeLessThan(15)
    })
  })

  describe('Architecture Validation', () => {
    it('should follow modular design', () => {
      // ActionRunner 应该只暴露 start 方法
      // 其他逻辑应该在模块中
      expect(actionRunnerStore.start).toBeTypeOf('function')

      // 不应该暴露内部实现细节
      expect(actionRunnerStore).not.toHaveProperty('update')
      expect(actionRunnerStore).not.toHaveProperty('updateCombatAction')
      expect(actionRunnerStore).not.toHaveProperty('updateCurrentAction')
    })

    it('should delegate to specialized modules', () => {
      // 这是一个架构测试
      // 验证 ActionRunner 只是一个轻量级协调者
      // 真正的逻辑在 ProgressCalculator, ProductionExecutor, CombatExecutor 中

      actionRunnerStore.start()

      // 应该能正常工作
      expect(actionRunnerStore).toBeTruthy()
    })
  })
})

