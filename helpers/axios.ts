import axios, { AxiosInstance } from 'axios';
import { AxiosRequestConfig } from 'axios';

export class HTTPClient {
  public static footballInstance: HTTPClient;
  public static basketballInstance: HTTPClient;
  public client: AxiosInstance;

  private constructor(apiUrl: string) {
    const configs: AxiosRequestConfig = {
      baseURL: apiUrl,
      timeout: 5000,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': process.env.RAPID_API_KEY,
      },
    };
    this.client = axios.create(configs);
    this.client.interceptors.response.use(
      (config) => config,
      (error) => {
        if (error.response.status === 408 || error.code === 'ECONNABORTED') {
          console.log(`A timeout happend on url ${error.config.url}`);
        }
        return Promise.reject(error);
      },
    );
  }

  public static getFootballInstance(): HTTPClient {
    if (!HTTPClient.footballInstance) {
      HTTPClient.footballInstance = new HTTPClient(
        'https://api-football-v1.p.rapidapi.com/v3',
      );
    }
    return HTTPClient.footballInstance;
  }

  public static getBasketballInstance(): HTTPClient {
    if (!HTTPClient.basketballInstance) {
      HTTPClient.basketballInstance = new HTTPClient(
        'https://api-basketball.p.rapidapi.com',
      );
    }
    return HTTPClient.basketballInstance;
  }
}
