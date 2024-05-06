export class SystemError extends Error {}

export class BubbleError extends Error {}

export class NetworkError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
