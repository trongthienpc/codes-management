"use client";

import { useFormCodes } from "@/providers/form-codes-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormType } from "@/providers/form-codes-provider";

interface FormTypeTableProps {
  formTypes: FormType[];
  onEdit: (formType: FormType) => void;
  isLoading: boolean;
}

export function FormTypeTable({
  formTypes,
  onEdit,
  isLoading,
}: FormTypeTableProps) {
  const { removeFormType } = useFormCodes();

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa loại biểu mẫu này?")) {
      await removeFormType(id);
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loại</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            formTypes.map((formType) => (
              <TableRow key={formType.id}>
                <TableCell>{formType.type}</TableCell>
                <TableCell>
                  {new Date(formType.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(formType)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(formType.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
