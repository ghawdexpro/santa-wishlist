/**
 * Retry utility with exponential backoff
 * Wraps async functions to automatically retry on failure
 */

export interface RetryConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryOn?: (error: unknown) => boolean
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable (default: retry on all errors)
 */
function isRetryable(error: unknown, customCheck?: (error: unknown) => boolean): boolean {
  if (customCheck) {
    return customCheck(error)
  }

  // Don't retry on validation errors or 4xx responses
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (
      message.includes('invalid') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('not found') ||
      message.includes('bad request')
    ) {
      return false
    }
  }

  return true
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let lastError: unknown

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn()
      if (attempt > 1) {
        console.log(`[Retry] ${context} succeeded on attempt ${attempt}`)
      }
      return result
    } catch (error) {
      lastError = error

      const isLastAttempt = attempt === finalConfig.maxAttempts
      const shouldRetry = !isLastAttempt && isRetryable(error, finalConfig.retryOn)

      if (!shouldRetry) {
        console.error(`[Retry] ${context} failed on attempt ${attempt}, not retrying:`, error)
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelayMs
      )

      console.warn(
        `[Retry] ${context} failed on attempt ${attempt}/${finalConfig.maxAttempts}. ` +
          `Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : error
      )

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Wrap an async function to always use retry logic
 */
export function withRetryWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  context: string,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), context, config)
}

/**
 * Retry config presets for different services
 */
export const RETRY_PRESETS = {
  // Veo video generation - longer delays, fewer retries
  veo: {
    maxAttempts: 2,
    initialDelayMs: 5000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  } as RetryConfig,

  // HeyGen - moderate retries
  heygen: {
    maxAttempts: 3,
    initialDelayMs: 3000,
    maxDelayMs: 20000,
    backoffMultiplier: 2,
  } as RetryConfig,

  // NanoBanana image generation - quick retries
  nanobanana: {
    maxAttempts: 3,
    initialDelayMs: 2000,
    maxDelayMs: 15000,
    backoffMultiplier: 2,
  } as RetryConfig,

  // Gemini script generation - quick retries
  gemini: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  } as RetryConfig,
}
