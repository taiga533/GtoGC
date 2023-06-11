import { z } from "zod"

export async function handleResponse<T>(response: Response, responseBodySchema: z.ZodType<T>) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}, ${await response.text()}`)
  }

  const rawObj = await response.json()
  const parsedObj = responseBodySchema.safeParse(rawObj)
  if (parsedObj.success) {
    return parsedObj.data
  } else {
    throw new Error(`Response body is invalid, ${parsedObj.error}`)
  }
}
export async function handleResponseStatus(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}, ${await response.text()}`)
  }
  return true;
}