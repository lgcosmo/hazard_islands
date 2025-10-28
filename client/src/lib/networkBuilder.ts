/**
 * Build interaction matrix from biadjacency matrices
 * Based on the Julia implementation for bipartite networks
 */

export interface BipartiteNetwork {
  B: number[][] | null;  // Pollination biadjacency matrix
  S: number[][] | null;  // Seed dispersal biadjacency matrix
}

export interface NetworkParams {
  m: number;  // Mutualistic strength for pollination
  d: number;  // Mutualistic strength for dispersal
  c: number;  // Competition strength
}

/**
 * Parse CSV string to matrix
 */
export function parseCSV(csvText: string): number[][] {
  const lines = csvText.trim().split('\n');
  const matrix: number[][] = [];
  
  for (const line of lines) {
    const values = line.split(',').map(v => parseFloat(v.trim()));
    if (values.some(isNaN)) {
      throw new Error('Invalid CSV format: contains non-numeric values');
    }
    matrix.push(values);
  }
  
  if (matrix.length === 0) {
    throw new Error('Empty CSV file');
  }
  
  // Check all rows have same length
  const cols = matrix[0].length;
  if (!matrix.every(row => row.length === cols)) {
    throw new Error('Invalid CSV format: rows have different lengths');
  }
  
  return matrix;
}

/**
 * Build interaction matrix Y from biadjacency matrices B and S
 * Adapted from Julia implementation
 */
export function buildInteractionMatrix(
  network: BipartiteNetwork,
  params: NetworkParams
): { Y_mut: number[][], Y_comp: number[][], nSpecies: number } {
  const { B, S } = network;
  const { m, d, c } = params;
  
  if (!B && !S) {
    throw new Error('At least one biadjacency matrix (B or S) must be provided');
  }
  
  // Determine dimensions
  let Np = 0; // Number of plants
  let Na = 0; // Number of animals
  
  if (B) {
    Np = Math.max(Np, B.length);
    Na = Math.max(Na, B[0].length);
  }
  if (S) {
    Np = Math.max(Np, S.length);
    Na = Math.max(Na, S[0].length);
  }
  
  const Nt = Np + Na; // Total species
  
  // Initialize Y matrix
  const Y: number[][] = Array(Nt).fill(0).map(() => Array(Nt).fill(0));
  
  // Pad matrices if needed
  const B_padded = padMatrix(B, Np, Na);
  const S_padded = padMatrix(S, Np, Na);
  
  // Identify active species (species with at least one interaction)
  const plant_in_B = Array(Np).fill(false);
  const animal_in_B = Array(Na).fill(false);
  const plant_in_S = Array(Np).fill(false);
  const animal_in_S = Array(Na).fill(false);
  
  if (B_padded) {
    for (let i = 0; i < Np; i++) {
      for (let j = 0; j < Na; j++) {
        if (B_padded[i][j] > 0) {
          plant_in_B[i] = true;
          animal_in_B[j] = true;
        }
      }
    }
  }
  
  if (S_padded) {
    for (let i = 0; i < Np; i++) {
      for (let j = 0; j < Na; j++) {
        if (S_padded[i][j] > 0) {
          plant_in_S[i] = true;
          animal_in_S[j] = true;
        }
      }
    }
  }
  
  // Count active species
  const n_active_plants_B = plant_in_B.filter(Boolean).length;
  const n_active_animals_B = animal_in_B.filter(Boolean).length;
  const n_active_plants_S = plant_in_S.filter(Boolean).length;
  const n_active_animals_S = animal_in_S.filter(Boolean).length;
  
  // Competition denominators (number of *other* active species)
  const comp_denom_p_b = Math.max(n_active_plants_B - 1, 1);
  const comp_denom_a_b = Math.max(n_active_animals_B - 1, 1);
  const comp_denom_p_s = Math.max(n_active_plants_S - 1, 1);
  const comp_denom_a_s = Math.max(n_active_animals_S - 1, 1);
  
  // --- Competition (plants) ---
  for (let j = 0; j < Np; j++) {
    for (let i = 0; i < Np; i++) {
      if (i !== j) {
        if (plant_in_B[i] && plant_in_B[j]) {
          Y[i][j] += c / comp_denom_p_b;
        }
        if (plant_in_S[i] && plant_in_S[j]) {
          Y[i][j] += c / comp_denom_p_s;
        }
      }
    }
  }
  
  // --- Competition (animals) ---
  for (let j = 0; j < Na; j++) {
    for (let i = 0; i < Na; i++) {
      if (i !== j) {
        if (animal_in_B[i] && animal_in_B[j]) {
          Y[Np + i][Np + j] += c / comp_denom_a_b;
        }
        if (animal_in_S[i] && animal_in_S[j]) {
          Y[Np + i][Np + j] += c / comp_denom_a_s;
        }
      }
    }
  }
  
  // --- Mutualism (normalized so each species' outgoing sum = m or d) ---
  
  // Pollination edges (B)
  if (B_padded) {
    // Precompute row and column sums
    const plant_B_row_sum = B_padded.map(row => row.reduce((sum, val) => sum + val, 0));
    const animal_B_col_sum = Array(Na).fill(0);
    for (let j = 0; j < Na; j++) {
      for (let i = 0; i < Np; i++) {
        animal_B_col_sum[j] += B_padded[i][j];
      }
    }
    
    for (let i = 0; i < Np; i++) {
      for (let j = 0; j < Na; j++) {
        if (B_padded[i][j] > 0) {
          // Plant -> animal
          const denom_p = plant_B_row_sum[i];
          if (denom_p > 0) {
            Y[i][Np + j] += m * B_padded[i][j] / Math.sqrt(denom_p);
          }
          // Animal -> plant
          const denom_a = animal_B_col_sum[j];
          if (denom_a > 0) {
            Y[Np + j][i] += m * B_padded[i][j] / Math.sqrt(denom_a);
          }
        }
      }
    }
  }
  
  // Dispersal edges (S)
  if (S_padded) {
    // Precompute row and column sums
    const plant_S_row_sum = S_padded.map(row => row.reduce((sum, val) => sum + val, 0));
    const animal_S_col_sum = Array(Na).fill(0);
    for (let j = 0; j < Na; j++) {
      for (let i = 0; i < Np; i++) {
        animal_S_col_sum[j] += S_padded[i][j];
      }
    }
    
    for (let i = 0; i < Np; i++) {
      for (let j = 0; j < Na; j++) {
        if (S_padded[i][j] > 0) {
          // Plant -> animal
          const denom_p = plant_S_row_sum[i];
          if (denom_p > 0) {
            Y[i][Np + j] += d * S_padded[i][j] / Math.sqrt(denom_p);
          }
          // Animal -> plant
          const denom_a = animal_S_col_sum[j];
          if (denom_a > 0) {
            Y[Np + j][i] += d * S_padded[i][j] / Math.sqrt(denom_a);
          }
        }
      }
    }
  }
  
  // Split into mutualistic and competitive matrices
  const Y_mut = Y.map(row => row.map(val => Math.max(0, val)));
  const Y_comp = Y.map(row => row.map(val => Math.min(0, val)));
  
  return { Y_mut, Y_comp, nSpecies: Nt };
}

