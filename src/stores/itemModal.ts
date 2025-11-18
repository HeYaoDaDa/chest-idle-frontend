import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useItemModalStore = defineStore('itemModal', () => {
  const show = ref(false)
  const itemId = ref<string | null>(null)
  const mode = ref<'inventory' | 'equipped' | 'view' | undefined>(undefined)

  function open(id: string, _mode?: 'inventory' | 'equipped' | 'view') {
    itemId.value = id
    mode.value = _mode
    show.value = true
  }

  function close() {
    show.value = false
    itemId.value = null
    mode.value = undefined
  }

  return { show, itemId, mode, open, close }
})
