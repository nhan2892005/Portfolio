import { useParams } from "react-router-dom";
import { MATERIALS } from "../constants";

export default function SlideViewer() {
  const { file } = useParams<{ file: keyof typeof MATERIALS }>();
  const url = file ? MATERIALS[file] : undefined;

  if (!url) {
    return <div className="p-8 text-center">Material not found.</div>;
  }

  return (
    <div className="flex justify-center p-6 mt-0">
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "550px",
          boxShadow: "0 2px 8px 0 rgba(63,69,81,0.16)",
          borderRadius: "8px",
          overflow: "hidden",
          marginTop: "75px"
        }}
      >
        <iframe
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          src={url}
          allowFullScreen
          title={file}
        />
      </div>
    </div>
  );
}
