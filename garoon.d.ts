type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ApiResponse = {
  statusCode: number,
  statusText: string,
  data: any,

}
interface Window {
  garoon: Garoon | undefined;
}
type Garoon = {
  async api(pathOrUrl: string, method: HttpMethod,params: any): Promise<ApiResponse>;
}
