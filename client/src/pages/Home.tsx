import { useState, useRef, useEffect, useCallback } from 'react';
import ControlPanel, { ControlParams } from '@/components/ControlPanel';
import SimulationChart from '@/components/SimulationChart';
import SimulationStatus from '@/components/SimulationStatus';
import NetworkUpload from '@/components/NetworkUpload';
import NetworkVisualization from '@/components/NetworkVisualization';
import { SimulationEngine, HurricaneCategory } from '@/lib/simulationEngine';
import { ecoDynamicsTypeII, createEcologyParams, ModelConfig } from '@/lib/ecologyModel';
import { BipartiteNetwork, buildInteractionMatrix } from '@/lib/networkBuilder';
import { generateDefaultNetwork } from '@/lib/defaultNetwork';

export default function Home() {
  // Control parameters
  const [params, setParams] = useState<ControlParams>({
    nSpecies: 4,
    mutualisticStrength: 0.5,
    dispersalStrength: 0.5,
    competitionStrength: -0.1,
    halfSaturation: 0.5,
    hurricaneRate: 0.05,
    cat1Prob: 0.6,
    cat1Damage: 0.1,
    cat2Prob: 0.3,
    cat2Damage: 0.5,
    cat3Prob: 0.1,
    cat3Damage: 0.8,
    simulationSpeed: 1.0
  });

  const [customNetwork, setCustomNetwork] = useState<BipartiteNetwork>(() => generateDefaultNetwork());
  const [useCustomNetwork, setUseCustomNetwork] = useState(true); // Start with default network

  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [populations, setPopulations] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{ t: number; y: number[] }>>([]);
  const [hurricanes, setHurricanes] = useState<any[]>([]);
  const [extinctSpecies, setExtinctSpecies] = useState<Set<number>>(new Set());
  const [actualNSpecies, setActualNSpecies] = useState<number>(9); // Track actual species count
  const [networkVersion, setNetworkVersion] = useState<number>(0); // Force re-init on network change

  const engineRef = useRef<SimulationEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize simulation engine
  const initializeEngine = useCallback(() => {
    let modelConfig: ModelConfig;
    
    if (useCustomNetwork && customNetwork) {
      // Build interaction matrices from uploaded network
      const { Y_mut, Y_comp, nSpecies } = buildInteractionMatrix(
        customNetwork,
        {
          m: params.mutualisticStrength,
          d: params.dispersalStrength,
          c: params.competitionStrength
        }
      );
      
      modelConfig = {
        nSpecies,
        mutualisticStrength: params.mutualisticStrength,
        dispersalStrength: params.dispersalStrength,
        competitionStrength: params.competitionStrength,
        halfSaturation: params.halfSaturation,
        customNetwork: { Y_mut, Y_comp }
      };
    } else {
      // Use random network
      modelConfig = {
        nSpecies: params.nSpecies,
        mutualisticStrength: params.mutualisticStrength,
        dispersalStrength: params.dispersalStrength,
        competitionStrength: params.competitionStrength,
        halfSaturation: params.halfSaturation
      };
    }

    const { params: ecologyParams, initialPopulation } = createEcologyParams(modelConfig);
    
    // Update actual species count
    setActualNSpecies(modelConfig.nSpecies);

    // Normalize hurricane probabilities
    const totalProb = params.cat1Prob + params.cat2Prob + params.cat3Prob;
    const hurricaneCategories: HurricaneCategory[] = [
      {
        name: 'Category 1',
        probability: totalProb > 0 ? params.cat1Prob / totalProb : 0.33,
        damage: params.cat1Damage
      },
      {
        name: 'Category 2',
        probability: totalProb > 0 ? params.cat2Prob / totalProb : 0.33,
        damage: params.cat2Damage
      },
      {
        name: 'Category 3',
        probability: totalProb > 0 ? params.cat3Prob / totalProb : 0.34,
        damage: params.cat3Damage
      }
    ];

    const engine = new SimulationEngine(
      ecoDynamicsTypeII,
      ecologyParams,
      initialPopulation,
      {
        hurricaneRate: params.hurricaneRate,
        hurricaneCategories,
        extinctionThreshold: 0.01,
        timeStep: 0.01
      }
    );

    engineRef.current = engine;

    // Update state with initial values
    const state = engine.getState();
    setCurrentTime(state.time);
    setPopulations(state.populations);
    setHistory(state.history);
    setHurricanes(state.hurricanes);
    setExtinctSpecies(state.extinctSpecies);
  }, [params, useCustomNetwork, networkVersion]); // customNetwork removed - tracked by networkVersion

  // Initialize on mount and when key parameters change
  useEffect(() => {
    initializeEngine();
  }, [initializeEngine]);

  const handleNetworkLoaded = (network: BipartiteNetwork) => {
    setCustomNetwork(network);
    setUseCustomNetwork(true);
    setIsRunning(false);
    lastTimeRef.current = 0;
    setNetworkVersion(prev => prev + 1); // Force re-initialization
  };

  const handleClearNetwork = () => {
    setCustomNetwork(generateDefaultNetwork());
    setUseCustomNetwork(true); // Go back to default network
    setIsRunning(false);
    lastTimeRef.current = 0;
    setNetworkVersion(prev => prev + 1); // Force re-initialization
  };

  // Animation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = timestamp;

      // Step simulation based on speed (divided by 5 to slow down base speed)
      const steps = Math.max(1, Math.floor(params.simulationSpeed * 2));
      for (let i = 0; i < steps; i++) {
        engineRef.current?.step(0.01);
      }

      // Update state
      if (engineRef.current) {
        const state = engineRef.current.getState();
        setCurrentTime(state.time);
        setPopulations(state.populations);
        setHistory(state.history);
        setHurricanes(state.hurricanes);
        setExtinctSpecies(state.extinctSpecies);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, params.simulationSpeed]);

  const handleParamChange = (param: keyof ControlParams, value: number) => {
    setParams(prev => {
      // Auto-adjust hurricane probabilities to sum to 1
      if (param === 'cat1Prob' || param === 'cat2Prob' || param === 'cat3Prob') {
        const newParams = { ...prev, [param]: value };
        
        // Calculate remaining probability for other categories
        const remaining = 1 - value;
        
        if (param === 'cat1Prob') {
          // Distribute remaining between cat2 and cat3 proportionally
          const total = prev.cat2Prob + prev.cat3Prob;
          if (total > 0) {
            newParams.cat2Prob = (prev.cat2Prob / total) * remaining;
            newParams.cat3Prob = (prev.cat3Prob / total) * remaining;
          } else {
            newParams.cat2Prob = remaining / 2;
            newParams.cat3Prob = remaining / 2;
          }
        } else if (param === 'cat2Prob') {
          // Distribute remaining between cat1 and cat3 proportionally
          const total = prev.cat1Prob + prev.cat3Prob;
          if (total > 0) {
            newParams.cat1Prob = (prev.cat1Prob / total) * remaining;
            newParams.cat3Prob = (prev.cat3Prob / total) * remaining;
          } else {
            newParams.cat1Prob = remaining / 2;
            newParams.cat3Prob = remaining / 2;
          }
        } else if (param === 'cat3Prob') {
          // Distribute remaining between cat1 and cat2 proportionally
          const total = prev.cat1Prob + prev.cat2Prob;
          if (total > 0) {
            newParams.cat1Prob = (prev.cat1Prob / total) * remaining;
            newParams.cat2Prob = (prev.cat2Prob / total) * remaining;
          } else {
            newParams.cat1Prob = remaining / 2;
            newParams.cat2Prob = remaining / 2;
          }
        }
        
        return newParams;
      }
      
      return { ...prev, [param]: value };
    });
  };

  const handleStart = () => {
    setIsRunning(true);
    lastTimeRef.current = 0;
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    lastTimeRef.current = 0;
    initializeEngine();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lotka-Volterra Mutualistic Dynamics
          </h1>
          <p className="text-lg text-gray-600">
            Interactive simulation with Type II functional response and natural hazards
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left sidebar - Network Upload & Controls */}
          <div className="lg:col-span-3 space-y-4">
            <NetworkUpload
              onNetworkLoaded={handleNetworkLoaded}
              onClear={handleClearNetwork}
            />
            
            {/* Simulation Controls */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-3">Simulation Controls</h3>
              <div className="flex gap-2 mb-3">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
                >
                  Reset
                </button>
              </div>
              
              {useCustomNetwork && (
                <div className="text-sm text-green-700 bg-green-50 p-2 rounded mb-3">
                  ✓ Using custom network from uploaded matrices
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">
                  Simulation Speed: {params.simulationSpeed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={params.simulationSpeed}
                  onChange={(e) => handleParamChange('simulationSpeed', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Hurricane Legend */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-2">Hurricane Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌀</span>
                  <span className="text-gray-600">Hurricane event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-yellow-400" />
                  <span className="text-gray-600">Category 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-orange-500" />
                  <span className="text-gray-600">Category 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-red-600" />
                  <span className="text-gray-600">Category 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Visualizations */}
          <div className="lg:col-span-6 space-y-4">
            {/* Network Visualization */}
            {useCustomNetwork && customNetwork && (
              <div className="bg-white p-4 rounded-lg border shadow-lg">
                <h3 className="text-lg font-semibold mb-3">Network Structure</h3>
                <div className="w-full" style={{ height: '250px' }}>
                  <NetworkVisualization
                    network={customNetwork}
                    extinctSpecies={extinctSpecies}
                    populations={populations}
                  />
                </div>
              </div>
            )}
            
            {/* Chart */}
            <div className="bg-white p-4 rounded-lg border shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Population Dynamics</h3>
              <div className="w-full" style={{ height: '400px' }}>
                <SimulationChart
                  history={history}
                  hurricanes={hurricanes}
                  extinctSpecies={extinctSpecies}
                  nSpecies={actualNSpecies}
                />
              </div>
            </div>

            {/* Status */}
            <SimulationStatus
              currentTime={currentTime}
              hurricaneCount={hurricanes.length}
              extinctCount={extinctSpecies.size}
              nSpecies={actualNSpecies}
              populations={populations}
            />
          </div>

          {/* Right sidebar - Parameters */}
          <div className="lg:col-span-3">
            <ControlPanel
              params={params}
              onParamChange={handleParamChange}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              isRunning={isRunning}
              useCustomNetwork={useCustomNetwork}
            />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>
            This simulation implements a Lotka-Volterra model with mutualistic interactions
            (Type II functional response) and stochastic natural hazard events.
          </p>
        </footer>
      </div>
    </div>
  );
}

