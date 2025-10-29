# Comprehensive Customization Tutorial

This tutorial will guide you through customizing the Hazard Islands application, from simple text changes to advanced modifications of the simulation logic.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Basic Customizations](#basic-customizations)
4. [Visual Customizations](#visual-customizations)
5. [Simulation Parameters](#simulation-parameters)
6. [Advanced Modifications](#advanced-modifications)
7. [Testing Your Changes](#testing-your-changes)
8. [Deploying Updates](#deploying-updates)

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 20+** installed ([Download here](https://nodejs.org/))
- **pnpm** package manager installed (`npm install -g pnpm`)
- A code editor (recommended: [VS Code](https://code.visualstudio.com/))
- Basic knowledge of HTML, CSS, and JavaScript (helpful but not required for simple changes)

---

## Project Structure Overview

The project is organized as follows:

```
lotka-volterra-sim/
├── client/                    # Frontend application
│   ├── public/               # Static files
│   │   └── 404.html         # GitHub Pages routing fix
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui components (buttons, cards, etc.)
│   │   │   ├── NetworkVisualization.tsx    # Bipartite network display
│   │   │   └── SimulationChart.tsx         # Population dynamics chart
│   │   ├── contexts/       # React contexts (theme, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Core logic
│   │   │   ├── simulation.ts    # ODE solver and simulation engine
│   │   │   └── utils.ts         # Utility functions
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx         # Main application page
│   │   │   └── NotFound.tsx     # 404 page
│   │   ├── App.tsx         # Main app component with routing
│   │   ├── main.tsx        # Application entry point
│   │   └── index.css       # Global styles and theme
│   ├── index.html          # HTML template
│   └── package.json        # Dependencies
├── shared/                 # Shared constants
│   └── const.ts           # App title, logo, etc.
├── vite.config.ts         # Build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── README.md              # Project documentation
```

---

## Basic Customizations

### 1. Changing the Page Title

**Problem:** The title shows as `%VITE_APP_TITLE%` instead of a proper name.

**Solution:** The title is defined in `shared/const.ts`. Edit this file:

```typescript
// File: shared/const.ts

export const APP_TITLE = "Hazard Islands Simulator";  // Change this!
export const APP_LOGO = "/logo.png";
```

**Example changes:**
- `"My Ecological Simulator"`
- `"Island Dynamics Lab"`
- `"Mutualistic Network Explorer"`

**Where it appears:**
- Browser tab title
- Page header (if displayed)
- Meta tags for SEO

---

### 2. Changing the Main Heading

The main heading "Lotka-Volterra Mutualistic Dynamics" is in the Home page component.

**File:** `client/src/pages/Home.tsx`

**Find this section (around line 200-210):**

```tsx
<div className="text-center mb-6">
  <h1 className="text-3xl font-bold mb-2">
    Lotka-Volterra Mutualistic Dynamics
  </h1>
  <p className="text-sm text-muted-foreground">
    Type II functional response with hurricane perturbations
  </p>
</div>
```

**Change to:**

```tsx
<div className="text-center mb-6">
  <h1 className="text-3xl font-bold mb-2">
    Your Custom Title Here
  </h1>
  <p className="text-sm text-muted-foreground">
    Your custom subtitle or description
  </p>
</div>
```

**Examples:**
- Title: `"Island Ecosystem Simulator"`
- Subtitle: `"Modeling plant-animal interactions under environmental stress"`

---

### 3. Changing Colors and Theme

The application uses a light theme by default. Colors are defined in two places:

#### A. Global Theme Colors

**File:** `client/src/index.css`

**Find the `:root` section:**

```css
:root {
  --background: oklch(1 0 0);           /* White background */
  --foreground: oklch(0.145 0 0);       /* Dark text */
  --primary: oklch(0.402 0.194 255.5);  /* Blue accent */
  /* ... more colors ... */
}
```

**Common changes:**

**For a darker theme:**
```css
:root {
  --background: oklch(0.15 0 0);        /* Dark background */
  --foreground: oklch(0.98 0 0);        /* Light text */
}
```

**For different accent colors:**
```css
--primary: oklch(0.55 0.22 142);        /* Green accent */
--primary: oklch(0.50 0.24 28);         /* Orange accent */
--primary: oklch(0.45 0.26 328);        /* Purple accent */
```

#### B. Network Visualization Colors

**File:** `client/src/components/NetworkVisualization.tsx`

**Find these color definitions (around line 80-90):**

```typescript
// Plant nodes (left side)
ctx.fillStyle = isExtinct ? '#cccccc' : '#22c55e';  // Green

// Animal nodes (right side)  
ctx.fillStyle = isExtinct ? '#cccccc' : '#f97316';  // Orange

// Pollination links
ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';  // Blue

// Seed dispersal links
ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';  // Purple
```

**Example changes:**

```typescript
// Make plants blue and animals green
ctx.fillStyle = isExtinct ? '#cccccc' : '#3b82f6';  // Blue plants
ctx.fillStyle = isExtinct ? '#cccccc' : '#10b981';  // Green animals

// Change link colors
ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';   // Red for pollination
ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';   // Green for dispersal
```

---

### 4. Changing Default Network

The application starts with a default 3x3 network. To change it:

**File:** `client/src/pages/Home.tsx`

**Find the `defaultNetworks` object (around line 40-60):**

```typescript
const defaultNetworks = {
  B: [
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
  ],
  S: [
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
  ],
};
```

**Example: Create a 4x4 network:**

```typescript
const defaultNetworks = {
  B: [
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
  ],
  S: [
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
  ],
};
```

**Rules:**
- Rows = number of plant species
- Columns = number of animal species
- `1` = interaction exists, `0` = no interaction
- You can use decimal values (e.g., `0.5`) for interaction strength

---

## Visual Customizations

### 5. Adjusting Layout

The application uses a 3-column layout. To modify:

**File:** `client/src/pages/Home.tsx`

**Find the main grid (around line 180):**

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_320px] gap-6">
  {/* Left sidebar: 350px */}
  {/* Center: flexible */}
  {/* Right sidebar: 320px */}
</div>
```

**Make sidebars wider:**

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr_400px] gap-6">
```

**Make center column wider (narrower sidebars):**

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6">
```

---

### 6. Customizing the Population Chart

**File:** `client/src/components/SimulationChart.tsx`

#### Change chart colors:

**Find the color generation (around line 100):**

```typescript
const hue = (i * 360) / totalSpecies;
const color = `hsl(${hue}, 70%, 50%)`;
```

**Use specific colors instead:**

```typescript
const colors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
];
const color = colors[i % colors.length];
```

#### Change chart height:

**Find the canvas element (around line 200):**

```tsx
<canvas
  ref={canvasRef}
  width={800}
  height={400}  // Change this value
  className="w-full h-auto"
/>
```

---

### 7. Modifying Hurricane Legend

**File:** `client/src/pages/Home.tsx`

**Find the hurricane legend (around line 220-250):**

```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-yellow-400" />
    <span className="text-xs">Cat 1 (Minimal)</span>
  </div>
  {/* ... more categories ... */}
</div>
```

**Change colors:**

```tsx
<div className="w-3 h-3 rounded-full bg-blue-400" />  {/* Change color */}
```

**Change labels:**

```tsx
<span className="text-xs">Category 1 - Light Storm</span>
```

---

## Simulation Parameters

### 8. Changing Default Parameter Values

**File:** `client/src/pages/Home.tsx`

**Find the `useState` declarations (around line 70-90):**

```typescript
const [pollinationStrength, setPollinationStrength] = useState(0.5);
const [dispersalStrength, setDispersalStrength] = useState(0.5);
const [competitionStrength, setCompetitionStrength] = useState(0.1);
const [halfSaturation, setHalfSaturation] = useState(1.0);
const [hurricaneRate, setHurricaneRate] = useState(0.05);
const [simulationSpeed, setSimulationSpeed] = useState(1);
```

**Example changes:**

```typescript
const [pollinationStrength, setPollinationStrength] = useState(0.8);  // Stronger
const [competitionStrength, setCompetitionStrength] = useState(0.05); // Weaker
const [simulationSpeed, setSimulationSpeed] = useState(2);            // Faster
```

---

### 9. Adjusting Parameter Ranges

**File:** `client/src/pages/Home.tsx`

**Find the slider components (around line 400-500):**

```tsx
<Slider
  value={[pollinationStrength]}
  onValueChange={(v) => setPollinationStrength(v[0])}
  min={0}      // Minimum value
  max={2}      // Maximum value
  step={0.1}   // Step size
/>
```

**Example: Allow higher pollination strength:**

```tsx
<Slider
  value={[pollinationStrength]}
  onValueChange={(v) => setPollinationStrength(v[0])}
  min={0}
  max={5}      // Increased from 2
  step={0.1}
/>
```

---

### 10. Modifying Hurricane Categories

**File:** `client/src/pages/Home.tsx`

**Find hurricane probabilities (around line 100-110):**

```typescript
const [cat1Prob, setCat1Prob] = useState(0.4);
const [cat2Prob, setCat2Prob] = useState(0.3);
const [cat3Prob, setCat3Prob] = useState(0.2);
const [cat4Prob, setCat4Prob] = useState(0.08);
const [cat5Prob, setCat5Prob] = useState(0.02);
```

**Example: Make stronger hurricanes more common:**

```typescript
const [cat1Prob, setCat1Prob] = useState(0.2);   // Less frequent
const [cat2Prob, setCat2Prob] = useState(0.2);
const [cat3Prob, setCat3Prob] = useState(0.3);
const [cat4Prob, setCat4Prob] = useState(0.2);
const [cat5Prob, setCat5Prob] = useState(0.1);   // More frequent
```

---

## Advanced Modifications

### 11. Changing the Simulation Equation

The core simulation logic is in `client/src/lib/simulation.ts`.

**File:** `client/src/lib/simulation.ts`

**Find the ODE function (around line 150-200):**

```typescript
function ode(N: number[], params: SimulationParams): number[] {
  const dN = new Array(N.length).fill(0);
  
  for (let i = 0; i < N.length; i++) {
    if (N[i] <= 0) {
      dN[i] = 0;
      continue;
    }

    // Intrinsic growth rate
    let growth = params.r[i];
    
    // Self-limitation (competition)
    growth -= N[i];
    
    // Competition with other species
    for (let j = 0; j < N.length; j++) {
      if (i !== j) {
        growth -= params.competitionStrength * params.Y_comp[i][j] * N[j];
      }
    }
    
    // Mutualistic interactions (Type II functional response)
    let mutualismSum = 0;
    for (let j = 0; j < N.length; j++) {
      mutualismSum += params.Y_mut[i][j] * N[j];
    }
    const mutualism = mutualismSum / (1 + params.halfSaturation * mutualismSum);
    growth += mutualism;
    
    dN[i] = N[i] * growth;
  }
  
  return dN;
}
```

**Example modifications:**

#### Add Allee effect (minimum viable population):

```typescript
// After the intrinsic growth rate line, add:
const alleeThreshold = 0.1;
if (N[i] < alleeThreshold) {
  growth -= 0.5; // Negative growth below threshold
}
```

#### Change to Type III functional response:

```typescript
// Replace the mutualism calculation with:
let mutualismSum = 0;
for (let j = 0; j < N.length; j++) {
  const interaction = params.Y_mut[i][j] * N[j] * N[j]; // Squared for Type III
  mutualismSum += interaction;
}
const mutualism = mutualismSum / (1 + params.halfSaturation * mutualismSum);
growth += mutualism;
```

---

### 12. Modifying Hurricane Impact

**File:** `client/src/lib/simulation.ts`

**Find the `applyHurricane` function (around line 250):**

```typescript
export function applyHurricane(
  populations: number[],
  category: number
): number[] {
  const mortalityRates = [0, 0.3, 0.5, 0.7, 0.85, 0.95];
  const mortality = mortalityRates[category];
  
  return populations.map(p => p * (1 - mortality));
}
```

**Example: Make hurricanes affect species differently:**

```typescript
export function applyHurricane(
  populations: number[],
  category: number,
  isPlant: boolean[] // Add this parameter
): number[] {
  const mortalityRates = [0, 0.3, 0.5, 0.7, 0.85, 0.95];
  const mortality = mortalityRates[category];
  
  return populations.map((p, i) => {
    // Plants are more resistant to hurricanes
    const adjustedMortality = isPlant[i] ? mortality * 0.5 : mortality;
    return p * (1 - adjustedMortality);
  });
}
```

---

### 13. Adding New Features

#### Example: Add a "Reset to Default" button

**File:** `client/src/pages/Home.tsx`

**Add this function (around line 150):**

```typescript
const resetToDefaults = () => {
  setPollinationStrength(0.5);
  setDispersalStrength(0.5);
  setCompetitionStrength(0.1);
  setHalfSaturation(1.0);
  setHurricaneRate(0.05);
  setSimulationSpeed(1);
  setCat1Prob(0.4);
  setCat2Prob(0.3);
  setCat3Prob(0.2);
  setCat4Prob(0.08);
  setCat5Prob(0.02);
};
```

**Add the button in the UI (around line 300):**

```tsx
<Button onClick={resetToDefaults} variant="outline" className="w-full">
  Reset to Defaults
</Button>
```

---

## Testing Your Changes

### Local Development

1. **Install dependencies** (first time only):
   ```bash
   cd lotka-volterra-sim
   pnpm install
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:3000`
   - The page will automatically reload when you save changes

4. **Check for errors**:
   - Look at the terminal for error messages
   - Open browser console (F12) for JavaScript errors

### Building for Production

Before deploying, test the production build:

```bash
pnpm build
pnpm preview
```

This will build the app and serve it at `http://localhost:4173/hazard_islands/`

---

## Deploying Updates

### To GitHub Pages

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

2. **Push to GitHub**:
   ```bash
   git push
   ```

3. **Wait for deployment**:
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Wait for the green checkmark (2-5 minutes)

4. **View your changes**:
   - Visit `https://lgcosmo.github.io/hazard_islands/`
   - Clear browser cache if needed (Ctrl+Shift+R)

---

## Common Issues and Solutions

### Issue: Changes don't appear after deployment

**Solution:**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes for CDN to update
- Check GitHub Actions for build errors

### Issue: TypeScript errors

**Solution:**
- Make sure variable types match
- If you see red squiggly lines in VS Code, hover over them for hints
- Run `pnpm build` to check for errors before deploying

### Issue: Simulation doesn't run

**Solution:**
- Check browser console (F12) for errors
- Make sure all parameters are valid numbers
- Check that network matrices are properly formatted

### Issue: Page is blank

**Solution:**
- Check that `vite.config.ts` has correct `base` path
- Make sure all imports are correct
- Check browser console for errors

---

## Additional Resources

- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite Guide**: https://vitejs.dev/guide/

---

## Need Help?

If you get stuck:

1. Check the browser console (F12) for error messages
2. Check the terminal where you ran `pnpm dev` for build errors
3. Make sure all syntax is correct (matching brackets, semicolons, etc.)
4. Try reverting your changes and applying them one at a time

---

## Quick Reference: File Locations

| What to Change | File Location |
|----------------|---------------|
| App title | `shared/const.ts` |
| Main heading | `client/src/pages/Home.tsx` (line ~205) |
| Theme colors | `client/src/index.css` (line ~10-30) |
| Network colors | `client/src/components/NetworkVisualization.tsx` (line ~80-90) |
| Default network | `client/src/pages/Home.tsx` (line ~40-60) |
| Default parameters | `client/src/pages/Home.tsx` (line ~70-90) |
| Parameter ranges | `client/src/pages/Home.tsx` (line ~400-500) |
| Simulation equation | `client/src/lib/simulation.ts` (line ~150-200) |
| Hurricane impact | `client/src/lib/simulation.ts` (line ~250) |
| Chart colors | `client/src/components/SimulationChart.tsx` (line ~100) |

---

Happy customizing! 🎨🔬

