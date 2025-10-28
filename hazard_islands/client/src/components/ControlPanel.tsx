import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ControlParams {
  nSpecies: number;
  mutualisticStrength: number;
  dispersalStrength: number;
  competitionStrength: number;
  halfSaturation: number;
  hurricaneRate: number;
  cat1Prob: number;
  cat1Damage: number;
  cat2Prob: number;
  cat2Damage: number;
  cat3Prob: number;
  cat3Damage: number;
  simulationSpeed: number;
}

interface ControlPanelProps {
  params: ControlParams;
  onParamChange: (param: keyof ControlParams, value: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  useCustomNetwork?: boolean;
}

export default function ControlPanel({
  params,
  onParamChange,
  onStart,
  onPause,
  onReset,
  isRunning,
  useCustomNetwork = false
}: ControlPanelProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold">Parameters</h3>
      <div className="space-y-4">
        {!useCustomNetwork && (
          <div>
            <Label htmlFor="nSpecies">Number of Species</Label>
            <Select
              value={params.nSpecies.toString()}
              onValueChange={(value) => onParamChange('nSpecies', parseInt(value))}
            >
              <SelectTrigger id="nSpecies">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {useCustomNetwork && (
          <div className="text-sm bg-green-50 p-2 rounded border border-green-200 text-green-700">
            ✓ Using custom network from uploaded matrices
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-3">Ecological Parameters</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="mutStrength">
              Pollination Strength (m): {params.mutualisticStrength.toFixed(2)}
            </Label>
            <Slider
              id="mutStrength"
              min={0}
              max={2}
              step={0.05}
              value={[params.mutualisticStrength]}
              onValueChange={([value]) => onParamChange('mutualisticStrength', value)}
            />
          </div>

          <div>
            <Label htmlFor="dispStrength">
              Dispersal Strength (d): {params.dispersalStrength.toFixed(2)}
            </Label>
            <Slider
              id="dispStrength"
              min={0}
              max={2}
              step={0.05}
              value={[params.dispersalStrength]}
              onValueChange={([value]) => onParamChange('dispersalStrength', value)}
            />
          </div>

          <div>
            <Label htmlFor="compStrength">
              Competition Strength (c): {params.competitionStrength.toFixed(2)}
            </Label>
            <Slider
              id="compStrength"
              min={-2}
              max={0}
              step={0.05}
              value={[params.competitionStrength]}
              onValueChange={([value]) => onParamChange('competitionStrength', value)}
            />
          </div>

          <div>
            <Label htmlFor="halfSat">
              Half-Saturation (h): {params.halfSaturation.toFixed(2)}
            </Label>
            <Slider
              id="halfSat"
              min={0.1}
              max={2}
              step={0.05}
              value={[params.halfSaturation]}
              onValueChange={([value]) => onParamChange('halfSaturation', value)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Hurricane Parameters</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="hurricaneRate">
              Hurricane Rate (λ): {params.hurricaneRate.toFixed(3)} events/year
            </Label>
            <Slider
              id="hurricaneRate"
              min={0}
              max={0.5}
              step={0.01}
              value={[params.hurricaneRate]}
              onValueChange={([value]) => onParamChange('hurricaneRate', value)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium">Category 1 (Yellow)</div>
            <div>
              <Label htmlFor="cat1Prob" className="text-xs">
                Probability: {params.cat1Prob.toFixed(2)}
              </Label>
              <Slider
                id="cat1Prob"
                min={0}
                max={1}
                step={0.05}
                value={[params.cat1Prob]}
                onValueChange={([value]) => onParamChange('cat1Prob', value)}
              />
            </div>
            <div>
              <Label htmlFor="cat1Damage" className="text-xs">
                Damage: {(params.cat1Damage * 100).toFixed(0)}%
              </Label>
              <Slider
                id="cat1Damage"
                min={0}
                max={1}
                step={0.05}
                value={[params.cat1Damage]}
                onValueChange={([value]) => onParamChange('cat1Damage', value)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium">Category 2 (Orange)</div>
            <div>
              <Label htmlFor="cat2Prob" className="text-xs">
                Probability: {params.cat2Prob.toFixed(2)}
              </Label>
              <Slider
                id="cat2Prob"
                min={0}
                max={1}
                step={0.05}
                value={[params.cat2Prob]}
                onValueChange={([value]) => onParamChange('cat2Prob', value)}
              />
            </div>
            <div>
              <Label htmlFor="cat2Damage" className="text-xs">
                Damage: {(params.cat2Damage * 100).toFixed(0)}%
              </Label>
              <Slider
                id="cat2Damage"
                min={0}
                max={1}
                step={0.05}
                value={[params.cat2Damage]}
                onValueChange={([value]) => onParamChange('cat2Damage', value)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium">Category 3 (Red)</div>
            <div>
              <Label htmlFor="cat3Prob" className="text-xs">
                Probability: {params.cat3Prob.toFixed(2)}
              </Label>
              <Slider
                id="cat3Prob"
                min={0}
                max={1}
                step={0.05}
                value={[params.cat3Prob]}
                onValueChange={([value]) => onParamChange('cat3Prob', value)}
              />
            </div>
            <div>
              <Label htmlFor="cat3Damage" className="text-xs">
                Damage: {(params.cat3Damage * 100).toFixed(0)}%
              </Label>
              <Slider
                id="cat3Damage"
                min={0}
                max={1}
                step={0.05}
                value={[params.cat3Damage]}
                onValueChange={([value]) => onParamChange('cat3Damage', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

