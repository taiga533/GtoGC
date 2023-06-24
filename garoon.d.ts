type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type ApiResponse = {
  statusCode: number
  statusText: string
  data: any
  hasNext: boolean
}
interface Window {
  garoon: Garoon | undefined
}
type Garoon = {
  api: (
    pathOrUrl: string,
    method: HttpMethod,
    params: any
  ) => Promise<ApiResponse>
}
