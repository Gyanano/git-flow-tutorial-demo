import React from 'react';
import { ArrowRight, GitBranch, GitCommit, GitMerge, Play, SkipForward, AlertCircle } from 'lucide-react';
import { SimulationStep } from '../types';

interface ControlsProps {
  currentStepIndex: number;
  steps: SimulationStep[];
  onAction: (action: SimulationStep['requiredAction']) => void;
  isAiLoading: boolean;
  aiExplanation: string;
}

const Controls: React.FC<ControlsProps> = ({ currentStepIndex, steps, onAction, isAiLoading, aiExplanation }) => {
  const currentStep = steps[currentStepIndex];
  const isFinished = currentStepIndex >= steps.length;

  return (
    <div className="w-96 bg-slate-900 border-r border-slate-700 flex flex-col h-full shadow-xl z-10">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <GitBranch className="text-blue-500" />
            Git Flow
        </h1>
        <p className="text-slate-400 text-sm">Interactive Visualizer</p>
      </div>

      {/* Tutorial Step */}
      <div className="p-6 flex-1 overflow-y-auto">
        {!isFinished ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
               <span>Step {currentStepIndex + 1} of {steps.length}</span>
               <div className="flex gap-1">
                   {steps.map((_, i) => (
                       <div key={i} className={`h-1 w-1 rounded-full ${i === currentStepIndex ? 'bg-blue-500' : i < currentStepIndex ? 'bg-blue-900' : 'bg-slate-700'}`} />
                   ))}
               </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 shadow-sm">
                <h2 className="text-xl font-bold text-white mb-3">{currentStep.title}</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{currentStep.description}</p>
                
                <button
                    onClick={() => onAction(currentStep.requiredAction)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    {getActionIcon(currentStep.requiredAction)}
                    {getActionLabel(currentStep.requiredAction)}
                </button>
            </div>

            {/* AI Insight */}
            <div className="mt-8 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-2 mb-3 text-purple-400 font-medium text-sm">
                    <span className="bg-purple-500/10 p-1 rounded">✨</span>
                    AI Insight
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20 text-sm text-slate-300 italic min-h-[80px]">
                    {isAiLoading ? (
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                        </div>
                    ) : (
                        aiExplanation || "Start the tutorial to see AI insights about the git operations."
                    )}
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
                  <Play className="w-8 h-8 ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Tutorial Complete!</h2>
              <p className="text-slate-400 mb-6">You've successfully managed a full release cycle using Git Flow.</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                  Restart Simulation
              </button>
          </div>
        )}
      </div>

      {/* Footer / Legend */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Master</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Develop</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Feature</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Release</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Hotfix</div>
      </div>
    </div>
  );
};

// Helper for labels
function getActionLabel(action: string) {
    switch(action) {
        case 'init': return 'git init';
        case 'flow_init': return 'git flow init';
        case 'feature_start': return 'Start Feature';
        case 'commit': return 'Make Commit';
        case 'feature_finish': return 'Finish Feature';
        case 'release_start': return 'Start Release';
        case 'release_finish': return 'Finish Release';
        case 'hotfix_start': return 'Start Hotfix';
        case 'hotfix_finish': return 'Finish Hotfix';
        default: return 'Next Step';
    }
}

function getActionIcon(action: string) {
    switch(action) {
        case 'commit': return <GitCommit size={18} />;
        case 'feature_finish': 
        case 'release_finish': 
        case 'hotfix_finish': return <GitMerge size={18} />;
        case 'init': return <Play size={18} />;
        default: return <ArrowRight size={18} />;
    }
}

export default Controls;