import {
  Capsule,
  Task,
  CaughtError,
  UnCaughtError,
  CaughtErrorBy,
} from "./capsule";

class SystemError extends Error {}

class BubbleError extends Error {}

class NetworkError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const systemErrorFn = jest.fn();

const uncaughtErrorFn = jest.fn();

const hackingErrorFn = jest.fn();

const statusErrorFn = jest.fn();

const sayHello = Capsule((name: string) => {
  if (typeof name === "number") {
    throw new SystemError("Number is not allowed");
  }

  if (name === "John") {
    throw new Error("John is not allowed");
  }

  if (name === "Sara") {
    throw new BubbleError("Sara is not allowed");
  }

  if (name === "Kevin") {
    throw new Error("hacking");
  }

  if (name === "_") {
    throw new NetworkError("Not found", 404);
  }

  return `Hello, ${name}!`;
})(
  CaughtError(SystemError, systemErrorFn),
  CaughtError(BubbleError, (err) => {
    throw err;
  }),
  CaughtErrorBy<Error>(["message", "hacking"], hackingErrorFn),
  CaughtErrorBy<NetworkError>(["status", 404], statusErrorFn),
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

    const wrappedSayHello = Capsule(sayHello)(
      CaughtError(BubbleError, bubbleFn)
    );

    const result = wrappedSayHello("Sara");

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(bubbleFn).toHaveBeenCalled();
  });

  it("should catch Error by message", () => {
    const result = sayHello("Kevin");

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(hackingErrorFn).toHaveBeenCalled();
  });

  it("should catch Error by status", () => {
    const result = sayHello("_");

    expect(result).toBeUndefined();
    expect(systemErrorFn).not.toHaveBeenCalled();
    expect(uncaughtErrorFn).not.toHaveBeenCalled();
    expect(statusErrorFn).toHaveBeenCalled();
  });

  it.skip("should pipe another task", () => {
    const wrappedSayHello = Capsule(sayHello)(Task((name) => `Bye, ${name}!`));

    const result = wrappedSayHello("Mike");

    expect(result).toBe("Bye, Mike!");
  });
});
