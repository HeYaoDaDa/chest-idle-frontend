import { defineComponent, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ChestModalBox } from '@/components/modals'
import { chestConfigs } from '@/gameConfig'
import { useChestPointStore } from '@/stores/chestPoint'

export default defineComponent({
  name: 'ChestPage',
  setup() {
    const { t } = useI18n()
    const chestPointStore = useChestPointStore()
    const selectedChestId = ref<string | null>(null)
    const modalVisible = ref(false)

    const chests = computed(() =>
      chestConfigs.map((config) => {
        const progress = chestPointStore.getChestProgress(config.id)
        return {
          id: config.id,
          name: config.name,
          progress,
        }
      }),
    )

    const openModal = (chestId: string) => {
      selectedChestId.value = chestId
      modalVisible.value = true
    }

    const closeModal = () => {
      modalVisible.value = false
      selectedChestId.value = null
    }

    return () => (
      <div class="flex flex-col gap-2 p-8">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{t('ui.chests')}</h2>
          <p class="text-gray-600">{t('ui.chestsDescription')}</p>
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-0.5">
          {chests.value.map((chest) => (
            <button
              key={chest.id}
              type="button"
              class="w-16 h-16 rounded bg-white border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex flex-col justify-center items-center p-1"
              onClick={() => openModal(chest.id)}
              aria-label={t(chest.name)}
            >
              <div class="text-xs font-semibold text-gray-900 text-center leading-tight">
                {t(chest.name)}
              </div>
              <div
                class="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(chest.progress * 100)}
                aria-label={t('ui.progressPercentage')}
              >
                <div
                  class="h-full bg-gradient-to-r from-cyan-400 to-primary transition-all"
                  style={{ width: chest.progress * 100 + '%' }}
                ></div>
              </div>
            </button>
          ))}
        </div>

        <ChestModalBox
          show={modalVisible.value}
          onClose={closeModal}
          chestId={selectedChestId.value ?? undefined}
        />
      </div>
    )
  },
})
