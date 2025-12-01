import { defineComponent, Teleport, Transition, onMounted, onUnmounted, ref } from 'vue'

// A lightweight modal stack to ensure only the top modal responds to Escape/backdrop
const modalStack: string[] = []

export default defineComponent({
  name: 'ModalBox',
  emits: ['close'],
  setup(props, { emit, slots }) {
    const dialogRef = ref<HTMLElement | null>(null)
    let previousActiveElement: HTMLElement | null = null
    const modalId = `modal-${Math.random().toString(36).slice(2)}`

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only the top-most modal should handle Escape
        if (modalStack[modalStack.length - 1] !== modalId) return
        emit('close')
      }
    }

    // Focus trap: trap Tab key inside modal
    const trapKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      // Only the top most modal traps Tab keynavigation
      if (modalStack[modalStack.length - 1] !== modalId) return
      if (!dialogRef.value) return

      // For trap navigation we WANT to allow tabbing to any focusable elements, even
      // if they are set to `data-autofocus-ignore` (that attribute only opts-out of
      // automatic focus, not from being reachable via keyboard navigation).
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
      modalStack.push(modalId)
      window.addEventListener('keydown', handleKeydown)
      window.addEventListener('keydown', trapKeydown)
      // Focus container for screen readers and keyboard navigation
      previousActiveElement = document.activeElement as HTMLElement | null
      if (dialogRef.value) {
        // When determining the element that should receive focus when the modal opens,
        // we should exclude `data-autofocus-ignore` elements so that inputs can
        // opt-out of being automatically focused.
        const autofocusExcludedSelector =
          'a[href], area[href], input:not([disabled]):not([data-autofocus-ignore]), select:not([disabled]):not([data-autofocus-ignore]), textarea:not([disabled]):not([data-autofocus-ignore]), button:not([disabled]):not([data-autofocus-ignore]), [tabindex]:not([tabindex="-1"]):not([data-autofocus-ignore])'
        const focusables = Array.from(
          dialogRef.value.querySelectorAll<HTMLElement>(autofocusExcludedSelector),
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
      // Only remove this modal from stack if present
      const top = modalStack[modalStack.length - 1]
      if (top === modalId) modalStack.pop()
      else {
        const idx = modalStack.indexOf(modalId)
        if (idx !== -1) modalStack.splice(idx, 1)
      }
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
              // Only the top modal should close when backdrop clicked
              if (modalStack[modalStack.length - 1] === modalId) emit('close')
            }}
          />
          <Transition
            enterActiveClass="transition-all duration-200 ease-out"
            leaveActiveClass="transition-all duration-200 ease-in"
            enterFromClass="opacity-0 translate-y-3 scale-98"
            leaveToClass="opacity-0 translate-y-3 scale-98"
            appear
          >
            <div class="relative max-h-[min(720px,90vh)] w-[min(460px,100%)] bg-white rounded-lg shadow-2xl overflow-auto p-2 lg:p-2">
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
