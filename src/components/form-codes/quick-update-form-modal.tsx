"use client";

import { QuickUpdateForm } from "./quick-update-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickUpdateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickUpdateFormModal({
  open,
  onOpenChange,
}: QuickUpdateFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật nhanh biểu mẫu</DialogTitle>
          <DialogDescription>
            Nhập mã biểu mẫu để tìm và cập nhật từ MongoDB
          </DialogDescription>
        </DialogHeader>
        <QuickUpdateForm />
      </DialogContent>
    </Dialog>
  );
}