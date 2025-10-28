interface SimulationStatusProps {
  currentTime: number;
  hurricaneCount: number;
  extinctCount: number;
  populations: number[];
  nSpecies: number;
}

const SPECIES_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function SimulationStatus({
  currentTime,
  hurricaneCount,
  extinctCount,
  populations,
  nSpecies
}: SimulationStatusProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">Current Time</div>
          <div className="text-2xl font-bold">{currentTime.toFixed(2)} years</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">Hurricanes</div>
          <div className="text-2xl font-bold">{hurricaneCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">Extinct Species</div>
          <div className="text-2xl font-bold text-red-600">{extinctCount} / {nSpecies}</div>
        </div>
      </div>

    </div>
  );
}

