// src/pages/Photobooth.jsx

import React, { useState, useRef, useEffect } from "react";
import { templates } from "../templates";
import MultiFrameCollage from "../components/MultiFrameCollage";

const Photobooth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Danh sách ảnh đã chụp
  const [capturedImages, setCapturedImages] = useState([]);

  // Template chọn (ví dụ: twoByFourWhite, oneByFourWhite, v.v.)
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("oneByFourWhite");
  // Mảng slot ảnh, reset mỗi khi đổi template
  const [frameSlots, setFrameSlots] = useState([]);

  // Màu viền (có thể không dùng nữa nếu không cần viền)
  const [frameColor, setFrameColor] = useState("");
  // Text ngày và brand
  const [dateText, setDateText] = useState("2025.03.20");
  const [brandText, setBrandText] = useState("Nhan");

  // Tùy chọn background: chọn kiểu (solid/gradient)
  const [bgType, setBgType] = useState("solid"); // "solid" hoặc "gradient"
  const [bgSolid, setBgSolid] = useState("#ffffff");
  const [bgGradient1, setBgGradient1] = useState("#ffffff");
  const [bgGradient2, setBgGradient2] = useState("#cccccc");

  // Setup camera: giữ nguyên kích thước gốc, không scale
  useEffect(() => {
    async function getCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.error("Lỗi camera:", err);
      }
    }
    getCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Khi đổi template => reset slot
  useEffect(() => {
    const template = templates[selectedTemplateKey];
    setFrameSlots(Array(template.slots.length).fill(null));
  }, [selectedTemplateKey]);

  // Chụp ảnh: không scale, giữ nguyên kích thước video
  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Dùng kích thước gốc của video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    // Không áp dụng scale hay mirror
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Vẽ khung nếu cần
    context.strokeStyle = frameColor;
    context.lineWidth = 20;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Reset lại transform nếu cần sử dụng canvas cho mục đích khác
    context.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImages((prev) => [...prev, dataUrl]);
  };

  // Xoá từng ảnh
  const deleteCapturedImage = (idx) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Clear all captured images và reset slot
  const clearAll = () => {
    setCapturedImages([]);
    const template = templates[selectedTemplateKey];
    setFrameSlots(Array(template.slots.length).fill(null));
  };

  // Xử lý kéo – thả: khi kéo ảnh từ gallery
  const handleDragStart = (e, img) => {
    e.dataTransfer.setData("text/plain", img);
  };

  // Khi thả vào slot
  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const img = e.dataTransfer.getData("text/plain");
    const newSlots = [...frameSlots];
    newSlots[slotIndex] = img;
    console.log("Cập nhật slot:", slotIndex, newSlots); // Kiểm tra state
    setFrameSlots(newSlots);
  };  

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 p-4">
      <h1 className="text-3xl font-bold mb-4">Photobooth Layout</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
  <div className="flex items-center">
    <label className="mr-1">Chọn template:</label>
    <select
      value={selectedTemplateKey}
      onChange={(e) => setSelectedTemplateKey(e.target.value)}
      className="border p-1"
    >
      {Object.keys(templates).map((key) => (
        <option key={key} value={key}>
          {templates[key].label}
        </option>
      ))}
    </select>
  </div>

  <div className="flex items-center">
    <label className="mr-1">Kiểu background:</label>
    <select
      value={bgType}
      onChange={(e) => setBgType(e.target.value)}
      className="border p-1"
    >
      <option value="solid">Solid</option>
      <option value="gradient">Gradient</option>
    </select>
  </div>

  {bgType === "solid" && (
    <div className="flex items-center">
      <label className="mr-1">Màu background:</label>
      <input
        type="color"
        value={bgSolid}
        onChange={(e) => setBgSolid(e.target.value)}
        className="border p-1"
      />
    </div>
  )}
  {bgType === "gradient" && (
    <>
      <div className="flex items-center">
        <label className="mr-1">Màu 1:</label>
        <input
          type="color"
          value={bgGradient1}
          onChange={(e) => setBgGradient1(e.target.value)}
          className="border p-1"
        />
      </div>
      <div className="flex items-center">
        <label className="mr-1">Màu 2:</label>
        <input
          type="color"
          value={bgGradient2}
          onChange={(e) => setBgGradient2(e.target.value)}
          className="border p-1"
        />
      </div>
    </>
  )}

  <div className="flex items-center">
    <label className="mr-1">Text:</label>
    <input
      type="text"
      value={brandText}
      onChange={(e) => setBrandText(e.target.value)}
      className="border p-1"
    />
  </div>

  <div className="flex items-center">
    <label className="mr-1">Date:</label>
    <input
      type="text"
      value={dateText}
      onChange={(e) => setDateText(e.target.value)}
      className="border p-1"
    />
  </div>
</div>


      {/* Video & Canvas ẩn */}
      <div className="mb-4">
      <video
        ref={videoRef}
        autoPlay
        className="border"
        style={{ width: "500px", height: "500px", transform: "scaleX(-1)" }}
      ></video>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Nút chụp ảnh & Clear All */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={capture}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Chụp Ảnh
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear All
        </button>
      </div>

      {/* Gallery ảnh đã chụp với xoá & kéo-drag */}
      <div className="mb-4 w-full max-w-3xl">
        <h2 className="text-xl mb-2">Gallery ảnh</h2>
        <div className="flex gap-2 flex-wrap">
          {capturedImages.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img}
                alt={`Ảnh ${idx}`}
                className="border cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, img)}
                style={{ width: "100px", height: "75px", objectFit: "cover" }}
              />
              <button
                onClick={() => deleteCapturedImage(idx)}
                className="absolute top-0 right-0 bg-white text-red-500 rounded-full w-5 h-5 text-xs flex items-center justify-center"
                title="Xoá ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Các slot: thay vì select box, dùng vùng kéo thả */}
      <div className="mb-4 w-full max-w-3xl">
        <h2 className="text-xl mb-2">Gán ảnh vào slots</h2>
        <div className="flex flex-wrap gap-4">
          {frameSlots.map((slotImg, i) => (
            <div
                key={i}
                className="border p-2"
                onDrop={(e) => handleDrop(e, i)}
                onDragOver={(e) => { e.preventDefault(); }}
                style={{ width: "150px", height: "150px", overflow: "hidden" }}
            >
                {slotImg ? (
                <img
                    src={slotImg}
                    alt={`Slot ${i}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    Kéo & thả ảnh vào đây
                </div>
                )}
            </div>          
          ))}
        </div>
      </div>

      {/* Xem trước & Lưu ảnh cuối */}
      <MultiFrameCollage
        selectedTemplate={templates[selectedTemplateKey]}
        frameSlots={frameSlots}
        frameColor={frameColor}
        dateText={dateText}
        brandText={brandText}
        bgType={bgType}
        bgSolid={bgSolid}
        bgGradient1={bgGradient1}
        bgGradient2={bgGradient2}
      />
    </div>
  );
};

export default Photobooth;
