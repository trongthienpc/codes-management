"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import { handleServerError } from "@/lib/utils";
import { lucia } from "@/lib/lucia-config";
import { validateRequest } from "@/lib/lucia";
import {
  LoginFormData,
  loginSchema,
  RegisterFormData,
  registerSchema,
} from "@/lib/schemas/user";

// Đăng ký người dùng mới
export async function register(data: RegisterFormData) {
  try {
    // Validate dữ liệu
    const validated = registerSchema.parse(data);

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { username: validated.username },
    });

    if (existingUser) {
      return { success: false, message: "Tên đăng nhập đã tồn tại" };
    }

    // Kiểm tra email đã tồn tại chưa (nếu có)
    if (validated.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingEmail) {
        return { success: false, message: "Email đã tồn tại" };
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await new Argon2id().hash(validated.password);
    const userId = generateId(15); // Tạo ID ngẫu nhiên

    // Tạo người dùng mới
    await prisma.user.create({
      data: {
        id: userId,
        username: validated.username,
        hashedPassword,
        name: validated.name || null,
        email: validated.email || null,
        role: "user", // Mặc định là user
      },
    });

    // Tạo session mới
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true, data: { userId } };
  } catch (error) {
    return handleServerError(error, "Đăng ký thất bại");
  }
}

// Đăng nhập
export async function login(data: LoginFormData) {
  try {
    // Validate dữ liệu
    const validated = loginSchema.parse(data);

    // Tìm người dùng
    const existingUser = await prisma.user.findUnique({
      where: { username: validated.username },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    }

    // Kiểm tra mật khẩu
    const validPassword = await new Argon2id().verify(
      existingUser.hashedPassword,
      validated.password
    );

    if (!validPassword) {
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    }

    // Tạo session mới
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Trả về thông tin user đầy đủ
    return {
      success: true,
      data: {
        userId: existingUser.id,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          fullname: existingUser.name,
          role: existingUser.role,
        },
      },
    };
  } catch (error) {
    return handleServerError(error, "Đăng nhập thất bại");
  }
}

// Đăng xuất
export async function logout() {
  try {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value;
    if (!sessionId) {
      return { success: false, message: "Bạn chưa đăng nhập" };
    }

    await lucia.invalidateSession(sessionId);

    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true, message: "Đăng xuất thành công" };
  } catch (error) {
    return handleServerError(error, "Đăng xuất thất bại");
  }
}

// Kiểm tra trạng thái đăng nhập và chuyển hướng nếu cần
export async function checkAuth(redirectTo = "/login") {
  const { user } = await validateRequest();
  if (!user) redirect(redirectTo);
  return user;
}

// Kiểm tra quyền admin
export async function checkAdmin(redirectTo = "/") {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") redirect(redirectTo);
  return user;
}
