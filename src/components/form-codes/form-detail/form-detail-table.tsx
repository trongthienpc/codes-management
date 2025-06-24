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
import { FormDetail } from "../../../../node_modules/@prisma/clients/codes_prisma";

interface FormDetailTableProps {
  formDetails: FormDetail[];
  onEdit: (formDetail: FormDetail) => void;
  isLoading: boolean;
}

export function FormDetailTable({
  formDetails,
  onEdit,
  isLoading,
}: FormDetailTableProps) {
  const { removeFormDetail } = useFormCodes();

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa chi tiết biểu mẫu này?")) {
      await removeFormDetail(id);
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Khóa</TableHead>
          <TableHead>Giá trị</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {formDetails.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        ) : (
          formDetails.map((formDetail) => (
            <TableRow key={formDetail.id}>
              <TableCell>{formDetail.key}</TableCell>
              <TableCell>{formDetail.value}</TableCell>
              <TableCell>
                {new Date(formDetail.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(formDetail)}
                >
                  Sửa
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(formDetail.id)}
                >
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
