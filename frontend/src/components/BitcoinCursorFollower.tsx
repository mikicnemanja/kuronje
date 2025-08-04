// components/BitcoinCursorFollower.tsx
import { Canvas } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import modelUrl from "/models/bitcoin/scene.gltf?url";

function BitcoinModel({
  mousePositionRef,
}: {
  mousePositionRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(modelUrl);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (meshRef.current) {
      const mousePos = mousePositionRef.current;
      const targetX = (mousePos.x / window.innerWidth) * 2 - 1;
      const targetY = (mousePos.y / window.innerHeight) * 2 - 1;

      // Update target rotations
      targetRotation.current.x = targetY * 0.4;
      targetRotation.current.y = targetX * 0.6;

      // Smooth rotation following cursor (more responsive and smooth)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.current.y,
        0.08
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotation.current.x,
        0.08
      );

      // Removed automatic z-rotation for clean cursor-only following
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene.clone()}
      scale={[0.08, 0.08, 0.08]}
      position={[0, -3, -3]}
    />
  );
}

export default function BitcoinCursorFollower() {
  const mousePositionRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const lastUpdateTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle to ~60fps
      if (now - lastUpdateTime.current > 16) {
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
        lastUpdateTime.current = now;
      }
    };

    // Add global mouse listener
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []); // Empty dependency array - this effect should only run once

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // Behind all other elements
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{
          background: "transparent", // Transparent so app background shows through
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={9} />
        <pointLight position={[-5, -5, -5]} intensity={9} />
        <BitcoinModel mousePositionRef={mousePositionRef} />
      </Canvas>
    </div>
  );
}
