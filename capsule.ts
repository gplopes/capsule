export type ErrorClass<T> = { new (...args: any[]): T };

export const Task = <T extends (...args: any[]) => any>(task: T) => ({
  name: "Task",
  task,
});

export const CaughtError = <
  Err extends ErrorClass<any>,
  ErrCallback extends (error: Err) => void = (error: Err) => void
>(
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

export const Capsule =
  <
    MainTask extends (...args: any[]) => any,
    PipeTask extends Array<TaskType | CaughtErrorType | UnCaughtErrorType>
  >(
    runner: MainTask
  ) =>
  (...caughtErrors: PipeTask) => {
    return (
      ...values: Parameters<MainTask>
    ): ReturnType<MainTask> | undefined => {
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
