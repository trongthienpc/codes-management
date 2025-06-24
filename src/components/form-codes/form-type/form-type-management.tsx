"use client";

import { useEffect, useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Button } from "@/components/ui/button";
import { FormTypeTable } from "./form-type-table";
import { FormTypeDialog } from "./form-type-dialog";
import { FormType } from "../../../../node_modules/@prisma/clients/codes_prisma";

export function FormTypeManagement() {
  const { formTypes, fetchFormTypes, isLoading } = useFormCodes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormType, setEditingFormType] = useState<FormType | null>(null);

  useEffect(() => {
    fetchFormTypes();
  }, [fetchFormTypes]);

  const handleAdd = () => {
    setEditingFormType(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (formType: FormType) => {
    setEditingFormType(formType);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFormType(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loại biểu mẫu</h2>
        <Button onClick={handleAdd}>Thêm loại biểu mẫu</Button>
      </div>

      <FormTypeTable
        formTypes={formTypes}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <FormTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formType={editingFormType}
        onClose={handleDialogClose}
      />
    </div>
  );
}
