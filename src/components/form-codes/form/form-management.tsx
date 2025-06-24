"use client";

import { useEffect, useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Button } from "@/components/ui/button";
import type { Form } from "@/providers/form-codes-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormTable } from "./form-table";
import { Search, Plus, Filter, FileText, Layers3 } from "lucide-react";
import { FormDialog } from "./form-dialog-v1";

export function FormManagement() {
  const {
    formTypes,
    forms,
    fetchFormTypes,
    fetchForms,
    selectedFormType,
    setSelectedFormType,
    isLoading,
  } = useFormCodes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFormTypes();
  }, [fetchFormTypes]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms, selectedFormType]);

  const handleAdd = () => {
    setEditingForm(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (form: Form) => {
    setEditingForm(form);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingForm(null);
  };

  const handleFormTypeChange = (value: string) => {
    setSelectedFormType(value === "_" ? null : value);
  };

  const filteredForms = forms.filter(
    (form) =>
      form.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalForms = forms.length;
  const activeFormType = formTypes.find((type) => type.id === selectedFormType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Quản lý Biểu mẫu
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý và tổ chức các biểu mẫu của bạn
                </p>
              </div>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm biểu mẫu
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng biểu mẫu
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalForms}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Layers3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Loại biểu mẫu
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formTypes.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Filter className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đang lọc
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {activeFormType ? activeFormType.type : "Tất cả"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Bộ lọc và Tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mã biểu mẫu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="w-full sm:w-64">
                <Select
                  value={selectedFormType || "_"}
                  onValueChange={handleFormTypeChange}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Chọn loại biểu mẫu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          Tất cả
                        </Badge>
                        Tất cả loại
                      </div>
                    </SelectItem>
                    {formTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {type.type}
                          </Badge>
                          {type.type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchQuery && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  Tìm kiếm: &quot;{searchQuery}&quot;
                </Badge>
                <Badge variant="outline">{filteredForms.length} kết quả</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <FormTable
              forms={filteredForms}
              onEdit={handleEdit}
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </CardContent>
        </Card>

        {/* Dialog */}
        <FormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          form={editingForm}
          onClose={handleDialogClose}
          formTypes={formTypes}
        />
      </div>
    </div>
  );
}
