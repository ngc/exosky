import { StarData } from "./Skyview";

export function generateConstellationImage(starData: StarData[]): string {
  // Create an off-screen canvas
  const canvas = document.createElement("canvas");
  const width = 800; // Set the desired canvas width
  const height = 800; // Make it square for easier scaling
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas rendering context not available");
  }

  // Set background color to black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // Convert RA and Dec to radians
  const raValues = starData.map((star) => (star.ra / 180) * Math.PI);
  const decValues = starData.map((star) => (star.dec / 180) * Math.PI);
  const brightnessValues = starData.map((star) => star.brightness);

  // Calculate the center point (mean RA and Dec)
  const meanRa = raValues.reduce((a, b) => a + b, 0) / raValues.length;
  const meanDec = decValues.reduce((a, b) => a + b, 0) / decValues.length;

  const maxBrightness = Math.max(...brightnessValues);

  // Project stars using stereographic projection
  const projectedPoints = raValues.map((ra, i) => {
    const dec = decValues[i];

    // Stereographic projection formulas
    const k =
      2 /
      (1 +
        Math.sin(meanDec) * Math.sin(dec) +
        Math.cos(meanDec) * Math.cos(dec) * Math.cos(ra - meanRa));

    const x = k * Math.cos(dec) * Math.sin(ra - meanRa);
    const y =
      k *
      (Math.cos(meanDec) * Math.sin(dec) -
        Math.sin(meanDec) * Math.cos(dec) * Math.cos(ra - meanRa));

    return { x, y };
  });

  // Find the max distance for scaling
  const distances = projectedPoints.map((p) => Math.hypot(p.x, p.y));
  const maxDistance = Math.max(...distances);

  // Scaling factor to fit the projected points within the canvas
  const scale = (width / 2 - 40) / maxDistance; // 40 pixels padding

  // Draw the constellation lines connecting the stars in order
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.beginPath();
  projectedPoints.forEach((point, i) => {
    const x = point.x * scale + width / 2;
    const y = -point.y * scale + height / 2; // Negative y to flip the y-axis

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw the stars
  projectedPoints.forEach((point, i) => {
    const x = point.x * scale + width / 2;
    const y = -point.y * scale + height / 2; // Negative y to flip the y-axis
    const brightness = brightnessValues[i];

    // Calculate star size (brighter stars appear larger)
    const size = ((maxBrightness - brightness + 1) / maxBrightness) * 8 + 2;

    // Draw the star as a filled circle
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Convert the canvas to a base64-encoded PNG image
  const dataURL = canvas.toDataURL("image/png");
  return dataURL;
}
