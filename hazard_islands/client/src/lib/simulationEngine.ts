/**
 * Event-driven simulation engine with hurricane perturbations
 */

import { solveODE, ODEFunction } from './odeSolver';
import { EcologyParams } from './ecologyModel';

export interface HurricaneCategory {
  name: string;
  probability: number;
  damage: number;
}

export interface SimulationConfig {
  hurricaneRate: number;           // Lambda: average hurricanes per year
  hurricaneCategories: HurricaneCategory[];
  extinctionThreshold: number;     // Fraction of initial population
  timeStep: number;                // ODE solver time step
}

export interface HurricaneEvent {
  time: number;
  category: string;
  damage: number;
}

export interface SimulationState {
  time: number;
  populations: number[];
  hurricanes: HurricaneEvent[];
  extinctSpecies: Set<number>;
  history: Array<{ t: number; y: number[] }>;
}

/**
 * Generate random number from exponential distribution
 */
function randomExponential(lambda: number): number {
  return -Math.log(1 - Math.random()) / lambda;
}

/**
 * Draw hurricane damage from probability mass function
 */
function drawHurricaneDamage(categories: HurricaneCategory[]): {
  category: string;
  damage: number;
} {
  const rand = Math.random();
  let cumProb = 0;
  
  for (const cat of categories) {
    cumProb += cat.probability;
    if (rand <= cumProb) {
      return { category: cat.name, damage: cat.damage };
    }
  }
  
  // Fallback to last category
  const last = categories[categories.length - 1];
  return { category: last.name, damage: last.damage };
}

/**
 * Simulation engine class
 */
export class SimulationEngine {
  private odeFunction: ODEFunction;
  private ecologyParams: EcologyParams;
  private config: SimulationConfig;
  private state: SimulationState;
  private initialPopulations: number[];
  private extinctionThresholds: number[];

  constructor(
    odeFunction: ODEFunction,
    ecologyParams: EcologyParams,
    initialPopulations: number[],
    config: SimulationConfig
  ) {
    this.odeFunction = odeFunction;
    this.ecologyParams = ecologyParams;
    this.config = config;
    this.initialPopulations = [...initialPopulations];
    
    // Calculate extinction thresholds
    this.extinctionThresholds = initialPopulations.map(
      pop => pop * config.extinctionThreshold
    );
    
    // Initialize state
    this.state = {
      time: 0,
      populations: [...initialPopulations],
      hurricanes: [],
      extinctSpecies: new Set(),
      history: [{ t: 0, y: [...initialPopulations] }]
    };
  }

  /**
   * Reset simulation to initial conditions
   */
  reset(initialPopulations?: number[]): void {
    if (initialPopulations) {
      this.initialPopulations = [...initialPopulations];
      this.extinctionThresholds = initialPopulations.map(
        pop => pop * this.config.extinctionThreshold
      );
    }
    
    this.state = {
      time: 0,
      populations: [...this.initialPopulations],
      hurricanes: [],
      extinctSpecies: new Set(),
      history: [{ t: 0, y: [...this.initialPopulations] }]
    };
  }

  /**
   * Update model parameters
   */
  updateParams(ecologyParams: EcologyParams): void {
    this.ecologyParams = ecologyParams;
  }

  /**
   * Update simulation configuration
   */
  updateConfig(config: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Step simulation forward by a given duration
   * Returns the next hurricane time if one occurs, or null
   */
  step(duration: number): number | null {
    const { hurricaneRate, hurricaneCategories, timeStep } = this.config;
    const startTime = this.state.time;
    const endTime = startTime + duration;
    
    // Generate next hurricane time
    let nextHurricaneTime: number | null = null;
    if (hurricaneRate > 0) {
      const timeToNext = randomExponential(hurricaneRate);
      nextHurricaneTime = startTime + timeToNext;
      
      // Only consider if within this step
      if (nextHurricaneTime > endTime) {
        nextHurricaneTime = null;
      }
    }
    
    // Determine actual end time for this step
    const actualEndTime = nextHurricaneTime ?? endTime;
    
    // Solve ODE from current time to actual end time
    if (actualEndTime > startTime) {
      const solution = solveODE(
        this.odeFunction,
        this.state.populations,
        startTime,
        actualEndTime,
        timeStep,
        this.ecologyParams
      );
      
      // Add solution to history (skip first point as it's already in history)
      for (let i = 1; i < solution.length; i++) {
        this.state.history.push(solution[i]);
      }
      
      // Update current state
      this.state.time = actualEndTime;
      this.state.populations = [...solution[solution.length - 1].y];
    }
    
    // Apply hurricane if it occurred
    if (nextHurricaneTime !== null) {
      const { category, damage } = drawHurricaneDamage(hurricaneCategories);
      
      // Record hurricane event
      this.state.hurricanes.push({
        time: nextHurricaneTime,
        category,
        damage
      });
      
      // Apply damage to populations
      this.state.populations = this.state.populations.map((pop, i) => {
        const newPop = pop * (1 - damage);
        
        // Check for extinction
        if (newPop < this.extinctionThresholds[i]) {
          this.state.extinctSpecies.add(i);
          return 0;
        }
        
        return newPop;
      });
      
      // Add post-hurricane state to history
      this.state.history.push({
        t: nextHurricaneTime,
        y: [...this.state.populations]
      });
    }
    
    return nextHurricaneTime;
  }

  /**
   * Get current simulation state
   */
  getState(): SimulationState {
    return {
      ...this.state,
      populations: [...this.state.populations],
      hurricanes: [...this.state.hurricanes],
      extinctSpecies: new Set(this.state.extinctSpecies),
      history: this.state.history.map(h => ({ ...h, y: [...h.y] }))
    };
  }

  /**
   * Get current time
   */
  getTime(): number {
    return this.state.time;
  }

  /**
   * Get current populations
   */
  getPopulations(): number[] {
    return [...this.state.populations];
  }

  /**
   * Get hurricane events
   */
  getHurricanes(): HurricaneEvent[] {
    return [...this.state.hurricanes];
  }
}

