import React, { useState, useEffect } from 'react';
import GitGraph from './components/GitGraph';
import Controls from './components/Controls';
import Terminal from './components/Terminal';
import { GitState, SimulationStep } from './types';
import { INITIAL_LOG } from './constants';
import * as git from './services/gitLogic';
import { explainGitState } from './services/geminiService';

const TUTORIAL_STEPS: SimulationStep[] = [
  {
    title: "Initialize Repository",
    description: "Every project starts somewhere. Let's create a new git repository to begin tracking our changes. This creates the default 'master' branch.",
    requiredAction: 'init',
  },
  {
    title: "Initialize Git Flow",
    description: "Git Flow requires a 'develop' branch alongside 'master'. 'Master' stores official releases, while 'develop' serves as the integration branch for features.",
    requiredAction: 'flow_init',
  },
  {
    title: "Start a Feature",
    description: "We need to add a login page. In Git Flow, we never commit directly to 'develop'. We branch off 'develop' to create a feature branch.",
    requiredAction: 'feature_start',
  },
  {
    title: "Development Work",
    description: "Work on the feature. Let's make a commit to save our progress on the 'feature/login' branch.",
    requiredAction: 'commit',
  },
  {
    title: "More Development",
    description: "Adding more code to the login feature. Committing again...",
    requiredAction: 'commit',
  },
  {
    title: "Finish Feature",
    description: "The login page is done! We finish the feature by merging it back into 'develop' and deleting the feature branch.",
    requiredAction: 'feature_finish',
  },
  {
    title: "Start a Release",
    description: "We have enough features for Version 1.0. Let's start a release branch from 'develop'. This allows us to polish the release without halting new development.",
    requiredAction: 'release_start',
  },
  {
    title: "Release Polish",
    description: "Fixing a minor typo in the documentation before release. Committing to the release branch.",
    requiredAction: 'commit',
  },
  {
    title: "Finish Release",
    description: "Ready for launch! Finishing a release involves merging to 'master' (and tagging it v1.0) AND merging back to 'develop' so future features have these fixes.",
    requiredAction: 'release_finish',
  },
  {
    title: "Emergency! Bug Found",
    description: "Users reported a critical bug in v1.0 on production. We need a 'hotfix' immediately. Hotfixes branch directly from 'master'.",
    requiredAction: 'hotfix_start',
  },
  {
    title: "Fixing the Bug",
    description: "Applied the patch to the hotfix branch. Committing the fix.",
    requiredAction: 'commit',
  },
  {
    title: "Finish Hotfix",
    description: "Deploy the fix. We merge the hotfix into 'master' (tagging v1.0.1) AND into 'develop' to ensure the bug doesn't reappear in the next release.",
    requiredAction: 'hotfix_finish',
  },
];

const App: React.FC = () => {
  const [gitState, setGitState] = useState<GitState>(git.createInitialState());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initial Logs
  useEffect(() => {
    setGitState(s => ({ ...s, logs: INITIAL_LOG }));
  }, []);

  // AI Trigger
  useEffect(() => {
    // Debounce AI calls to avoid spamming while animating rapidly
    const timeoutId = setTimeout(async () => {
        if (gitState.commits.length > 0) {
            setIsAiLoading(true);
            const explanation = await explainGitState(gitState);
            setAiExplanation(explanation);
            setIsAiLoading(false);
        }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gitState.commits.length, gitState.currentBranch]);

  const handleAction = (action: SimulationStep['requiredAction']) => {
    let newState = { ...gitState };

    switch (action) {
      case 'init':
        newState = git.gitInit(newState);
        break;
      case 'flow_init':
        newState = git.gitFlowInit(newState);
        break;
      case 'feature_start':
        newState = git.createBranch(newState, 'feature', 'feature/login');
        break;
      case 'commit':
        const msgs = ["Update styles", "Fix logic", "Add tests", "Refactor core", "Update readme"];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        newState = git.commit(newState, msg);
        break;
      case 'feature_finish':
        newState = git.merge(newState, 'feature/login', 'develop', "Merge feature 'login'");
        newState = git.deleteBranch(newState, 'feature/login');
        break;
      case 'release_start':
        newState = git.createBranch(newState, 'release', 'release/v1.0');
        break;
      case 'release_finish':
        // release finishes to master AND develop
        // 1. Merge to master
        newState = git.merge(newState, 'release/v1.0', 'master', "Release v1.0");
        newState = git.tag(newState, 'v1.0');
        // 2. Merge to develop
        newState = git.merge(newState, 'release/v1.0', 'develop', "Merge release v1.0 back to develop");
        newState = git.deleteBranch(newState, 'release/v1.0');
        // Switch back to develop as default continuation
        newState = { ...newState, currentBranch: 'develop' };
        break;
      case 'hotfix_start':
        // Must start from master for hotfix
        // Force switch context logically if not already (visualizer simplicity)
        newState = { ...newState, currentBranch: 'master' }; 
        newState = git.createBranch(newState, 'hotfix', 'hotfix/v1.0.1');
        break;
      case 'hotfix_finish':
        // Hotfix merges to master and develop
        newState = git.merge(newState, 'hotfix/v1.0.1', 'master', "Hotfix v1.0.1");
        newState = git.tag(newState, 'v1.0.1');
        newState = git.merge(newState, 'hotfix/v1.0.1', 'develop', "Merge hotfix back to develop");
        newState = git.deleteBranch(newState, 'hotfix/v1.0.1');
        newState = { ...newState, currentBranch: 'develop' };
        break;
    }

    setGitState(newState);
    setCurrentStepIndex(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden">
      {/* Left Sidebar */}
      <Controls 
        currentStepIndex={currentStepIndex}
        steps={TUTORIAL_STEPS}
        onAction={handleAction}
        isAiLoading={isAiLoading}
        aiExplanation={aiExplanation}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Graph Area */}
        <div className="flex-1 overflow-hidden relative shadow-inner">
           {/* Overlay Gradient for depth */}
           <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none"></div>
           <GitGraph state={gitState} />
        </div>

        {/* Terminal Area */}
        <div className="h-48 z-20">
            <Terminal logs={gitState.logs} />
        </div>
      </div>
    </div>
  );
};

export default App;
