# Lotka-Volterra Mutualistic Dynamics Simulator

An interactive web application that simulates population dynamics using a Lotka-Volterra model with mutualistic interactions (Type II functional response) and stochastic natural hazard events (hurricanes).

## Features

- **Real-time animated simulation** of population dynamics
- **Interactive controls** for all model parameters:
  - Mutualistic strength
  - Competition strength
  - Half-saturation constant (Type II functional response)
  - Hurricane frequency and intensity distribution
- **Visual representation** with color-coded species and hurricane event markers
- **Extinction tracking** with automatic detection
- **Adjustable simulation speed** for detailed observation

## Model Description

The simulation implements the Lotka-Volterra equations with:

**dN[i]/dt = N[i] × (r[i] - N[i] + comp_sum[i] + M[i])**

Where:
- **N[i]**: Population size of species i
- **r[i]**: Intrinsic growth rate
- **M[i]**: Mutualistic benefit with Type II functional response: M[i] = (Y_mut × N)[i] / (1 + h × (Y_mut × N)[i])
- **comp_sum[i]**: Competitive effects from other species
- **h**: Half-saturation constant

Hurricane events occur stochastically (exponential distribution) and reduce populations by a damage fraction based on category.

## Setup Instructions

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm

### Installation

1. Extract the project files to a directory
2. Open a terminal in the project directory
3. Install dependencies:

```bash
pnpm install
```

Or if using npm:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Building for Production

To create a production build:

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Usage

1. **Adjust parameters** using the sliders in the control panel
2. **Click "Start"** to begin the simulation
3. **Watch** the population dynamics unfold in real-time
4. **Pause** at any time to examine the current state
5. **Reset** to return to initial conditions with new random populations
6. **Change species count** (3-5 species) to explore different network sizes

## Parameter Guide

### Ecological Parameters

- **Mutualistic Strength (m)**: Controls how strongly species help each other. Higher values = stronger mutualism.
- **Competition Strength (c)**: Negative values represent competition. More negative = stronger competition.
- **Half-Saturation (h)**: Controls the saturation of mutualistic benefits. Higher values = slower saturation.

### Hurricane Parameters

- **Hurricane Rate (λ)**: Average number of hurricanes per year. 0.05 = 1 hurricane every 20 years on average.
- **Category Probabilities**: Relative likelihood of each hurricane category (automatically normalized).
- **Category Damage**: Fraction of population lost during a hurricane of that category.

## Technical Details

### Core Components

- **ODE Solver**: Runge-Kutta 4th order (RK4) method
- **Event-Driven Simulation**: Exponentially distributed hurricane events
- **Visualization**: Custom Canvas-based rendering for smooth animations
- **UI Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components

### Project Structure

```
client/
  src/
    lib/
      odeSolver.ts          # RK4 ODE solver
      ecologyModel.ts       # Lotka-Volterra dynamics
      simulationEngine.ts   # Event-driven simulation
    components/
      ControlPanel.tsx      # Parameter controls
      SimulationChart.tsx   # Canvas visualization
      SimulationStatus.tsx  # Status display
    pages/
      Home.tsx              # Main application
```

## License

This project is provided as-is for educational and research purposes.

## Acknowledgments

Based on the Julia implementation of Lotka-Volterra mutualistic dynamics with Type II functional response and stochastic perturbations.

