// src/utils/security/jwt/JwtUtils.ts

import { SecurityConfig } from "../config/SecurityConfig";

export class JwtUtils {
  static getToken(): string | null {
    return localStorage.getItem(SecurityConfig.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(SecurityConfig.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(SecurityConfig.TOKEN_KEY);
  }

  static parseToken(token: string): any {
    return JSON.parse(atob(token.split(".")[1]));
  }

  static getAuthHeader(): string {
    const token = this.getToken();
    return token ? `${SecurityConfig.AUTH_PREFIX} ${token}` : "";
  }
}
