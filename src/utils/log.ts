import loglevel from 'loglevel'

type Meta = Record<string, unknown> | undefined

// Default logger
const logger = loglevel.getLogger('app')

// Default transport for errors/warns - consumers can set this
let transport: ((level: string, message: string, meta?: Meta) => void) | null = null

const formatMessage = (message: unknown, meta?: Meta) => {
  if (meta && typeof meta === 'object') {
    // When logging an object, we'll combine message + meta
    try {
      return `${message} ${JSON.stringify(meta)}`
    } catch {
      return `${message}`
    }
  }
  return String(message)
}

const debug = (message: unknown, meta?: Meta) => {
  logger.debug(message, meta)
}

const info = (message: unknown, meta?: Meta) => {
  logger.info(message, meta)
}

const warn = (message: unknown, meta?: Meta) => {
  const formatted = formatMessage(message, meta)
  logger.warn(formatted)
  if (transport) transport('warn', formatted, meta)
}

const error = (message: unknown, meta?: Meta) => {
  const formatted = formatMessage(message, meta)
  logger.error(formatted)
  if (transport) transport('error', formatted, meta)
}

const setLevel = (level: loglevel.LogLevelDesc) => {
  logger.setLevel(level)
}

const getLevel = () => logger.getLevel()

const setTransport = (fn: (level: string, message: string, meta?: Meta) => void) => {
  transport = fn
}

const createLogger = (name: string) => {
  const scoped = loglevel.getLogger(name || 'app')
  return {
    debug: (m: unknown, meta?: Meta) => scoped.debug(m, meta),
    info: (m: unknown, meta?: Meta) => scoped.info(m, meta),
    warn: (m: unknown, meta?: Meta) => {
      scoped.warn(formatMessage(m, meta))
      if (transport) transport('warn', formatMessage(m, meta), meta)
    },
    error: (m: unknown, meta?: Meta) => {
      scoped.error(formatMessage(m, meta))
      if (transport) transport('error', formatMessage(m, meta), meta)
    },
  }
}

export default {
  debug,
  info,
  warn,
  error,
  setLevel,
  getLevel,
  setTransport,
  createLogger,
}

export { debug, info, warn, error, setLevel, getLevel, setTransport, createLogger }
