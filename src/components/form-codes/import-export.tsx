"use client";

import { useState, useEffect } from "react";
import { useFormCodes } from "@/providers/form-codes-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Info,
  Upload,
  Download,
  Code,
  LoaderCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import JSONPretty from "react-json-pretty";

export function ImportExport() {
  const { importData, exportData } = useFormCodes();
  const [jsonData, setJsonData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [formattedJson, setFormattedJson] = useState("");

  // Cập nhật formattedJson khi jsonData thay đổi
  useEffect(() => {
    if (jsonData) {
      try {
        // Kiểm tra nếu jsonData là JSON hợp lệ
        setFormattedJson(jsonData);
        setError(null);
      } catch {
        // Nếu không phải JSON hợp lệ, giữ nguyên giá trị
        setFormattedJson(jsonData);
      }
    } else {
      setFormattedJson("");
    }
  }, [jsonData]);

  // Giả lập tiến trình khi đang import
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isImporting) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress =
            prevProgress < 90 ? prevProgress + 5 : prevProgress;
          return newProgress;
        });
      }, 300);
    } else if (progress > 0 && progress < 100) {
      setProgress(100);
      timer = setTimeout(() => {
        setProgress(0);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isImporting, progress]);

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setError("Vui lòng nhập dữ liệu JSON");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsImporting(true);
    try {
      // Kiểm tra định dạng JSON trước khi gửi
      try {
        const parsed = JSON.parse(jsonData);
        // Kiểm tra xem dữ liệu có phải là mảng không
        if (!Array.isArray(parsed)) {
          setError(
            "Dữ liệu phải là một mảng các đối tượng. Vui lòng kiểm tra định dạng và thử lại."
          );
          setIsImporting(false); // Đặt lại isImporting khi có lỗi
          return;
        }

        // Kiểm tra số lượng form types và forms
        const formTypesCount = parsed.length;
        const formsCount = parsed.reduce(
          (total, type) => total + (type.forms?.length || 0),
          0
        );

        // Hiển thị thông báo về số lượng dữ liệu sẽ được import
        setSuccess(
          `Đang import ${formTypesCount} loại biểu mẫu với tổng cộng ${formsCount} biểu mẫu...`
        );
      } catch (parseError) {
        setError(
          `Lỗi phân tích JSON: ${
            parseError instanceof Error
              ? parseError.message
              : "Định dạng không hợp lệ"
          }`
        );
        setIsImporting(false); // Đặt lại isImporting khi có lỗi
        return;
      }

      await importData(jsonData);
      setJsonData("");
      setFormattedJson("");
      setSuccess("Import dữ liệu thành công");
    } catch (importError) {
      console.error("Import error:", importError);
      setError(
        `Lỗi khi import dữ liệu: ${
          importError instanceof Error
            ? importError.message
            : "Đã xảy ra lỗi không xác định"
        }`
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await exportData();
      if (result) {
        // Format JSON trước khi hiển thị
        try {
          const parsed = JSON.parse(result);
          const formatted = JSON.stringify(parsed, null, 2);
          setJsonData(formatted);
          setFormattedJson(formatted);
        } catch {
          setJsonData(result);
          setFormattedJson(result);
        }
        setSuccess("Xuất dữ liệu thành công");
      }
    } catch (exportError) {
      console.error("Export error:", exportError);
      setError(
        `Lỗi khi xuất dữ liệu: ${
          exportError instanceof Error
            ? exportError.message
            : "Đã xảy ra lỗi không xác định"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Thêm chức năng import từ file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonData(content);
    };
    reader.readAsText(file);
  };

  const handleExportToFile = () => {
    if (!jsonData) {
      setError("Không có dữ liệu để xuất");
      return;
    }

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-codes-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess("Đã xuất dữ liệu ra file thành công");
  };

  // Thêm chức năng format JSON
  const handleFormatJson = () => {
    if (!jsonData.trim()) {
      setError("Không có dữ liệu để format");
      return;
    }

    try {
      const parsed = JSON.parse(jsonData);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonData(formatted);
      setFormattedJson(formatted);
      setSuccess("Format JSON thành công");
    } catch (e) {
      setError(
        `Lỗi khi format JSON: ${
          e instanceof Error ? e.message : "Định dạng không hợp lệ"
        }`
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nhập/Xuất dữ liệu</CardTitle>
          <CardDescription>
            Nhập hoặc xuất dữ liệu biểu mẫu dưới định dạng JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Thành công</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {isImporting && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Đang xử lý...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Hướng dẫn định dạng</AlertTitle>
              <AlertDescription className="">
                Dữ liệu import phải là một mảng các đối tượng với cấu trúc:
                <pre className="mt-2 bg-secondary p-2 rounded text-xs overflow-auto w-full">
                  {JSON.stringify(
                    [
                      {
                        type: "Tên loại biểu mẫu",
                        forms: [
                          {
                            templateuid: "UID mẫu",
                            code: "Mã biểu mẫu",
                            name: "Tên biểu mẫu",
                            ismultiple: false,
                            seq: 0,
                            formdetails: [{ key: "Khóa", value: "Giá trị" }],
                          },
                        ],
                      },
                    ],
                    null,
                    2
                  )}
                </pre>
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Chọn file JSON
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileImport}
              />
              <Button
                variant="outline"
                onClick={handleFormatJson}
                disabled={!jsonData.trim() || isImporting || isExporting}
              >
                <Code className="h-4 w-4 mr-2" />
                Format JSON
              </Button>
              <span className="text-sm text-gray-500">
                hoặc nhập trực tiếp vào ô bên dưới
              </span>
            </div>

            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Dữ liệu JSON"
              className="min-h-[300px] font-mono"
              disabled={isImporting}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleImport}
                disabled={isImporting || !jsonData.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isImporting ? "Đang nhập..." : "Nhập dữ liệu"}

                {isImporting && <LoaderCircle className="animate-spin" />}
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || isImporting}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Đang xuất..." : "Xuất dữ liệu"}
              </Button>
              <Button
                onClick={handleExportToFile}
                disabled={!jsonData || isExporting || isImporting}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống file
              </Button>
            </div>

            {formattedJson && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Xem trước JSON:</h3>
                <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-[300px]">
                  <JSONPretty
                    id="json-pretty"
                    data={formattedJson}
                    mainStyle="padding:0;background:transparent;overflow:auto;"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
