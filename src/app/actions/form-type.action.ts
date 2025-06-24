"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  FormTypeFormData,
  UpdateFormTypeFormData,
  formTypeSchema,
  updateFormTypeSchema,
} from "@/lib/schemas/form-codes";
import { handleServerError, ServerActionError } from "@/lib/utils";
import { FormType } from "../../../node_modules/@prisma/clients/codes_prisma";

// Tạo mới loại biểu mẫu
export async function createFormType(
  data: FormTypeFormData
): Promise<{ success: true; data: FormType } | ServerActionError> {
  try {
    // Validate dữ liệu đầu vào
    const validated = formTypeSchema.parse(data);

    // Kiểm tra trùng lặp
    const existing = await prisma.formType.findUnique({
      where: { type: validated.type },
    });

    if (existing) {
      return handleServerError("Loại biểu mẫu đã tồn tại");
    }

    // Tạo mới
    const formType = await prisma.formType.create({
      data: validated,
    });

    revalidatePath("/form-codes");
    return { success: true, data: formType };
  } catch (error) {
    console.error("Error creating form type:", error);
    return handleServerError(error, "Không thể tạo loại biểu mẫu");
  }
}

// Cập nhật loại biểu mẫu
export async function updateFormType(
  data: UpdateFormTypeFormData
): Promise<{ success: true; data: FormType } | ServerActionError> {
  try {
    // Validate dữ liệu đầu vào
    const validated = updateFormTypeSchema.parse(data);
    const { id, ...updateData } = validated;

    // Kiểm tra tồn tại
    const existing = await prisma.formType.findUnique({
      where: { id },
    });

    if (!existing) {
      return handleServerError("Loại biểu mẫu không tồn tại");
    }

    // Kiểm tra trùng lặp nếu thay đổi type
    if (updateData.type && updateData.type !== existing.type) {
      const duplicate = await prisma.formType.findUnique({
        where: { type: updateData.type },
      });

      if (duplicate) {
        return handleServerError("Loại biểu mẫu đã tồn tại");
      }
    }

    // Cập nhật
    const formType = await prisma.formType.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/form-codes");
    return { success: true, data: formType };
  } catch (error) {
    console.error("Error updating form type:", error);
    return handleServerError(error, "Không thể cập nhật loại biểu mẫu");
  }
}

// Xóa loại biểu mẫu
export async function deleteFormType(
  id: string
): Promise<{ success: true; message: string } | ServerActionError> {
  try {
    // Kiểm tra tồn tại
    const existing = await prisma.formType.findUnique({
      where: { id },
      include: { forms: true },
    });

    if (!existing) {
      return handleServerError("Loại biểu mẫu không tồn tại");
    }

    // Xóa
    await prisma.formType.delete({
      where: { id },
    });

    revalidatePath("/form-codes");
    return { success: true, message: "Xóa loại biểu mẫu thành công" };
  } catch (error) {
    console.error("Error deleting form type:", error);
    return handleServerError(error, "Không thể xóa loại biểu mẫu");
  }
}

// Lấy tất cả loại biểu mẫu
export async function getAllFormTypes(): Promise<
  { success: true; data: FormType[] } | ServerActionError
> {
  try {
    const formTypes = await prisma.formType.findMany({
      orderBy: { type: "asc" },
    });

    return { success: true, data: formTypes || [] };
  } catch (error) {
    console.error("Error fetching form types:", error);
    return handleServerError(error, "Không thể lấy danh sách khu vực");
  }
}

// Lấy loại biểu mẫu theo ID
export async function getFormTypeById(
  id: string
): Promise<{ success: true; data: FormType } | ServerActionError> {
  try {
    const formType = await prisma.formType.findUnique({
      where: { id },
      include: { forms: true },
    });

    if (!formType) {
      return handleServerError("Loại biểu mẫu không tồn tại");
    }

    return { success: true, data: formType };
  } catch (error) {
    console.error("Error fetching form type:", error);
    return handleServerError(error, "Không thể lấy thông tin loại biểu mẫu");
  }
}
