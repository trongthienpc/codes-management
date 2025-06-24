"use client";

import { useEffect, useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Button } from "@/components/ui/button";
import { FormDetail } from "@/providers/form-codes-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDetailTable } from "./form-detail-table";
import { FormDetailDialog } from "./form-detail-dialog";

export function FormDetailManagement() {
  const {
    forms,
    formDetails,
    fetchForms,
    fetchFormDetails,
    selectedForm,
    setSelectedForm,
    isLoading,
  } = useFormCodes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormDetail, setEditingFormDetail] = useState<FormDetail | null>(
    null
  );

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  useEffect(() => {
    if (selectedForm) {
      fetchFormDetails(selectedForm);
    }
  }, [fetchFormDetails, selectedForm]);

  const handleAdd = () => {
    setEditingFormDetail(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (formDetail: FormDetail) => {
    setEditingFormDetail(formDetail);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFormDetail(null);
  };

  const handleFormChange = (value: string) => {
    setSelectedForm(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chi tiết biểu mẫu</h2>
        <Button onClick={handleAdd} disabled={!selectedForm}>
          Thêm chi tiết
        </Button>
      </div>

      <div className="w-full max-w-xs">
        <Select value={selectedForm || ""} onValueChange={handleFormChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn biểu mẫu" />
          </SelectTrigger>
          <SelectContent>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.code} - {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FormDetailTable
        formDetails={formDetails}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <FormDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formDetail={editingFormDetail}
        onClose={handleDialogClose}
        selectedForm={selectedForm}
      />
    </div>
  );
}
