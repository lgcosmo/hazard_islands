/**
 * Lotka-Volterra mutualistic model with Type II functional response
 */

export interface EcologyParams {
  Y_mut: number[][];      // Mutualistic interaction matrix
  Y_comp: number[][];     // Competition interaction matrix
  r: number[];            // Intrinsic growth rates
  h: number[];            // Half-saturation constants
}

export interface ModelConfig {
  nSpecies: number;
  mutualisticStrength: number;  // m parameter
  dispersalStrength: number;    // d parameter (for seed dispersal)
  competitionStrength: number;  // c parameter
  halfSaturation: number;       // h parameter
  customNetwork?: {             // Optional custom network matrices
    Y_mut: number[][];
    Y_comp: number[][];
  };
}

/**
 * Generate interaction matrices based on network structure
 */
export function generateInteractionMatrices(config: ModelConfig): {
  Y_mut: number[][];
  Y_comp: number[][];
} {
  const { nSpecies, mutualisticStrength, competitionStrength } = config;
  const Y = Array(nSpecies).fill(0).map(() => Array(nSpecies).fill(0));
  
  // Create a simple mutualistic network structure
  // For simplicity, we'll create a connected network where species help each other
  for (let i = 0; i < nSpecies; i++) {
    for (let j = 0; j < nSpecies; j++) {
      if (i !== j) {
        // Mutualistic interactions (positive)
        if ((i + 1) % nSpecies === j || (j + 1) % nSpecies === i) {
          Y[i][j] = mutualisticStrength;
        } else {
          // Competition (negative)
          Y[i][j] = competitionStrength;
        }
      }
    }
  }
  
  // Split into mutualistic and competitive matrices
  const Y_mut = Y.map(row => row.map(val => Math.max(0, val)));
  const Y_comp = Y.map(row => row.map(val => Math.min(0, val)));
  
  return { Y_mut, Y_comp };
}

/**
 * Matrix-vector multiplication
 */
function matVecMult(matrix: number[][], vec: number[]): number[] {
  return matrix.map(row => 
    row.reduce((sum, val, i) => sum + val * vec[i], 0)
  );
}

/**
 * Element-wise division with saturation (Type II functional response)
 */
function typeIIResponse(mutRaw: number[], h: number[]): number[] {
  return mutRaw.map((val, i) => val / (1 + h[i] * val));
}

/**
 * ODE function for Lotka-Volterra dynamics with Type II functional response
 * dN[i]/dt = N[i] * (r[i] - N[i] + comp_sum[i] + M[i])
 */
export function ecoDynamicsTypeII(
  t: number,
  N: number[],
  params: EcologyParams
): number[] {
  const { Y_mut, Y_comp, r, h } = params;
  
  // Calculate mutualistic benefit with Type II functional response
  const mutRaw = matVecMult(Y_mut, N);
  const M = typeIIResponse(mutRaw, h);
  
  // Calculate competitive effects
  const compSum = matVecMult(Y_comp, N);
  
  // Calculate derivatives
  const dN = N.map((Ni, i) => {
    // Prevent negative populations
    if (Ni <= 0) return 0;
    return Ni * (r[i] - Ni + compSum[i] + M[i]);
  });
  
  return dN;
}

/**
 * Initialize random growth rates
 */
export function initializeGrowthRates(nSpecies: number): number[] {
  return Array(nSpecies).fill(0).map(() => 
    0.1 + Math.random() * 0.4  // Range [0.1, 0.5]
  );
}

/**
 * Initialize random initial populations
 */
export function initializePopulations(nSpecies: number): number[] {
  return Array(nSpecies).fill(0).map(() => 
    0.3 + Math.random() * 0.7  // Range [0.3, 1.0]
  );
}

/**
 * Create ecology parameters from configuration
 */
export function createEcologyParams(config: ModelConfig): {
  params: EcologyParams;
  initialPopulation: number[];
} {
  // Use custom network if provided, otherwise generate random
  let Y_mut: number[][];
  let Y_comp: number[][];
  
  if (config.customNetwork) {
    Y_mut = config.customNetwork.Y_mut;
    Y_comp = config.customNetwork.Y_comp;
  } else {
    const matrices = generateInteractionMatrices(config);
    Y_mut = matrices.Y_mut;
    Y_comp = matrices.Y_comp;
  }
  
  const r = initializeGrowthRates(config.nSpecies);
  const h = Array(config.nSpecies).fill(config.halfSaturation);
  const initialPopulation = initializePopulations(config.nSpecies);
  
  return {
    params: { Y_mut, Y_comp, r, h },
    initialPopulation
  };
}

