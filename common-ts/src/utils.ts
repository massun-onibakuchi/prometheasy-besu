export type Result<T = void, E = void> = { ok: true; value: T } | { ok: false; error: E }

export const Ok = <T, E>(value: T): Result<T, E> => ({
  ok: true,
  value,
})

export const Err = <T, E>(error: E): Result<T, E> => ({ ok: false, error })

export const unreachable = (msg?: string) => {
  throw new Error(msg ?? 'Something went wrong')
}

/// Wrap a function that returns a promise and return a Result.
/// If the function throws, return Err.
/// If the function succeeds, return Ok.
/// If logger is provided, log the error.
export async function rwrap<T = void, E = void>(
  func: () => Promise<T> | T,
  onError: E,
  logger?: { error: (...args: any) => void } | undefined
): Promise<Result<T, E>> {
  try {
    const value = await func()
    return Ok(value)
  } catch (error: any) {
    if (logger) logger.error(error, 'rwrap error')
    return Err(onError)
  }
}

/**
 * Basic timeout-based async sleep function.
 *
 * @param ms Number of milliseconds to sleep.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Copy from Optimism repo
// retry a function with specified number of tries.
export async function retry<T>(
  callback: () => Promise<T>,
  tries: number,
  onError: ((e: any) => Promise<void> | void) | undefined
): Promise<[T | undefined, any]> {
  const timeout = 2000
  let lastError: any = undefined
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return [await callback(), undefined]
    } catch (e) {
      if (onError) await onError(e)
      lastError = e
      await sleep(timeout * 2 ** attempt)
    }
  }
  return [undefined, lastError]
}
