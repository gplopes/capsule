# Capsule

## Description
Capsule is a simple function wrapper that allows to handle errors more gracefully.


## Usage

Wrapping any function with `Capsule` or `SyncCapsule` it will return another function where error handlers must be passed
there are a few ways how the Capsule can catch/match an error. 

- `CatchError(ErrorInstance, callback)` - Using instance of an error.
- `CatchErrorBy([key, value], callback)` - Value matching, e.g "[status, 404]"
- `UnCaughtError(callback)` - Any other value that does not match with the ones above

Capsule won't bubble the error unless you specifically tells it to, the way you can do is just
re-throw the error, e.g:

```ts
UnCaughtError((error) => {
    throw error
});
```

The capsule will use the first match method from the arguments and discard the others, so it won't pipe
the error, but rather exit the check once match is concluded.

```tsx
const requestData = AsyncCapsule(async (id: string) => {
    const response = await fetch(`.../${id}`);
    const response = await response.json();
    return response.data;
})(
UnCaughtError((error) => console.log("unknown error", error)),
CatchErrorBy(["status", 401], (error) => console.log("unauthorized access", error))
);


const result = await requestData("<id>");
```

