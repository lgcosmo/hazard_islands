/**
 * Generate default multilayer bipartite network
 * 3 plants, 3 pollinators, 3 seed dispersers (total 6 animals)
 */

import { BipartiteNetwork } from './networkBuilder';

export function generateDefaultNetwork(): BipartiteNetwork {
  const nPlants = 3;
  const nAnimals = 6; // 3 pollinators + 3 seed dispersers
  
  // Initialize matrices
  const B: number[][] = Array(nPlants).fill(0).map(() => Array(nAnimals).fill(0));
  const S: number[][] = Array(nPlants).fill(0).map(() => Array(nAnimals).fill(0));
  
  // Pollination network (B) - connects plants to first 3 animals (pollinators)
  // Create a nested structure with some specialization
  B[0][0] = 1; // Plant 1 -> Pollinator 1
  B[0][1] = 1; // Plant 1 -> Pollinator 2
  B[1][1] = 1; // Plant 2 -> Pollinator 2
  B[1][2] = 1; // Plant 2 -> Pollinator 3
  B[2][0] = 1; // Plant 3 -> Pollinator 1
  B[2][2] = 1; // Plant 3 -> Pollinator 3
  
  // Seed dispersal network (S) - connects plants to last 3 animals (seed dispersers)
  // Create a different pattern for dispersal
  S[0][3] = 1; // Plant 1 -> Disperser 1
  S[0][4] = 1; // Plant 1 -> Disperser 2
  S[1][4] = 1; // Plant 2 -> Disperser 2
  S[1][5] = 1; // Plant 2 -> Disperser 3
  S[2][3] = 1; // Plant 3 -> Disperser 1
  S[2][5] = 1; // Plant 3 -> Disperser 3
  
  return { B, S };
}

/**
 * Check if a network is the default network
 */
export function isDefaultNetwork(network: BipartiteNetwork | null): boolean {
  if (!network || !network.B || !network.S) return false;
  
  const defaultNet = generateDefaultNetwork();
  
  // Simple check: compare dimensions
  if (!defaultNet.B) return false;
  if (network.B.length !== defaultNet.B.length) return false;
  if (network.B[0].length !== defaultNet.B[0].length) return false;
  
  return true;
}

