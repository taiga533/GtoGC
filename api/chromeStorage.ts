import { ZodType, z } from "zod"

const extensionStatusSchema = z.object({
  calendarId: z.string().nullish(),
  lastSyncUnixTime: z.number().nullish(),
  syncTermType: z.enum(["0", "7", "30"]).default("0")
})

export type ExtensionStatus = z.infer<typeof extensionStatusSchema>

const extensionStatusKey = "syncStatus"
export async function getExtensionStatus() {
  const store = await chrome.storage.sync.get([extensionStatusKey])
  const values = store[extensionStatusKey]
  values
  return extensionStatusSchema.parse(values ?? {})
}
export async function saveExtensionStatus<ExtensionStatus>(
  value: ExtensionStatus
) {
  const old = await getExtensionStatus()
  await chrome.storage.sync.set({ [extensionStatusKey]: { ...old, ...value } })
}
