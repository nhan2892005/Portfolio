import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";

import sakura from "../assets/sakura.mp3";
import bacdangcungchungchauhanhquan from "../assets/BacDangCungChungChauHanhQuan-VA_95g.mp3";
import baonoilenroi from "../assets/BaoNoiLenRoi-TrongTan-DangDuong-V_a27.mp3";
import cogaimoduong from "../assets/Cogaimoduong-ThuyVan_agqb.mp3";
import NhuCoBacHoTrongNgayVuiDaiThang from "../assets/NhuCoBacHoTrongNgayVuiDaiThang-T_3dyat.mp3";
import Tienvesaigon from "../assets/TienVeSaiGon-VA_95r.mp3";
import VietNamQueHuongToi from "../assets/VietNamQueHuongToi-DangDuong-Trong_3hn82.mp3";
import { HomeInfo, Loader } from "../components";
import { soundoff, soundon } from "../assets/icons";
import { Bird, Island, Plane, Sky } from "../models";
import { Helmet } from "react-helmet-async";
import { a } from "@react-spring/three";

const Home = () => {
  const audioRef = useRef(new Audio(VietNamQueHuongToi));
  audioRef.current.volume = 0.2;
  audioRef.current.loop = true;

  const [currentStage, setCurrentStage] = useState(1);
  const [isRotating, setIsRotating] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const music = [
    VietNamQueHuongToi,
    bacdangcungchungchauhanhquan,
    baonoilenroi,
    cogaimoduong,
    NhuCoBacHoTrongNgayVuiDaiThang,
    Tienvesaigon,
    VietNamQueHuongToi,
  ];
  const [musicList, setMusicList] = useState(0);

  const playMusic = (index) => {
    audioRef.current.src = music[index];
    audioRef.current.load();
    audioRef.current.play();
  };

  useEffect(() => {
    if (isPlayingMusic) {
      playMusic(musicList);
    }

    return () => {
      audioRef.current.pause();
    };
  }, [isPlayingMusic]);

  useEffect(() => {
    if (audioRef.current) {
      const handleEnd = () => {
        const nextTrack = (musicList + 1) % music.length; // Go to next track
        setMusicList(nextTrack); // Update current track
        if (isPlayingMusic) {
          changeAudioSource(nextTrack); // Change to the next track if music is playing
        }
      };

      audioRef.current.addEventListener('ended', handleEnd); // Listen for end of audio

      // Cleanup event listener on unmount
      return () => {
        audioRef.current.removeEventListener('ended', handleEnd);
      };
    }
  }, [musicList, music, isPlayingMusic]);

  const adjustBiplaneForScreenSize = () => {
    let screenScale, screenPosition;

    // If screen width is less than 768px, adjust the scale and position
    if (window.innerWidth < 768) {
      screenScale = [1.5, 1.5, 1.5];
      screenPosition = [0, -1.5, 0];
    } else {
      screenScale = [3, 3, 3];
      screenPosition = [0, -4, -4];
    }

    return [screenScale, screenPosition];
  };

  const adjustIslandForScreenSize = () => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
      screenPosition = [0, -6.5, -43.4];
    } else {
      screenScale = [1, 1, 1];
      screenPosition = [0, -6.5, -43.4];
    }

    return [screenScale, screenPosition];
  };

  const [biplaneScale, biplanePosition] = adjustBiplaneForScreenSize();
  const [islandScale, islandPosition] = adjustIslandForScreenSize();

  return (
    <>
    <Helmet>
      <title>Nguyen Phuc Nhan | Home</title>
      <meta name="description" content="Trang chủ portfolio của Nguyen Phuc Nhan, nơi giới thiệu các dự án và nghiên cứu về HPC, Big Data, Quantum Computing và Reinforcement Learning." />
      <meta property="og:title" content="Nguyen Phuc Nhan | Home" />
      <meta property="og:description" content="Khám phá các dự án sáng tạo của Nguyen Phuc Nhan, lập trình viên &amp; kỹ sư dữ liệu." />
      <link rel="canonical" href="https://phucnhan.vercel.app" />
    </Helmet>
    <section className='w-full h-screen relative'>
      <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
        {currentStage && <HomeInfo currentStage={currentStage} />}
      </div>

      <Canvas
        className={`w-full h-screen bg-transparent ${
          isRotating ? "cursor-grabbing" : "cursor-grab"
        }`}
        camera={{ near: 0.1, far: 1000 }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 1]} intensity={2} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 5, 10]} intensity={2} />
          <spotLight
            position={[0, 50, 10]}
            angle={0.15}
            penumbra={1}
            intensity={2}
          />
          <hemisphereLight
            skyColor='#b1e1ff'
            groundColor='#000000'
            intensity={1}
          />

          <Bird />
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

      <div className='absolute bottom-2 left-2'>
        <img
          src={!isPlayingMusic ? soundoff : soundon}
          alt='jukebox'
          onClick={() => setIsPlayingMusic(!isPlayingMusic)}
          className='w-10 h-10 cursor-pointer object-contain'
        />
      </div>
    </section>
    </>
  );
};

export default Home;
