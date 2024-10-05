// src/App.tsx
import "@radix-ui/themes/styles.css";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { MathUtils, Color } from "three";
import * as THREE from "three";
import { Button, Dialog, Flex, TextArea, TextField } from "@radix-ui/themes";
import { Theme } from "@radix-ui/themes";
import { HUD } from "./HUD";

// Define the type for a star object
export interface StarData {
  ra: number;
  dec: number;
  distance: number;
  brightness: number;
}

// Define props for the Star component
interface StarProps {
  position: [number, number, number];
  brightness: number;
  starInfo: StarData; // Added starInfo prop to pass star data
  onSelect: (star: StarData) => void; // Callback for selecting a star
}

// Star Component to render individual stars
const Star: React.FC<StarProps> = ({
  position,
  brightness,
  starInfo,
  onSelect,
}) => {
  const [size, setSize] = useState(0.1 * Math.max(0.1, brightness / 10)); // Adjust the divisor to control size scaling
  const clickDetectionSize = size * 25; // Size for the invisible sphere for click detection

  // Handle star selection on click
  const handleClick = () => {
    onSelect(starInfo);
  };

  return (
    <>
      {/* Invisible sphere for click detection */}
      <mesh
        position={position}
        onClick={handleClick}
        scale={[clickDetectionSize, clickDetectionSize, clickDetectionSize]}
        visible={false} // Make the mesh invisible
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="transparent" />
      </mesh>

      {/* Visible star sphere */}
      <mesh position={position}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </>
  );
};

/**
 * 
 * index,proper name,conections,ra,dec, parallax
1,Alkaid,2,206.8843267,49.31320181, 31.38 arcmin
2,Mizar,"1,3",200.9823734,54.92525908, 39.36 arcmin
3,Alioth,"2,4",193.5081785,55.95978478, 39.51
4,Megrez,"3,5,7",183.8573483,57.03265316, 40.51
5,Phecda,"4,6",178.4583668,53.69479733, 39.21
6,Merak,"5,7",165.4609742,56.38257749, 40.9
7,Dubhe,"4,6",165.931965,61.751035, 26.54
 */

const SELECTED_STARS_BIG_DIPPER: StarData[] = [
  { ra: 206.8843267, dec: 49.31320181, distance: 1882.8, brightness: 31.38 },
  { ra: 200.9823734, dec: 54.92525908, distance: 2361.6, brightness: 39.36 },
  { ra: 193.5081785, dec: 55.95978478, distance: 2370.6, brightness: 39.51 },
  { ra: 183.8573483, dec: 57.03265316, distance: 2430.6, brightness: 40.51 },
  { ra: 178.4583668, dec: 53.69479733, distance: 2352.6, brightness: 39.21 },
  { ra: 165.4609742, dec: 56.38257749, distance: 2454.0, brightness: 40.9 },
  { ra: 165.931965, dec: 61.751035, distance: 1592.4, brightness: 26.54 },
  { ra: 183.8573483, dec: 57.03265316, distance: 2430.6, brightness: 40.51 },
];
export const Skyview: React.FC = () => {
  const [stars, setStars] = useState<StarData[]>([]);
  const [selectedStars, setSelectedStars] = useState<StarData[]>([]); // State to track selected stars
  const [isSelecting, setIsSelecting] = useState(false); // State to track if a star is currently being selected

  useEffect(() => {
    // Fetch the star data from the Flask API
    fetch("http://127.0.0.1:5000/stars")
      .then((response) => response.json())
      .then((data: StarData[]) => {
        console.log("Fetched star data:", data);
        setStars(data);
      })
      .catch((error) => console.error("Error fetching star data:", error));
  }, []);

  // Determine maximum distance to adjust scaling
  const distances = stars.map((star) => star.distance);
  const maxDistance = Math.max(...distances);

  // Adjust scaling factor based on maximum distance
  const scale = maxDistance / 200; // Adjust 200 to control scene size

  // Function to handle star selection
  const handleStarSelect = (star: StarData) => {
    if (!isSelecting) {
      console.log("Selected star:", star);
      setSelectedStars((prev) => [...prev, star]); // Add selected star to the list
      setIsSelecting(true); // Set selecting state to true
      setTimeout(() => setIsSelecting(false), 100); // Reset selecting state after a short delay
    }
  };

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
          // camera={{ position: [0, 0, 0], fov: 75 }} // Set initial camera position
          onCreated={({ gl }) => {
            gl.setClearColor("black"); // Set canvas background to black
          }}
        >
          <ambientLight />
          <OrbitControls enableZoom={false} /> {/* Disable zooming */}
          {/* Render stars */}
          {stars.map((star, idx) => {
            const { ra, dec, distance, brightness } = star;

            // Apply logarithmic scaling to distance
            const scaledDistance = Math.log10(distance + 1) * 10000; // Adjust 10000 as needed

            // Convert spherical coordinates (RA, Dec, Distance) to 3D Cartesian
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

            return (
              <Star
                key={idx}
                position={[x, y, z]}
                brightness={brightness}
                starInfo={star}
                onSelect={handleStarSelect} // Pass the select handler
              />
            );
          })}
          {/* Draw lines between selected stars */}
          {selectedStars.length > 1 && (
            <Line
              points={selectedStars.map((star) => {
                const { ra, dec, distance } = star;
                const scaledDistance = Math.log10(distance + 1) * 10000; // Adjust 10000 as needed
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
                return [x, y, z];
              })}
              color="white" // Color of the line
              lineWidth={2} // Width of the line
            />
          )}
          {/* Ground at the horizon */}
          <mesh
            position={[0, -10, 0]} // Moved to center of scene
            rotation={[MathUtils.degToRad(90), 0, 0]} // Rotated 90 degrees around X-axis
          >
            <planeGeometry args={[2000, 2000]} />{" "}
            {/* Larger plane to cover entire view */}
            <meshBasicMaterial
              color="gray"
              side={THREE.DoubleSide}
              transparent
              opacity={1}
            />{" "}
            {/* Opaque material */}
          </mesh>
        </Canvas>
        {/* HUD Component */}
        <HUD selectedStars={selectedStars} />
      </div>
    </Theme>
  );
};

export default Skyview;
