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
import { OrbitControls, Line, Billboard, Text3D } from "@react-three/drei";
import { MathUtils, Color } from "three";
import * as THREE from "three";
import { Button, Dialog, Flex, TextArea, TextField } from "@radix-ui/themes";
import { Theme } from "@radix-ui/themes";
import { HUD } from "./HUD";
import { getColor } from "./helpers"; // Import the getColor function
import DynamicGround from "./DynamicGround";

// Define the type for a star object
export interface StarData {
  ra: number;
  dec: number;
  distance: number;
  brightness: number;
  bp_rp: number;
  g_rp: number;
  bp_g: number;
  source_id: string;
}

// Define props for the Star component
interface StarProps {
  position: [number, number, number];
  brightness: number;
  starInfo: StarData;
  onSelect: (star: StarData) => void;
  onDoubleClick: (star: StarData) => void;
  isSelected: boolean;
  onHover: (star: StarData | null) => void;
}

const EarthComponent = ({
  earth,
}: {
  earth: { ra: number; distance: number; dec: number } | null;
}) => {
  if (!earth) return null;

  const { ra, distance, dec } = earth;
  const scaledDistance = distance * 1000;

  // Convert spherical coordinates to Cartesian
  const x = scaledDistance * Math.cos(dec) * Math.cos(ra);
  const y = scaledDistance * Math.cos(dec) * Math.sin(ra);
  const z = scaledDistance * Math.sin(dec);

  const font = "/gt.json";

  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>
    </group>
  );
};

