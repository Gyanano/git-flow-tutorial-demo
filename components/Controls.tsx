import React from 'react';
import { ArrowRight, GitBranch, GitCommit, GitMerge, Play } from 'lucide-react';
import { Language, SimulationStep } from '../types';

interface ControlLabels {
  appTitle: string;
  appSubtitle: string;
  stepCounter: (current: number, total: number) => string;
  actionLabels: Record<SimulationStep['requiredAction'], string>;
  tutorialCompleteTitle: string;
  tutorialCompleteBody: string;
  restartSimulation: string;
  legendLabels: {
    master: string;
    develop: string;
    feature: string;
    release: string;
    hotfix: string;
  };
  languageLabel: string;
  languageToggleLabel: string;
  languageToggleAriaLabel: string;
}

interface ControlsProps {
  currentStepIndex: number;
  steps: SimulationStep[];
  onAction: (action: SimulationStep['requiredAction']) => void;
  labels: ControlLabels;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentStepIndex,
  steps,
  onAction,
  labels,
  language,
  onLanguageChange,
}) => {
  const currentStep = steps[currentStepIndex];
  const isFinished = currentStepIndex >= steps.length;
  const nextLanguage = language === 'en' ? 'zh' : 'en';

  return (
    <div className="w-96 bg-slate-900 border-r border-slate-700 flex flex-col h-full shadow-xl z-10">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <GitBranch className="text-blue-500" />
              {labels.appTitle}
            </h1>
            <p className="text-slate-400 text-sm">{labels.appSubtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {labels.languageLabel}
            </span>
            <button
              type="button"
              onClick={() => onLanguageChange(nextLanguage)}
              aria-label={labels.languageToggleAriaLabel}
              className="px-2.5 py-1 text-xs font-semibold text-slate-200 border border-slate-600 rounded-md hover:border-slate-400 hover:text-white transition"
            >
              {labels.languageToggleLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Tutorial Step */}
      <div className="p-6 flex-1 overflow-y-auto">
        {!isFinished ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
               <span>{labels.stepCounter(currentStepIndex + 1, steps.length)}</span>
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
                    {getActionLabel(currentStep.requiredAction, labels.actionLabels)}
                </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
                  <Play className="w-8 h-8 ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{labels.tutorialCompleteTitle}</h2>
              <p className="text-slate-400 mb-6">{labels.tutorialCompleteBody}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                  {labels.restartSimulation}
              </button>
          </div>
        )}
      </div>

      {/* Footer / Legend */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {labels.legendLabels.master}</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500"></div> {labels.legendLabels.develop}</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> {labels.legendLabels.feature}</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {labels.legendLabels.release}</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> {labels.legendLabels.hotfix}</div>
      </div>
    </div>
  );
};

// Helper for labels
function getActionLabel(action: SimulationStep['requiredAction'], actionLabels: ControlLabels['actionLabels']) {
    return actionLabels[action] || actionLabels.none;
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
