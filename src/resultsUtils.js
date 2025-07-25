import { productDetails } from "./productDetails";

export function calculateResults({ area, height, ead, safetyFactor, fa, trench, ceiling, room  }) {
  const roomarea  =  isNaN(area) ? 0 : area;

  // Fallback for NaN values using || 0
  const safeTrench = isNaN(trench) ? 0 : trench;
  const safeCeiling = isNaN(ceiling) ? 0 : ceiling;
  const safeRoom = isNaN(room) ? 0 : room;
  const roomVolume = roomarea * height;
  const totalVolume = safeTrench + safeCeiling + safeRoom;
  const da = ead * safetyFactor;
  const totalAgent = da * fa * totalVolume;
  const RoomtotalAgent= da * fa * roomVolume;
  console.log(RoomtotalAgent, "RoomtotalAgent");

  const TrenchtotalAgent = da * fa * safeTrench;
  console.log(TrenchtotalAgent, "TrenchtotalAgent");
  const CeilingtotalAgent = da * fa * safeCeiling;
  console.log(CeilingtotalAgent, "CeilingtotalAgent");
  

  console.log(totalAgent, "totalAgent");
  console.log(da, "da");
  console.log(totalVolume, "totalVolume");
  console.log(roomVolume, "roomVolume");
  
  return { roomVolume, totalVolume, da, totalAgent ,roomarea ,safeTrench, safeCeiling, RoomtotalAgent, TrenchtotalAgent, CeilingtotalAgent  };
}

export function recommendProducts(targetGrams, installation) {
  targetGrams = targetGrams;

  // Filter products based on the installation type
  const filteredProducts = Object.entries(productDetails)
    .filter(([code, { installationType }]) => {
      if (installation === "Panel") {
        return installationType === "Panel";
      } else if (installation === "Room" || installation === "Container") {
        return installationType === "Room";
      } else if (installation === "Both") {
        return true; // Include all products for "both"
      }
      return false;
    })
    .map(([code, { agcMass }]) => [code, parseFloat(agcMass)])
    .sort((a, b) => b[1] - a[1]); // Sort by descending AGC mass

  const recommendation = {};
  let remaining = targetGrams;

  for (let [code, mass] of filteredProducts) {
    if (mass === 0) continue;
    const count = Math.floor(remaining / mass);
    if (count > 0) {
      recommendation[code] = count;
      remaining -= count * mass;
    }
  }

  // Add smallest product to cover any remaining grams
  if (remaining > 0 && filteredProducts.length > 0) {
    const [smallestCode] = filteredProducts[filteredProducts.length - 1];
    recommendation[smallestCode] = (recommendation[smallestCode] || 0) + 1;
  }

  return recommendation;
}