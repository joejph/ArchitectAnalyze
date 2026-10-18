import { useState } from 'react';

export default function ScriptPreview({ script }: { script: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = script.split('\n').length;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-sm font-mono">analyze_architecture.sh</span>
          <span className="text-gray-600 text-xs">({lineCount} 行)</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
        >
          {copied ? (
            <>
              <i className="fas fa-check text-emerald-400"></i>
              <span>已复制</span>
            </>
          ) : (
            <>
              <i className="fas fa-copy"></i>
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-auto max-h-[600px]">
        <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed">
          <code>{script}</code>
        </pre>
      </div>
    </div>
  );
}
