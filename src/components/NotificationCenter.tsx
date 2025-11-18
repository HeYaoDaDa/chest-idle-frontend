import { defineComponent, TransitionGroup } from 'vue'
import { useI18n } from 'vue-i18n'

import { useNotificationStore } from '@/stores/notification'

export default defineComponent({
  name: 'NotificationCenter',
  setup() {
    const { t } = useI18n()
    const notificationStore = useNotificationStore()

    const dismiss = (id: number) => {
      notificationStore.remove(id)
    }

    return () => (
      <div class="fixed top-4 right-4 flex flex-col gap-1.5 z-2000 pointer-events-none">
        <TransitionGroup
          tag="div"
          name="notification"
          enterActiveClass="transition-all duration-200"
          leaveActiveClass="transition-all duration-200"
          enterFromClass="opacity-0 translate-x-5"
          leaveToClass="opacity-0 translate-x-5"
        >
          {notificationStore.notifications.map((entry) => (
            <div
              key={entry.id}
              role={entry.type === 'error' ? 'alert' : 'status'}
              class={`
                pointer-events-auto min-w-60 max-w-90
                p-2.5 px-3 rounded bg-white shadow-lg
                flex justify-between items-center gap-2
                border-l-4
                ${
                  entry.type === 'error'
                    ? 'border-error'
                    : entry.type === 'warning'
                      ? 'border-yellow-500'
                      : 'border-primary'
                }
              `}
            >
              <span class="flex-1 text-sm text-gray-800">{t(entry.key, entry.params ?? {})}</span>
              <button class="btn-ghost" onClick={() => dismiss(entry.id)} aria-label="close">
                ×
              </button>
            </div>
          ))}
        </TransitionGroup>
      </div>
    )
  },
})
