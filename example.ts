import { Capsule, Task, CaughtError, UnCaughtError } from "./capsule";

class SystemError {}

class NetworkError {}

const myFn = Capsule(
  Task((name: string) => {
    console.log(`Hello, ${name}`);

    return "1";
  }),
  CaughtError(SystemError, (err) => {
    console.log("System Error", err);
  }),
  UnCaughtError((err) => {
    console.log("Uncaught Error", err);
  })
);

const result = myFn("John");

if (result) {
  console.log(result);
}
