"use client";

import { ImportExport } from "./import-export";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportExportModal({
  open,
  onOpenChange,
}: ImportExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhập/Xuất dữ liệu</DialogTitle>
        </DialogHeader>
        <ImportExport />
      </DialogContent>
    </Dialog>
  );
}