// Star Component to render individual stars
const Star: React.FC<StarProps> = React.memo(
  ({
    position,
    brightness,
    starInfo,
    onSelect,
    onDoubleClick,
    isSelected,
    onHover,
  }) => {
    const baseSize = 8 * 0.3 * Math.max(0.1, brightness / 10);
    const [size] = useState(baseSize);
    const clickDetectionSize = size * 10;
    const roughColor = useMemo(
      () => getColor(starInfo.bp_rp, starInfo.g_rp, starInfo.bp_g),
      [starInfo]
    );

    // We calculate the final color by making a much whiter version of the rough color
    const color = new THREE.Color(roughColor);
    color.multiplyScalar(2.5);

    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    const handleClick = useCallback(
      (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(starInfo);
      },
      [onSelect, starInfo]
    );

    const handleDoubleClick = useCallback(
      (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onDoubleClick(starInfo);
      },
      [onDoubleClick, starInfo]
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
          onDoubleClick={handleDoubleClick}
          onPointerOver={() => {
            setHovered(true);
            onHover(starInfo);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
          scale={[clickDetectionSize, clickDetectionSize, clickDetectionSize]}
          visible={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="transparent" />
        </mesh>

        <mesh
          ref={meshRef}
          position={position}
          onPointerOver={() => {
            setHovered(true);
            onHover(starInfo);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
        >
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </>
    );
  }
);

const DISTANCE_MULTIPLIER = 30000;

// StarField component to render all stars
const StarField: React.FC<{
  stars: StarData[];
  scale: number;
  selectedStars: StarData[];
  onStarSelect: (star: StarData) => void;
  onStarDoubleClick: (star: StarData) => void;
  onStarHover: (star: StarData | null) => void;
}> = React.memo(
  ({
    stars,
    scale,
    selectedStars,
    onStarSelect,
    onStarDoubleClick,
    onStarHover,
  }) => {
    return (
      <>
        {stars.map((star, idx) => {
          const { ra, dec, distance, brightness } = star;
          const scaledDistance =
            (Math.log10(distance + 1) / 8) * DISTANCE_MULTIPLIER * 10;
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
          const z =
            (scaledDistance * Math.sin(MathUtils.degToRad(dec))) / scale;

          // Check if the star is above the horizon (y > 0)
          if (y > 0) {
            return (
              <Star
                key={idx}
                position={[x, y, z]}
                brightness={brightness}
                starInfo={star}
                onSelect={onStarSelect}
                onDoubleClick={onStarDoubleClick}
                onHover={onStarHover}
                isSelected={selectedStars.some(
                  (s) => s.ra === star.ra && s.dec === star.dec
                )}
              />
            );
          }
          return null; // Don't render stars below the horizon
        })}
      </>
    );
  }
);

// ConstellationLines component to render lines between selected stars
const ConstellationLines: React.FC<{
  selectedStars: Omit<
    StarData,
    "brightness" | "bp_rp" | "g_rp" | "bp_g" | "source_id"
  >[];
  scale: number;
}> = React.memo(({ selectedStars, scale }) => {
  const points = useMemo(
    () =>
      selectedStars.map((star) => {
        const { ra, dec, distance } = star;
        const scaledDistance = Math.log10(distance + 1) * DISTANCE_MULTIPLIER;
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

/*
When we are viewing from earth, we want to show some of the well known constellations 
*/
const EarthConstellationLines: React.FC<{ scale: number }> = React.memo(
  ({ scale }) => {
    const isEarth = window.location.pathname.includes("earth");

    const EARTH_CONSTELLATIONS: Omit<
      StarData,
      "brightness" | "bp_rp" | "g_rp" | "bp_g" | "source_id"
    >[][] = [
      [
        { ra: 37.954561, dec: 89.264109, distance: 7.54 },
        { ra: 263.0549075, dec: 86.58669984, distance: 17.8802 },
        { ra: 251.4932889, dec: 82.03726905, distance: 9.8637 },
        { ra: 236.0150792, dec: 77.79448392, distance: 9.0827 },
        { ra: 236.0150792, dec: 77.79448392, distance: 9.0827 },
        { ra: 230.1818713, dec: 71.83410166, distance: 6.5959 },
        { ra: 222.676357, dec: 74.155504, distance: 24.91 },
        { ra: 236.0150792, dec: 77.79448392, distance: 9.0827 },
      ],
    ];

    if (!isEarth) return null;

    return (
      <>
        {EARTH_CONSTELLATIONS.map((constellation, idx) => (
          <ConstellationLines
            key={idx}
            selectedStars={constellation}
            scale={scale}
          />
        ))}
      </>
    );
  }
);

// Ground component
const Ground: React.FC<{ seed: number }> = React.memo(({ seed }) => (
  <DynamicGround seed={seed} />
));

export const Skyview: React.FC = () => {
  const [stars, setStars] = useState<StarData[]>([]);
  const [selectedStars, setSelectedStars] = useState<StarData[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoadingStars, setIsLoadingStars] = useState(true);
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);

  const [earth, setEarth] = useState<{
    ra: number;
    distance: number;
    dec: number;
  } | null>(null);

  const selectedExoplanetId = window.location.pathname.split("/")[2];

  const [exoplanetData, setExoplanetData] = useState<any | null>(null);

  useEffect(() => {
    setIsLoadingStars(true);
    fetch(`http://127.0.0.1:5001/stars/${selectedExoplanetId}`)
      .then((response) => response.json())
      .then((data: StarData[]) => {
        console.log("Fetched star data:", data);
        setStars(data["stars"]);
        setEarth(data["earth"]);
        setIsLoadingStars(false);
      })
      .catch((error) => {
        console.error("Error fetching star data:", error);
        setIsLoadingStars(false);
      });

    fetch(`http://127.0.0.1:5001/exoplanet/${selectedExoplanetId}`)
      .then((response) => response.json())
      .then((data) => {
        setExoplanetData(data);
      })
      .catch((error) => {
        console.error("Error fetching exoplanet data:", error);
      });
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
          return [...prev, star];
        });
        setIsSelecting(true);
        setTimeout(() => setIsSelecting(false), 100);
      }
    },
    [isSelecting]
  );

  const handleStarDoubleClick = useCallback((star: StarData) => {
    console.log("Double-clicked star:", star);
    setSelectedStars((prev) =>
      prev.filter((s) => s.ra !== star.ra || s.dec !== star.dec)
    );
  }, []);

  const handleStarHover = useCallback((star: StarData | null) => {
    setHoveredStar(star);
  }, []);

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
          onCreated={({ gl, camera }) => {
            gl.setClearColor("black");
            camera.zoom = 100;
          }}
        >
          <ambientLight />
          <OrbitControls enableZoom={false} />
          <StarField
            stars={stars}
            scale={scale}
            selectedStars={selectedStars}
            onStarSelect={handleStarSelect}
            onStarDoubleClick={handleStarDoubleClick}
            onStarHover={handleStarHover}
          />
          <EarthComponent earth={earth} />
          <ConstellationLines selectedStars={selectedStars} scale={scale} />
          <Ground seed={parseInt(selectedExoplanetId)} />
        </Canvas>
        <HUD
          selectedStars={selectedStars}
          isLoadingStars={isLoadingStars}
          exoplanetData={exoplanetData}
          hoveredStar={hoveredStar}
        />
      </div>
    </Theme>
  );
};

export default Skyview;
