"use client";

import { useState } from "react";
import { FormManagement } from "./form/form-management";
import { Button } from "@/components/ui/button";
import { Import, Layers3, ListTree, Zap, Search, Plus } from "lucide-react";
import { FormTypeManagementModal } from "./form-type/form-type-management-modal";
import { ImportExportModal } from "./import-export-modal";
import { FormDetailManagementModal } from "./form-detail/form-detail-management-modal";
import { QuickUpdateFormModal } from "./quick-update-form-modal";
import { UserMenu } from "../ui/user-menu";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FormManagementPage() {
  const [isFormTypeModalOpen, setIsFormTypeModalOpen] = useState(false);
  const [isFormDetailModalOpen, setIsFormDetailModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isQuickUpdateModalOpen, setIsQuickUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      {/* Header Section with Title and User Menu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý biểu mẫu
          </h1>
          <p className="text-muted-foreground">
            Quản lý và cập nhật các biểu mẫu trong hệ thống
          </p>
        </div>
        <div className="absolute top-5 right-5 sm:relative sm:flex sm:top-0 sm:right-0">
          <UserMenu />
        </div>
      </div>

      {/* Action Bar with Search and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm biểu mẫu..."
            className="w-full pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button className="w-full md:w-auto flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm biểu mẫu mới
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className="hover:shadow-md transition-all cursor-pointer"
            onClick={() => setIsQuickUpdateModalOpen(true)}
          >
            <CardHeader className="p-4">
              <Zap className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-base">Cập nhật nhanh</CardTitle>
              <CardDescription>Cập nhật thông tin nhanh chóng</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-md transition-all cursor-pointer"
            onClick={() => setIsFormTypeModalOpen(true)}
          >
            <CardHeader className="p-4">
              <ListTree className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-base">Quản lý loại biểu mẫu</CardTitle>
              <CardDescription>Phân loại và tổ chức biểu mẫu</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-md transition-all cursor-pointer"
            onClick={() => setIsFormDetailModalOpen(true)}
          >
            <CardHeader className="p-4">
              <Layers3 className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-base">Chi tiết biểu mẫu</CardTitle>
              <CardDescription>Quản lý thông tin chi tiết</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-md transition-all cursor-pointer"
            onClick={() => setIsImportExportModalOpen(true)}
          >
            <CardHeader className="p-4">
              <Import className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-base">Nhập/Xuất dữ liệu</CardTitle>
              <CardDescription>Quản lý dữ liệu hệ thống</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Form Management Component */}
        <Card>
          <CardContent className="p-0">
            <FormManagement />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <FormTypeManagementModal
        open={isFormTypeModalOpen}
        onOpenChange={setIsFormTypeModalOpen}
      />
      <FormDetailManagementModal
        open={isFormDetailModalOpen}
        onOpenChange={setIsFormDetailModalOpen}
      />
      <ImportExportModal
        open={isImportExportModalOpen}
        onOpenChange={setIsImportExportModalOpen}
      />
      <QuickUpdateFormModal
        open={isQuickUpdateModalOpen}
        onOpenChange={setIsQuickUpdateModalOpen}
      />
    </div>
  );
}
