import React, { useMemo } from 'react';
import { GitState, Commit, Branch } from '../types';
import { LANES, LANE_COLORS } from '../constants';

interface GitGraphProps {
  state: GitState;
}

const SPACING_X = 60;
const SPACING_Y = 50;
const RADIUS = 7;
const SVG_PADDING = 40;

const GitGraph: React.FC<GitGraphProps> = ({ state }) => {
  // Sort commits by timestamp (oldest at top)
  const sortedCommits = useMemo(() => {
    return [...state.commits].sort((a, b) => a.timestamp - b.timestamp);
  }, [state.commits]);

  // Calculate coordinates
  const commitCoords = useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    sortedCommits.forEach((commit, index) => {
      coords[commit.id] = {
        x: commit.lane * SPACING_X + SVG_PADDING,
        y: index * SPACING_Y + SVG_PADDING,
      };
    });
    return coords;
  }, [sortedCommits]);

  const height = Math.max(400, sortedCommits.length * SPACING_Y + SVG_PADDING * 2);
  const width = Math.max(600, Object.keys(LANES).length * SPACING_X + SVG_PADDING * 2);

  return (
    <div className="w-full h-full overflow-auto bg-[#0d1117] relative flex justify-center">
      {sortedCommits.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <p>Repository not initialized</p>
         </div>
      )}
      <svg width={width} height={height} className="block">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
          </marker>
        </defs>

        {/* Lanes Background Lines */}
        {Object.entries(LANES).map(([name, laneIdx]) => (
            <line 
                key={name}
                x1={laneIdx * SPACING_X + SVG_PADDING} 
                y1={0} 
                x2={laneIdx * SPACING_X + SVG_PADDING} 
                y2={height}
                stroke="#1e293b" 
                strokeWidth="1" 
                strokeDasharray="4"
            />
        ))}

        {/* Lane Labels */}
        {Object.entries(LANES).map(([name, laneIdx]) => (
             <text
                key={`label-${name}`}
                x={laneIdx * SPACING_X + SVG_PADDING}
                y={20}
                fill={LANE_COLORS[name as keyof typeof LANES]}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                className="uppercase tracking-wider opacity-50"
             >
                {name}
             </text>
        ))}

        {/* Connections */}
        {sortedCommits.map((commit) => {
          const start = commitCoords[commit.id];
          if (!start) return null;

          const parents = [commit.parentId, commit.secondParentId].filter(Boolean) as string[];

          return parents.map((pid) => {
            const end = commitCoords[pid];
            if (!end) return null;

            // Bezier curve for smooth branch lines
            const isStraight = start.x === end.x;
            const pathData = isStraight
                ? `M ${start.x} ${start.y} L ${end.x} ${end.y}`
                : `M ${start.x} ${start.y} C ${start.x} ${start.y - SPACING_Y/2}, ${end.x} ${end.y + SPACING_Y/2}, ${end.x} ${end.y}`;

            return (
              <path
                key={`${commit.id}-${pid}`}
                d={pathData}
                fill="none"
                stroke="#475569"
                strokeWidth="2"
              />
            );
          });
        })}

        {/* Nodes */}
        {sortedCommits.map((commit) => {
          const { x, y } = commitCoords[commit.id];
          // Explicitly type 'b' as Branch to fix 'unknown' type error
          const isHead = Object.values(state.branches).some((b: Branch) => b.headCommitId === commit.id);
          const color = state.branches[commit.branchName]?.color || '#94a3b8'; // Fallback color

          return (
            <g key={commit.id} className="cursor-pointer hover:opacity-80 transition-opacity">
              <circle
                cx={x}
                cy={y}
                r={RADIUS}
                fill="#0f172a"
                stroke={color}
                strokeWidth="3"
              />
              {/* Commit Message Tooltip-ish */}
              <text x={x + 15} y={y + 4} fill="#94a3b8" fontSize="11" fontFamily="monospace">
                {commit.message.length > 20 ? commit.message.substring(0, 20) + '...' : commit.message}
              </text>
              
              {/* Tags */}
              {commit.tags?.map((tag, i) => (
                  <g key={tag} transform={`translate(${x - 30}, ${y - 15 - (i * 15)})`}>
                      <rect x="0" y="-8" width={tag.length * 7 + 10} height="14" rx="2" fill="#facc15" />
                      <text x="5" y="2" fontSize="9" fontWeight="bold" fill="#000">{tag}</text>
                  </g>
              ))}

              {/* Branch Labels (Heads) */}
              {Object.values(state.branches).map((branch: Branch) => {
                  if (branch.headCommitId === commit.id) {
                      return (
                          <g key={branch.name} transform={`translate(${x + 12}, ${y + 20})`}>
                              <rect x="-2" y="-8" width={branch.name.length * 7 + 12} height="16" rx="4" fill={branch.color} />
                              <text x="4" y="3" fontSize="10" fontWeight="bold" fill="#fff">
                                  {branch.name}
                                  {state.currentBranch === branch.name && '*'}
                              </text>
                          </g>
                      )
                  }
                  return null;
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GitGraph;