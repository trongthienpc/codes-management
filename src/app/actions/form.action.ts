"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  FormFormData,
  UpdateFormFormData,
  formSchema,
  updateFormSchema,
} from "@/lib/schemas/form-codes";

// Tạo mới biểu mẫu
export async function createForm(data: FormFormData) {
  try {
    // Validate dữ liệu đầu vào
    const validated = formSchema.parse(data);

    // Kiểm tra loại biểu mẫu tồn tại
    const formType = await prisma.formType.findUnique({
      where: { id: validated.formTypeId },
    });

    if (!formType) {
      return { success: false, message: "Loại biểu mẫu không tồn tại" };
    }

    // Kiểm tra trùng lặp mã biểu mẫu trong cùng loại
    const existing = await prisma.form.findFirst({
      where: {
        formTypeId: validated.formTypeId,
        code: validated.code,
      },
    });

    if (existing) {
      return {
        success: false,
        message: "Mã biểu mẫu đã tồn tại trong loại này",
      };
    }

    // Tạo mới
    const form = await prisma.form.create({
      data: validated,
    });

    revalidatePath("/form-codes");
    return { success: true, data: form };
  } catch (error) {
    console.error("Error creating form:", error);
    return { success: false, message: "Không thể tạo biểu mẫu" };
  }
}

// Cập nhật biểu mẫu
export async function updateForm(data: UpdateFormFormData) {
  try {
    // Validate dữ liệu đầu vào
    const validated = updateFormSchema.parse(data);
    const { id, ...updateData } = validated;

    // Kiểm tra tồn tại
    const existing = await prisma.form.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, message: "Biểu mẫu không tồn tại" };
    }

    // Kiểm tra trùng lặp nếu thay đổi code hoặc formTypeId
    if (
      (updateData.code && updateData.code !== existing.code) ||
      (updateData.formTypeId && updateData.formTypeId !== existing.formTypeId)
    ) {
      const formTypeId = updateData.formTypeId || existing.formTypeId;
      const code = updateData.code || existing.code;

      const duplicate = await prisma.form.findFirst({
        where: {
          formTypeId,
          code,
          id: { not: id },
        },
      });

      if (duplicate) {
        return {
          success: false,
          message: "Mã biểu mẫu đã tồn tại trong loại này",
        };
      }
    }

    // Cập nhật
    const form = await prisma.form.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/form-codes");
    return { success: true, data: form };
  } catch (error) {
    console.error("Error updating form:", error);
    return { success: false, message: "Không thể cập nhật biểu mẫu" };
  }
}

// Xóa biểu mẫu
export async function deleteForm(id: string) {
  try {
    // Kiểm tra tồn tại
    const existing = await prisma.form.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, message: "Biểu mẫu không tồn tại" };
    }

    // Xóa
    await prisma.form.delete({
      where: { id },
    });

    revalidatePath("/form-codes");
    return { success: true, message: "Xóa biểu mẫu thành công" };
  } catch (error) {
    console.error("Error deleting form:", error);
    return { success: false, message: "Không thể xóa biểu mẫu" };
  }
}

// Lấy tất cả biểu mẫu
export async function getAllForms() {
  try {
    const forms = await prisma.form.findMany({
      include: { formType: true },
      orderBy: [{ formType: { type: "asc" } }, { seq: "asc" }],
    });
    console.log("🚀 ~ getAllForms ~ forms:", forms.length);

    return { success: true, data: forms };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return {
      success: false,
      message: "Không thể lấy danh sách biểu mẫu",
      data: [],
    };
  }
}

// Lấy biểu mẫu theo ID
export async function getFormById(id: string) {
  try {
    const form = await prisma.form.findUnique({
      where: { id },
      include: { formType: true, formDetails: true },
    });

    if (!form) {
      return { success: false, message: "Biểu mẫu không tồn tại" };
    }

    return { success: true, data: form };
  } catch (error) {
    console.error("Error fetching form:", error);
    return { success: false, message: "Không thể lấy thông tin biểu mẫu" };
  }
}

// Lấy biểu mẫu theo loại
export async function getFormsByType(formTypeId: string) {
  try {
    const forms = await prisma.form.findMany({
      where: { formTypeId },
      include: { formDetails: true, formType: true },
      orderBy: { seq: "asc" },
    });

    return { success: true, data: forms };
  } catch (error) {
    console.error("Error fetching forms by type:", error);
    return {
      success: false,
      message: "Không thể lấy danh sách biểu mẫu theo loại",
    };
  }
}
