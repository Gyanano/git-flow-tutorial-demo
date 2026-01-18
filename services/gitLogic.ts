import { GitState, Commit, Branch, BranchType } from "../types";
import { LANES, LANE_COLORS } from "../constants";

// Helper to generate short hash
const generateId = () => Math.random().toString(36).substring(2, 9);

export const createInitialState = (): GitState => ({
  commits: [],
  branches: {},
  currentBranch: '',
  logs: [],
});

export const gitInit = (state: GitState): GitState => {
  const masterBranch: Branch = {
    name: 'master',
    type: 'master',
    color: LANE_COLORS.master,
    headCommitId: null,
  };

  const initCommit: Commit = {
    id: generateId(),
    message: 'Initial commit',
    branchName: 'master',
    parentId: null,
    secondParentId: null,
    timestamp: Date.now(),
    lane: LANES.master,
  };

  masterBranch.headCommitId = initCommit.id;

  return {
    ...state,
    commits: [initCommit],
    branches: { master: masterBranch },
    currentBranch: 'master',
    logs: [...state.logs, '$ git init', '> Initialized empty Git repository'],
  };
};

export const gitFlowInit = (state: GitState): GitState => {
  const masterHead = state.branches['master']?.headCommitId;
  if (!masterHead) return state;

  const developBranch: Branch = {
    name: 'develop',
    type: 'develop',
    color: LANE_COLORS.develop,
    headCommitId: masterHead, // Points to same commit as master initially
  };

  return {
    ...state,
    branches: { ...state.branches, develop: developBranch },
    currentBranch: 'develop',
    logs: [...state.logs, '$ git flow init', '> Created develop branch from master', '> Switched to branch develop'],
  };
};

export const createBranch = (state: GitState, type: BranchType, name: string): GitState => {
  const sourceBranchName = state.currentBranch;
  const sourceHeadId = state.branches[sourceBranchName]?.headCommitId;

  if (!sourceHeadId) return state;

  const newBranch: Branch = {
    name,
    type,
    color: LANE_COLORS[type],
    headCommitId: sourceHeadId,
  };

  return {
    ...state,
    branches: { ...state.branches, [name]: newBranch },
    currentBranch: name,
    logs: [...state.logs, `$ git checkout -b ${name} ${sourceBranchName}`, `> Switched to a new branch '${name}'`],
  };
};

export const commit = (state: GitState, message: string): GitState => {
  const currentBranch = state.branches[state.currentBranch];
  if (!currentBranch) return state;

  const parentId = currentBranch.headCommitId;
  const newCommit: Commit = {
    id: generateId(),
    message,
    branchName: currentBranch.name,
    parentId,
    secondParentId: null,
    timestamp: Date.now(),
    lane: LANES[currentBranch.type],
  };

  const updatedBranch = { ...currentBranch, headCommitId: newCommit.id };

  return {
    ...state,
    commits: [...state.commits, newCommit],
    branches: { ...state.branches, [currentBranch.name]: updatedBranch },
    logs: [...state.logs, `$ git commit -m "${message}"`, `> [${currentBranch.name} ${newCommit.id}] ${message}`],
  };
};

export const merge = (state: GitState, sourceBranchName: string, targetBranchName: string, message?: string): GitState => {
  const sourceBranch = state.branches[sourceBranchName];
  const targetBranch = state.branches[targetBranchName];

  if (!sourceBranch || !targetBranch || !sourceBranch.headCommitId || !targetBranch.headCommitId) return state;

  const newCommit: Commit = {
    id: generateId(),
    message: message || `Merge branch '${sourceBranchName}' into ${targetBranchName}`,
    branchName: targetBranchName,
    parentId: targetBranch.headCommitId, // Main parent is the target we are merging INTO
    secondParentId: sourceBranch.headCommitId, // Second parent is the source we are merging FROM
    timestamp: Date.now(),
    lane: LANES[targetBranch.type],
  };

  const updatedTargetBranch = { ...targetBranch, headCommitId: newCommit.id };

  return {
    ...state,
    commits: [...state.commits, newCommit],
    branches: { ...state.branches, [targetBranchName]: updatedTargetBranch },
    currentBranch: targetBranchName,
    logs: [...state.logs, `$ git checkout ${targetBranchName}`, `$ git merge ${sourceBranchName}`, `> Merged ${sourceBranchName} into ${targetBranchName}`],
  };
};

export const tag = (state: GitState, tagName: string): GitState => {
    const currentBranch = state.branches[state.currentBranch];
    if(!currentBranch || !currentBranch.headCommitId) return state;

    const updatedCommits = state.commits.map(c => {
        if(c.id === currentBranch.headCommitId) {
            return { ...c, tags: [...(c.tags || []), tagName] };
        }
        return c;
    });

    return {
        ...state,
        commits: updatedCommits,
        logs: [...state.logs, `$ git tag ${tagName}`, `> Tagged ${currentBranch.headCommitId} as ${tagName}`]
    };
};

export const deleteBranch = (state: GitState, branchName: string): GitState => {
    const { [branchName]: deleted, ...remainingBranches } = state.branches;
    return {
        ...state,
        branches: remainingBranches,
        logs: [...state.logs, `$ git branch -d ${branchName}`, `> Deleted branch ${branchName}`]
    };
};
