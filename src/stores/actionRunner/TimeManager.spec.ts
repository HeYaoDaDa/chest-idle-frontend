import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'

import { TimeManager } from './TimeManager'

describe('TimeManager', () => {
  let timeManager: TimeManager
  let updateCallback: ReturnType<typeof vi.fn>
  let shouldStopCallback: ReturnType<typeof vi.fn>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rafSpy: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cancelRafSpy: any

  beforeEach(() => {
    updateCallback = vi.fn()
    shouldStopCallback = vi.fn(() => false)

    // Mock requestAnimationFrame 和 cancelAnimationFrame
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // 立即执行回调以便测试
      setTimeout(() => cb(performance.now()), 0)
      return 1 as number
    })
    cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    timeManager = new TimeManager(updateCallback, shouldStopCallback)
  })

  afterEach(() => {
    timeManager.destroy()
    rafSpy.mockRestore()
    cancelRafSpy.mockRestore()
  })

  describe('start/stop', () => {
    it('should start the loop', () => {
      expect(timeManager.getIsRunning()).toBe(false)

      timeManager.start()

      expect(timeManager.getIsRunning()).toBe(true)
      expect(rafSpy).toHaveBeenCalled()
    })

    it('should not start twice', () => {
      timeManager.start()
      const callCount = rafSpy.mock.calls.length

      timeManager.start()

      // 不应该再次调用 requestAnimationFrame
      expect(rafSpy.mock.calls.length).toBe(callCount)
    })

    it('should stop the loop', () => {
      timeManager.start()
      expect(timeManager.getIsRunning()).toBe(true)

      timeManager.stop()

      expect(timeManager.getIsRunning()).toBe(false)
      expect(cancelRafSpy).toHaveBeenCalled()
    })

    it('should not stop twice', () => {
      timeManager.start()
      timeManager.stop()
      const callCount = cancelRafSpy.mock.calls.length

      timeManager.stop()

      // 不应该再次调用 cancelAnimationFrame
      expect(cancelRafSpy.mock.calls.length).toBe(callCount)
    })
  })

  describe('update callback', () => {
    it('should call update callback on each frame', async () => {
      timeManager.start()

      // 等待 requestAnimationFrame 回调执行
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(updateCallback).toHaveBeenCalled()
      expect(updateCallback.mock.calls[0][0]).toBeTypeOf('number') // now 参数
    })

    it('should pass current timestamp to callback', async () => {
      const mockNow = 12345.67
      rafSpy.mockRestore()
      rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(() => cb(mockNow), 0)
        return 1 as number
      })

      timeManager.start()
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(updateCallback).toHaveBeenCalledWith(mockNow)
    })
  })

  describe('auto stop', () => {
    it('should auto stop when shouldStopCallback returns true', async () => {
      shouldStopCallback.mockReturnValue(true)

      timeManager.start()
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(timeManager.getIsRunning()).toBe(false)
    })

    it('should not auto stop when shouldStopCallback returns false', async () => {
      shouldStopCallback.mockReturnValue(false)

      timeManager.start()
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(timeManager.getIsRunning()).toBe(true)
    })
  })

  describe('destroy', () => {
    it('should stop loop', () => {
      timeManager.start()
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      timeManager.destroy()

      expect(timeManager.getIsRunning()).toBe(false)
      expect(removeEventListenerSpy).not.toHaveBeenCalled()

      removeEventListenerSpy.mockRestore()
    })
  })
})
