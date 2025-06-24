/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { useDataFetching } from "@/lib/hooks/use-data-fetching"; // Thay thế import useSWR
import {
  getAllFormTypes,
  createFormType,
  updateFormType,
  deleteFormType,
} from "@/app/actions/form-type.action";
import {
  getAllForms,
  getFormsByType,
  createForm,
  updateForm,
  deleteForm,
} from "@/app/actions/form.action";
import {
  getFormDetailsByForm,
  createFormDetail,
  updateFormDetail,
  deleteFormDetail,
} from "@/app/actions/form-detail.action";
import {
  importFormCodes,
  exportFormCodes,
} from "@/app/actions/import-export.action";
import {
  FormTypeFormData,
  UpdateFormTypeFormData,
  FormFormData,
  UpdateFormFormData,
  FormDetailFormData,
  UpdateFormDetailFormData,
} from "@/lib/schemas/form-codes";
import { ServerActionError } from "@/lib/utils";

// Định nghĩa các interface dựa trên model Prisma
export interface FormType {
  id: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Form {
  id: string;
  templateuid: string;
  code: string;
  name: string;
  ismultiple: boolean;
  seq: number;
  formTypeId: string;
  createdAt: Date;
  updatedAt: Date;
  formType?: FormType;
  formDetails?: FormDetail[];
}

export interface FormDetail {
  id: string;
  key: string;
  value: string;
  formId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa kiểu dữ liệu cho response từ server action
type ApiResponse =
  | { success: true; data: any; message?: string }
  | ServerActionError;

// Tạo fetcher function cho useDataFetching
const fetcher = async (key: string): Promise<any> => {
  // Phân tích key để xác định loại dữ liệu cần fetch
  if (key === "/form-types") {
    return await getAllFormTypes();
  }

  if (key.startsWith("/forms/type/")) {
    const formTypeId = key.split("/forms/type/")[1];
    return await getFormsByType(formTypeId);
  }

  if (key.startsWith("/form-details/")) {
    const formId = key.split("/form-details/")[1];
    return await getFormDetailsByForm(formId);
  }

  if (key === "/forms") {
    return await getAllForms();
  }

  throw new Error("Invalid key for fetcher");
};

type FormCodesContextType = {
  // State
  formTypes: FormType[];
  forms: Form[];
  formDetails: FormDetail[];
  selectedFormType: string | null;
  selectedForm: string | null;
  isLoading: boolean;

  // Actions
  setSelectedFormType: (id: string | null) => void;
  setSelectedForm: (id: string | null) => void;

  // Form Type CRUD
  fetchFormTypes: () => Promise<void>;
  addFormType: (data: FormTypeFormData) => Promise<void>;
  editFormType: (data: UpdateFormTypeFormData) => Promise<void>;
  removeFormType: (id: string) => Promise<void>;

  // Form CRUD
  fetchForms: (formTypeId?: string) => Promise<void>;
  addForm: (data: FormFormData) => Promise<void>;
  editForm: (data: UpdateFormFormData) => Promise<void>;
  removeForm: (id: string) => Promise<void>;

  // Form Detail CRUD
  fetchFormDetails: (formId: string) => Promise<void>;
  addFormDetail: (data: FormDetailFormData) => Promise<void>;
  editFormDetail: (data: UpdateFormDetailFormData) => Promise<void>;
  removeFormDetail: (id: string) => Promise<void>;

  // Import/Export
  importData: (jsonData: string) => Promise<void>;
  exportData: () => Promise<string>;
};

const FormCodesContext = createContext<FormCodesContextType | null>(null);

export function FormCodesProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();

  // State
  const [selectedFormType, setSelectedFormType] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  // Sử dụng useDataFetching thay vì useSWR trực tiếp
  const {
    data: formTypesResponse,
    mutate: mutateFormTypes,
    isLoading: isLoadingFormTypes,
  } = useDataFetching<ApiResponse>("/form-types", fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: formsResponse,
    mutate: mutateForms,
    isLoading: isLoadingForms,
  } = useDataFetching<ApiResponse>(
    selectedFormType ? `/forms/type/${selectedFormType}` : "/forms",
    fetcher,
    { revalidateOnFocus: false }
  );

