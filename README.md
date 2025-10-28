# Hazard Islands - Lotka-Volterra Mutualistic Dynamics Simulator

Interactive simulation of population dynamics using a Lotka-Volterra model with mutualistic interactions (Type II functional response) and stochastic natural hazard events.

🌐 **Live Demo:** https://lgcosmo.github.io/hazard_islands/

## Features

- **Bipartite Network Visualization**: Display plant-animal interactions with pollination and seed dispersal
- **Custom Network Upload**: Load your own CSV files for pollination (B) and seed dispersal (S) matrices
- **Real-time Population Dynamics**: Animated visualization of species populations over time
- **Hurricane Perturbations**: Stochastic natural disaster events with adjustable rates and intensities
- **Extinction Tracking**: Visual indicators when species go extinct
- **Interactive Parameters**: Adjust ecological parameters in real-time:
  - Pollination and dispersal strength
  - Competition strength
  - Half-saturation constant
  - Hurricane rate and category probabilities
  - Simulation speed

## Model Description

The simulation implements a Lotka-Volterra model with:

- **Type II Functional Response**: Mutualistic interactions with saturation
- **Bipartite Network Structure**: Separate pollination and seed dispersal layers
- **Competition**: Intra-specific competition
- **Natural Hazards**: Periodic hurricane events that reduce population sizes

### Dynamics Equation

```
dN_i/dt = N_i * (r_i - N_i + Σ(competition) + Σ(mutualism))
```

Where mutualistic interactions follow Type II functional response:
```
M_i = Σ(Y_mut * N) / (1 + h * Σ(Y_mut * N))
```

## Network Format

Upload CSV files for custom networks:

- **Format**: Comma-separated values, no headers
- **Rows**: Plant species
- **Columns**: Animal species (pollinators or seed dispersers)
- **Values**: 0 for no interaction, positive values for interaction strength

### Example Network Files

Example CSV files are included:
- `example_network_B.csv` - Pollination interactions
- `example_network_S.csv` - Seed dispersal interactions

## Local Development

### Prerequisites

- Node.js 20+ 
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The app will be available at `http://localhost:3000`

## Deployment

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

Every push to the `main` branch triggers a build and deployment.

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Canvas API** - Visualizations
- **RK4 ODE Solver** - Numerical integration

## Project Structure

```
client/
  src/
    components/     # React components
    lib/           # Core simulation logic
    pages/         # Page components
    hooks/         # Custom React hooks
shared/           # Shared constants
```

## Citation

If you use this simulator in your research, please cite:

```bibtex
@software{hazard_islands,
  title = {Hazard Islands: Lotka-Volterra Mutualistic Dynamics Simulator},
  author = {Your Name},
  year = {2025},
  url = {https://github.com/lgcosmo/hazard_islands}
}
```

## License

MIT License - see LICENSE file for details

## Author

Developed by [lgcosmo](https://github.com/lgcosmo)
