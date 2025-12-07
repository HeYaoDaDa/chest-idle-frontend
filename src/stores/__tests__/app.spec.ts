import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import log from '@/utils/log'

import { useAppStore } from '../app'

// Mock implementations
const mockStart = vi.fn()
const mockLoadGameConfig = vi.fn()

// Mock gameConfig
vi.mock('@/gameConfig', () => ({
  loadGameConfig: () => mockLoadGameConfig(),
}))

// Mock actionRunner
vi.mock('../actionRunner', () => ({
  useActionRunnerStore: () => ({
    start: mockStart,
  }),
}))

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockLoadGameConfig.mockReset()
    mockStart.mockReset()
  })

  describe('initial state', () => {
    it('should have undefined state initially', () => {
      const appStore = useAppStore()
      expect(appStore.state).toBeUndefined()
    })
  })

  describe('loadApplication', () => {
    it('should set state to loading then ready on success', async () => {
      const appStore = useAppStore()

      expect(appStore.state).toBeUndefined()

      // loadApplication is synchronous, so state changes immediately
      await appStore.loadApplication()

      expect(appStore.state).toBe('ready')
    })

    it('should call loadGameConfig', async () => {
      const appStore = useAppStore()

      await appStore.loadApplication()

      expect(mockLoadGameConfig).toHaveBeenCalledTimes(1)
    })

    it('should start action runner', async () => {
      const appStore = useAppStore()

      await appStore.loadApplication()

      expect(mockStart).toHaveBeenCalledTimes(1)
    })

    it('should set state to error if loadGameConfig throws', async () => {
      mockLoadGameConfig.mockImplementation(() => {
        throw new Error('Load failed')
      })

      const appStore = useAppStore()
      const consoleErrorSpy = vi.spyOn(log, 'error').mockImplementation(() => {})

      await appStore.loadApplication()

      expect(appStore.state).toBe('error')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should set state to error if actionRunner.start throws', async () => {
      mockStart.mockImplementation(() => {
        throw new Error('Start failed')
      })

      const appStore = useAppStore()
      const consoleErrorSpy = vi.spyOn(log, 'error').mockImplementation(() => {})

      await appStore.loadApplication()

      expect(appStore.state).toBe('error')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should be able to call loadApplication multiple times', async () => {
      const appStore = useAppStore()

      await appStore.loadApplication()
      expect(appStore.state).toBe('ready')

      await appStore.loadApplication()
      expect(appStore.state).toBe('ready')
    })
  })
})
