import React, { useState, useEffect } from 'react';
import GitGraph from './components/GitGraph';
import Controls from './components/Controls';
import Terminal from './components/Terminal';
import { GitState, Language, SimulationStep } from './types';
import { INITIAL_LOG } from './constants';
import * as git from './services/gitLogic';

const COMMIT_MESSAGES = ["Update styles", "Fix logic", "Add tests", "Refactor core", "Update readme"];

const COMMIT_MESSAGE_TRANSLATIONS: Record<string, string> = {
  "Update styles": "更新样式",
  "Fix logic": "修复逻辑",
  "Add tests": "添加测试",
  "Refactor core": "重构核心",
  "Update readme": "更新说明文档",
};

const STATIC_LOG_TRANSLATIONS: Record<string, string> = {
  "Welcome to Git Flow Visualizer.": "欢迎使用 Git Flow 可视化工具。",
  "Follow the guide to learn how to manage a project using Git Flow.": "按照指南学习如何使用 Git Flow 管理项目。",
  "Click 'Initialize Repository' to start.": "点击“初始化仓库”开始。",
};

const TUTORIAL_STEPS: Record<Language, SimulationStep[]> = {
  en: [
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
  ],
  zh: [
    {
      title: "初始化仓库",
      description: "每个项目都要从某处开始。让我们创建新的 Git 仓库来跟踪更改，这会创建默认的 'master' 分支。",
      requiredAction: 'init',
    },
    {
      title: "初始化 Git Flow",
      description: "Git Flow 需要在 'master' 之外创建 'develop' 分支。'master' 用于保存正式发布版本，'develop' 用于集成功能开发。",
      requiredAction: 'flow_init',
    },
    {
      title: "开始功能分支",
      description: "我们需要添加登录页。在 Git Flow 中不会直接向 'develop' 提交，而是从 'develop' 分出一个功能分支。",
      requiredAction: 'feature_start',
    },
    {
      title: "开发工作",
      description: "在功能分支上工作，向 'feature/login' 分支提交一次以保存进度。",
      requiredAction: 'commit',
    },
    {
      title: "继续开发",
      description: "继续为登录功能添加代码，再提交一次...",
      requiredAction: 'commit',
    },
    {
      title: "完成功能分支",
      description: "登录页完成！将功能分支合并回 'develop' 并删除功能分支。",
      requiredAction: 'feature_finish',
    },
    {
      title: "开始发布分支",
      description: "功能已满足 1.0 版本需求，从 'develop' 创建发布分支，以便在不影响新开发的情况下完善发布。",
      requiredAction: 'release_start',
    },
    {
      title: "发布完善",
      description: "发布前修复文档中的小错误，并提交到发布分支。",
      requiredAction: 'commit',
    },
    {
      title: "完成发布",
      description: "准备发布！完成发布需要合并到 'master'（并打上 v1.0 标签），同时合并回 'develop' 以让后续功能包含修复。",
      requiredAction: 'release_finish',
    },
    {
      title: "紧急！发现 Bug",
      description: "用户在生产环境的 v1.0 中发现严重问题，需要立即创建 'hotfix'，热修复直接从 'master' 分支创建。",
      requiredAction: 'hotfix_start',
    },
    {
      title: "修复 Bug",
      description: "在热修复分支应用补丁并提交修复。",
      requiredAction: 'commit',
    },
    {
      title: "完成热修复",
      description: "部署修复：将热修复合并到 'master'（打上 v1.0.1 标签），并合并回 'develop' 以确保下次发布不会重复问题。",
      requiredAction: 'hotfix_finish',
    },
  ],
};

