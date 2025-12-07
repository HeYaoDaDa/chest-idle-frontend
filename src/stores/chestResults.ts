import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ChestResult = { itemId: string; amount: number }

export const useChestResultsStore = defineStore('chestResults', () => {
  const results = ref<ChestResult[] | null>(null)

  function open(r: ChestResult[]): void {
    results.value = r
  }

  function close(): void {
    results.value = null
  }

  return { results, open, close }
})
