import { errorHandler } from './errorHandler';
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
      try {
        return context(...values);
      } catch (error) {
        errorHandler(tasks, error);
      }
    };
  };

export const AsyncCapsule =
  <
    TContext extends (...args: any[]) => Promise<any>,
    TTasks extends (TCaughtError | TUnCaughtError | TCaughtErrorBy)[],
  >(
    context: TContext,
  ) =>
  (...tasks: TTasks) => {
    return (...values: Parameters<TContext>): Promise<ReturnType<TContext>> | undefined => {
      try {
        return context(...values);
      } catch (error) {
        errorHandler(tasks, error);
      }
    };
  };
