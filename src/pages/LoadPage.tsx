import { computed, defineComponent, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAppStore } from '@/stores/app'

export default defineComponent({
  name: 'LoadPage',
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const appStore = useAppStore()
    const state = computed(() => appStore.state)
    const fail = computed(() => appStore.state === 'error')

    appStore.loadApplication()

    watch(
      () => state.value,
      (newState) => {
        if (newState === 'ready') {
          router.push('/game')
        }
      },
      { immediate: true },
    )

    return () => (
      <div class="h-screen flex justify-center items-center">
        <h1 class={`heading-page-small ${fail.value ? 'text-error' : ''}`}>
          {fail.value ? t('loadDataFail') : `${t('loading')}...`}
        </h1>
      </div>
    )
  },
})
