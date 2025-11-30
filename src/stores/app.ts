import { defineStore } from 'pinia'
import { ref } from 'vue'

import { loadGameConfig } from '@/gameConfig'
import log from '@/utils/log'

import { useActionProgressStore } from './actionProgress'
import { useActionRunnerStore } from './actionRunner'

export const useAppStore = defineStore('app', () => {
  const state = ref(undefined as 'loading' | 'ready' | 'error' | undefined)

  async function loadApplication(): Promise<void> {
    // 幂等保护：已加载或正在加载则直接返回
    if (state.value === 'ready' || state.value === 'loading') {
      return
    }
    state.value = 'loading'
    try {
      loadGameConfig()
      const actionRunnerStore = useActionRunnerStore()
      const actionProgressStore = useActionProgressStore()
      actionRunnerStore.start()
      actionProgressStore.start()
      state.value = 'ready'
    } catch (error) {
      log.error('Failed to load application:', { error: `${error}` })
      state.value = 'error'
    }
  }

  return {
    state,
    loadApplication,
  }
})
