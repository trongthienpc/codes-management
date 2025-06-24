"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { login, logout, register } from "@/app/actions/auth.action";
import { LoginFormData, RegisterFormData } from "@/lib/schemas/user";

type User = {
  id: string;
  username: string;
  fullname: string | null;
  avatarUrl: string | null;
  departmentId: string | null;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    startTransition(async () => {
      const result = await login(data);
      if (result.success && result.data) {
        setUser({
          id: result.data.user.id,
          username: result.data.user.username,
          fullname: result.data.user.fullname,
          avatarUrl: "",
          departmentId: "",
          role: result.data.user.role,
        }); // Cập nhật user state với thông tin từ server
        toast.success("Đăng nhập thành công");
        router.refresh(); // Vẫn giữ refresh để cập nhật trạng thái đăng nhập
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRegister = async (data: RegisterFormData) => {
    startTransition(async () => {
      const result = await register(data);
      if (result.success) {
        toast.success("Đăng ký thành công");
        router.refresh(); // Làm mới trang để cập nhật trạng thái đăng nhập
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleLogout = async () => {
    startTransition(async () => {
      const result = await logout();
      if (result.success) {
        setUser(null);
        toast.success("Đăng xuất thành công");
        router.refresh(); // Làm mới trang để cập nhật trạng thái đăng nhập
        router.push("/login"); // Chuyển hướng về trang đăng nhập
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
