/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formCodesImportSchema } from "@/lib/schemas/form-codes";
import { Prisma } from "../../../node_modules/@prisma/clients/codes_prisma";

// Import dữ liệu từ JSON
export async function importFormCodes(jsonData: string) {
  try {
    // Parse và validate dữ liệu JSON
    const data = JSON.parse(jsonData);
    const validated = formCodesImportSchema.parse(data);

    // Biến đếm để theo dõi tiến trình
    let processedTypes = 0;
    const totalTypes = validated.length;

    // Xử lý từng FormType trong một transaction riêng biệt
    for (const typeData of validated) {
      await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Tìm hoặc tạo mới FormType
          let formType = await tx.formType.findUnique({
            where: { type: typeData.type },
          });

          if (!formType) {
            formType = await tx.formType.create({
              data: { type: typeData.type },
            });
          }

          // Xử lý các Form
          for (const formData of typeData.forms) {
            // Tìm hoặc tạo mới Form
            let form = await tx.form.findFirst({
              where: {
                formTypeId: formType.id,
                code: formData.code,
              },
            });

            if (!form) {
              form = await tx.form.create({
                data: {
                  templateuid: formData.templateuid,
                  code: formData.code,
                  name: formData.name,
                  ismultiple: formData.ismultiple,
                  seq: formData.seq,
                  formTypeId: formType.id,
                },
              });
            } else {
              // Cập nhật Form nếu đã tồn tại
              form = await tx.form.update({
                where: { id: form.id },
                data: {
                  templateuid: formData.templateuid,
                  name: formData.name,
                  ismultiple: formData.ismultiple,
                  seq: formData.seq,
                },
              });
            }

            // Xử lý các FormDetail
            if (formData.formdetails && formData.formdetails.length > 0) {
              for (const detailData of formData.formdetails) {
                // Tìm hoặc tạo mới FormDetail
                const existingDetail = await tx.formDetail.findFirst({
                  where: {
                    formId: form.id,
                    key: detailData.key,
                  },
                });

                if (!existingDetail) {
                  await tx.formDetail.create({
                    data: {
                      key: detailData.key,
                      value: detailData.value,
                      formId: form.id,
                    },
                  });
                } else {
                  // Cập nhật FormDetail nếu đã tồn tại
                  await tx.formDetail.update({
                    where: { id: existingDetail.id },
                    data: {
                      value: detailData.value,
                    },
                  });
                }
              }
            }
          }
        },
        {
          maxWait: 30000, // 30 giây cho mỗi transaction
          timeout: 60000, // 60 giây cho mỗi transaction
        }
      );

      // Cập nhật tiến trình
      processedTypes++;
    }

    revalidatePath("/form-codes");
    return {
      success: true,
      message: `Import dữ liệu thành công (${processedTypes}/${totalTypes} loại biểu mẫu)`,
    };
  } catch (error) {
    console.error("Error importing form codes:", error);
    return {
      success: false,
      message: `Không thể import dữ liệu: ${
        error instanceof Error ? error.message : "Lỗi không xác định"
      }`,
    };
  }
}

// Export dữ liệu ra JSON
export async function exportFormCodes() {
  try {
    // Lấy tất cả FormType kèm theo Form và FormDetail
    const formTypes = await prisma.formType.findMany({
      include: {
        forms: {
          include: {
            formDetails: true,
          },
          orderBy: { seq: "asc" },
        },
      },
      orderBy: { type: "asc" },
    });

    // Chuyển đổi dữ liệu sang định dạng export
    const exportData = formTypes.map((formType: any) => ({
      type: formType.type,
      forms: formType.forms.map((form: any) => ({
        formdetails: form.formDetails.map((detail: any) => ({
          key: detail.key,
          value: detail.value,
        })),
        templateuid: form.templateuid,
        code: form.code,
        name: form.name,
        ismultiple: form.ismultiple,
        seq: form.seq,
      })),
    }));

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting form codes:", error);
    return { success: false, message: "Không thể export dữ liệu" };
  }
}
