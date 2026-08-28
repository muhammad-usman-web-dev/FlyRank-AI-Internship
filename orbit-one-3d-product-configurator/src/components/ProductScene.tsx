"use client";

import { ContactShadows, Environment, Float, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import type { ProductColor } from "@/lib/product";

type SceneProps = {
  color: ProductColor;
  autoRotate: boolean;
  metalness: number;
  roughness: number;
};

function Product({ color, autoRotate, metalness, roughness }: SceneProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current && autoRotate) {
      group.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
      <group ref={group} rotation={[0.08, -0.45, 0]}>
        {/* Main Body with smoother bevels */}
        <RoundedBox args={[2.7, 1.25, 1.5]} radius={0.18} smoothness={12} castShadow receiveShadow>
          <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} envMapIntensity={1.5} />
        </RoundedBox>

        {/* Top Module: Aluminum look */}
        <RoundedBox position={[0, 0.78, 0]} args={[1.7, 0.22, 1.05]} radius={0.08} smoothness={12} castShadow>
          <meshStandardMaterial color="#EAEAEB" metalness={0.7} roughness={0.15} envMapIntensity={1.5} />
        </RoundedBox>

        {/* Top Dial/Knob */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.29, 0.29, 0.13, 32]} />
          <meshStandardMaterial color="#111318" metalness={0.8} roughness={0.2} envMapIntensity={1.2} />
        </mesh>

        {/* Sub-base stand */}
        <mesh position={[0, -0.74, 0]} receiveShadow>
          <boxGeometry args={[2.05, 0.12, 1.0]} />
          <meshStandardMaterial color="#1A1C20" metalness={0.3} roughness={0.6} />
        </mesh>

        {/* Feet cylinders */}
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} position={[x, -0.87, 0]} receiveShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 24]} />
            <meshStandardMaterial color="#0A0B0D" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function ProductScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [3.8, 2.2, 4.4], fov: 35 }}
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
      fallback={null}
    >
      <color attach="background" args={["#EBEBE9"]} />
      
      {/* Premium studio lighting configuration */}
      <ambientLight intensity={0.75} />
      <directionalLight 
        position={[6, 10, 6]} 
        intensity={2.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.65} />
      <directionalLight position={[0, -5, 0]} intensity={0.3} />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Product {...props} />
        <ContactShadows 
          position={[0, -0.95, 0]} 
          opacity={0.35} 
          scale={8} 
          blur={2.5} 
          far={2} 
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={3.8}
        maxDistance={7.2}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.68}
        enableDamping
        dampingFactor={0.07}
      />
    </Canvas>
  );
}
