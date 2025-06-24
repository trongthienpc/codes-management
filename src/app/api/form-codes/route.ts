import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Lấy tham số formtype từ URL
    const searchParams = request.nextUrl.searchParams;
    const formType = searchParams.get("formtype");

    // Nếu không có formtype, trả về mảng rỗng thay vì lỗi
    if (!formType) {
      return NextResponse.json({
        type: "",
        forms: [],
      });
    }

    // Tìm FormType theo type
    const formTypeData = await prisma.formType.findUnique({
      where: { type: formType },
      include: {
        forms: {
          include: {
            formDetails: true,
          },
          orderBy: { seq: "asc" },
        },
      },
    });

    // Nếu không tìm thấy, trả về mảng rỗng thay vì lỗi
    if (!formTypeData) {
      return NextResponse.json({
        type: formType,
        forms: [],
      });
    }

    // Chuyển đổi dữ liệu sang định dạng tương thích với ứng dụng NestJS
    const responseData = {
      type: formTypeData.type,
      forms: formTypeData.forms.map((form) => ({
        formdetails: form.formDetails.map((detail) => ({
          key: detail.key,
          value: detail.value,
        })),
        templateuid: form.templateuid,
        code: form.code,
        name: form.name,
        ismultiple: form.ismultiple,
        seq: form.seq,
      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching form codes:", error);
    // Trả về mảng rỗng thay vì lỗi
    return NextResponse.json({
      type: "",
      forms: [],
    });
  }
}
