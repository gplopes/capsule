export type AnyError<T> = new (...args: any[]) => T;

export type ErrorCallback<T> = (error: T) => void;

export type TCaughtError = ReturnType<typeof CaughtError<never, ErrorCallback<unknown>>>;

export const CaughtError = <
  TError extends AnyError<unknown>,
  Callback extends ErrorCallback<TError>,
>(
  errorType: TError,
  call: Callback,
) => ({ name: 'CaughtError' as const, errorType, call });

export type TUnCaughtError = ReturnType<typeof UnCaughtError>;

export const UnCaughtError = <Callback extends ErrorCallback<unknown>>(call: Callback) => ({
  name: 'UnCaughtError' as const,
  call,
});

export type TCaughtErrorBy = ReturnType<typeof CaughtErrorBy>;

export const CaughtErrorBy = <
  TError,
  Callback extends ErrorCallback<TError> = ErrorCallback<TError>,
  ErrorKey extends keyof TError = keyof TError,
>(
  matcher: [ErrorKey, TError[ErrorKey]],
  call: Callback,
) => ({ name: 'CaughtErrorBy' as const, matcher, call });
