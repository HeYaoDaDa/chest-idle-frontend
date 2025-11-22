import log from '../../utils/log'

import type { PiniaPluginContext } from 'pinia'

export default function loggerPlugin(context: PiniaPluginContext) {
  const { store } = context
  try {
    if (typeof store.$onAction === 'function') {
      store.$onAction(({ name, args, after, onError }) => {
        const meta = { store: store.$id, action: name, args }
        log.debug('action:start', meta)
        after((result) => {
          log.debug('action:finish', { ...meta, result })
        })
        onError((error) => {
          const errorMsg = error instanceof Error ? error.message : String(error)
          log.error('action:error', { ...meta, error: errorMsg })
        })
      })
    }
  } catch (e) {
    log.warn('loggerPlugin initialization failed', { error: `${e}` })
  }
}
