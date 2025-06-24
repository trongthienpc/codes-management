"use server";
import { findFormTemplateByCode } from "@/lib/mongodb";
import {
  QuickUpdateFormData,
  quickUpdateFormSchema,
} from "@/lib/schemas/form-codes";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  FormFormData,
  NewCodeUpdateFormData,
  UpdateFormFormData,
  formSchema,
  newCodeUpdateFormSchema,
  updateFormSchema,
} from "@/lib/schemas/form-codes";
import { validateRequest } from "@/lib/lucia";

// Tạo mới biểu mẫu
export async function createForm(data: FormFormData) {
  try {
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
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
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
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
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
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
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
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
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
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
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
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

// Cập nhật nhanh form từ MongoDB
export async function quickUpdateForm(data: QuickUpdateFormData) {
  try {
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
    // Validate dữ liệu đầu vào
    const validated = quickUpdateFormSchema.parse(data);

    // Tìm template trong MongoDB
    const template = await findFormTemplateByCode(validated.code);

    if (!template) {
      return {
        success: false,
        message: `Không tìm thấy biểu mẫu với mã ${validated.code} trong MongoDB`,
      };
    }

    // Kiểm tra form đã tồn tại trong PostgreSQL chưa
    const existingForm = await prisma.form.findFirst({
      where: {
        code: validated.code,
      },
    });

    if (existingForm) {
      // Cập nhật form hiện có
      const updatedForm = await prisma.form.update({
        where: { id: existingForm.id },
        data: {
          name: template.name,
          templateuid: template._id.toString(),
        },
      });

      revalidatePath("/form-codes");
      return {
        success: true,
        data: updatedForm,
        message: "Cập nhật biểu mẫu thành công",
      };
    } else {
      return {
        success: false,
        message: `Không tìm thấy biểu mẫu với mã ${validated.code} trong danh sách`,
      };
    }
  } catch (error) {
    console.error("Lỗi cập nhật nhanh form:", error);
    return { success: false, message: "Không thể cập nhật biểu mẫu" };
  }
}

// Kiểm tra form tồn tại
export async function checkFormExists(code: string) {
  try {
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
    // Kiểm tra form đã tồn tại trong PostgreSQL chưa
    const existingForm = await prisma.form.findFirst({
      where: {
        code,
      },
    });

    if (!existingForm) {
      return {
        success: false,
        message: `Không tìm thấy biểu mẫu với mã ${code} trong danh sách`,
      };
    }

    // Tìm template trong MongoDB
    const template = await findFormTemplateByCode(code);

    if (!template) {
      return {
        success: false,
        message: `Không tìm thấy biểu mẫu với mã ${code} trong MongoDB`,
      };
    }

    // Serialize MongoDB document to plain JavaScript object
    const serializedTemplate = JSON.parse(JSON.stringify(template));

    return {
      success: true,
      data: {
        existingForm,
        template: serializedTemplate,
      },
    };
  } catch (error) {
    console.error("Lỗi kiểm tra form:", error);
    return { success: false, message: "Không thể kiểm tra biểu mẫu" };
  }
}

// Cập nhật form với code mới
export async function updateFormWithNewCode(data: NewCodeUpdateFormData) {
  try {
    // Kiểm tra xác thực
    const { user } = await validateRequest();
    if (!user) {
      return {
        success: false,
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      };
    }
    // Validate dữ liệu đầu vào
    const validated = newCodeUpdateFormSchema.parse(data);

    // Kiểm tra form cũ tồn tại
    const existingForms = await prisma.form.findMany({
      where: {
        code: validated.oldCode,
      },
    });

    if (existingForms.length === 0) {
      return {
        success: false,
        message: `Không tìm thấy biểu mẫu với mã ${validated.oldCode} trong danh sách`,
      };
    }

    // Tìm template mới trong MongoDB
    const newTemplate = await findFormTemplateByCode(validated.newCode);

    if (!newTemplate) {
      return {
        success: false,
        message: `Không tìm thấy biểu mẫu với mã ${validated.newCode} trong MongoDB`,
      };
    }

    // Serialize MongoDB document to plain JavaScript object
    const serializedTemplate = JSON.parse(JSON.stringify(newTemplate));

    // Cập nhật tất cả các form hiện có có cùng mã code
    const updatePromises = existingForms.map((form) => {
      return prisma.form.update({
        where: { id: form.id },
        data: {
          code: validated.newCode,
          name: serializedTemplate.name,
          templateuid: serializedTemplate._id.toString(),
        },
      });
    });

    const updatedForms = await Promise.all(updatePromises);

    revalidatePath("/form-codes");
    return {
      success: true,
      data: updatedForms,
      message: "Cập nhật biểu mẫu thành công",
    };
  } catch (error) {
    console.error("Lỗi cập nhật form với code mới:", error);
    return { success: false, message: "Không thể cập nhật biểu mẫu" };
  }
}
