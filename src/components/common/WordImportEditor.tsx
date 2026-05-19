import React, { useRef, useState, useEffect } from "react";
import {
  FiBold, FiItalic, FiUnderline, FiList, FiCheckCircle,
  FiFileText, FiTrash2, FiRotateCcw, FiRotateCw, FiScissors
} from "react-icons/fi";
import { toast } from "react-toastify";
import uploadServices from "~/services/uploadService";

interface WordImportEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
}

export default function WordImportEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung mô tả chi tiết hoặc tải lên từ file Word...",
  label
}: WordImportEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isWordLoaded, setIsWordLoaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [wordWarnings, setWordWarnings] = useState<string[]>([]);
  const [editorHtml, setEditorHtml] = useState(value || "");

  // Update editor content when external value changes (only if it differs from current inner HTML)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
      setEditorHtml(value || "");
    }
  }, [value]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setEditorHtml(html);
      onChange(html);
    }
  };

  // Executive formatting command helper
  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Word file (.docx) reader using mammoth
  const handleWordImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const mammoth = await import("mammoth");

        const options = {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Normal'] => p:fresh"
          ],
          convertImage: mammoth.images.imgElement(async (element: any) => {
            try {
              const imageBuffer = await element.read();
              const contentType = element.contentType;
              const extension = contentType.split("/")[1] || "png";
              const blob = new Blob([imageBuffer], { type: contentType });
              const file = new File([blob], `word_image_${Date.now()}.${extension}`, { type: contentType });

              const res: any = await uploadServices.upload([file]);
              if (res && res.error && res.error.code === 0 && res.data?.items?.length > 0) {
                const apiMedia = (process.env.NEXT_PUBLIC_API_MEDIA || "https://localhost:7287").replace(/\/+$/, "");
                const relativePath = res.data.items[0].replace(/^\/+/, "");
                const cleanUrl = `${apiMedia}/${relativePath}`;
                return {
                  src: cleanUrl
                };
              }
            } catch (error) {
              console.error("Failed to upload image from Word file:", error);
            }
            return {
              src: ""
            };
          })
        };

        const result: any = await mammoth.convertToHtml({ arrayBuffer }, options);
        let html = result.value;

        // Clean empty tags or do slight adjustments if necessary
        if (!html.trim()) {
          toast.warn("File Word rỗng hoặc không đọc được nội dung chữ!");
          return;
        }

        // Wrap paragraphs nicely
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          handleEditorInput();
        }

        setIsWordLoaded(true);
        if (result.warnings && result.warnings.length > 0) {
          setWordWarnings(result.warnings.map((w: any) => w.message));
        } else {
          setWordWarnings([]);
        }

        toast.success(`Đã chuyển đổi thành công từ file Word: ${file.name}`);
      } catch (err) {
        console.error("Error converting docx to HTML:", err);
        toast.error("Lỗi khi đọc file Word! Vui lòng kiểm tra lại file định dạng .docx.");
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ nội dung hiện tại?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        handleEditorInput();
      }
      setIsWordLoaded(false);
      setFileName("");
      setWordWarnings([]);
    }
  };

  return (
    <div className="word-editor-container">
      {label && <label className="word-editor-label">{label}</label>}

      <div className="word-editor-box">
        {/* Editor Toolbar Area */}
        <div className="word-editor-toolbar">
          {/* Format actions */}
          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("bold")}
              title="Chữ đậm"
            >
              <FiBold />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("italic")}
              title="Chữ nghiêng"
            >
              <FiItalic />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("underline")}
              title="Gạch chân"
            >
              <FiUnderline />
            </button>
          </div>

          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("insertUnorderedList")}
              title="Danh sách dấu chấm"
            >
              <FiList />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("insertOrderedList")}
              title="Danh sách số"
            >
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>1.</span>
            </button>
          </div>

          <div className="toolbar-group">
            <select
              className="toolbar-select"
              onChange={(e) => execCommand("formatBlock", e.target.value)}
              defaultValue="p"
              title="Định dạng thẻ"
            >
              <option value="p">Đoạn văn (P)</option>
              <option value="h1">Tiêu đề lớn (H1)</option>
              <option value="h2">Tiêu đề vừa (H2)</option>
              <option value="h3">Tiêu đề nhỏ (H3)</option>
            </select>

            <select
              className="toolbar-select"
              onChange={(e) => execCommand("foreColor", e.target.value)}
              defaultValue="#2c3e50"
              title="Màu chữ"
            >
              <option value="#2c3e50">Mặc định</option>
              <option value="#e9680c">Màu Cam VOYAGE</option>
              <option value="#e74c3c">Màu Đỏ</option>
              <option value="#2ecc71">Màu Xanh lá</option>
              <option value="#3498db">Màu Xanh dương</option>
            </select>
          </div>

          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("undo")}
              title="Quay lại (Undo)"
            >
              <FiRotateCcw />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand("redo")}
              title="Lặp lại (Redo)"
            >
              <FiRotateCw />
            </button>
          </div>

          {/* Word import action button */}
          <div className="toolbar-group-right">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".docx"
              onChange={handleWordImport}
            />
            <button
              type="button"
              className="import-word-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Nhập nội dung từ file Microsoft Word (.docx)"
            >
              <FiFileText /> Nhập từ file Word (.docx)
            </button>

            <button
              type="button"
              className="toolbar-btn delete-btn"
              onClick={handleClear}
              title="Xóa toàn bộ nội dung"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        {/* Custom style mapping description */}
        {isWordLoaded && (
          <div className="word-success-banner">
            <FiCheckCircle className="banner-icon" />
            <span>
              Đã tải thành công từ Word: <strong>{fileName}</strong>. Bạn có thể chỉnh sửa thêm bên dưới.
            </span>
          </div>
        )}

        {/* Content Editable Area */}
        <div
          ref={editorRef}
          className="word-editor-body"
          contentEditable={true}
          onInput={handleEditorInput}
          onBlur={handleEditorInput}
          data-placeholder={placeholder}
          style={{ minHeight: "180px" }}
        />

        {/* Word Import Warnings */}
        {wordWarnings.length > 0 && (
          <div className="word-warnings-container">
            <strong>Lưu ý khi chuyển đổi:</strong>
            <ul>
              {wordWarnings.slice(0, 3).map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
              {wordWarnings.length > 3 && <li>Và {wordWarnings.length - 3} cảnh báo khác...</li>}
            </ul>
          </div>
        )}
      </div>

      <style jsx global>{`
        .word-editor-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .word-editor-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #2c3e50;
        }

        .word-editor-box {
          border: 1px solid #eef0f5;
          border-radius: 12px;
          background-color: #ffffff;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .word-editor-box:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(233, 104, 12, 0.08);
        }

        .word-editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding: 8px 12px;
          background-color: #fafbfc;
          border-bottom: 1px solid #eef0f5;
          gap: 10px;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          border-right: 1px solid #eef0f5;
          padding-right: 10px;
          gap: 4px;
        }

        .toolbar-group:last-of-type {
          border-right: none;
        }

        .toolbar-group-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toolbar-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #eef0f5;
          background-color: #ffffff;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5c6b73;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toolbar-btn:hover {
          background-color: #f0f2f5;
          color: #2c3e50;
          border-color: #bdc3c7;
        }

        .toolbar-btn.delete-btn {
          color: #e74c3c;
          border-color: rgba(231, 76, 60, 0.2);
        }

        .toolbar-btn.delete-btn:hover {
          background-color: rgba(231, 76, 60, 0.08);
        }

        .toolbar-select {
          height: 32px;
          border: 1px solid #eef0f5;
          background-color: #ffffff;
          border-radius: 6px;
          padding: 0 8px;
          font-size: 12.5px;
          color: #5c6b73;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .toolbar-select:hover {
          border-color: #bdc3c7;
        }

        .import-word-btn {
          height: 32px;
          padding: 0 12px;
          border: 1px solid rgba(46, 204, 113, 0.3);
          background-color: rgba(46, 204, 113, 0.08);
          color: #27ae60;
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .import-word-btn:hover {
          background-color: #2ecc71;
          color: #ffffff;
          border-color: #2ecc71;
          box-shadow: 0 2px 6px rgba(46, 204, 113, 0.2);
        }

        .word-success-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #e8f8f5;
          border-bottom: 1px solid #d1f2eb;
          padding: 8px 16px;
          font-size: 13px;
          color: #117864;
        }

        .banner-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .word-editor-body {
          padding: 16px;
          font-size: 14.5px;
          color: #2c3e50;
          line-height: 1.6;
          outline: none;
          overflow-y: auto;
          background-color: #ffffff;
        }

        /* HTML format within Editor Area */
        .word-editor-body h1 {
          font-size: 22px;
          font-weight: 700;
          margin-top: 16px;
          margin-bottom: 8px;
          color: #1a252f;
        }

        .word-editor-body h2 {
          font-size: 18px;
          font-weight: 700;
          margin-top: 14px;
          margin-bottom: 6px;
          color: #2c3e50;
        }

        .word-editor-body h3 {
          font-size: 16px;
          font-weight: 600;
          margin-top: 12px;
          margin-bottom: 4px;
          color: #34495e;
        }

        .word-editor-body p {
          margin-bottom: 10px;
        }

        .word-editor-body ul, .word-editor-body ol {
          padding-left: 24px;
          margin-bottom: 12px;
        }

        .word-editor-body li {
          margin-bottom: 4px;
        }

        .word-editor-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }

        .word-editor-body th, .word-editor-body td {
          border: 1px solid #bdc3c7;
          padding: 8px 12px;
          text-align: left;
        }

        .word-editor-body th {
          background-color: #f2f4f4;
          font-weight: bold;
        }

        .word-editor-body[contentEditable=true]:empty:before {
          content: attr(data-placeholder);
          color: #bdc3c7;
          font-style: italic;
          cursor: text;
        }

        .word-warnings-container {
          padding: 12px 16px;
          background-color: #fef9e7;
          border-top: 1px solid #fdebd0;
          font-size: 12px;
          color: #b7950b;
        }

        .word-warnings-container ul {
          margin-top: 4px;
          padding-left: 18px;
        }
      `}</style>
    </div>
  );
}
