import { defineComponent, Teleport, Transition, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'ModalBox',
  emits: ['close'],
  setup(props, { emit, slots }) {
    const dialogRef = ref<HTMLElement | null>(null)
    let previousActiveElement: HTMLElement | null = null
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        emit('close')
      }
    }

    // Focus trap: trap Tab key inside modal
    const trapKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      if (!dialogRef.value) return

      const focusableSelector =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      const focusable = Array.from(dialogRef.value.querySelectorAll<HTMLElement>(focusableSelector))

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      // const first = focusable[0]
      // const last = focusable[focusable.length - 1]

      // Manually move focus as jsdom doesn't perform default tab navigation
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
      const current = currentIndex === -1 ? 0 : currentIndex
      const nextIndex = event.shiftKey
        ? (current - 1 + focusable.length) % focusable.length
        : (current + 1) % focusable.length

      event.preventDefault()
      focusable[nextIndex].focus()
    }

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
      window.addEventListener('keydown', trapKeydown)
      // Focus container for screen readers and keyboard navigation
      previousActiveElement = document.activeElement as HTMLElement | null
      if (dialogRef.value) {
        const focusableSelector =
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        const focusables = Array.from(
          dialogRef.value.querySelectorAll<HTMLElement>(focusableSelector),
        )
        if (focusables.length > 0) {
          focusables[0].focus()
        } else {
          dialogRef.value.focus()
        }
      }
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keydown', trapKeydown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    })

    return () => (
      <Teleport to="body">
        <div class="fixed inset-0 z-2000 grid place-items-center p-4 lg:p-8">
          <div
            class="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              emit('close')
            }}
          />
          <Transition
            enterActiveClass="transition-all duration-200 ease-out"
            leaveActiveClass="transition-all duration-200 ease-in"
            enterFromClass="opacity-0 translate-y-3 scale-98"
            leaveToClass="opacity-0 translate-y-3 scale-98"
            appear
          >
            <div class="relative max-h-[min(720px,90vh)] w-[min(480px,100%)] bg-white rounded-lg shadow-2xl overflow-auto p-3 lg:p-4">
              <div
                ref={dialogRef}
                tabindex={-1}
                role="dialog"
                aria-modal="true"
                class="outline-none"
              >
                {slots.default?.()}
              </div>
            </div>
          </Transition>
        </div>
      </Teleport>
    )
  },
})