/**
 * Pad matrix to target dimensions with zeros
 */
function padMatrix(
  matrix: number[][] | null,
  targetRows: number,
  targetCols: number
): number[][] | null {
  if (!matrix) return null;
  
  const padded: number[][] = [];
  for (let i = 0; i < targetRows; i++) {
    const row: number[] = [];
    for (let j = 0; j < targetCols; j++) {
      if (i < matrix.length && j < matrix[0].length) {
        row.push(matrix[i][j]);
      } else {
        row.push(0);
      }
    }
    padded.push(row);
  }
  
  return padded;
}

/**
 * Get network statistics for display
 */
export function getNetworkStats(network: BipartiteNetwork): {
  nPlants: number;
  nAnimals: number;
  nTotal: number;
  nPollinationLinks: number;
  nDispersalLinks: number;
} {
  let nPlants = 0;
  let nAnimals = 0;
  let nPollinationLinks = 0;
  let nDispersalLinks = 0;
  
  if (network.B) {
    nPlants = Math.max(nPlants, network.B.length);
    nAnimals = Math.max(nAnimals, network.B[0].length);
    for (const row of network.B) {
      nPollinationLinks += row.filter(v => v > 0).length;
    }
  }
  
  if (network.S) {
    nPlants = Math.max(nPlants, network.S.length);
    nAnimals = Math.max(nAnimals, network.S[0].length);
    for (const row of network.S) {
      nDispersalLinks += row.filter(v => v > 0).length;
    }
  }
  
  return {
    nPlants,
    nAnimals,
    nTotal: nPlants + nAnimals,
    nPollinationLinks,
    nDispersalLinks
  };
}

