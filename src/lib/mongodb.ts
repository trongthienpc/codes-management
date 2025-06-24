import { MongoClient } from "mongodb";

// Chuỗi kết nối MongoDB
const MONGODB_URI =
  process.env.MONGODB_DEV_URI ||
  "mongodb://aait:aait%404321@10.10.9.12:45431/arcusairtest?authMechanism=DEFAULT&directConnection=true";

// Cache kết nối để tái sử dụng
let cachedClient: MongoClient | null = null;

export async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    throw error;
  }
}

// Hàm tìm template theo code
export async function findFormTemplateByCode(code: string) {
  const client = await connectToMongoDB();
  const db = client.db();

  try {
    const template = await db.collection("formtemplates").findOne({ code });
    return template;
  } catch (error) {
    console.error("Lỗi truy vấn MongoDB:", error);
    throw error;
  }
}
