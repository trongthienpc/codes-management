"use client";

import { useEffect, useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { FormType } from "@/providers/form-codes-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formType: FormType | null;
  onClose: () => void;
}

export function FormTypeDialog({
  open,
  onOpenChange,
  formType,
  onClose,
}: FormTypeDialogProps) {
  const { addFormType, editFormType } = useFormCodes();
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formType) {
      setType(formType.type);
    } else {
      setType("");
    }
  }, [formType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formType) {
        await editFormType({ id: formType.id, type });
      } else {
        await addFormType({ type });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {formType ? "Sửa loại biểu mẫu" : "Thêm loại biểu mẫu"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Loại biểu mẫu</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Nhập loại biểu mẫu"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : formType ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
