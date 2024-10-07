// DynamicGround.tsx

import React, { useMemo } from "react";
import { MeshProps } from "@react-three/fiber";
import * as THREE from "three";
import { Noise } from "noisejs";

interface DynamicGroundProps extends MeshProps {
  seed: number;
}

export const DynamicGround: React.FC<DynamicGroundProps> = ({
  seed,
  ...props
}) => {
  // Create a noise generator based on the seed number
  const noise = useMemo(() => new Noise(seed), [seed]);

  // Generate the terrain geometry
  const geometry = useMemo(() => {
    const size = 2000;
    const segments = 200;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const colors = [];
    const vector = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      vector.fromBufferAttribute(positions, i);

      // Use noise to create elevation
      const elevation = noise.perlin2(vector.x / 200, vector.y / 200) * 50;
      positions.setZ(i, elevation);

      // Set color based on elevation
      const color = new THREE.Color();
      const hue = (0.5 + elevation / 100) % 1;
      color.setHSL(hue, 0.5, 0.5);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    return geometry;
  }, [noise]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -100, 0]}
      {...props}
    >
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
};

export default DynamicGround;
