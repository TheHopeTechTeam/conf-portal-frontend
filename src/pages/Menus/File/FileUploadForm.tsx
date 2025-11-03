import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MdCloudUpload, MdWarning } from "react-icons/md";
import ImagePreviewCard from "./ImagePreviewCard";

interface PreviewFile {
  file: File;
  preview: string;
  hash?: string; // 檔案內容的 hash 值
  hashCalculating?: boolean; // 是否正在計算 hash
  uploadProgress?: number; // 上傳進度 0-100
  uploadStatus?: "pending" | "uploading" | "success" | "error"; // 上傳狀態
  uploadError?: string; // 上傳錯誤訊息
  uploadMessage?: string; // 上傳成功訊息或一般訊息
}

export interface FileUploadFormHandle {
  validate: () => boolean;
  getFiles: () => File[];
  clearFiles: () => void;
  setUploadProgress: (fileIndex: number, progress: number) => void;
  setUploadStatus: (fileIndex: number, status: "pending" | "uploading" | "success" | "error", error?: string, message?: string) => void;
}

interface FileUploadFormProps {
  defaultFiles?: File[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// 計算檔案的 SHA-256 hash
const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

const FileUploadForm = forwardRef<FileUploadFormHandle, FileUploadFormProps>(function FileUploadForm({ defaultFiles = [] }, ref) {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>(() => {
    // 如果有預設檔案，創建預覽
    return defaultFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
  });

  // 追蹤正在計算的檔案，避免重複計算
  const calculatingRef = useRef<Set<File>>(new Set());
  // 追蹤已經計算過的檔案（用於生成唯一標識）
  const processedFilesRef = useRef<string>("");

  // 生成檔案的唯一標識（用於追蹤檔案變化）
  const fileKeys = useMemo(() => {
    return previewFiles.map((pf) => `${pf.file.name}-${pf.file.size}-${pf.file.lastModified}`).join("|");
  }, [previewFiles]);

  // 更新單一檔案上傳進度
  const setUploadProgress = (fileIndex: number, progress: number) => {
    setPreviewFiles((prev) => prev.map((pf, i) => (i === fileIndex ? { ...pf, uploadProgress: progress, uploadStatus: "uploading" } : pf)));
  };

  // 更新單一檔案上傳狀態
  const setUploadStatus = (fileIndex: number, status: "pending" | "uploading" | "success" | "error", error?: string, message?: string) => {
    setPreviewFiles((prev) =>
      prev.map((pf, i) => (i === fileIndex ? { ...pf, uploadStatus: status, uploadError: error, uploadMessage: message } : pf))
    );
  };

  // 計算所有檔案的 hash
  useEffect(() => {
    const calculateHashes = async () => {
      // 如果檔案列表沒有變化，跳過計算
      if (fileKeys === processedFilesRef.current) {
        return;
      }

      // 找出需要計算 hash 的檔案（沒有 hash 且不在計算中）
      const filesToCalculate = previewFiles.filter((pf) => !pf.hash && !calculatingRef.current.has(pf.file));
      if (filesToCalculate.length === 0) {
        processedFilesRef.current = fileKeys;
        return;
      }

      // 標記開始計算
      filesToCalculate.forEach((pf) => calculatingRef.current.add(pf.file));

      setPreviewFiles((prev) =>
        prev.map((pf) => {
          const needsCalculation = filesToCalculate.some((ftc) => ftc.file === pf.file);
          if (needsCalculation && !pf.hashCalculating) {
            return { ...pf, hashCalculating: true };
          }
          return pf;
        })
      );

      // 並行計算所有檔案的 hash
      const hashPromises = filesToCalculate.map(async (pf) => {
        try {
          const hash = await calculateFileHash(pf.file);
          return { file: pf.file, hash };
        } catch (error) {
          console.error("計算檔案 hash 失敗:", error);
          return { file: pf.file, hash: undefined };
        } finally {
          calculatingRef.current.delete(pf.file);
        }
      });

      const results = await Promise.all(hashPromises);

      // 更新 hash 值
      setPreviewFiles((prev) => {
        const updated = prev.map((pf) => {
          const result = results.find((r) => r.file === pf.file);
          if (result) {
            return { ...pf, hash: result.hash, hashCalculating: false };
          }
          return pf;
        });
        // 更新已處理的檔案標識
        processedFilesRef.current = fileKeys;
        return updated;
      });
    };

    calculateHashes();
  }, [fileKeys, previewFiles]);

  // 檢測重複檔案（基於檔案內容的 hash）
  const duplicateHashes = useMemo(() => {
    const hashes = previewFiles.filter((pf) => pf.hash).map((pf) => pf.hash!);
    const duplicates = new Set<string>();
    const seen = new Set<string>();

    hashes.forEach((hash) => {
      if (seen.has(hash)) {
        duplicates.add(hash);
      } else {
        seen.add(hash);
      }
    });

    return duplicates;
  }, [previewFiles]);

  // 檢查檔案是否重複
  const isFileDuplicate = (fileHash?: string): boolean => {
    if (!fileHash) return false;
    return duplicateHashes.has(fileHash);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newPreviewFiles: PreviewFile[] = acceptedFiles.map((file) => {
      const preview = URL.createObjectURL(file);
      return { file, preview };
    });
    setPreviewFiles((prev) => [...prev, ...newPreviewFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "image/gif": [".gif"],
    },
    multiple: true,
  });

  const handleRemoveFile = (index: number) => {
    setPreviewFiles((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // 暴露方法給父組件
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (previewFiles.length === 0) {
        return false;
      }
      // 如果有檔案還在計算 hash，等待計算完成
      const hasCalculating = previewFiles.some((pf) => pf.hashCalculating);
      if (hasCalculating) {
        return false;
      }
      // 如果有重複檔案，驗證失敗
      if (duplicateHashes.size > 0) {
        return false;
      }
      return true;
    },
    getFiles: () => {
      return previewFiles.map((pf) => pf.file);
    },
    clearFiles: () => {
      previewFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
      setPreviewFiles([]);
    },
    setUploadProgress,
    setUploadStatus,
  }));

  return (
    <div className="h-full flex flex-col gap-6">
      {/* 拖拽上傳區域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer shrink-0 min-h-100 flex items-center justify-center ${
          isDragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-500"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 hover:border-brand-300 dark:hover:border-brand-700"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <MdCloudUpload size={32} />
            </div>
          </div>

          {/* Text */}
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {isDragActive ? "放開以上傳檔案" : "拖拽檔案至此或點擊選擇"}
          </h4>

          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">支援 PNG, JPG, JPEG, WebP, SVG, GIF 格式</p>

          <span className="text-sm font-medium text-brand-500 underline">瀏覽檔案</span>
        </div>
      </div>

      {/* 預覽區域 */}
      {previewFiles.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">已選擇 {previewFiles.length} 個檔案 (上傳完成後，請自行關閉此視窗)</h5>
            {duplicateHashes.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <MdWarning size={16} />
                <span>檢測到 {duplicateHashes.size} 個重複檔案（內容相同）</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-8 gap-4">
              {previewFiles.map((previewFile, index) => {
                const isDuplicate = isFileDuplicate(previewFile.hash);
                const isCalculating = previewFile.hashCalculating;

                // 左上角元素（計算中或重複標記）
                const topLeftElement = isDuplicate ? (
                  <div className="flex items-center justify-center rounded-full bg-red-500 text-white px-2 py-1">
                    <MdWarning size={14} />
                    <span className="ml-1 text-xs font-semibold">重複</span>
                  </div>
                ) : isCalculating ? (
                  <div className="flex items-center justify-center rounded-full bg-gray-500 text-white px-2 py-1">
                    <span className="text-xs font-semibold">檢測中...</span>
                  </div>
                ) : undefined;

                return (
                  <div
                    key={index}
                    className={`flex flex-col rounded-lg overflow-hidden transition-colors ${
                      isDuplicate
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                        : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    {/* 圖片預覽 */}
                    <ImagePreviewCard
                      imageUrl={previewFile.preview}
                      alt={previewFile.file.name}
                      topLeft={topLeftElement}
                      onDelete={() => handleRemoveFile(index)}
                      className={
                        isDuplicate ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-900"
                      }
                      showDeleteButton
                      fileInfo={{
                        name: previewFile.file.name,
                        size: previewFile.file.size,
                        type: previewFile.file.type || "未知類型",
                        nameClassName: isDuplicate ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300",
                      }}
                      formatFileSize={formatFileSize}
                      showUploadProgress
                      uploadProgress={previewFile.uploadProgress}
                      uploadStatus={previewFile.uploadStatus}
                      message={previewFile.uploadStatus === "error" ? previewFile.uploadError : previewFile.uploadMessage}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FileUploadForm.displayName = "FileUploadForm";

export default FileUploadForm;
