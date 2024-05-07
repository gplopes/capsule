# Capsule

## Description

Capsule is a lightweight function wrapper designed to enhance error handling in your codebase with grace and simplicity. With Capsule, managing errors becomes intuitive and flexible, allowing for cleaner and more robust code.

## Usage

By encapsulating any function with `Capsule` or `SyncCapsule`, you enable it to return another function where error handlers can be seamlessly integrated. Capsule offers multiple ways to catch and manage errors:

- `CatchError(ErrorInstance, callback)`: Utilize specific error instances for targeted handling.
- `CatchErrorBy([key, value], callback)`: Match errors based on key-value pairs, such as "[status, 404]".
- `UnCaughtError(callback)`: Define a fallback for any unforeseen errors.

Capsule operates non-invasively, meaning it won't propagate errors unless instructed to do so explicitly. If you wish to bubble up an error, simply re-throw it:

```typescript
UnCaughtError((error) => {
    throw error;
});
```

Furthermore, Capsule optimizes error handling by employing a first-match approach. Once a match is found, it exits the check.

```tsx
const requestData = Capsule(async (id: string) => {
    const response = await fetch(`.../${id}`);
    const responseData = await response.json();
    return responseData.data;
})(
UnCaughtError((error) => console.log("Unknown error:", error)),
CatchErrorBy(["status", 401], (error) => console.log("Unauthorized access:", error))
);

const result = await requestData("<id>");
```
