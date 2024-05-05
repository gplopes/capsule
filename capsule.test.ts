import { Capsule, Task, CaughtError, UnCaughtError } from "./capsule";

class SystemError extends Error {}

class BubbleError extends Error {}

const systemErrorFn = jest.fn();

const uncaughtErrorFn = jest.fn();

const sayHello = Capsule(
  Task((name: string) => {
    if (typeof name === "number") {
      throw new SystemError("Number is not allowed");
    }

    if (name === "John") {
      throw new Error("John is not allowed");
    }

    if (name === "Sara") {
      throw new BubbleError("Sara is not allowed");
    }

    return `Hello, ${name}!`;
  }),
  CaughtError(SystemError, systemErrorFn),
  CaughtError(BubbleError, (err) => {
    throw err;
  }),
  UnCaughtError(uncaughtErrorFn)
);

describe(Capsule.name, () => {
  beforeEach(() => {
    systemErrorFn.mockClear();
    uncaughtErrorFn.mockClear();
  });

  it("should say hello", () => {
    const result = sayHello("Mike");
    expect(result).toBe("Hello, Mike!");
  });

  it("should catch SystemError", () => {
    // @ts-expect-error
    const result = sayHello(22);

    expect(result).toBeUndefined();
    expect(systemErrorFn).toHaveBeenCalled();
  });

  it("should call uncaught error", () => {
    const result = sayHello("John");

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).toHaveBeenCalled();
  });

  it("should throw BubbleError", () => {
    expect(() => sayHello("Sara")).toThrow(BubbleError);
  });

  it("should catch BubbleError from the", () => {
    const bubbleFn = jest.fn();

    const wrappedSayHello = Capsule(
      sayHello,
      CaughtError(BubbleError, bubbleFn)
    );

    const result = wrappedSayHello("Sara");

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(bubbleFn).toHaveBeenCalled();
  });
});
