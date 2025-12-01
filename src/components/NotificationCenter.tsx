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
            <button
              key={entry.id}
              type="button"
              aria-labelledby={`notification-label-${entry.id} notification-${entry.id}`}
              onClick={() => dismiss(entry.id)}
                class={`
                pointer-events-auto min-w-60 max-w-90
                p-2 rounded-none bg-surface shadow-panel
                flex items-start gap-2
                border-l-4
                select-none cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
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
                <span id={`notification-label-${entry.id}`} class="sr-only">{labelByType[entry.type ?? 'info'] ?? labelByType.info}: </span>
                <span
                  id={`notification-${entry.id}`}
                  role={entry.type === 'error' ? 'alert' : 'status'}
                  aria-live={entry.type === 'error' ? 'assertive' : 'polite'}
                >
                  {t(entry.key, entry.params ?? {})}
                </span>
              </div>
              {/* Close button removed - notification is closed by clicking the item itself */}
            </button>
          ))}
        </TransitionGroup>
      </div>
    )
  },
})
