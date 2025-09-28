import { useParams } from "react-router-dom";
import { PDF_FILES } from "../constants";

export default function PdfViewer() {
  const { file } = useParams();
  const url = PDF_FILES[file];

  if (!url) return <div className="p-8 text-center">PDF not found.</div>;

  return (
    <div className="flex justify-center p-4">
      <iframe
        src={url}
        title="PDF Viewer"
        style={{
          width: "100%",
          maxWidth: 1000,
          height: 700,
          border: "none",
          boxShadow: "0 2px 8px rgba(63,69,81,0.16)",
          borderRadius: 8,
          marginTop: "60px"
        }}
      />
    </div>
  );
}
