import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";

import { HomeInfo, Loader } from "../components";
import { DragonMove, Island, Plane, Sky } from "../models"; // Thay Bird thành DragonMove

import { adjustBiplaneForScreenSize, adjustIslandForScreenSize } from "../utils";

const Home = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [isRotating, setIsRotating] = useState(false);

  const [biplaneScale, biplanePosition] = adjustBiplaneForScreenSize();
  const [islandScale, islandPosition] = adjustIslandForScreenSize();

  return (
    <section className='w-full h-screen relative'>
      <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-10">
        {currentStage && <HomeInfo currentStage={currentStage} />}
      </div>

      <Canvas
        className={`w-full h-screen bg-transparent ${
          isRotating ? "cursor-grabbing" : "cursor-grab"
        }`}
        camera={{ near: 0.1, far: 1000 }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 1]} intensity={3} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 5, 10]} intensity={3} />
          <spotLight
            position={[0, 50, 10]}
            angle={0.15}
            penumbra={1}
            intensity={3}
          />
          <hemisphereLight
            skyColor='#b1e1ff'
            groundColor='#000000'
            intensity={1}
          />

          {/* Thay Bird bằng DragonMove với các tùy chỉnh */}
          <DragonMove 
            dragonColor="golden"
            currentAnimation="Flying" // Tên animation nếu có
            initialPosition={[-15, -1000, -15]}
            scale={[0.007, 0.007, 0.007]}
            speed={0.005}
            flyingHeight={2}
            waveAmplitude={0.8}
          />
          
          <Sky isRotating={isRotating} />
          <Island
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            position={islandPosition}
            rotation={[0, -Math.PI, 0]}
            scale={islandScale}
          />
          <Plane
            isRotating={isRotating}
            position={biplanePosition}
            rotation={[0, 20.1, 0]}
            scale={biplaneScale}
          />
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Home;