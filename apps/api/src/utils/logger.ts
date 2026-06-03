import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Structured JSON logger powered by pino.
 * - Development: pretty-printed with colors via pino-pretty
 * - Production:  newline-delimited JSON (compatible with Datadog, Loki, etc.)
 *
 * The public interface mirrors the previous console wrapper so no call sites change.
 */
const _logger = pino(
  { level: isDev ? 'debug' : 'info' },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
      })
    : undefined
);

export const logger = {
  info: (message: string, ...args: unknown[]) =>
    _logger.info(args.length ? { args } : {}, message),

  warn: (message: string, ...args: unknown[]) =>
    _logger.warn(args.length ? { args } : {}, message),

  /** Pass the Error object as the second argument for structured stack traces in JSON output. */
  error: (message: string, error?: unknown) =>
    _logger.error({ err: error instanceof Error ? error : undefined }, message),

  debug: (message: string, ...args: unknown[]) =>
    _logger.debug(args.length ? { args } : {}, message),
};
