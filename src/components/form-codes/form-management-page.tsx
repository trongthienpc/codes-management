"use client";

import { useState } from "react";
import { FormManagement } from "./form/form-management";
import { Button } from "@/components/ui/button";
import { Import, Layers3, ListTree } from "lucide-react";
import { FormTypeManagementModal } from "./form-type/form-type-management-modal";
import { ImportExportModal } from "./import-export-modal";
import { FormDetailManagementModal } from "./form-detail/form-detail-management-modal";

export function FormManagementPage() {
  const [isFormTypeModalOpen, setIsFormTypeModalOpen] = useState(false);
  const [isFormDetailModalOpen, setIsFormDetailModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4 mb-6">
        <Button
          onClick={() => setIsFormTypeModalOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ListTree className="h-4 w-4" />
          Quản lý loại biểu mẫu
        </Button>
        <Button
          onClick={() => setIsFormDetailModalOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Layers3 className="h-4 w-4" />
          Quản lý chi tiết biểu mẫu
        </Button>
        <Button
          onClick={() => setIsImportExportModalOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Import className="h-4 w-4" />
          Nhập/Xuất dữ liệu
        </Button>
      </div>

      {/* Nội dung chính - Form Management */}
      <FormManagement />

      {/* Các modal */}
      <FormTypeManagementModal
        open={isFormTypeModalOpen}
        onOpenChange={setIsFormTypeModalOpen}
      />
      <FormDetailManagementModal
        open={isFormDetailModalOpen}
        onOpenChange={setIsFormDetailModalOpen}
      />
      <ImportExportModal
        open={isImportExportModalOpen}
        onOpenChange={setIsImportExportModalOpen}
      />
    </div>
  );
}
