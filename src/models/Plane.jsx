import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

import planeScene from "../assets/3d/ufo.glb";

// 3D Model from: https://sketchfab.com/3d-models/stylized-ww1-plane-c4edeb0e410f46e8a4db320879f0a1db
export function Plane({ isRotating, ...props }) {
  const ref = useRef();
  const { scene, animations } = useGLTF(planeScene);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    if (isRotating) {
      const action = actions["Hovering"];
      if (action) {
        action.play();
      }
    } else {
      const action = actions["Hovering"];
      if (action) {
        action.stop();
      }
    }
  }, [actions, isRotating]);

  return (
    <mesh {...props} ref={ref} scale={[0.5, 0.5, 0.5]}>
      <primitive object={scene} />
    </mesh>
  );
}

