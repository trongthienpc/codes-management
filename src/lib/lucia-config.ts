import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { prisma } from "./prisma";
const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "codes-auth-session-cookie",
    expires: true,
    // attributes: {
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   path: "/",
    //   domain: process.env.COOKIE_DOMAIN || undefined,
    // },
    attributes: {
      secure: false, // ⚠️ Đặt false để cookie hoạt động trên HTTP
      sameSite: "lax", // Nếu chạy trên IP, có thể cần "none"
      path: "/",
      domain: undefined, // Không cần thiết nếu không chạy trên domain
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      fullname: attributes.fullname,
      avatarUrl: attributes.avatarUrl, // url of avata
      departmentId: attributes.departmentId ?? null,
      role: attributes.role ?? "USER",
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  fullname: string;
  departmentId: string | null;
  role: string;
  avatarUrl: string | null;
}
