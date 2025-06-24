import { FormManagementPage } from "@/components/form-codes/form-management-page";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Quản lý Form Codes</h1>
      <FormManagementPage />
    </div>
  );
}
