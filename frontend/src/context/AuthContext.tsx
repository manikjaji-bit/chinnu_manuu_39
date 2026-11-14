import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getAuthHeaders, normalizeRole } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role: UserRole, departmentId?: number) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cg_token');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (res.ok) {
        const userData = await res.json();
        // Ensure role is normalized
        userData.role = normalizeRole(userData.role);
        setUser(userData);
      } else {
        // Token invalid or expired: clear session
        try {
          localStorage.removeItem('cg_token');
        } catch {}
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      try {
        localStorage.removeItem('cg_token');
      } catch {}
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Incorrect campus email or password.');
      }

      const data = await res.json();
      const normalizedUser = {
        ...data.user,
        role: normalizeRole(data.user.role)
      };

      try {
        localStorage.setItem('cg_token', data.access_token);
      } catch {}

      setToken(data.access_token);
      setUser(normalizedUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, role: UserRole, departmentId?: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role: role.toLowerCase(),
          department_id: role === 'maintenance' ? (departmentId || 1) : null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Registration failed. Please check your information.');
      }

      const data = await res.json();
      const normalizedUser = {
        ...data.user,
        role: normalizeRole(data.user.role)
      };

      try {
        localStorage.setItem('cg_token', data.access_token);
      } catch {}

      setToken(data.access_token);
      setUser(normalizedUser);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (targetRole: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/demo-login/${targetRole.toLowerCase()}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Demo login for ${targetRole} failed.`);
      }

      const data = await res.json();
      const normalizedUser = {
        ...data.user,
        role: normalizeRole(data.user.role)
      };

      try {
        localStorage.setItem('cg_token', data.access_token);
      } catch {}

      setToken(data.access_token);
      setUser(normalizedUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('cg_token');
    } catch {}
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const role: UserRole = normalizeRole(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
