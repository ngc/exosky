import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MathUtils } from "three";

// Define the type for a star object
interface StarData {
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
}

// Star Component to render individual stars
const Star: React.FC<StarProps> = ({ position, brightness, starInfo }) => {
  // Scale the size of the star based on its brightness
  const size = 0.1 * Math.max(0.1, brightness / 10); // Adjust the divisor to control size scaling

  // Log star data on hover
  const handlePointerOver = () => {
    console.log("Star data:", starInfo);
  };

  return (
    <mesh
      position={position}
      onPointerOver={handlePointerOver}
      scale={[2, 2, 2]}
    >
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
};

const App: React.FC = () => {
  const [stars, setStars] = useState<StarData[]>([]);

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

  return (
    <div
      style={{ width: "100vw", height: "100vh", margin: 0, overflow: "hidden" }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 300], fov: 75 }}
        onCreated={({ gl }) => {
          gl.setClearColor("black");
        }}
      >
        <ambientLight />
        <OrbitControls />

        {/* Render stars */}
        {stars.map((star, idx) => {
          const { ra, dec, distance, brightness } = star;

          // Apply logarithmic scaling to distance
          const scaledDistance = Math.log10(distance + 1) * 10000; // Adjust 50 as needed

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
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default App;
