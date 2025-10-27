/**
 * Runge-Kutta 4th order ODE solver
 */

export type ODEFunction = (t: number, y: number[], params: any) => number[];

/**
 * Single step of RK4 solver
 * @param f - ODE function dy/dt = f(t, y, params)
 * @param t - Current time
 * @param y - Current state vector
 * @param dt - Time step
 * @param params - Additional parameters for the ODE
 * @returns Next state vector
 */
export function rk4Step(
  f: ODEFunction,
  t: number,
  y: number[],
  dt: number,
  params: any
): number[] {
  const k1 = f(t, y, params);
  
  const y2 = y.map((yi, i) => yi + (dt / 2) * k1[i]);
  const k2 = f(t + dt / 2, y2, params);
  
  const y3 = y.map((yi, i) => yi + (dt / 2) * k2[i]);
  const k3 = f(t + dt / 2, y3, params);
  
  const y4 = y.map((yi, i) => yi + dt * k3[i]);
  const k4 = f(t + dt, y4, params);
  
  return y.map((yi, i) => 
    yi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])
  );
}

/**
 * Solve ODE from t0 to t1 with fixed time step
 * @param f - ODE function
 * @param y0 - Initial state
 * @param t0 - Start time
 * @param t1 - End time
 * @param dt - Time step
 * @param params - Additional parameters
 * @returns Array of [time, state] pairs
 */
export function solveODE(
  f: ODEFunction,
  y0: number[],
  t0: number,
  t1: number,
  dt: number,
  params: any
): Array<{ t: number; y: number[] }> {
  const solution: Array<{ t: number; y: number[] }> = [];
  let t = t0;
  let y = [...y0];
  
  solution.push({ t, y: [...y] });
  
  while (t < t1) {
    const step = Math.min(dt, t1 - t);
    y = rk4Step(f, t, y, step, params);
    t += step;
    solution.push({ t, y: [...y] });
  }
  
  return solution;
}