  const {
    data: formDetailsResponse,
    mutate: mutateFormDetails,
    isLoading: isLoadingFormDetails,
  } = useDataFetching<ApiResponse>(
    selectedForm ? `/form-details/${selectedForm}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Trích xuất dữ liệu từ response
  const formTypes = formTypesResponse?.success ? formTypesResponse.data : [];
  const forms = formsResponse?.success ? formsResponse.data : [];
  const formDetails = formDetailsResponse?.success
    ? formDetailsResponse.data
    : [];

  // Tổng hợp trạng thái loading
  const isLoading =
    isPending || isLoadingFormTypes || isLoadingForms || isLoadingFormDetails;

  // Form Type CRUD
  const fetchFormTypes = useCallback(async () => {
    await mutateFormTypes();
  }, [mutateFormTypes]);

  const addFormType = async (data: FormTypeFormData) => {
    startTransition(async () => {
      const result = await createFormType(data);
      if (result.success) {
        toast.success("Tạo loại biểu mẫu thành công");
        await mutateFormTypes();
      } else {
        toast.error(result.message);
      }
    });
  };

  const editFormType = async (data: UpdateFormTypeFormData) => {
    startTransition(async () => {
      const result = await updateFormType(data);
      if (result.success) {
        toast.success("Cập nhật loại biểu mẫu thành công");
        await mutateFormTypes();
      } else {
        toast.error(result.message);
      }
    });
  };

  const removeFormType = async (id: string) => {
    startTransition(async () => {
      const result = await deleteFormType(id);
      if (result.success) {
        toast.success("Xóa loại biểu mẫu thành công");
        await mutateFormTypes();
        if (selectedFormType === id) {
          setSelectedFormType(null);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  // Form CRUD
  const fetchForms = useCallback(
    async (formTypeId?: string) => {
      const typeId = formTypeId || selectedFormType;
      if (typeId) {
        setSelectedFormType(typeId);
        await mutateForms();
      } else {
        // Nếu không có formTypeId, reset forms
        setSelectedFormType(null);
        // Thêm đoạn code này để lấy tất cả biểu mẫu khi chọn "Tất cả"
        const result = await getAllForms();
        console.log("🚀 ~ result:", result);
        if (result.success) {
          await mutateForms();
        } else {
          toast.error(result.message);
        }
      }
    },
    [selectedFormType, mutateForms]
  );

  const addForm = async (data: FormFormData) => {
    startTransition(async () => {
      const result = await createForm(data);
      if (result.success) {
        toast.success("Tạo biểu mẫu thành công");
        await mutateForms();
      } else {
        toast.error(result.message);
      }
    });
  };

  const editForm = async (data: UpdateFormFormData) => {
    startTransition(async () => {
      const result = await updateForm(data);
      if (result.success) {
        toast.success("Cập nhật biểu mẫu thành công");
        await mutateForms();
      } else {
        toast.error(result.message);
      }
    });
  };

  const removeForm = async (id: string) => {
    startTransition(async () => {
      const result = await deleteForm(id);
      if (result.success) {
        toast.success("Xóa biểu mẫu thành công");
        await mutateForms();
        if (selectedForm === id) {
          setSelectedForm(null);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  // Form Detail CRUD
  const fetchFormDetails = useCallback(
    async (formId: string) => {
      setSelectedForm(formId);
      await mutateFormDetails();
    },
    [mutateFormDetails]
  );

  const addFormDetail = async (data: FormDetailFormData) => {
    startTransition(async () => {
      const result = await createFormDetail(data);
      if (result.success) {
        toast.success("Tạo chi tiết biểu mẫu thành công");
        await mutateFormDetails();
      } else {
        toast.error(result.message);
      }
    });
  };

  const editFormDetail = async (data: UpdateFormDetailFormData) => {
    startTransition(async () => {
      const result = await updateFormDetail(data);
      if (result.success) {
        toast.success("Cập nhật chi tiết biểu mẫu thành công");
        await mutateFormDetails();
      } else {
        toast.error(result.message);
      }
    });
  };

  const removeFormDetail = async (id: string) => {
    startTransition(async () => {
      const result = await deleteFormDetail(id);
      if (result.success) {
        toast.success("Xóa chi tiết biểu mẫu thành công");
        await mutateFormDetails();
      } else {
        toast.error(result.message);
      }
    });
  };

  // Import/Export
  const importData = async (jsonData: string) => {
    startTransition(async () => {
      const result = await importFormCodes(jsonData);
      if (result.success) {
        toast.success("Import dữ liệu thành công");
        await mutateFormTypes();
        setSelectedFormType(null);
        setSelectedForm(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const exportData = async () => {
    const result = await exportFormCodes();
    if (result.success) {
      return JSON.stringify(result.data, null, 2);
    } else {
      toast.error(result.message);
      return "";
    }
  };

  return (
    <FormCodesContext.Provider
      value={{
        // State
        formTypes,
        forms,
        formDetails,
        selectedFormType,
        selectedForm,
        isLoading, // Đã được cập nhật ở trên

        // Actions
        setSelectedFormType,
        setSelectedForm,

        // Form Type CRUD
        fetchFormTypes,
        addFormType,
        editFormType,
        removeFormType,

        // Form CRUD
        fetchForms,
        addForm,
        editForm,
        removeForm,

        // Form Detail CRUD
        fetchFormDetails,
        addFormDetail,
        editFormDetail,
        removeFormDetail,

        // Import/Export
        importData,
        exportData,
      }}
    >
      {children}
    </FormCodesContext.Provider>
  );
}

export function useFormCodes() {
  const context = useContext(FormCodesContext);
  if (!context) {
    throw new Error("useFormCodes must be used within a FormCodesProvider");
  }
  return context;
}
