export type Result<T, E> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E }

export function ok<T>(value: T): Result<T, never> {
  return { success: true, value }
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

export function match<T, E, R>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => R; err: (error: E) => R }
): R {
  return result.success
    ? handlers.ok(result.value)
    : handlers.err(result.error)
}
