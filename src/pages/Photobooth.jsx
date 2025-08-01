// src/pages/Photobooth.jsx

import React, { useState, useRef, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { templates } from "../templates";
import MultiFrameCollage from "../components/MultiFrameCollage";

const Photobooth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceCanvasRef = useRef(null); // Canvas cho face detection overlay
  const [stream, setStream] = useState(null);

  // Face Detection States
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [faceAnalysis, setFaceAnalysis] = useState(null);
  const [autoCapture, setAutoCapture] = useState(false);
  const [lastSmileTime, setLastSmileTime] = useState(0);

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

  // Thêm state cho màu chữ
  const [textColor, setTextColor] = useState("#000000");
  // Tùy chọn background
  const [bgType, setBgType] = useState("solid"); // "solid" hoặc "gradient"
  const [bgSolid, setBgSolid] = useState("#ffffff");
  const [bgGradient1, setBgGradient1] = useState("#ffffff");
  const [bgGradient2, setBgGradient2] = useState("#cccccc");

  // Bộ đếm giờ
  const [countdown, setCountdown] = useState(0);
  // Số giây đếm tùy chỉnh (mặc định là 3 giây)
  const [customCountdown, setCustomCountdown] = useState(3);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Loading face-api.js models...');
        
        // Load from CDN để tránh phải tải file local
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        
        console.log('✅ Face-api.js models loaded successfully');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('❌ Error loading face-api.js models:', error);
      }
    };
    
    loadModels();
  }, []);

  // Face detection loop
  useEffect(() => {
    let detectionInterval;
    
    if (faceDetectionEnabled && isModelLoaded && stream && videoRef.current) {
      detectionInterval = setInterval(async () => {
        await detectFaces();
      }, 150); // Detect every 150ms để balance performance
    }
    
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [faceDetectionEnabled, isModelLoaded, stream]);

  // Face detection function
  const detectFaces = async () => {
    const video = videoRef.current;
    const canvas = faceCanvasRef.current;
    
    if (!video || !canvas || video.paused || video.ended || !video.videoWidth) return;
    
    try {
      // Detect faces with all features
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      
      setDetectedFaces(detections);
      
      // Analyze first face
      if (detections.length > 0) {
        const face = detections[0];
        const expressions = face.expressions;
        const dominantExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        
        const analysis = {
          count: detections.length,
          age: Math.round(face.age),
          gender: face.gender,
          genderProbability: Math.round(face.genderProbability * 100),
          expression: dominantExpression,
          expressionConfidence: Math.round(expressions[dominantExpression] * 100),
          expressions: Object.keys(expressions).map(exp => ({
            name: exp,
            confidence: Math.round(expressions[exp] * 100)
          })).sort((a, b) => b.confidence - a.confidence),
          isSmiling: expressions.happy > 0.7
        };
        
        setFaceAnalysis(analysis);
        
        // Auto capture on smile
        if (autoCapture && analysis.isSmiling && !countdown) {
          const now = Date.now();
          if (now - lastSmileTime > 3000) { // Cooldown 3 giây
            setLastSmileTime(now);
            startCountdown();
          }
        }
      } else {
        setFaceAnalysis(null);
      }
      
      // Draw detection overlay
      drawFaceDetections(canvas, video, detections);
      
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  // Draw face detection overlay
  const drawFaceDetections = (canvas, video, detections) => {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detections.length === 0) return;
    
    // Calculate scale factors
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    
    detections.forEach((detection, index) => {
      const { x, y, width, height } = detection.detection.box;
      
      // Scale coordinates
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Draw face box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw face info
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fillRect(scaledX, scaledY - 25, 120, 25);
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`Face ${index + 1}`, scaledX + 5, scaledY - 8);
      
      // Draw landmarks (68 points)
      if (detection.landmarks) {
        ctx.fillStyle = '#ff0000';
        detection.landmarks.positions.forEach(point => {
          const scaledPoint = {
            x: point.x * scaleX,
            y: point.y * scaleY
          };
          ctx.beginPath();
          ctx.arc(scaledPoint.x, scaledPoint.y, 1, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  };

  // Hàm dừng camera thủ công
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log("Manual stop camera track:", track.kind);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Stop face detection when camera stops
    setFaceDetectionEnabled(false);
    setFaceAnalysis(null);
    setDetectedFaces([]);
  };

  // Hàm khởi động lại camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error("Lỗi khởi động camera:", err);
    }
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDateText(`${yyyy}.${mm}.${dd}`);
  }, []);

  // Tự động tắt camera khi user rời khỏi tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stream) {
        console.log("Tab hidden, stopping camera");
        stopCamera();
      }
    };

    const handleBeforeUnload = () => {
      if (stream) {
        console.log("Page unload, stopping camera");
        stopCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stream]);  

  // Setup camera: giữ nguyên kích thước gốc, không scale
  useEffect(() => {
    async function getCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error("Lỗi camera:", err);
      }
    }
    getCamera();

    // Khi component unmount, dừng camera
    return () => {
      // Dừng tất cả tracks từ stream
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Camera track stopped:", track.kind);
        });
      }
      
      // Dừng tracks từ video element (backup)
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => {
          track.stop();
          console.log("Video element track stopped:", track.kind);
        });
        videoRef.current.srcObject = null;
      }
      
      // Reset stream state
      setStream(null);
    };
  }, []); // Không dependencies để tránh re-run

  // Khi đổi template => reset slot
  useEffect(() => {
    const template = templates[selectedTemplateKey];
    setFrameSlots(Array(template.slots.length).fill(null));
  }, [selectedTemplateKey]);

  // Cleanup effect riêng cho stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [stream]);

  // Hàm chụp ảnh: không scale, giữ nguyên kích thước video
  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImages((prev) => [...prev, dataUrl]);
  };

  // Hàm bắt đầu đếm ngược
  const startCountdown = () => {
    let seconds = Number(customCountdown);
    setCountdown(seconds);
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(intervalId);
          capture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Xoá từng ảnh
  const deleteCapturedImage = (idx) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Clear all ảnh và reset slot
  const clearAll = () => {
    setCapturedImages([]);
    const template = templates[selectedTemplateKey];
    setFrameSlots(Array(template.slots.length).fill(null));
  };

  // Xử lý kéo – thả
  const handleDragStart = (e, img) => {
    e.dataTransfer.setData("text/plain", img);
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const img = e.dataTransfer.getData("text/plain");
    const newSlots = [...frameSlots];
    newSlots[slotIndex] = img;
    setFrameSlots(newSlots);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 py-4 px-4 md:px-20">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">📸 Photobooth with Face Detection</h1>

      {/* Face Detection Panel */}
      {stream && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 w-full max-w-4xl">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            🔍 Face Detection Controls
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Model Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isModelLoaded ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-sm font-medium">
                Models: {isModelLoaded ? 'Ready ✅' : 'Loading... ⏳'}
              </span>
            </div>
            
            {/* Detection Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFaceDetectionEnabled(!faceDetectionEnabled)}
                disabled={!isModelLoaded}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  faceDetectionEnabled 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {faceDetectionEnabled ? '🔴 Stop Detection' : '👁️ Start Detection'}
              </button>
            </div>
            
            {/* Auto Capture */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCapture}
                  onChange={(e) => setAutoCapture(e.target.checked)}
                  disabled={!faceDetectionEnabled}
                  className="mr-2"
                />
                <span className="text-sm font-medium">😊 Auto capture on smile</span>
              </label>
            </div>
          </div>
          
          {/* Face Analysis Display */}
          {faceDetectionEnabled && faceAnalysis && (
            <div className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
              <h4 className="font-medium mb-3 text-gray-800">📊 Real-time Face Analysis:</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{faceAnalysis.count}</div>
                  <div className="text-gray-600">Face(s)</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">~{faceAnalysis.age}</div>
                  <div className="text-gray-600">Years old</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {faceAnalysis.gender === 'male' ? '👨' : '👩'} {faceAnalysis.genderProbability}%
                  </div>
                  <div className="text-gray-600">{faceAnalysis.gender}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {faceAnalysis.expression === 'happy' ? '😊' : 
                     faceAnalysis.expression === 'sad' ? '😢' :
                     faceAnalysis.expression === 'angry' ? '😠' :
                     faceAnalysis.expression === 'surprised' ? '😲' :
                     faceAnalysis.expression === 'fearful' ? '😨' :
                     faceAnalysis.expression === 'disgusted' ? '🤢' : '😐'}
                  </div>
                  <div className="text-gray-600">{faceAnalysis.expression} ({faceAnalysis.expressionConfidence}%)</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold ${faceAnalysis.isSmiling ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {faceAnalysis.isSmiling ? '😄' : '😐'}
                  </div>
                  <div className="text-gray-600">{faceAnalysis.isSmiling ? 'Smiling!' : 'Not smiling'}</div>
                </div>
              </div>
              
              {/* Top 3 expressions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs font-medium text-gray-600">Top emotions:</span>
                {faceAnalysis.expressions.slice(0, 3).map((exp, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                  >
                    {exp.name}: {exp.confidence}%
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {faceDetectionEnabled && !faceAnalysis && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <span className="text-yellow-800">👁️ Looking for faces...</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-wrap md:flex-row items-start gap-4 mb-4 w-full max-w-5xl">
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
          <label className="mr-1">Màu chữ:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
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

        <div className="flex items-center">
          <label className="mr-1">Số giây đếm:</label>
          <input
            type="number"
            min="1"
            value={customCountdown}
            onChange={(e) => setCustomCountdown(e.target.value)}
            className="border p-1 w-16"
          />
        </div>
      </div>

      {/* Video & Face Detection Overlay */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stream ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              Camera: {stream ? 'Active 📹' : 'Inactive 📵'}
            </span>
          </div>
          
          {faceDetectionEnabled && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-sm text-purple-600 font-medium">Face Detection: ON</span>
            </div>
          )}
          
          {faceAnalysis && (
            <div className="text-sm text-green-600 font-medium">
              {faceAnalysis.count} face(s) detected
            </div>
          )}
        </div>
        
        <div className="relative inline-block">
          <video
            ref={videoRef}
            autoPlay
            className="border-2 border-gray-300 rounded-lg"
            style={{ 
              width: "400px", 
              height: "300px", 
              transform: "scaleX(-1)",
              opacity: stream ? 1 : 0.5 
            }}
          />
          <canvas
            ref={faceCanvasRef}
            className="absolute top-0 left-0 pointer-events-none rounded-lg"
            style={{ 
              width: "400px", 
              height: "300px",
              transform: "scaleX(-1)"
            }}
          />
          {faceDetectionEnabled && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {faceAnalysis ? `${faceAnalysis.count} face(s)` : 'Scanning...'}
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {countdown > 0 && (
        <div className="text-4xl font-bold mb-4 text-center">{countdown}</div>
      )}

      <div className="mb-4 flex gap-4 flex-wrap">
        <button
          onClick={startCountdown}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          disabled={countdown > 0 || !stream}
        >
          📸 {countdown > 0 ? `Chụp sau ${countdown}s` : 'Chụp Ảnh'}
        </button>
        
        <button
          onClick={clearAll}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          🗑️ Clear All
        </button>
        <div className="flex gap-2 w-full md:w-auto justify-center">
          {stream ? (
            <button
              onClick={stopCamera}
              className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              🔴 Tắt Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              📹 Bật Camera
            </button>
          )}
        </div>
        
        {autoCapture && faceDetectionEnabled && (
          <div className="px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 font-medium">
            😊 Auto-capture: Smile to take photo!
          </div>
        )}
      </div>

      {/* Gallery ảnh đã chụp với xoá & kéo-drag */}
      <div className="mb-4 w-full max-w-3xl">
        <h2 className="text-xl mb-2 text-center md:text-left">Gallery ảnh</h2>
        <div className="flex gap-2 flex-wrap justify-center">
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

      <div className="mb-4 w-full max-w-3xl">
        <h2 className="text-xl mb-2 text-center md:text-left">Gán ảnh vào slots</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {frameSlots.map((slotImg, i) => (
            <div
              key={i}
              className="border p-2"
              onDrop={(e) => handleDrop(e, i)}
              onDragOver={handleDragOver}
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
        textColor={textColor}  // truyền màu chữ xuống
        bgType={bgType}
        bgSolid={bgSolid}
        bgGradient1={bgGradient1}
        bgGradient2={bgGradient2}
      />
    </div>
  );
};

export default Photobooth;
