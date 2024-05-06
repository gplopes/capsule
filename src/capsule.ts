import { TCaughtError, TUnCaughtError, TCaughtErrorBy } from './tasks';

export const Capsule =
  <
    TContext extends (...args: any[]) => any,
    TTasks extends (TCaughtError | TUnCaughtError | TCaughtErrorBy)[],
  >(
    context: TContext,
  ) =>
  (...tasks: TTasks) => {
    return (...values: Parameters<TContext>): ReturnType<TContext> | undefined => {
      const uncaughtError = tasks.find((task) => task.name === 'UnCaughtError');

      try {
        return context(...values);
      } catch (error) {
        const isHandled = tasks.some((task) => {
          // Earlier return, if error is falsy and does not contain much information
          // we pipe it to the uncaughtError callback
          if (!error) {
            uncaughtError?.call(error);
            return true;
          }

          if (error && task.name === 'CaughtErrorBy') {
            const [key, value] = task.matcher;

            // @ts-expect-error
            if (error[key] === value) {
              task.call(error);

              return true;
            }
          }

          if (error && task.name === 'CaughtError' && error && error instanceof task.errorType) {
            task.call(error);
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
