import { SystemError, BubbleError, NetworkError } from './mocks';
import { Capsule, AsyncCapsule } from '../capsule';
import { CaughtError, UnCaughtError, CaughtErrorBy } from '../tasks';

const systemErrorFn = jest.fn();

const uncaughtErrorFn = jest.fn();

const hackingErrorFn = jest.fn();

const statusErrorFn = jest.fn();

const sayHello = Capsule((name: string) => {
  if (typeof name === 'number') {
    throw new SystemError('Number is not allowed');
  }

  if (name === 'John') {
    throw new Error('John is not allowed');
  }

  if (name === 'Sara') {
    throw new BubbleError('Sara is not allowed');
  }

  if (name === 'Kevin') {
    throw new Error('hacking');
  }

  if (name === '_') {
    throw new NetworkError('Not found', 404);
  }

  return `Hello, ${name}!`;
})(
  UnCaughtError(uncaughtErrorFn),
  CaughtError(SystemError, systemErrorFn),
  CaughtErrorBy<Error>(['message', 'hacking'], hackingErrorFn),
  CaughtErrorBy<NetworkError>(['status', 404], statusErrorFn),
  CaughtError(BubbleError, (err) => {
    throw err;
  }),
);

const fetchHello = AsyncCapsule(async (name: string) => {
  return `Async Hello, ${name}!`;
})(UnCaughtError(uncaughtErrorFn));

describe(Capsule.name, () => {
  beforeEach(() => {
    systemErrorFn.mockClear();
    uncaughtErrorFn.mockClear();
  });

  it('should say hello', () => {
    const result = sayHello('Mike');
    expect(result).toBe('Hello, Mike!');
  });

  it('should catch SystemError', () => {
    // @ts-expect-error
    const result = sayHello(22);

    expect(result).toBeUndefined();
    expect(systemErrorFn).toHaveBeenCalled();
  });

  it('should call uncaught error', () => {
    const result = sayHello('John');

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).toHaveBeenCalled();
  });

  it('should throw BubbleError', () => {
    expect(() => sayHello('Sara')).toThrow(BubbleError);
  });

  it('should catch BubbleError from the', () => {
    const bubbleFn = jest.fn();

    const wrappedSayHello = Capsule(sayHello)(CaughtError(BubbleError, bubbleFn));

    const result = wrappedSayHello('Sara');

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(bubbleFn).toHaveBeenCalled();
  });

  it('should catch Error by message', () => {
    const result = sayHello('Kevin');

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(hackingErrorFn).toHaveBeenCalled();
  });

  it('should catch Error by status', () => {
    const result = sayHello('_');

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(statusErrorFn).toHaveBeenCalled();
  });
});

describe(AsyncCapsule.name, () => {
  it('should say hello', async () => {
    const result = await fetchHello('Mike');

    expect(result).toBe('Async Hello, Mike!');
  });
});
