// // src/utils/security/jwt/JwtUtils.ts

// import { SecurityConfig } from "../config/SecurityConfig";

// export class JwtUtils {
//   static getToken(): string | null {
//     // First check sessionStorage, then localStorage
//     return (
//       sessionStorage.getItem(SecurityConfig.TOKEN_KEY) ||
//       localStorage.getItem(SecurityConfig.TOKEN_KEY)
//     );
//   }

//   static setToken(token: string, rememberMe: boolean): void {
//     if (rememberMe) {
//       localStorage.setItem(SecurityConfig.TOKEN_KEY, token);
//     } else {
//       sessionStorage.setItem(SecurityConfig.TOKEN_KEY, token);
//     }
//   }

//   static removeToken(): void {
//     sessionStorage.removeItem(SecurityConfig.TOKEN_KEY);
//     localStorage.removeItem(SecurityConfig.TOKEN_KEY);
//   }

//   static parseToken(token: string): Record<string, unknown> {
//     return JSON.parse(atob(token.split(".")[1]));
//   }

//   static getAuthHeader(): string {
//     const token = this.getToken();
//     return token ? `${SecurityConfig.AUTH_PREFIX} ${token}` : "";
//   }
// }

import { SecurityConfig } from "../config/SecurityConfig";

export class JwtUtils {
  private static readonly EMAIL_KEY = "user_email";
  private static readonly USERNAME_KEY = "user_name";

  static getToken(): string | null {
    return (
      sessionStorage.getItem(SecurityConfig.TOKEN_KEY) ||
      localStorage.getItem(SecurityConfig.TOKEN_KEY)
    );
  }

  static getEmail(): string | null {
    return (
      sessionStorage.getItem(this.EMAIL_KEY) ||
      localStorage.getItem(this.EMAIL_KEY)
    );
  }

  static getUsername(): string | null {
    return (
      sessionStorage.getItem(this.USERNAME_KEY) ||
      localStorage.getItem(this.USERNAME_KEY)
    );
  }

  static setToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem(SecurityConfig.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(SecurityConfig.TOKEN_KEY, token);
    }
  }

  static setUserInfo(
    email: string,
    username: string,
    rememberMe: boolean = false
  ): void {
    if (rememberMe) {
      localStorage.setItem(this.EMAIL_KEY, email);
      localStorage.setItem(this.USERNAME_KEY, username);
    } else {
      sessionStorage.setItem(this.EMAIL_KEY, email);
      sessionStorage.setItem(this.USERNAME_KEY, username);
    }
  }

  static removeToken(): void {
    sessionStorage.removeItem(SecurityConfig.TOKEN_KEY);
    localStorage.removeItem(SecurityConfig.TOKEN_KEY);
  }

  static removeUserInfo(): void {
    sessionStorage.removeItem(this.EMAIL_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }

  static clearAll(): void {
    this.removeToken();
    this.removeUserInfo();
  }

  static parseToken(token: string): Record<string, unknown> {
    return JSON.parse(atob(token.split(".")[1]));
  }

  static getAuthHeader(): string {
    const token = this.getToken();
    return token ? `${SecurityConfig.AUTH_PREFIX} ${token}` : "";
  }
}
