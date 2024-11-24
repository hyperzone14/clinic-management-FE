import axios from "axios";
import { SecurityConfig } from "../config/SecurityConfig";
import { JwtUtils } from "../jwt/JwtUtils";
import store from "../../../redux/store";
import { setCredentials, logout } from "../../../redux/slices/authSlice";
import { jwtDecode } from "jwt-decode";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  result: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface LoginResponse {
  code: number;
  message: string;
  result: {
    id: number;
    token: string;
  };
}

interface DecodedToken {
  email: string;
  id: string;
  roles: string[];
  exp: number;
  iat: number;
}

export const AuthService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${SecurityConfig.API_URL}/api/auth/login`,
      credentials
    );

    if (response.data.code === 200 && response.data.result.token) {
      // Store token and user info with remember me preference
      JwtUtils.setToken(response.data.result.token, credentials.rememberMe);
      JwtUtils.setUserInfo(
        credentials.email,
        credentials.email, // or username if available in response
        credentials.rememberMe
      );

      if (response.data.result && typeof response.data.result === "object") {
        store.dispatch(
          setCredentials({
            id: response.data.result.id.toString(),
            email: credentials.email,
            username: credentials.email,
            token: response.data.result.token,
          })
        );
      }
    }

    return response.data;
  },

  logout(): void {
    JwtUtils.removeToken(); // This will now clear both storages
    store.dispatch(logout());
  },

  // isAuthenticated(): boolean {
  //   return JwtUtils.isTokenValid();
  // },

  getToken(): string | null {
    return JwtUtils.getToken();
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  getRolesFromToken(): string[] {
    const token = JwtUtils.getToken();
    if (!token) {
      return []; // Return empty array instead of null
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.roles || [];
    } catch (error) {
      console.error("Error decoding token:", error);
      return [];
    }
  },

  getIdFromToken(): string | null {
    const token = JwtUtils.getToken();
    if (!token) {
      return null;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  hasId(id: string): boolean {
    const userId = this.getIdFromToken();
    return userId === id;
  },

  hasRole(role: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }
    const roles = this.getRolesFromToken();
    return roles.includes(role);
  },

  getCurrentRole(): string {
    if (!this.isAuthenticated()) {
      return "GUEST";
    }
    const roles = this.getRolesFromToken();
    if (roles.includes("ROLE_DOCTOR")) return "ROLE_DOCTOR";
    if (roles.includes("ROLE_PATIENT")) return "ROLE_PATIENT";
    return "GUEST";
  },
};
