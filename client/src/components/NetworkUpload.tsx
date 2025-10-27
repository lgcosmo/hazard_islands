import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BipartiteNetwork, parseCSV, getNetworkStats } from '@/lib/networkBuilder';

interface NetworkUploadProps {
  onNetworkLoaded: (network: BipartiteNetwork) => void;
  onClear: () => void;
}

export default function NetworkUpload({ onNetworkLoaded, onClear }: NetworkUploadProps) {
  const [network, setNetwork] = useState<BipartiteNetwork>({ B: null, S: null });
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<{
    B: boolean;
    S: boolean;
  }>({ B: false, S: false });

  const handleFileUpload = async (
    file: File,
    type: 'B' | 'S'
  ) => {
    try {
      setError('');
      const text = await file.text();
      const matrix = parseCSV(text);
      
      const newNetwork = { ...network, [type]: matrix };
      setNetwork(newNetwork);
      setUploadStatus(prev => ({ ...prev, [type]: true }));
      
      // Notify parent if at least one matrix is loaded
      if (newNetwork.B || newNetwork.S) {
        onNetworkLoaded(newNetwork);
      }
    } catch (err) {
      setError(`Error loading ${type} matrix: ${(err as Error).message}`);
    }
  };

  const handleClear = () => {
    setNetwork({ B: null, S: null });
    setUploadStatus({ B: false, S: false });
    setError('');
    onClear();
  };

  const stats = (network.B || network.S) ? getNetworkStats(network) : null;

  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div>
        <h4 className="font-semibold mb-2 text-blue-900">Upload Network Matrices</h4>
        <p className="text-xs text-blue-700 mb-3">
          Upload CSV files for pollination (B) and/or seed dispersal (S) biadjacency matrices.
          Rows = plants, Columns = animals.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="file-B" className="text-sm">
            Pollination Matrix (B) {uploadStatus.B && '✓'}
          </Label>
          <input
            id="file-B"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'B');
            }}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 mt-1"
          />
        </div>

        <div>
          <Label htmlFor="file-S" className="text-sm">
            Seed Dispersal Matrix (S) {uploadStatus.S && '✓'}
          </Label>
          <input
            id="file-S"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'S');
            }}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 mt-1"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {stats && (
        <div className="text-sm bg-white p-3 rounded border">
          <div className="font-semibold mb-1">Network Statistics:</div>
          <div className="space-y-0.5 text-xs">
            <div>Plants: {stats.nPlants}</div>
            <div>Animals: {stats.nAnimals}</div>
            <div>Total species: {stats.nTotal}</div>
            {stats.nPollinationLinks > 0 && (
              <div>Pollination links: {stats.nPollinationLinks}</div>
            )}
            {stats.nDispersalLinks > 0 && (
              <div>Dispersal links: {stats.nDispersalLinks}</div>
            )}
          </div>
        </div>
      )}

      {(uploadStatus.B || uploadStatus.S) && (
        <Button onClick={handleClear} variant="outline" size="sm" className="w-full">
          Clear & Use Default Network
        </Button>
      )}
      
      {!uploadStatus.B && !uploadStatus.S && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
          <strong>Default:</strong> Using multilayer network with 3 plants, 3 pollinators, and 3 seed dispersers.
        </div>
      )}

      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
        <strong>CSV Format:</strong> Comma-separated values, no headers. Each row = plant, each column = animal.
        Use 0 for no interaction, positive values for interaction strength.
      </div>
    </div>
  );
}

