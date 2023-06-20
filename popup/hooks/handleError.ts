export function handleError(e: unknown) {
  if (typeof e === "string") return new Error(e);
  if (e instanceof Error) return e;
  return new Error("Failed to fetch data from Chrome Storage");
}
