// src/App.tsx
import "@radix-ui/themes/styles.css";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { MathUtils, Color } from "three";
import * as THREE from "three";
import { Button, Dialog, Flex, TextArea, TextField } from "@radix-ui/themes";
import { Theme } from "@radix-ui/themes";
import { HUD } from "./HUD";
import { getColor } from "./helpers"; // Import the getColor function

// Define the type for a star object
export interface StarData {
  ra: number;
  dec: number;
  distance: number;
  brightness: number;
  bp_rp: number;
  g_rp: number;
  bp_g: number;
}

// Define props for the Star component
interface StarProps {
  position: [number, number, number];
  brightness: number;
  starInfo: StarData;
  onSelect: (star: StarData) => void;
  isSelected: boolean;
}

// Star Component to render individual stars
const Star: React.FC<StarProps> = React.memo(
  ({ position, brightness, starInfo, onSelect, isSelected }) => {
    const baseSize = 0.3 * Math.max(0.1, brightness / 10);
    const [size] = useState(baseSize);
    const clickDetectionSize = size * 10;
    const color = useMemo(
      () => getColor(starInfo.bp_rp, starInfo.g_rp, starInfo.bp_g),
      [starInfo]
    );
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    const handleClick = useCallback(
      (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(starInfo);
      },
      [onSelect, starInfo]
    );

    useFrame(() => {
      if (meshRef.current) {
        if (isSelected) {
          meshRef.current.scale.lerp(new THREE.Vector3(3, 3, 3), 0.1);
        } else if (hovered) {
          meshRef.current.scale.lerp(new THREE.Vector3(2, 2, 2), 0.1);
        } else {
          meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      }
    });

    return (
      <>
        <mesh
          position={position}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={[clickDetectionSize, clickDetectionSize, clickDetectionSize]}
          visible={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="transparent" />
        </mesh>

        <mesh
          ref={meshRef}
          position={position}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </>
    );
  }
);

// StarField component to render all stars
const StarField: React.FC<{
  stars: StarData[];
  scale: number;
  selectedStars: StarData[];
  onStarSelect: (star: StarData) => void;
}> = React.memo(({ stars, scale, selectedStars, onStarSelect }) => {
  return (
    <>
      {stars.map((star, idx) => {
        const { ra, dec, distance, brightness } = star;
        const scaledDistance = Math.log10(distance + 1) * 10000;
        const x =
          (scaledDistance *
            Math.cos(MathUtils.degToRad(dec)) *
            Math.cos(MathUtils.degToRad(ra))) /
          scale;
        const y =
          (scaledDistance *
            Math.cos(MathUtils.degToRad(dec)) *
            Math.sin(MathUtils.degToRad(ra))) /
          scale;
        const z = (scaledDistance * Math.sin(MathUtils.degToRad(dec))) / scale;

        return (
          <Star
            key={idx}
            position={[x, y, z]}
            brightness={brightness}
            starInfo={star}
            onSelect={onStarSelect}
            isSelected={selectedStars.some(
              (s) => s.ra === star.ra && s.dec === star.dec
            )}
          />
        );
      })}
    </>
  );
});

// ConstellationLines component to render lines between selected stars
const ConstellationLines: React.FC<{
  selectedStars: StarData[];
  scale: number;
}> = React.memo(({ selectedStars, scale }) => {
  const points = useMemo(
    () =>
      selectedStars.map((star) => {
        const { ra, dec, distance } = star;
        const scaledDistance = Math.log10(distance + 1) * 10000;
        const x =
          (scaledDistance *
            Math.cos(MathUtils.degToRad(dec)) *
            Math.cos(MathUtils.degToRad(ra))) /
          scale;
        const y =
          (scaledDistance *
            Math.cos(MathUtils.degToRad(dec)) *
            Math.sin(MathUtils.degToRad(ra))) /
          scale;
        const z = (scaledDistance * Math.sin(MathUtils.degToRad(dec))) / scale;
        return [x, y, z];
      }),
    [selectedStars, scale]
  );

  if (selectedStars.length < 2) return null;

  return (
    <Line
      points={points as unknown as THREE.Vector3[]}
      color="white"
      lineWidth={2}
    />
  );
});

// Ground component
const Ground: React.FC = React.memo(() => (
  <mesh position={[0, -10, 0]} rotation={[MathUtils.degToRad(90), 0, 0]}>
    <planeGeometry args={[2000, 2000]} />
    <meshBasicMaterial
      color="gray"
      side={THREE.DoubleSide}
      transparent
      opacity={1}
    />
  </mesh>
));

export const Skyview: React.FC = () => {
  const [stars, setStars] = useState<StarData[]>([]);
  const [selectedStars, setSelectedStars] = useState<StarData[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const selectedExoplanetId = window.location.pathname.split("/")[2];

  useEffect(() => {
    fetch(`http://127.0.0.1:5001/stars/${selectedExoplanetId}`)
      .then((response) => response.json())
      .then((data: StarData[]) => {
        console.log("Fetched star data:", data);
        setStars(data);
      })
      .catch((error) => console.error("Error fetching star data:", error));
  }, [selectedExoplanetId]);

  const scale = useMemo(() => {
    const distances = stars.map((star) => star.distance);
    const maxDistance = Math.max(...distances);
    return maxDistance / 200;
  }, [stars]);

  const handleStarSelect = useCallback(
    (star: StarData) => {
      if (!isSelecting) {
        console.log("Selected star:", star);
        setSelectedStars((prev) => {
          const index = prev.findIndex(
            (s) => s.ra === star.ra && s.dec === star.dec
          );
          if (index !== -1) {
            return prev.filter((_, i) => i !== index);
          } else {
            return [...prev, star];
          }
        });
        setIsSelecting(true);
        setTimeout(() => setIsSelecting(false), 100);
      }
    },
    [isSelecting]
  );

  return (
    <Theme>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Canvas
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setClearColor("black");
          }}
        >
          <ambientLight />
          <OrbitControls enableZoom={false} />
          <StarField
            stars={stars}
            scale={scale}
            selectedStars={selectedStars}
            onStarSelect={handleStarSelect}
          />
          <ConstellationLines selectedStars={selectedStars} scale={scale} />
          <Ground />
        </Canvas>
        <HUD selectedStars={selectedStars} />
      </div>
    </Theme>
  );
};

export default Skyview;
