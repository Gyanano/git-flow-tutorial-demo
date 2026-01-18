export type BranchType = 'master' | 'develop' | 'feature' | 'release' | 'hotfix';

export type Language = 'en' | 'zh';

export interface Branch {
  name: string;
  type: BranchType;
  color: string;
  headCommitId: string | null;
}

export interface Commit {
  id: string;
  message: string;
  branchName: string;
  parentId: string | null;
  secondParentId: string | null; // For merges
  timestamp: number;
  tags?: string[];
  lane: number; // Y-axis lane for visualization
}

export interface GitState {
  commits: Commit[];
  branches: Record<string, Branch>;
  currentBranch: string;
  logs: string[];
}

export interface SimulationStep {
  title: string;
  description: string;
  requiredAction: 'init' | 'flow_init' | 'feature_start' | 'commit' | 'feature_finish' | 'release_start' | 'release_finish' | 'hotfix_start' | 'hotfix_finish' | 'none';
}
