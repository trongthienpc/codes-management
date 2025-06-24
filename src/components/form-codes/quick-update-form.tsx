/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function QuickUpdateForm() {
  const { checkForm, updateWithNewCode } = useFormCodes();
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheckForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await checkForm(oldCode);
      if (result.success) {
        setFormData(result.data);
        setStep(2); // Chuyển sang bước nhập code mới
      } else {
        setError(result.message || "Không thể kiểm tra biểu mẫu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await updateWithNewCode(oldCode, newCode);
      // Reset form
      setOldCode("");
      setNewCode("");
      setFormData(null);
      setStep(1);
    } catch {
      setError("Không thể cập nhật biểu mẫu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 1 ? (
        <form onSubmit={handleCheckForm} className="space-y-4">
          <div>
            <Input
              value={oldCode}
              onChange={(e) => setOldCode(e.target.value)}
              placeholder="Nhập mã biểu mẫu cần cập nhật..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!oldCode || isLoading}>
              {isLoading ? "Đang kiểm tra..." : "Kiểm tra"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleUpdateForm} className="space-y-4">
          {formData && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>
                <strong>Mã hiện tại:</strong> {oldCode}
              </p>
              <p>
                <strong>Tên:</strong> {formData.template.name}
              </p>
            </div>
          )}
          <div>
            <Input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Nhập mã biểu mẫu mới..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep(1);
                setFormData(null);
                setError("");
              }}
              disabled={isLoading}
            >
              Quay lại
            </Button>
            <Button type="submit" disabled={!newCode || isLoading}>
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
