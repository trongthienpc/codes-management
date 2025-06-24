"use client";

import { useEffect, useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Form, FormType } from "@/providers/form-codes-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form | null;
  onClose: () => void;
  formTypes: FormType[];
  formTypeId?: string; // Prop mới để chỉ định formTypeId khi thêm mới
  hideFormTypeSelect?: boolean; // Prop mới để ẩn select loại biểu mẫu
}

export function FormDialog({
  open,
  onOpenChange,
  form,
  onClose,
  formTypes,
  formTypeId,
  hideFormTypeSelect = false,
}: FormDialogProps) {
  const { addForm, editForm } = useFormCodes();
  const [formData, setFormData] = useState({
    templateuid: "",
    code: "",
    name: "",
    ismultiple: false,
    seq: 0,
    formTypeId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (form) {
      setFormData({
        templateuid: form.templateuid,
        code: form.code,
        name: form.name,
        ismultiple: form.ismultiple,
        seq: form.seq,
        formTypeId: form.formTypeId,
      });
    } else {
      setFormData({
        templateuid: "",
        code: "",
        name: "",
        ismultiple: false,
        seq: 0,
        formTypeId: formTypeId || "", // Sử dụng formTypeId nếu được cung cấp
      });
    }
  }, [form, formTypeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      ismultiple: checked,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      formTypeId: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (form) {
        await editForm({ id: form.id, ...formData });
      } else {
        await addForm(formData);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{form ? "Sửa biểu mẫu" : "Thêm biểu mẫu"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!hideFormTypeSelect && (
            <div className="space-y-2">
              <Label htmlFor="formTypeId">Loại biểu mẫu</Label>
              <Select
                value={formData.formTypeId}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại biểu mẫu" />
                </SelectTrigger>
                <SelectContent>
                  {formTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="templateuid">Template UID</Label>
            <Input
              id="templateuid"
              name="templateuid"
              value={formData.templateuid}
              onChange={handleChange}
              placeholder="Nhập template UID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Mã biểu mẫu</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Nhập mã biểu mẫu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên biểu mẫu</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên biểu mẫu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seq">Thứ tự</Label>
            <Input
              id="seq"
              name="seq"
              type="number"
              value={formData.seq}
              onChange={handleChange}
              placeholder="Nhập thứ tự"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ismultiple"
              checked={formData.ismultiple}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="ismultiple">Đa giá trị</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : form ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
