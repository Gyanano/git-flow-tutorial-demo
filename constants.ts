import { BranchType } from "./types";

export const LANES: Record<BranchType, number> = {
  hotfix: 0,
  master: 1,
  release: 2,
  develop: 3,
  feature: 4,
};

export const LANE_COLORS: Record<BranchType, string> = {
  hotfix: '#ef4444', // Red
  master: '#3b82f6', // Blue
  release: '#10b981', // Emerald
  develop: '#8b5cf6', // Violet
  feature: '#f59e0b', // Amber
};

export const INITIAL_LOG = [
  "Welcome to Git Flow Visualizer.",
  "Follow the guide to learn how to manage a project using Git Flow.",
  "Click 'Initialize Repository' to start."
];
