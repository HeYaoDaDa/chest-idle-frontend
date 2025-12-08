import { defineComponent, Transition } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemTag from '@/components/ItemTag'
import { useLootNotificationStore } from '@/stores/lootNotification'
import { formatNumber } from '@/utils/format'

export default defineComponent({
  name: 'LootNotificationOverlay',
  setup() {
    const { locale } = useI18n()
    const store = useLootNotificationStore()

    return () => (
      <div class="flex items-center justify-start pointer-events-none z-50 w-full h-8">
        <Transition
          enterActiveClass="transition duration-300 ease-out"
          enterFromClass="opacity-0 translate-y-2"
          enterToClass="opacity-100 translate-y-0"
          leaveActiveClass="duration-0"
        >
          {store.currentNotification ? (
            <div
              key={store.currentNotification.id}
              class="flex gap-3"
            >
              {store.currentNotification.items.map((item, index) => (
                <div key={index} class="flex items-center gap-1">
                  <span class="text-sm font-bold text-neutral-600">
                    {formatNumber(item.count, locale.value)}
                  </span>
                  <ItemTag
                    itemId={item.itemId}
                    class="pointer-events-none shadow-sm border border-neutral-200 !bg-white"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </Transition>
      </div>
    )
  },
})
