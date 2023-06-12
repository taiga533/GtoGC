import { ZodType } from "zod";

export async function getStatusFromSyncStorage<T>(key: string, storageSchema: ZodType<T>) {
  const store = await chrome.storage.sync.get([key]);
  const values = store[key];
  console.log(values)
  return storageSchema.parse(values ?? {});
}
export async function saveStatusToSyncStorage<T>(key: string, value: T) {
  await chrome.storage.sync.set({ [key]: value });
}