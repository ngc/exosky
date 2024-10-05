// helpers.ts

export function getColor(bp_rp, g_rp, bp_g) {
    // Normalize BP-RP, G-RP, BP-G to [0, 1] (adjust ranges based on real GAIA data)
    const normalize = (value, min, max) => (value - min) / (max - min);
  
    const normalizedBP_RP = normalize(bp_rp, -0.5, 3.0);  // Adjust these ranges as necessary
    const normalizedG_RP = normalize(g_rp, 0, 2.5);
    const normalizedBP_G = normalize(bp_g, 0, 1.5);
  
    // Convert normalized values to RGB values (range [0, 255])
    const R = Math.round(normalizedBP_RP * 255);  // Red corresponds to BP-RP
    const G = Math.round((1 - normalizedG_RP) * 255);  // Green corresponds to G-RP
    const B = Math.round((1 - normalizedBP_G) * 255);  // Blue corresponds to BP-G
  
    // Ensure RGB values are clamped between 0 and 255
    const clamp = (val) => Math.max(0, Math.min(255, val));
  
    const red = clamp(R);
    const green = clamp(G);
    const blue = clamp(B);
  
    // Convert RGB to hex
    const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  
    return hex;
  }
  