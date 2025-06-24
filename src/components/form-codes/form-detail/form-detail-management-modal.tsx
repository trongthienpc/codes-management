"use client";

import { FormDetailManagement } from "./form-detail-management";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDetailManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormDetailManagementModal({
  open,
  onOpenChange,
}: FormDetailManagementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý chi tiết biểu mẫu</DialogTitle>
        </DialogHeader>
        <FormDetailManagement />
      </DialogContent>
    </Dialog>
  );
}
