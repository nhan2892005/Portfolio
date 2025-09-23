import React, { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import scene from "../assets/3d/dragon.glb";

export function Dragon({ currentAnimation, dragonColor = "red", ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(scene);
  const { actions } = useAnimations(animations, group);

  // ✅ Cách 2: Clone materials một lần và modify trực tiếp
  const customMaterials = useRef({});
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Clone materials một lần duy nhất
  useEffect(() => {
    if (materials && Object.keys(customMaterials.current).length === 0) {
      if (materials.MI_b09_00_drg_hair) {
        customMaterials.current.MI_b09_00_drg_hair = materials.MI_b09_00_drg_hair.clone();
      }
      if (materials.MI_b09_00_drg_eye) {
        customMaterials.current.MI_b09_00_drg_eye = materials.MI_b09_00_drg_eye.clone();
      }
    }
  }, [materials]);
  
  // Update màu sắc khi dragonColor thay đổi
  useEffect(() => {
    if (Object.keys(customMaterials.current).length > 0) {
      // Material cho thân rồng (hair)
      if (customMaterials.current.MI_b09_00_drg_hair) {
        if (dragonColor === "red") {
          // Màu đỏ rực cho rồng
          customMaterials.current.MI_b09_00_drg_hair.color.setHex(0xcc0000);
          customMaterials.current.MI_b09_00_drg_hair.emissive.setHex(0x330000);
          customMaterials.current.MI_b09_00_drg_hair.emissiveIntensity = 0.3;
        } else if (dragonColor === "golden") {
          // Màu vàng gold
          customMaterials.current.MI_b09_00_drg_hair.color.setHex(0xffd700);
          customMaterials.current.MI_b09_00_drg_hair.emissive.setHex(0x664400);
          customMaterials.current.MI_b09_00_drg_hair.emissiveIntensity = 0.2;
        } else if (dragonColor === "darkred") {
          // Màu đỏ sẫm
          customMaterials.current.MI_b09_00_drg_hair.color.setHex(0x8b0000);
          customMaterials.current.MI_b09_00_drg_hair.emissive.setHex(0x220000);
          customMaterials.current.MI_b09_00_drg_hair.emissiveIntensity = 0.4;
        }
        
        // Thêm hiệu ứng metallic/roughness
        if (customMaterials.current.MI_b09_00_drg_hair.metalness !== undefined) {
          customMaterials.current.MI_b09_00_drg_hair.metalness = 0.3;
          customMaterials.current.MI_b09_00_drg_hair.roughness = 0.4;
        }
        
        // Đánh dấu material cần update
        customMaterials.current.MI_b09_00_drg_hair.needsUpdate = true;
      }
      
      // Material cho mắt
      if (customMaterials.current.MI_b09_00_drg_eye) {
        // Mắt vàng sáng cho rồng đỏ
        if (dragonColor === "red" || dragonColor === "darkred") {
          customMaterials.current.MI_b09_00_drg_eye.color.setHex(0xffff00);
          customMaterials.current.MI_b09_00_drg_eye.emissive.setHex(0x666600);
          customMaterials.current.MI_b09_00_drg_eye.emissiveIntensity = 0.5;
        }
        customMaterials.current.MI_b09_00_drg_eye.needsUpdate = true;
      }
      
      // Force component re-render để áp dụng màu mới
      setForceUpdate(prev => prev + 1);
    }
  }, [dragonColor]); // ✅ dragonColor trong dependency array

  // Log animations để xem có animation nào không
  useEffect(() => {
    console.log("Available animations:", animations);
    console.log("Actions:", actions);
  }, [animations, actions]);

  // This effect will run whenever the currentAnimation prop changes
  useEffect(() => {
    // Nếu có animations từ model
    if (animations && animations.length > 0) {
      // Stop all animations
      Object.values(actions).forEach((action) => action.stop());

      // Play animation theo tên hoặc play animation đầu tiên
      if (currentAnimation && actions[currentAnimation]) {
        actions[currentAnimation].play();
      } else if (Object.keys(actions).length > 0) {
        // Nếu không có currentAnimation, play animation đầu tiên
        const firstAnimation = Object.values(actions)[0];
        if (firstAnimation) {
          firstAnimation.play();
        }
      }
    }
  }, [actions, currentAnimation, animations]);

  // Thêm animation bay thủ công nếu model không có sẵn animations
  useFrame((state) => {
    if (group.current) {
      // Animation bay lượn sóng
      const time = state.clock.getElapsedTime();
      
      // Chuyển động lên xuống như sóng
      group.current.position.y = Math.sin(time * 1.5) * 0.3 + (props.position?.[1] || 0);
      
      // Chuyển động xoay nhẹ cho thân rồng
      group.current.rotation.z = Math.sin(time * 2) * 0.05;
      
      // Optional: Chuyển động tiến tới/lùi
      group.current.position.z = Math.sin(time * 0.8) * 0.2 + (props.position?.[2] || 0);
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="51c007ade1cb4b04bbd547e135465dbbfbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="drgon">
                  <group name="drgon_1">
                    <group name="Object_6">
                      <primitive object={nodes._rootJoint} />
                      <skinnedMesh
                        name="Object_281"
                        geometry={nodes.Object_281.geometry}
                        material={customMaterials.current.MI_b09_00_drg_hair || materials.MI_b09_00_drg_hair}
                        skeleton={nodes.Object_281.skeleton}
                        key={forceUpdate} // Force re-render
                      />
                      <skinnedMesh
                        name="Object_282"
                        geometry={nodes.Object_282.geometry}
                        material={customMaterials.current.MI_b09_00_drg_eye || materials.MI_b09_00_drg_eye}
                        skeleton={nodes.Object_282.skeleton}
                        key={forceUpdate} // Force re-render
                      />
                      <group name="Object_280" rotation={[-Math.PI / 2, 0, 0]} />
                    </group>
                  </group>
                  <group name="drgon_2">
                    <group name="drgon_3" />
                    <group name="drgon_4" />
                    <group name="drgon_5" />
                    <group name="drgon_6" />
                    <group name="drgon_7" />
                    <group name="drgon_8" />
                    <group name="drgon_9" />
                    <group name="drgon_10" />
                    <group name="drgon_11" />
                    <group name="drgon_12" />
                    <group name="drgon_13" />
                  </group>
                </group>
                <group name="dragon" rotation={[-Math.PI / 2, 0, 0]} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(scene);