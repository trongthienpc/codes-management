"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  FormDetailFormData,
  UpdateFormDetailFormData,
  formDetailSchema,
  updateFormDetailSchema,
} from "@/lib/schemas/form-codes";

// Tạo mới chi tiết biểu mẫu
export async function createFormDetail(data: FormDetailFormData) {
  try {
    // Validate dữ liệu đầu vào
    const validated = formDetailSchema.parse(data);

    // Kiểm tra biểu mẫu tồn tại
    const form = await prisma.form.findUnique({
      where: { id: validated.formId },
    });

    if (!form) {
      return { success: false, message: "Biểu mẫu không tồn tại" };
    }

    // Kiểm tra trùng lặp key trong cùng biểu mẫu
    const existing = await prisma.formDetail.findFirst({
      where: {
        formId: validated.formId,
        key: validated.key,
      },
    });

    if (existing) {
      return { success: false, message: "Khóa đã tồn tại trong biểu mẫu này" };
    }

    // Tạo mới
    const formDetail = await prisma.formDetail.create({
      data: validated,
    });

    revalidatePath("/form-codes");
    return { success: true, data: formDetail };
  } catch (error) {
    console.error("Error creating form detail:", error);
    return { success: false, message: "Không thể tạo chi tiết biểu mẫu" };
  }
}

// Cập nhật chi tiết biểu mẫu
export async function updateFormDetail(data: UpdateFormDetailFormData) {
  try {
    // Validate dữ liệu đầu vào
    const validated = updateFormDetailSchema.parse(data);
    const { id, ...updateData } = validated;

    // Kiểm tra tồn tại
    const existing = await prisma.formDetail.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, message: "Chi tiết biểu mẫu không tồn tại" };
    }

    // Kiểm tra trùng lặp nếu thay đổi key hoặc formId
    if (
      (updateData.key && updateData.key !== existing.key) ||
      (updateData.formId && updateData.formId !== existing.formId)
    ) {
      const formId = updateData.formId || existing.formId;
      const key = updateData.key || existing.key;

      const duplicate = await prisma.formDetail.findFirst({
        where: {
          formId,
          key,
          id: { not: id },
        },
      });

      if (duplicate) {
        return {
          success: false,
          message: "Khóa đã tồn tại trong biểu mẫu này",
        };
      }
    }

    // Cập nhật
    const formDetail = await prisma.formDetail.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/form-codes");
    return { success: true, data: formDetail };
  } catch (error) {
    console.error("Error updating form detail:", error);
    return { success: false, message: "Không thể cập nhật chi tiết biểu mẫu" };
  }
}

// Xóa chi tiết biểu mẫu
export async function deleteFormDetail(id: string) {
  try {
    // Kiểm tra tồn tại
    const existing = await prisma.formDetail.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, message: "Chi tiết biểu mẫu không tồn tại" };
    }

    // Xóa
    await prisma.formDetail.delete({
      where: { id },
    });

    revalidatePath("/form-codes");
    return { success: true, message: "Xóa chi tiết biểu mẫu thành công" };
  } catch (error) {
    console.error("Error deleting form detail:", error);
    return { success: false, message: "Không thể xóa chi tiết biểu mẫu" };
  }
}

// Lấy chi tiết biểu mẫu theo biểu mẫu
export async function getFormDetailsByForm(formId: string) {
  try {
    const formDetails = await prisma.formDetail.findMany({
      where: { formId },
      orderBy: { key: "asc" },
    });

    return { success: true, data: formDetails };
  } catch (error) {
    console.error("Error fetching form details:", error);
    return {
      success: false,
      message: "Không thể lấy danh sách chi tiết biểu mẫu",
      data: [],
    };
  }
}
