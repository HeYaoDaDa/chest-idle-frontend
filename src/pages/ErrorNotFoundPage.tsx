import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFoundPage',
  setup() {
    return () => (
      <div class="h-screen flex justify-center items-center">
        <h1 class="text-6xl font-bold text-neutral-800">404</h1>
      </div>
    )
  },
})
