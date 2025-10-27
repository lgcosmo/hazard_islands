import { useEffect, useRef } from 'react';
import { BipartiteNetwork } from '@/lib/networkBuilder';

interface NetworkVisualizationProps {
  network: BipartiteNetwork;
  extinctSpecies: Set<number>;
  populations: number[];
}

const PLANT_COLOR = '#10b981'; // green
const ANIMAL_COLOR = '#f59e0b'; // amber
const POLLINATION_COLOR = '#3b82f6'; // blue
const DISPERSAL_COLOR = '#8b5cf6'; // purple
const EXTINCT_COLOR = '#d1d5db'; // gray

export default function NetworkVisualization({
  network,
  extinctSpecies,
  populations
}: NetworkVisualizationProps) {
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

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const { B, S } = network;
    if (!B && !S) return;

    // Determine dimensions
    const Np = B ? B.length : (S ? S.length : 0);
    const Na = B ? B[0].length : (S ? S[0].length : 0);

    // Layout parameters
    const padding = 40;
    const nodeRadius = 12;
    const plantX = padding + 30;
    const animalX = width - padding - 30;
    
    // Calculate positions
    const plantPositions: Array<{ x: number; y: number }> = [];
    const animalPositions: Array<{ x: number; y: number }> = [];

    const plantSpacing = (height - 2 * padding) / (Np + 1);
    for (let i = 0; i < Np; i++) {
      plantPositions.push({
        x: plantX,
        y: padding + (i + 1) * plantSpacing
      });
    }

    const animalSpacing = (height - 2 * padding) / (Na + 1);
    for (let i = 0; i < Na; i++) {
      animalPositions.push({
        x: animalX,
        y: padding + (i + 1) * animalSpacing
      });
    }

    // Draw edges
    const linkWidth = 1.5; // Fixed thin width for all links
    const linkAlpha = 0.4; // Transparency for better visibility

    // Draw pollination edges (B)
    if (B) {
      for (let i = 0; i < Np; i++) {
        for (let j = 0; j < Na; j++) {
          if (B[i][j] > 0) {
            const plantExtinct = extinctSpecies.has(i);
            const animalExtinct = extinctSpecies.has(Np + j);
            
            ctx.strokeStyle = (plantExtinct || animalExtinct) 
              ? EXTINCT_COLOR 
              : POLLINATION_COLOR;
            ctx.globalAlpha = (plantExtinct || animalExtinct) ? 0.2 : linkAlpha;
            ctx.lineWidth = linkWidth;
            
            ctx.beginPath();
            ctx.moveTo(plantPositions[i].x, plantPositions[i].y);
            ctx.lineTo(animalPositions[j].x, animalPositions[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw dispersal edges (S)
    if (S) {
      for (let i = 0; i < Np; i++) {
        for (let j = 0; j < Na; j++) {
          if (S[i][j] > 0) {
            const plantExtinct = extinctSpecies.has(i);
            const animalExtinct = extinctSpecies.has(Np + j);
            
            ctx.strokeStyle = (plantExtinct || animalExtinct) 
              ? EXTINCT_COLOR 
              : DISPERSAL_COLOR;
            ctx.globalAlpha = (plantExtinct || animalExtinct) ? 0.2 : linkAlpha;
            ctx.lineWidth = linkWidth;
            
            // Draw dashed line for dispersal if both B and S exist
            if (B) {
              ctx.setLineDash([5, 5]);
            }
            
            ctx.beginPath();
            ctx.moveTo(plantPositions[i].x, plantPositions[i].y);
            ctx.lineTo(animalPositions[j].x, animalPositions[j].y);
            ctx.stroke();
            
            ctx.setLineDash([]);
          }
        }
      }
    }

    ctx.globalAlpha = 1.0;

    // Draw plant nodes
    for (let i = 0; i < Np; i++) {
      const pos = plantPositions[i];
      const isExtinct = extinctSpecies.has(i);
      const pop = populations[i] || 0;
      
      // Node circle
      ctx.fillStyle = isExtinct ? EXTINCT_COLOR : PLANT_COLOR;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Population size indicator (inner circle)
      if (!isExtinct && pop > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const innerRadius = Math.max(2, nodeRadius * Math.sqrt(pop / 2));
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, innerRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Border
      ctx.strokeStyle = isExtinct ? '#9ca3af' : '#059669';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = isExtinct ? '#6b7280' : '#374151';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${i + 1}`, pos.x - nodeRadius - 5, pos.y);
    }

    // Draw animal nodes
    for (let i = 0; i < Na; i++) {
      const pos = animalPositions[i];
      const isExtinct = extinctSpecies.has(Np + i);
      const pop = populations[Np + i] || 0;
      
      // Node circle
      ctx.fillStyle = isExtinct ? EXTINCT_COLOR : ANIMAL_COLOR;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Population size indicator
      if (!isExtinct && pop > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const innerRadius = Math.max(2, nodeRadius * Math.sqrt(pop / 2));
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, innerRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Border
      ctx.strokeStyle = isExtinct ? '#9ca3af' : '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = isExtinct ? '#6b7280' : '#374151';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`A${i + 1}`, pos.x + nodeRadius + 5, pos.y);
    }

    // Draw legend
    const legendY = height - 25;
    let legendX = 10;
    
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    
    // Plants
    ctx.fillStyle = PLANT_COLOR;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    ctx.fillText('Plants', legendX + 12, legendY);
    legendX += 60;
    
    // Animals
    ctx.fillStyle = ANIMAL_COLOR;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.fillText('Animals', legendX + 12, legendY);
    legendX += 70;
    
    // Pollination
    if (B) {
      ctx.strokeStyle = POLLINATION_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();
      ctx.fillStyle = '#374151';
      ctx.fillText('Pollination', legendX + 25, legendY);
      legendX += 95;
    }
    
    // Dispersal
    if (S) {
      ctx.strokeStyle = DISPERSAL_COLOR;
      ctx.lineWidth = 2;
      if (B) ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#374151';
      ctx.fillText('Dispersal', legendX + 25, legendY);
    }

  }, [
    JSON.stringify(network.B) + JSON.stringify(network.S),
    Array.from(extinctSpecies).join(','),
    populations.length
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

