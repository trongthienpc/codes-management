/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Interface definitions for type safety
interface FormDetail {
  key: string;
  value: string;
}

interface FormData {
  templateuid: string;
  code: string;
  name: string;
  ismultiple: boolean;
  seq: number;
  formdetails?: FormDetail[];
}

interface TypeData {
  type: string;
  forms: FormData[];
}

// Configuration
const CONFIG = {
  BATCH_SIZE: 10, // Số lượng forms xử lý trong 1 batch
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
  TRANSACTION_TIMEOUT: 120000, // 2 minutes
  MAX_WAIT: 30000, // 30 seconds
};

/**
 * Sleep function for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validate JSON data structure
 */
function validateData(data: any[]): data is TypeData[] {
  if (!Array.isArray(data)) {
    throw new Error("Data phải là một array");
  }

  for (const typeData of data) {
    if (!typeData.type || typeof typeData.type !== "string") {
      throw new Error("Mỗi item phải có thuộc tính 'type' kiểu string");
    }

    if (!Array.isArray(typeData.forms)) {
      throw new Error("Thuộc tính 'forms' phải là một array");
    }

    for (const form of typeData.forms) {
      const requiredFields = [
        "templateuid",
        "code",
        "name",
        "ismultiple",
        "seq",
      ];
      for (const field of requiredFields) {
        if (form[field] === undefined || form[field] === null) {
          throw new Error(`Form thiếu thuộc tính bắt buộc: ${field}`);
        }
      }
    }
  }

  return true;
}

/**
 * Process forms in batches to avoid overwhelming the database
 */
async function processForms(
  tx: any,
  forms: FormData[],
  formTypeId: number
): Promise<void> {
  const batches = [];

  // Chia forms thành các batch nhỏ
  for (let i = 0; i < forms.length; i += CONFIG.BATCH_SIZE) {
    batches.push(forms.slice(i, i + CONFIG.BATCH_SIZE));
  }

  let processedCount = 0;

  for (const batch of batches) {
    console.log(
      `  📦 Xử lý batch ${Math.floor(processedCount / CONFIG.BATCH_SIZE) + 1}/${
        batches.length
      } (${batch.length} forms)`
    );

    for (const formData of batch) {
      try {
        // Tạo Form
        const form = await tx.form.create({
          data: {
            templateuid: formData.templateuid,
            code: formData.code,
            name: formData.name,
            ismultiple: formData.ismultiple,
            seq: formData.seq,
            formTypeId: formTypeId,
          },
        });

        // Tạo FormDetails nếu có (sử dụng createMany để tối ưu)
        if (formData.formdetails && formData.formdetails.length > 0) {
          await tx.formDetail.createMany({
            data: formData.formdetails.map((detail) => ({
              key: detail.key,
              value: detail.value,
              formId: form.id,
            })),
            skipDuplicates: true, // Bỏ qua duplicates nếu có
          });
        }

        processedCount++;

        // Log progress
        if (processedCount % 5 === 0) {
          console.log(
            `    ✅ Đã xử lý ${processedCount}/${forms.length} forms`
          );
        }
      } catch (error) {
        console.error(`❌ Lỗi khi tạo form ${formData.code}:`, error);
        throw error;
      }
    }
  }
}

/**
 * Process a single FormType with its forms
 */
async function processFormType(typeData: TypeData): Promise<void> {
  await prisma.$transaction(
    async (tx: any) => {
      console.log(`🚀 Bắt đầu xử lý FormType: "${typeData.type}"`);

      // Kiểm tra xem FormType đã tồn tại chưa
      const existingFormType = await tx.formType.findFirst({
        where: { type: typeData.type },
      });

      let formType;
      if (existingFormType) {
        console.log(
          `  ⚠️  FormType "${typeData.type}" đã tồn tại, sẽ sử dụng lại`
        );
        formType = existingFormType;
      } else {
        // Tạo FormType mới
        formType = await tx.formType.create({
          data: { type: typeData.type },
        });
        console.log(`  ✅ Tạo FormType mới: "${typeData.type}"`);
      }

      // Xử lý các Forms
      if (typeData.forms.length > 0) {
        console.log(`  📋 Bắt đầu xử lý ${typeData.forms.length} forms`);
        await processForms(tx, typeData.forms, formType.id);
        console.log(
          `  ✅ Hoàn thành xử lý tất cả forms cho FormType "${typeData.type}"`
        );
      } else {
        console.log(
          `  ⚠️  Không có forms nào để xử lý cho FormType "${typeData.type}"`
        );
      }
    },
    {
      maxWait: CONFIG.MAX_WAIT,
      timeout: CONFIG.TRANSACTION_TIMEOUT,
    }
  );
}

