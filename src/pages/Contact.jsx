import React, { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import emailjs from "@emailjs/browser";

import { Dragon } from "../models";
import useAlert from "../hooks/useAlert";
import { Alert, Loader } from "../components";

const Contact = () => {
  const formRef = useRef();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idle");

  // Control whether canvas accepts pointer events / OrbitControls
  const [canvasInteractive, setCanvasInteractive] = useState(true);

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  const handleFocus = () => {
    setCurrentAnimation("walk");
    setCanvasInteractive(false); // disable canvas interaction while typing
  };
  const handleBlur = () => {
    setCurrentAnimation("idle");
    setTimeout(() => setCanvasInteractive(true), 150);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentAnimation("hit");
    setCanvasInteractive(false);

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: "Nguyen Phuc Nhan",
          from_email: form.email,
          to_email: "nhan.nguyen2005phuyen@hcmut.edu.vn",
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          showAlert({
            show: true,
            text: "Thank you for your message 😃",
            type: "success",
          });

          setTimeout(() => {
            hideAlert(false);
            setCurrentAnimation("idle");
            setForm({ name: "", email: "", message: "" });
            setCanvasInteractive(true);
          }, 3000);
        },
        (error) => {
          setLoading(false);
          console.error(error);
          setCurrentAnimation("idle");
          setCanvasInteractive(true);

          showAlert({
            show: true,
            text: "I didn't receive your message 😢",
            type: "danger",
          });
        }
      );
  };

  return (
    <section className="relative flex lg:flex-row flex-col w-full min-h-screen" style={{ top: "100px" }}>
      {alert.show && <Alert {...alert} />}

      {/* LEFT: Form */}
      <div className="w-full lg:w-2/5 flex flex-col z-10 pl-6 lg:pl-20">
        <h1 className="head-text">Get in Touch</h1>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-7 mt-14"
        >
          <label className="text-black-500 font-semibold">
            Name
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </label>

          <label className="text-black-500 font-semibold">
            Email
            <input
              type="email"
              name="email"
              className="input"
              placeholder="EX: your_email@gmail.com"
              required
              value={form.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </label>

          <label className="text-black-500 font-semibold">
            Your Message
            <textarea
              name="message"
              rows="4"
              className="textarea"
              placeholder="Write your thoughts here..."
              value={form.message}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn"
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>

      {/* RIGHT: Dragon canvas */}
      <div
        className="flex-1 h-screen overflow-visible relative"
        style={{ position: "relative" }}
      >
        <Canvas
          gl={{
            antialias: true,
            outputEncoding: THREE.sRGBEncoding,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{ position: [0, -3, 5], fov: 50, near: 0.01, far: 10000 }}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            pointerEvents: canvasInteractive ? "auto" : "none",
          }}
        >
          {/* Key light: chiếu thẳng từ trước (cùng hướng camera) */}
          <directionalLight
            castShadow
            position={[0, 0, 5]}
            intensity={2.0}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0005}
          />

          {/* Fill + rim/back light */}
          <hemisphereLight intensity={0.6} skyColor={"#ffffff"} groundColor={"#222222"} />
          <spotLight position={[6, 6, -4]} angle={0.6} penumbra={0.6} intensity={1.0} castShadow />

          <Suspense fallback={<Loader />}>
            <Environment preset="studio" background={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.6} width={10} height={10} blur={2} far={4} />

            {/* Dragon: shift phải so với center để hiển thị về bên phải */}
            <Dragon
              position={[0, -2, -2]}
              scale={0.003}
              dragonColor="golden"
              currentAnimation={currentAnimation}
            />

            {/* Controls only active when canvasInteractive */}
            <OrbitControls
              enablePan={true}
              enableRotate={true}
              minPolarAngle={Math.PI / 2}
              maxPolarAngle={Math.PI / 2}
              enableKeys={false}
              enableZoom={false}
            />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default Contact;