import { z } from "zod";

// Schema cho FormType
export const formTypeSchema = z.object({
  type: z.string().min(1, { message: "Loại biểu mẫu không được để trống" }),
});

export type FormTypeFormData = z.infer<typeof formTypeSchema>;

// Schema cho Form
export const formSchema = z.object({
  templateuid: z.string().min(1, { message: "Template UID không được để trống" }),
  code: z.string().min(1, { message: "Mã biểu mẫu không được để trống" }),
  name: z.string().min(1, { message: "Tên biểu mẫu không được để trống" }),
  ismultiple: z.boolean().default(false),
  seq: z.number().int().nonnegative(),
  formTypeId: z.string().min(1, { message: "Loại biểu mẫu không được để trống" }),
});

export type FormFormData = z.infer<typeof formSchema>;

// Schema cho FormDetail
export const formDetailSchema = z.object({
  key: z.string().min(1, { message: "Khóa không được để trống" }),
  value: z.string(),
  formId: z.string().min(1, { message: "Biểu mẫu không được để trống" }),
});

export type FormDetailFormData = z.infer<typeof formDetailSchema>;

// Schema cho ID validation
export const idSchema = z.object({
  id: z.string().min(1, { message: "ID không được để trống" }),
});

// Schema cho update FormType
export const updateFormTypeSchema = idSchema.merge(formTypeSchema.partial());
export type UpdateFormTypeFormData = z.infer<typeof updateFormTypeSchema>;

// Schema cho update Form
export const updateFormSchema = idSchema.merge(formSchema.partial());
export type UpdateFormFormData = z.infer<typeof updateFormSchema>;

// Schema cho update FormDetail
export const updateFormDetailSchema = idSchema.merge(formDetailSchema.partial());
export type UpdateFormDetailFormData = z.infer<typeof updateFormDetailSchema>;

// Schema cho import/export
export const formCodesImportSchema = z.array(
  z.object({
    type: z.string(),
    forms: z.array(
      z.object({
        formdetails: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ).default([]),
        templateuid: z.string(),
        code: z.string(),
        name: z.string(),
        ismultiple: z.boolean().default(false),
        seq: z.number().int().nonnegative(),
      })
    ),
  })
);

export type FormCodesImportData = z.infer<typeof formCodesImportSchema>;