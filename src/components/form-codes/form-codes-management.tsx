"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FormTypeManagement } from "./form-type/form-type-management";
import { FormDetailManagement } from "./form-detail/form-detail-management";
import { ImportExport } from "./import-export";
import { FormManagement } from "./form/form-management";

export function FormCodesManagement() {
  return (
    <Tabs defaultValue="form-types" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="form-types">Loại biểu mẫu</TabsTrigger>
        <TabsTrigger value="forms">Biểu mẫu</TabsTrigger>
        <TabsTrigger value="form-details">Chi tiết biểu mẫu</TabsTrigger>
        <TabsTrigger value="import-export">Nhập/Xuất dữ liệu</TabsTrigger>
      </TabsList>
      <TabsContent value="form-types">
        <FormTypeManagement />
      </TabsContent>
      <TabsContent value="forms">
        <FormManagement />
      </TabsContent>
      <TabsContent value="form-details">
        <FormDetailManagement />
      </TabsContent>
      <TabsContent value="import-export">
        <ImportExport />
      </TabsContent>
    </Tabs>
  );
}