const UI_LABELS = {
  en: {
    appTitle: "Git Flow",
    appSubtitle: "Interactive Visualizer",
    stepCounter: (current: number, total: number) => `Step ${current} of ${total}`,
    actionLabels: {
      init: "git init",
      flow_init: "git flow init",
      feature_start: "Start Feature",
      commit: "Make Commit",
      feature_finish: "Finish Feature",
      release_start: "Start Release",
      release_finish: "Finish Release",
      hotfix_start: "Start Hotfix",
      hotfix_finish: "Finish Hotfix",
      none: "Next Step",
    },
    tutorialCompleteTitle: "Tutorial Complete!",
    tutorialCompleteBody: "You've successfully managed a full release cycle using Git Flow.",
    restartSimulation: "Restart Simulation",
    legendLabels: {
      master: "Master",
      develop: "Develop",
      feature: "Feature",
      release: "Release",
      hotfix: "Hotfix",
    },
    languageLabel: "Language",
    languageToggleLabel: "中文",
    languageToggleAriaLabel: "Switch language to Chinese",
    terminalTitle: "TERMINAL",
    emptyGraph: "Repository not initialized",
  },
  zh: {
    appTitle: "Git Flow",
    appSubtitle: "交互式可视化",
    stepCounter: (current: number, total: number) => `步骤 ${current} / ${total}`,
    actionLabels: {
      init: "git init",
      flow_init: "git flow init",
      feature_start: "开始功能开发",
      commit: "提交更改",
      feature_finish: "完成功能",
      release_start: "开始发布",
      release_finish: "完成发布",
      hotfix_start: "开始热修",
      hotfix_finish: "完成热修",
      none: "下一步",
    },
    tutorialCompleteTitle: "教程完成！",
    tutorialCompleteBody: "你已成功使用 Git Flow 完成一次完整的发布流程。",
    restartSimulation: "重新开始模拟",
    legendLabels: {
      master: "Master 主分支",
      develop: "Develop 开发",
      feature: "Feature 功能",
      release: "Release 发布",
      hotfix: "Hotfix 热修复",
    },
    languageLabel: "语言",
    languageToggleLabel: "EN",
    languageToggleAriaLabel: "切换到英文界面",
    terminalTitle: "终端",
    emptyGraph: "仓库尚未初始化",
  },
};

const App: React.FC = () => {
  const [gitState, setGitState] = useState<GitState>(git.createInitialState());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('en');

  // Initial Logs
  useEffect(() => {
    setGitState(s => ({ ...s, logs: INITIAL_LOG }));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
  }, [language]);

  const translateCommitMessage = (message: string) => {
    if (language === 'zh') {
      return COMMIT_MESSAGE_TRANSLATIONS[message] || message;
    }
    return message;
  };

  const translateLog = (log: string) => {
    if (language === 'en') {
      return log;
    }

    const staticTranslation = STATIC_LOG_TRANSLATIONS[log];
    if (staticTranslation) {
      return staticTranslation;
    }

    if (log.startsWith('$')) {
      return log;
    }

    if (log === '> Initialized empty Git repository') {
      return '> 已初始化空的 Git 仓库';
    }

    const createdBranchMatch = log.match(/^> Created (\S+) branch from (\S+)$/);
    if (createdBranchMatch) {
      return `> 已从 ${createdBranchMatch[2]} 创建 ${createdBranchMatch[1]} 分支`;
    }

    const switchedBranchMatch = log.match(/^> Switched to branch (.+)$/);
    if (switchedBranchMatch) {
      return `> 已切换到分支 ${switchedBranchMatch[1]}`;
    }

    const switchedNewBranchMatch = log.match(/^> Switched to a new branch '(.+)'$/);
    if (switchedNewBranchMatch) {
      return `> 已切换到新分支 '${switchedNewBranchMatch[1]}'`;
    }

    const commitMatch = log.match(/^> \[(\S+) (\S+)\] (.+)$/);
    if (commitMatch) {
      const translatedMessage = translateCommitMessage(commitMatch[3]);
      return `> 已在 ${commitMatch[1]} 提交 ${commitMatch[2]}：${translatedMessage}`;
    }

    const mergedMatch = log.match(/^> Merged (.+) into (.+)$/);
    if (mergedMatch) {
      return `> 已将 ${mergedMatch[1]} 合并到 ${mergedMatch[2]}`;
    }

    const taggedMatch = log.match(/^> Tagged (.+) as (.+)$/);
    if (taggedMatch) {
      return `> 已将 ${taggedMatch[1]} 标记为 ${taggedMatch[2]}`;
    }

    const deletedMatch = log.match(/^> Deleted branch (.+)$/);
    if (deletedMatch) {
      return `> 已删除分支 ${deletedMatch[1]}`;
    }

    return log;
  };

  const steps = TUTORIAL_STEPS[language];
  const labels = UI_LABELS[language];

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
        const msg = COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)];
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
        steps={steps}
        onAction={handleAction}
        labels={labels}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Graph Area */}
        <div className="flex-1 overflow-hidden relative shadow-inner">
           {/* Overlay Gradient for depth */}
           <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none"></div>
            <GitGraph
              state={gitState}
              emptyMessage={labels.emptyGraph}
              translateCommitMessage={translateCommitMessage}
            />
        </div>

        {/* Terminal Area */}
        <div className="h-48 z-20">
            <Terminal
              logs={gitState.logs}
              title={labels.terminalTitle}
              translateLog={translateLog}
            />
        </div>
      </div>
    </div>
  );
};

export default App;
