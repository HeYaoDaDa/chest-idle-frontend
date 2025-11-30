import { defineComponent, TransitionGroup } from 'vue'
import { useI18n } from 'vue-i18n'

import { useNotificationStore } from '@/stores/notification'

export default defineComponent({
  name: 'NotificationCenter',
  setup() {
    const { t } = useI18n()
    const notificationStore = useNotificationStore()

    const iconByType: Record<string, string> = {
      error: '⚠️',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️',
    }

    const labelByType: Record<string, string> = {
      error: 'Error',
      warning: 'Warning',
      success: 'Success',
      info: 'Info',
    }

    const dismiss = (id: number) => {
      notificationStore.remove(id)
    }

    return () => (
      <div class="fixed top-4 right-4 flex flex-col gap-1.5 z-2000 pointer-events-none" aria-live="polite">
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
              aria-live={entry.type === 'error' ? 'assertive' : 'polite'}
              class={`
                pointer-events-auto min-w-60 max-w-90
                p-3 rounded-lg bg-surface shadow-panel
                flex items-start gap-3
                border-l-4
                ${
                  entry.type === 'error'
                    ? 'border-error'
                    : entry.type === 'warning'
                      ? 'border-warning'
                      : 'border-primary'
                }
              `}
            >
              <span class="text-lg" aria-hidden="true">
                {iconByType[entry.type ?? 'info'] ?? iconByType.info}
              </span>
              <div class="flex-1 text-sm text-neutral-600">
                <span class="sr-only">{labelByType[entry.type ?? 'info'] ?? labelByType.info}: </span>
                {t(entry.key, entry.params ?? {})}
              </div>
              <button class="btn-ghost rounded-full" onClick={() => dismiss(entry.id)} aria-label="close notification">
                ×
              </button>
            </div>
          ))}
        </TransitionGroup>
      </div>
    )
  },
})
