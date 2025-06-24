"use client";

import { FormTypeManagement } from "./form-type-management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormTypeManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormTypeManagementModal({
  open,
  onOpenChange,
}: FormTypeManagementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý loại biểu mẫu</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <FormTypeManagement />
      </DialogContent>
    </Dialog>
  );
}
