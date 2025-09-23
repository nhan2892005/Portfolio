import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Dragon } from "./Dragon";

export function DragonMove({ 
  dragonColor = "golden",
  currentAnimation,
  initialPosition = [-15, -1000, -15],
  scale = [0.8, 0.8, 0.8],
  speed = 0.02,
  flyingHeight = 3,
  waveAmplitude = 0.5
}) {
  const dragonRef = useRef();
  const directionRef = useRef(1); // 1 for forward, -1 for backward

  useFrame(({ clock, camera }) => {
    if (!dragonRef.current) return;

    const time = clock.elapsedTime;

    // Chuyển động bay lượn như sóng (Y axis)
    dragonRef.current.position.y = Math.sin(time * 1.2) * waveAmplitude + flyingHeight;

    // Chuyển động nhẹ nhàng trên trục Z (tạo độ sâu)
    dragonRef.current.position.z = Math.sin(time * 0.8) * 0.3 + initialPosition[2];

    // Logic thay đổi hướng dựa trên vị trí camera
    const cameraX = camera.position.x;
    const dragonX = dragonRef.current.position.x;

    // Kiểm tra nếu rồng đã bay quá xa về một phía
    if (dragonX > cameraX + 15) {
      // Quay về phía sau (180 độ)
      dragonRef.current.rotation.y = 0;
      directionRef.current = 1;
    } else if (dragonX < cameraX - 15) {
      // Quay về phía trước (0 độ)
      dragonRef.current.rotation.y = 0;
      directionRef.current = 1;
    }

    // Di chuyển theo hướng hiện tại
    if (directionRef.current === 1) {
      // Bay về phía trước
      dragonRef.current.position.x += speed;
    } else {
      // Bay về phía sau
      dragonRef.current.position.x -= speed;
    }

    // Thêm hiệu ứng nghiêng khi bay (banking effect)
    const bankingAngle = Math.sin(time * 1.5) * 0.1;
    dragonRef.current.rotation.z = bankingAngle * directionRef.current;

    // Chuyển động đầu rồng nhẹ nhàng
    if (dragonRef.current.children[0]) {
      const headMovement = Math.sin(time * 2) * 0.05;
      dragonRef.current.rotation.x = headMovement;
    }
  });

  return (
    <group 
      ref={dragonRef} 
      position={initialPosition}
      scale={scale}
    >
      <Dragon 
        currentAnimation={currentAnimation}
        dragonColor={dragonColor}
      />
    </group>
  );
}