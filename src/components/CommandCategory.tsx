import { useState } from 'react';
import type { Category } from '../data/commands';

export default function CommandCategory({ category }: { category: Category }) {
  const [expandedCmd, setExpandedCmd] = useState<number | null>(null);

  return (
    <div>
      {/* Category Description */}
      <div className="text-center mb-8">
        <p className="text-gray-400 max-w-2xl mx-auto">{category.description}</p>
      </div>

      {/* Commands List */}
      <div className="space-y-4">
        {category.commands.map((cmd, idx) => (
          <div
            key={idx}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
          >
            {/* Command Header */}
            <button
              onClick={() => setExpandedCmd(expandedCmd === idx ? null : idx)}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="bg-gray-800 rounded-lg px-3 py-1.5 shrink-0">
                <span className="text-emerald-400 font-mono text-sm">$</span>
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-cyan-300 font-mono text-sm sm:text-base break-all">
                  {cmd.command}
                </code>
                <p className="text-gray-400 text-sm mt-1">{cmd.description}</p>
              </div>
              <div className={`text-gray-500 transition-transform duration-200 shrink-0 ${expandedCmd === idx ? 'rotate-180' : ''}`}>
                <i className="fas fa-chevron-down"></i>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedCmd === idx && (
              <div className="px-4 pb-4 pt-0">
                <div className="ml-12 border-t border-gray-800 pt-4 space-y-3">
                  {/* Output Example */}
                  {cmd.output && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
                        <i className="fas fa-desktop mr-1"></i> 示例输出
                      </p>
                      <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 overflow-x-auto">
                        <pre className="text-gray-300 text-xs sm:text-sm font-mono whitespace-pre leading-relaxed">
                          {cmd.output}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tip */}
                  {cmd.tip && (
                    <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-lg p-3">
                      <p className="text-sm text-emerald-300">
                        <i className="fas fa-lightbulb mr-2"></i>
                        {cmd.tip}
                      </p>
                    </div>
                  )}

                  {/* Copy Button */}
                  <CopyButton command={cmd.command} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
    >
      {copied ? (
        <>
          <i className="fas fa-check text-emerald-400"></i>
          <span>已复制!</span>
        </>
      ) : (
        <>
          <i className="fas fa-copy"></i>
          <span>复制命令</span>
        </>
      )}
    </button>
  );
}
