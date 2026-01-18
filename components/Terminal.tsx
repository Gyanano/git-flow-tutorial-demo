import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full bg-slate-900 border-t border-slate-700 flex flex-col font-mono text-sm shadow-inner">
      <div className="bg-slate-800 px-4 py-1 text-slate-400 text-xs flex items-center justify-between">
        <span>TERMINAL</span>
        <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 text-slate-300">
        {logs.map((log, i) => (
          <div key={i} className={`${log.startsWith('$') ? 'text-yellow-400 font-bold mt-2' : 'text-slate-300 ml-2'}`}>
            {log}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
