---
title: "Hành trình học Three.js"
date: "2025-06-25"
author: "Nguyễn Phúc Nhân"
description: "Chia sẻ kinh nghiệm học Three.js từ zero đến hero, cùng với những dự án thực tế."
tags: ["threejs", "3d", "webgl", "javascript"]
cover: "/images/threejs-journey.jpg"
---

# Hành trình khám phá Three.js 🎮

Three.js đã hoàn toàn thay đổi cách tôi nhìn về web development. Từ những trang web tĩnh, giờ đây tôi có thể tạo ra những trải nghiệm 3D tương tác tuyệt vời!

## Tại sao Three.js lại quan trọng?

### 🌟 Web 3D đang là tương lai
- **Immersive experiences**: Trải nghiệm nhập vai hơn
- **Interactive design**: Thiết kế tương tác phong phú
- **Creative freedom**: Tự do sáng tạo không giới hạn

## Dự án đầu tiên: Rotating Cube

```javascript
import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tạo cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

animate();
```

## Những khái niệm quan trọng

### 1. Scene Graph
- **Scene**: Không gian 3D chứa tất cả objects
- **Camera**: Góc nhìn của người dùng
- **Renderer**: Công cụ vẽ lên canvas

### 2. Geometry & Material
```javascript
// Geometry - Hình dạng
const geometry = new THREE.SphereGeometry(1, 32, 32);

// Material - Chất liệu
const material = new THREE.MeshPhongMaterial({
    color: 0xff6347,
    shininess: 100
});

// Mesh - Kết hợp geometry và material
const sphere = new THREE.Mesh(geometry, material);
```

### 3. Lighting System
```javascript
// Ambient light - Ánh sáng môi trường
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

// Directional light - Ánh sáng định hướng
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);
```

## Dự án thực tế: 3D Portfolio

Tôi đã áp dụng Three.js vào portfolio cá nhân với:

- 🏝️ **3D Island**: Hòn đảo 3D tương tác
- 🦅 **Animated Birds**: Chim bay động
- ✈️ **Flying Plane**: Máy bay bay lượn
- 🌅 **Dynamic Sky**: Bầu trời thay đổi theo thời gian

```javascript
// Load 3D model
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('./models/island.glb', (gltf) => {
    const island = gltf.scene;
    island.scale.setScalar(0.5);
    scene.add(island);
});
```

## Tips học Three.js hiệu quả

### 📚 Tài liệu và khóa học
1. **Three.js Journey** - Bruno Simon
2. **Three.js Documentation** - Official docs
3. **YouTube tutorials** - Fireship, DesignCourse

### 🛠️ Tools hữu ích
- **Blender**: Tạo 3D models
- **Sketchfab**: Tìm free 3D models
- **HDRI Haven**: Environment maps

### 💡 Thực hành dự án
1. Bắt đầu với cube đơn giản
2. Thêm lighting và materials
3. Load 3D models
4. Tạo animations
5. Thêm tương tác user

## Performance Tips

```javascript
// 1. Dispose geometry và materials
geometry.dispose();
material.dispose();

// 2. Sử dụng InstancedMesh cho nhiều objects giống nhau
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

// 3. Frustum culling
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 4. LOD (Level of Detail)
const lod = new THREE.LOD();
lod.addLevel(highPolyMesh, 0);
lod.addLevel(lowPolyMesh, 100);
```

## Kết luận

Three.js mở ra một thế giới mới trong web development. Từ những website đơn giản, bạn có thể tạo ra những trải nghiệm 3D tuyệt vời như game, visualizations, hay interactive art.

Hãy bắt đầu với những dự án nhỏ và dần dần phát triển. Remember: **"The best way to learn is by doing!"**

---

*Keep exploring the 3D world! 🚀*
