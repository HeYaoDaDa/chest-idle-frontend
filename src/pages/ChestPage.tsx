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
      <div class="flex flex-col gap-2 p-4">
        <div class="mb-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
          <div class="flex justify-between items-baseline mb-2">
            <h2 class="text-2xl font-bold text-gray-900">{t('ui.chests')}</h2>
          </div>
          <div class="text-gray-700">{t('ui.chestsDescription')}</div>
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-0.5">
          {chests.value.map((chest) => (
            <button
              key={chest.id}
              type="button"
              class="card-item w-16 h-16 flex flex-col justify-center items-center p-1"
              onClick={() => openModal(chest.id)}
              aria-label={t(chest.name)}
              aria-expanded={modalVisible.value && selectedChestId.value === chest.id}
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
                  class="h-full progress-bar"
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
