import axios from 'axios';

interface TokenResponse {
  status: string;
  msg: string;
  token: string;
}

class BizapayService {
  private static instance: BizapayService;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly tokenLifetime = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): BizapayService {
    if (!BizapayService.instance) {
      BizapayService.instance = new BizapayService();
    }
    return BizapayService.instance;
  }

  private async generateNewToken(): Promise<string> {
    try {
      const apiKey = process.env.BIZAPAY_API_KEY;
      if (!apiKey) {
        throw new Error('BIZAPAY_API_KEY is not configured');
      }

      const response = await axios.post<TokenResponse>(
        'https://bizappay.my/api/v3/token',
        { apiKey }
      );

      if (response.data.status !== 'ok' || !response.data.token) {
        throw new Error('Failed to generate Bizapay token');
      }

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + this.tokenLifetime;
      
      return this.token;
    } catch (error) {
      console.error('Error generating Bizapay token:', error);
      throw new Error('Failed to generate Bizapay token');
    }
  }

  public async getToken(): Promise<string> {
    // If token exists and is not expired, return it
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // If already refreshing, wait for that promise to resolve
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start refresh process
    try {
      this.isRefreshing = true;
      this.refreshPromise = this.generateNewToken();
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
}

export const bizapayService = BizapayService.getInstance(); 