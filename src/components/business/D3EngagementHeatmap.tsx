import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface HeatmapDataPoint {
  day: string; // 'Mon', 'Tue', etc.
  dayIndex: number; // 0-6
  hour: number; // 0-23
  intensity: number; // 0-100 score
  inquiries: number;
}

interface D3EngagementHeatmapProps {
  businessName: string;
}

export const D3EngagementHeatmap: React.FC<D3EngagementHeatmapProps> = ({ businessName }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    day: string;
    hour: number;
    intensity: number;
    inquiries: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    day: '',
    hour: 0,
    intensity: 0,
    inquiries: 0,
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate realistic Zambian commercial business engagement pattern
  // Peak times: 08:00 - 17:30 weekdays, 09:00 - 15:00 Saturdays
  const generateData = (): HeatmapDataPoint[] => {
    const data: HeatmapDataPoint[] = [];
    days.forEach((day, dIdx) => {
      const isWeekend = dIdx === 5 || dIdx === 6;
      hours.forEach((hour) => {
        let base = 5;
        if (!isWeekend) {
          if (hour >= 8 && hour <= 12) {
            // Morning commercial rush (Lusaka/Kitwe working hours)
            base = 65 + Math.sin(hour) * 25 + (dIdx === 0 || dIdx === 4 ? 12 : 5);
          } else if (hour >= 13 && hour <= 17) {
            // Afternoon orders & inquiries
            base = 75 + Math.cos(hour) * 20;
          } else if (hour >= 18 && hour <= 21) {
            // Evening browsing & quote reviews
            base = 35 + (hour === 19 ? 20 : 5);
          }
        } else if (dIdx === 5) {
          // Saturday shopping peak
          if (hour >= 9 && hour <= 14) {
            base = 82 + Math.sin(hour) * 15;
          } else if (hour >= 15 && hour <= 18) {
            base = 45;
          }
        } else {
          // Sunday quiet
          if (hour >= 11 && hour <= 16) {
            base = 25;
          }
        }

        const clampedIntensity = Math.min(100, Math.max(0, Math.round(base)));
        const inquiries = Math.round((clampedIntensity / 100) * 14);

        data.push({
          day,
          dayIndex: dIdx,
          hour,
          intensity: clampedIntensity,
          inquiries,
        });
      });
    });
    return data;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const dataset = generateData();
    const containerWidth = containerRef.current.clientWidth || 700;
    const margin = { top: 30, right: 20, bottom: 40, left: 45 };
    const width = Math.max(580, containerWidth - margin.left - margin.right);
    const height = 210 - margin.top - margin.bottom;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const xScale = d3
      .scaleBand<number>()
      .domain(hours)
      .range([0, width])
      .padding(0.08);

    const yScale = d3
      .scaleBand<string>()
      .domain(days)
      .range([0, height])
      .padding(0.12);

    // Color Interpolator: Emerald gradient from pale cream/neutral to rich vibrant emerald
    const colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateRgbBasis(['#f5f5f4', '#d1fae5', '#34d399', '#059669', '#064e3b']))
      .domain([0, 100]);

    // X-Axis (Hours of Day)
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues([0, 3, 6, 9, 12, 15, 18, 21])
          .tickFormat((d) => `${d}:00`)
      );

    xAxis.select('.domain').attr('stroke', '#a8a29e').attr('stroke-opacity', 0.3);
    xAxis.selectAll('text')
      .attr('fill', '#78716c')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('dy', '1em');

    // Y-Axis (Days of Week)
    const yAxis = svg.append('g').call(d3.axisLeft(yScale));
    yAxis.select('.domain').remove();
    yAxis.selectAll('line').remove();
    yAxis.selectAll('text')
      .attr('fill', '#78716c')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('font-family', 'system-ui');

    // Heatmap Cells
    svg
      .selectAll<SVGRectElement, HeatmapDataPoint>('.heatmap-cell')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d) => xScale(d.hour) || 0)
      .attr('y', (d) => yScale(d.day) || 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.intensity))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.15s ease')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('stroke', '#047857')
          .attr('stroke-width', 2);

        const [xPos, yPos] = d3.pointer(event, containerRef.current);
        setTooltip({
          visible: true,
          x: xPos,
          y: yPos - 50,
          day: d.day,
          hour: d.hour,
          intensity: d.intensity,
          inquiries: d.inquiries,
        });
      })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Chart title label
    svg
      .append('text')
      .attr('x', 0)
      .attr('y', -12)
      .attr('fill', '#57534e')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Hourly Customer Discovery & Lead Density (24-Hour Cycle)');

  }, [businessName]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto select-none">
      <div className="min-w-[620px]">
        <svg ref={svgRef} className="w-full overflow-visible" />
      </div>

      {/* Floating Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-20 pointer-events-none bg-stone-950 text-white rounded-lg px-2.5 py-1.5 shadow-xl border border-stone-700 text-xs transition-all duration-75"
        >
          <div className="font-bold flex items-center gap-1.5 text-emerald-400">
            <span>{tooltip.day}</span>
            <span>·</span>
            <span>{tooltip.hour}:00 - {tooltip.hour + 1}:00</span>
          </div>
          <div className="text-[11px] text-stone-300 mt-0.5 flex items-center justify-between gap-3">
            <span>Traffic Activity:</span>
            <span className="font-mono font-bold text-white">{tooltip.intensity}%</span>
          </div>
          <div className="text-[11px] text-stone-300 flex items-center justify-between gap-3">
            <span>Est. Inquiries:</span>
            <span className="font-mono font-bold text-emerald-300">~{tooltip.inquiries} leads</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">
        <div className="flex items-center gap-2">
          <span>Quiet</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#f5f5f4] border border-stone-300 dark:border-stone-700" />
            <span className="w-3 h-3 rounded-xs bg-[#d1fae5]" />
            <span className="w-3 h-3 rounded-xs bg-[#34d399]" />
            <span className="w-3 h-3 rounded-xs bg-[#059669]" />
            <span className="w-3 h-3 rounded-xs bg-[#064e3b]" />
          </div>
          <span>Peak Commercial Traffic</span>
        </div>
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
          D3.js Vector Matrix
        </span>
      </div>
    </div>
  );
};
