import { defineStore } from 'pinia'
import { ref } from 'vue'

import { loadGameConfig } from '@/gameConfig'
import log from '@/utils/log'

import { useActionRunnerStore } from './actionRunner'

export const useAppStore = defineStore('app', () => {
  const state = ref(undefined as 'loading' | 'ready' | 'error' | undefined)

  async function loadApplication(): Promise<void> {
    state.value = 'loading'
    try {
      loadGameConfig()
      const actionRunnerStore = useActionRunnerStore()
      actionRunnerStore.start()
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
