import axios, { AxiosInstance } from 'axios'
import { logger } from '../utils/logger'

const CLINE_API_BASE_URL = process.env.CLINE_API_BASE_URL || 'https://api.cline.bot'

export interface ClineAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  userInfo?: ClineUserInfo
}

export interface ClineUserInfo {
  id: string
  email: string
  name: string
  clineUserId: string | null
  organizations?: Array<{
    id: string
    name: string
    active: boolean
  }>
}

export class ClineAuthService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: CLINE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  /**
   * Get authorization URL for OAuth flow
   */
  async getAuthUrl(callbackUrl: string, state?: string): Promise<string> {
    try {
      const authUrl = new URL('/api/v1/auth/authorize', CLINE_API_BASE_URL)
      authUrl.searchParams.set('client_type', 'web')
      authUrl.searchParams.set('callback_url', callbackUrl)
      authUrl.searchParams.set('redirect_uri', callbackUrl)
      if (state) {
        authUrl.searchParams.set('state', state)
      }

      // Use fetch instead of axios for better redirect handling
      const response = await fetch(authUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      // If redirect, get Location header
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get('Location')
        if (redirectUrl) {
          return redirectUrl
        }
      }

      // Try JSON response
      if (response.ok) {
        const data = await response.json() as { redirect_url?: string }
        if (data.redirect_url) {
          return data.redirect_url
        }
      }

      throw new Error('Unexpected response from auth server')
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to get auth URL', { error: errorMessage })
      throw new Error(`Failed to get auth URL: ${errorMessage}`)
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    callbackUrl: string,
    provider?: string
  ): Promise<ClineAuthTokens> {
    try {
      const response = await this.client.post(
        '/api/v1/auth/token',
        {
          grant_type: 'authorization_code',
          code,
          client_type: 'web',
          redirect_uri: callbackUrl,
          provider: provider || 'google', // Default to google, can be overridden
        }
      )

      const data = response.data.data
      if (!data.accessToken || !data.refreshToken) {
        throw new Error('Invalid token response from server')
      }

      // Fetch user info
      const userInfo = await this.getUserInfo(data.accessToken)

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: new Date(data.expiresAt).getTime() / 1000,
        userInfo,
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to exchange code for tokens', { error: errorMessage })
      throw new Error(`Failed to exchange code: ${errorMessage}`)
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<ClineAuthTokens> {
    try {
      const response = await this.client.post(
        '/api/v1/auth/refresh',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }
      )

      const data = response.data.data
      if (!data.accessToken || !data.refreshToken) {
        throw new Error('Invalid token response from server')
      }

      // Fetch user info
      const userInfo = await this.getUserInfo(data.accessToken)

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: new Date(data.expiresAt).getTime() / 1000,
        userInfo,
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to refresh token', { error: errorMessage })
      throw new Error(`Failed to refresh token: ${errorMessage}`)
    }
  }

  /**
   * Get user info from Cline API
   */
  async getUserInfo(accessToken: string): Promise<ClineUserInfo> {
    try {
      const response = await this.client.get('/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const data = response.data.data
      return {
        id: data.clineUserId || data.subject || data.id,
        email: data.email,
        name: data.name,
        clineUserId: data.clineUserId,
        organizations: data.organizations,
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to get user info', { error: errorMessage })
      throw new Error(`Failed to get user info: ${errorMessage}`)
    }
  }

  /**
   * Verify token is valid
   */
  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken)
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const clineAuthService = new ClineAuthService()

