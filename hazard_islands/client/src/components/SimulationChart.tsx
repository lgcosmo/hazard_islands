import { useEffect, useRef } from 'react';
import { HurricaneEvent } from '@/lib/simulationEngine';

interface SimulationChartProps {
  history: Array<{ t: number; y: number[] }>;
  hurricanes: HurricaneEvent[];
  extinctSpecies: Set<number>;
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

export default function SimulationChart({
  history,
  hurricanes,
  extinctSpecies,
  nSpecies
}: SimulationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (history.length === 0) return;

    // Find data ranges
    const maxTime = Math.max(...history.map(h => h.t), 1);
    const maxPop = Math.max(
      ...history.flatMap(h => h.y),
      1
    );

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (plotHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const value = maxPop * (1 - i / 5);
      const y = padding.top + (plotHeight / 5) * i;
      ctx.fillText(value.toFixed(2), padding.left - 10, y);
    }

    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 5; i++) {
      const value = (maxTime / 5) * i;
      const x = padding.left + (plotWidth / 5) * i;
      ctx.fillText(value.toFixed(1), x, height - padding.bottom + 10);
    }

    // Axis labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (years)', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Population Size', 0, 0);
    ctx.restore();

    // Scale functions
    const scaleX = (t: number) => padding.left + (t / maxTime) * plotWidth;
    const scaleY = (pop: number) => height - padding.bottom - (pop / maxPop) * plotHeight;

    // Draw hurricane events
    hurricanes.forEach(hurricane => {
      const x = scaleX(hurricane.time);
      
      // Determine color based on damage
      let color = '#fbbf24'; // yellow for low damage
      if (hurricane.damage > 0.6) color = '#dc2626'; // red for high damage
      else if (hurricane.damage > 0.3) color = '#f97316'; // orange for medium damage
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw hurricane icon
      ctx.fillStyle = color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌀', x, padding.top - 5);
    });

    // Draw population lines
    for (let species = 0; species < nSpecies; species++) {
      const color = SPECIES_COLORS[species % SPECIES_COLORS.length];
      const isExtinct = extinctSpecies.has(species);
      
      ctx.strokeStyle = isExtinct ? '#d1d5db' : color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = isExtinct ? 0.3 : 1.0;
      
      ctx.beginPath();
      let started = false;
      
      for (let i = 0; i < history.length; i++) {
        const point = history[i];
        const x = scaleX(point.t);
        const y = scaleY(point.y[species]);
        
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

  }, [history, hurricanes, Array.from(extinctSpecies).join(','), nSpecies]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