/**
 * Main import function with retry logic
 */
async function importData(): Promise<void> {
  try {
    console.log("🔄 Bắt đầu quá trình import dữ liệu...");

    // Đọc và validate file JSON
    const filePath = path.join(process.cwd(), "form-codes.json");

    if (!fs.existsSync(filePath)) {
      throw new Error(`File không tồn tại: ${filePath}`);
    }

    console.log(`📖 Đọc file: ${filePath}`);
    const jsonData = fs.readFileSync(filePath, "utf8");

    let data: any;
    try {
      data = JSON.parse(jsonData);
    } catch (parseError) {
      throw new Error(`Lỗi parse JSON: ${parseError}`);
    }

    // Validate dữ liệu
    console.log("🔍 Kiểm tra tính hợp lệ của dữ liệu...");
    validateData(data);

    console.log(`✅ Dữ liệu hợp lệ. Tìm thấy ${data.length} FormTypes`);

    // Đếm tổng số forms
    const totalForms = data.reduce(
      (sum: number, typeData: TypeData) => sum + typeData.forms.length,
      0
    );
    console.log(`📊 Tổng số forms sẽ được import: ${totalForms}`);

    // Xử lý từng FormType
    let processedTypes = 0;
    for (const typeData of data) {
      try {
        await processFormType(typeData);
        processedTypes++;
        console.log(
          `✅ Hoàn thành FormType ${processedTypes}/${data.length}: "${typeData.type}"`
        );
        console.log("─".repeat(50));
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý FormType "${typeData.type}":`, error);
        throw error;
      }
    }

    console.log("🎉 Import dữ liệu thành công!");
    console.log(`📈 Thống kê:`);
    console.log(`   - FormTypes đã xử lý: ${processedTypes}`);
    console.log(`   - Tổng Forms đã import: ${totalForms}`);
  } catch (error) {
    console.error("💥 Lỗi trong quá trình import:", error);
    throw error;
  }
}

/**
 * Main function with retry mechanism
 */
async function main(): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`\n🔄 Lần thử ${attempt}/${CONFIG.MAX_RETRIES}`);

      // Test database connection
      await prisma.$connect();
      console.log("✅ Kết nối database thành công");

      await importData();

      console.log("🎊 Quá trình import hoàn tất thành công!");
      return; // Success - exit function
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Lần thử ${attempt} thất bại:`, error);

      if (attempt < CONFIG.MAX_RETRIES) {
        console.log(
          `⏳ Chờ ${CONFIG.RETRY_DELAY / 1000} giây trước khi thử lại...`
        );
        await sleep(CONFIG.RETRY_DELAY);
      }
    }
  }

  // Nếu tất cả các lần thử đều thất bại
  console.error(`💥 Đã thử ${CONFIG.MAX_RETRIES} lần nhưng vẫn thất bại`);
  throw lastError;
}

/**
 * Cleanup function
 */
async function cleanup(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("🔌 Đã ngắt kết nối database");
  } catch (error) {
    console.error("⚠️  Lỗi khi ngắt kết nối database:", error);
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n🛑 Nhận tín hiệu dừng, đang cleanup...");
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Nhận tín hiệu terminate, đang cleanup...");
  await cleanup();
  process.exit(0);
});

// Execute main function
main()
  .catch(async (error) => {
    console.error("💥 Lỗi không thể khôi phục:", error);
    await cleanup();
    process.exit(1);
  })
  .finally(async () => {
    await cleanup();
  });

export { main, importData, processFormType };
