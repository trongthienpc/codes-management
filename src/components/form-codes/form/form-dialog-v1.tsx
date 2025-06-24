/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Form, FormType } from "@/providers/form-codes-provider";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Save, X, FileText, Type, Code, AlignLeft, Hash } from "lucide-react";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form | null;
  onClose: () => void;
  formTypes: FormType[];
}

export function FormDialog({
  open,
  onOpenChange,
  form,
  onClose,
  formTypes,
}: FormDialogProps) {
  const { addForm, editForm } = useFormCodes();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    templateuid: "",
    formTypeId: "",
    ismultiple: false,
    seq: 0,
    description: "", // Trường mô tả bổ sung (không thuộc schema)
  });

  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name || "",
        code: form.code || "",
        templateuid: form.templateuid || "",
        formTypeId: form.formTypeId || "",
        ismultiple: form.ismultiple || false,
        seq: form.seq || 0,
        description: "", // Mô tả không lưu trong DB
      });
    } else {
      setFormData({
        name: "",
        code: "",
        templateuid: "",
        formTypeId: "",
        ismultiple: false,
        seq: 0,
        description: "",
      });
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Chuẩn bị dữ liệu theo schema
    const formSubmitData = {
      name: formData.name,
      code: formData.code,
      templateuid: formData.templateuid,
      formTypeId: formData.formTypeId,
      ismultiple: formData.ismultiple,
      seq: formData.seq,
    };

    if (isEditing) {
      // Cập nhật biểu mẫu
      await editForm({
        id: form?.id as string,
        ...formSubmitData,
      });
    } else {
      // Tạo mới biểu mẫu
      await addForm(formSubmitData);
    }

    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isEditing = !!form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span>
              {isEditing ? "Chỉnh sửa biểu mẫu" : "Thêm biểu mẫu mới"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditing
              ? "Cập nhật thông tin biểu mẫu của bạn."
              : "Tạo một biểu mẫu mới cho hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center space-x-2 text-sm font-medium"
              >
                <Type className="h-4 w-4 text-gray-500" />
                <span>Tên biểu mẫu</span>
                <Badge variant="destructive" className="text-xs">
                  Bắt buộc
                </Badge>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên biểu mẫu..."
                className="focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="code"
                className="flex items-center space-x-2 text-sm font-medium"
              >
                <Code className="h-4 w-4 text-gray-500" />
                <span>Mã biểu mẫu</span>
                <Badge variant="destructive" className="text-xs">
                  Bắt buộc
                </Badge>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Nhập mã biểu mẫu..."
                className="focus:border-blue-500 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="formTypeId"
                className="flex items-center space-x-2 text-sm font-medium"
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Loại biểu mẫu</span>
                <Badge variant="destructive" className="text-xs">
                  Bắt buộc
                </Badge>
              </Label>
              <Select
                value={formData.formTypeId}
                onValueChange={(value) =>
                  handleInputChange("formTypeId", value)
                }
                required
              >
                <SelectTrigger className="focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn loại biểu mẫu" />
                </SelectTrigger>
                <SelectContent>
                  {formTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        <span>{type.type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="templateuid"
                className="flex items-center space-x-2 text-sm font-medium"
              >
                <Code className="h-4 w-4 text-gray-500" />
                <span>Template UID</span>
                <Badge variant="destructive" className="text-xs">
                  Bắt buộc
                </Badge>
              </Label>
              <Input
                id="templateuid"
                value={formData.templateuid}
                onChange={(e) =>
                  handleInputChange("templateuid", e.target.value)
                }
                placeholder="Nhập template UID..."
                className="focus:border-blue-500 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="seq"
                className="flex items-center space-x-2 text-sm font-medium"
              >
                <Hash className="h-4 w-4 text-gray-500" />
                <span>Thứ tự</span>
                <Badge variant="destructive" className="text-xs">
                  Bắt buộc
                </Badge>
              </Label>
              <Input
                id="seq"
                type="number"
                min="0"
                value={formData.seq.toString()}
                onChange={(e) =>
                  handleInputChange("seq", parseInt(e.target.value) || 0)
                }
                placeholder="Nhập thứ tự..."
                className="focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ismultiple"
                  checked={formData.ismultiple}
                  onCheckedChange={(checked) =>
                    handleInputChange("ismultiple", !!checked)
                  }
                />
                <Label
                  htmlFor="ismultiple"
                  className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
                >
                  <span>Cho phép nhiều bản ghi</span>
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="flex items-center space-x-2 text-sm font-medium"
            >
              <AlignLeft className="h-4 w-4 text-gray-500" />
              <span>Mô tả</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Nhập mô tả cho biểu mẫu..."
              className="focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
              rows={4}
            />
          </div>
        </form>

        <DialogFooter className="pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="mr-2"
          >
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
