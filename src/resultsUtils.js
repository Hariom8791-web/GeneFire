import { productDetails } from "./productDetails";

export function calculateResults({ area, height, ead, safetyFactor, fa, trench, ceiling, floor }) {
  const roomVolume = area * height;
  const totalVolume = roomVolume + trench + ceiling + floor;
  const da = ead * safetyFactor;
  const totalAgent = da * fa * totalVolume;
  return { roomVolume, totalVolume, da, totalAgent };
}

export function recommendProducts(targetGrams) {
  const sortedProducts = Object.entries(productDetails)
    .map(([code, { agcMass }]) => [code, parseFloat(agcMass)])
    .sort((a, b) => b[1] - a[1]);

  const recommendation = {};
  let remaining = targetGrams;

  for (let [code, mass] of sortedProducts) {
    if (mass === 0) continue;
    const count = Math.floor(remaining / mass);
    if (count > 0) {
      recommendation[code] = count;
      remaining -= count * mass;
    }
  }

  // Add smallest product to cover any remaining grams
  if (remaining > 0) {
    const [smallestCode] = sortedProducts[sortedProducts.length - 1];
    recommendation[smallestCode] = (recommendation[smallestCode] || 0) + 1;
  }

  return recommendation;
}
