import { z } from "zod"

export async function handleResponse<T>(
  response: Response,
  responseBodySchema: z.ZodType<T>
) {
  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}, ${await response.text()}`
    )
  }

  const rawObj = await response.json()
  const result = responseBodySchema.safeParse(rawObj)
  if (!result.success) {
    throw new Error(`Response body is invalid, ${result.error}`)
  }
  return result.data
}
export async function handleResponseStatus(response: Response) {
  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}, ${await response.text()}`
    )
  }
  return true
}
