export const Task =
  <T extends (...args: any[]) => any>(task: T) =>
  (...params: Parameters<T>): ReturnType<T> => {
    return task(...params);
  };

export const CaughtError = <Err = never, ErrCallback = (error: Err) => void>(
  errorType: Err,
  onFail: ErrCallback
) => ({
  name: "CaughtError",
  errorType,
  call: onFail,
});

export const UnCaughtError = <TCallback extends (error: unknown) => void>(
  onFail: TCallback
) => ({
  name: "UnCaughtError",
  call: onFail,
});

type TaskType = ReturnType<typeof Task<never>>;

type CaughtErrorType = ReturnType<typeof CaughtError<never>>;

type UnCaughtErrorType = ReturnType<typeof UnCaughtError>;

export const Capsule = <
  T extends [TaskType, ...Array<CaughtErrorType | UnCaughtErrorType>]
>(
  ...tasks: T
) => {
  return (...values: Parameters<T[0]>): ReturnType<T[0]> | undefined => {
    const [runner, ...caughtErrors] = tasks;
    const uncaughtError = caughtErrors.find(
      (catcher) => catcher.name === "UnCaughtError"
    );
    try {
      return runner(...values);
    } catch (error) {
      const isHandled = caughtErrors.some((catcher) => {
        if (
          error &&
          catcher.name === "CaughtError" &&
          error instanceof catcher.errorType
        ) {
          catcher.call(error);
          return true;
        }

        return false;
      });

      if (!isHandled) {
        uncaughtError?.call(error);
      }
    }
  };
};
