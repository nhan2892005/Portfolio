// src/components/MultiFrameCollage.jsx

import React, { useRef, useEffect, useState } from "react";

const MultiFrameCollage = ({
  selectedTemplate,
  frameSlots,
  frameColor,
  dateText,
  brandText,
  bgType,        // "solid" hoặc "gradient"
  bgSolid,       // nếu bgType === "solid"
  bgGradient1,   // nếu bgType === "gradient"
  bgGradient2,   // nếu bgType === "gradient"
}) => {
  const canvasRef = useRef(null);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);

  const generateCollage = async () => {
    if (!selectedTemplate) return null;
    const { width, height, backgroundColor, slots } = selectedTemplate;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set kích thước canvas
    canvas.width = width;
    canvas.height = height;

    // Tô background: nếu bgType là gradient, tạo gradient
    if (bgType === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, bgGradient1);
      gradient.addColorStop(1, bgGradient2);
      ctx.fillStyle = gradient;
    } else {
      // Nếu solid, dùng màu từ bgSolid (nếu không, dùng backgroundColor của template)
      ctx.fillStyle = bgSolid || backgroundColor || "#ffffff";
    }
    ctx.fillRect(0, 0, width, height);

    // Vẽ từng ảnh vào vị trí slot (co giãn theo kích thước slot)
    for (let i = 0; i < slots.length; i++) {
      if (!frameSlots[i]) continue;
      const img = new Image();
      img.src = frameSlots[i];
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const { x, y, width: w, height: h } = slots[i];
      ctx.drawImage(img, x, y, w, h);
    }

    // (Tuỳ chọn) Nếu có viền, bạn có thể vẽ nó (ở đây vẫn giữ nếu frameColor có giá trị)
    if (frameColor) {
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 20;
      ctx.strokeRect(0, 0, width, height);
    }

    // Vẽ text brand & date ở dưới
    if (brandText) {
      ctx.fillStyle = bgType === "gradient" ? "#FFD700" : "#000000";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(brandText, width / 2, height - 80);
    }
    if (dateText) {
      ctx.fillStyle = bgType === "gradient" ? "#FFD700" : "#000000";
      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(dateText, width / 2, height - 30);
    }

    return canvas.toDataURL("image/png");
  };

  const generatePreview = async () => {
    const dataUrl = await generateCollage();
    setPreviewDataUrl(dataUrl);
  };

  useEffect(() => {
    generatePreview();
    // eslint-disable-next-line
  }, [selectedTemplate, frameSlots, frameColor, dateText, brandText, bgType, bgSolid, bgGradient1, bgGradient2]);

  const handleSaveCollage = async () => {
    const dataUrl = await generateCollage();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "my-collage.png";
    link.click();
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSaveCollage}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Lưu ảnh cuối
      </button>

      <div className="mt-4">
        <h3 className="text-lg font-bold">Xem trước:</h3>
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt="Collage Preview"
            className="border"
            style={{ maxWidth: "300px" }} // preview nhỏ lại
          />
        ) : (
          <p>Chưa có preview</p>
        )}
      </div>

      {/* Canvas ẩn */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default MultiFrameCollage;
