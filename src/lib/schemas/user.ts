import { z } from "zod";

// Schema cho đăng ký
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  name: z.string().optional(),
  email: z.string().email({ message: "Email không hợp lệ" }).optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema cho đăng nhập
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Tên đăng nhập là bắt buộc" }),
  password: z.string().min(1, { message: "Mật khẩu là bắt buộc" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
