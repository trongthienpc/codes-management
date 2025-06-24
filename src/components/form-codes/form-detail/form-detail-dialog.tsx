"use client";

import { useEffect, useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormDetail } from "../../../../node_modules/@prisma/clients/codes_prisma";

interface FormDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formDetail: FormDetail | null;
  onClose: () => void;
  selectedForm: string | null;
}

export function FormDetailDialog({
  open,
  onOpenChange,
  formDetail,
  onClose,
  selectedForm,
}: FormDetailDialogProps) {
  const { addFormDetail, editFormDetail } = useFormCodes();
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    formId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formDetail) {
      setFormData({
        key: formDetail.key,
        value: formDetail.value,
        formId: formDetail.formId,
      });
    } else {
      setFormData({
        key: "",
        value: "",
        formId: selectedForm || "",
      });
    }
  }, [formDetail, selectedForm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formDetail) {
        await editFormDetail({ id: formDetail.id, ...formData });
      } else {
        await addFormDetail(formData);
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
            {formDetail ? "Sửa chi tiết biểu mẫu" : "Thêm chi tiết biểu mẫu"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Khóa</Label>
            <Input
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              placeholder="Nhập khóa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Giá trị</Label>
            <Textarea
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="Nhập giá trị"
              rows={4}
            />
          </div>

          <input type="hidden" name="formId" value={formData.formId} />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.formId}>
              {isSubmitting
                ? "Đang xử lý..."
                : formDetail
                ? "Cập nhật"
                : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
