import { checkAuth } from "./actions/auth.action";
import { FormManagementPage } from "@/components/form-codes/form-management-page";

export default async function Home() {
  // Kiểm tra xác thực, nếu chưa đăng nhập sẽ chuyển hướng đến trang đăng nhập
  await checkAuth();

  return (
    <div className="w-full h-full p-6">
      <FormManagementPage />;
    </div>
  );
}
