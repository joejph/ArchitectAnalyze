import { useState } from 'react';

const workflowSteps = [
  {
    step: 1,
    title: '查看运行中的服务',
    icon: 'fas fa-server',
    color: 'emerald',
    commands: ['systemctl list-units --type=service --state=running', 'ps aux --sort=-%mem | head -20'],
    description: '首先了解系统上运行了哪些服务，这是架构分析的起点。',
    whatToLook: '关注服务名称、运行用户、启动命令'
  },
  {
    step: 2,
    title: '查看监听端口',
    icon: 'fas fa-plug',
    color: 'cyan',
    commands: ['ss -tlnp', 'ss -ulnp'],
    description: '查看每个服务监听的端口号，了解对外暴露了哪些接口。',
    whatToLook: '注意监听地址（0.0.0.0 vs 127.0.0.1）和端口号'
  },
  {
    step: 3,
    title: '分析网络连接',
    icon: 'fas fa-network-wired',
    color: 'purple',
    commands: ['ss -tunap', 'ss -tnp state established'],
    description: '查看已建立的连接，了解服务之间的通信关系。',
    whatToLook: '哪些服务在互相通信，连接的目标地址和端口'
  },
  {
    step: 4,
    title: '查看进程树',
    icon: 'fas fa-sitemap',
    color: 'blue',
    commands: ['ps -ef --forest', 'pstree -p'],
    description: '通过进程树了解进程之间的父子关系，识别主进程和工作进程。',
    whatToLook: '主进程和子进程的关系，哪些进程属于同一个服务'
  },
  {
    step: 5,
    title: '检查容器环境',
    icon: 'fas fa-cube',
    color: 'orange',
    commands: ['docker ps', 'find / -name "docker-compose.yml" 2>/dev/null'],
    description: '检查是否使用了Docker或Kubernetes等容器技术。',
    whatToLook: '容器名称、镜像、端口映射、网络配置'
  },
  {
    step: 6,
    title: '查看配置文件',
    icon: 'fas fa-file-code',
    color: 'pink',
    commands: ['systemctl cat <服务名>', 'cat /etc/nginx/nginx.conf'],
    description: '通过配置文件了解服务的详细设置和依赖关系。',
    whatToLook: '启动参数、工作目录、依赖服务、代理配置'
  },
  {
    step: 7,
    title: '绘制架构图',
    icon: 'fas fa-draw-polygon',
    color: 'yellow',
    commands: [],
    description: '综合以上信息，绘制出系统的完整架构图。',
    whatToLook: '前端入口 → 反向代理 → 应用服务 → 数据存储的完整链路'
  }
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-700/50', text: 'text-emerald-400', badge: 'bg-emerald-600' },
  cyan: { bg: 'bg-cyan-900/20', border: 'border-cyan-700/50', text: 'text-cyan-400', badge: 'bg-cyan-600' },
  purple: { bg: 'bg-purple-900/20', border: 'border-purple-700/50', text: 'text-purple-400', badge: 'bg-purple-600' },
  blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-400', badge: 'bg-blue-600' },
  orange: { bg: 'bg-orange-900/20', border: 'border-orange-700/50', text: 'text-orange-400', badge: 'bg-orange-600' },
  pink: { bg: 'bg-pink-900/20', border: 'border-pink-700/50', text: 'text-pink-400', badge: 'bg-pink-600' },
  yellow: { bg: 'bg-yellow-900/20', border: 'border-yellow-700/50', text: 'text-yellow-400', badge: 'bg-yellow-600' },
};

export default function WorkflowSection() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section>
      <h2 className="text-3xl font-bold text-center mb-4">
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          分析工作流程
        </span>
      </h2>
      <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
        按照以下步骤逐步分析，从宏观到微观，全面还原系统架构
      </p>

      <div className="space-y-4">
        {workflowSteps.map((step) => {
          const colors = colorMap[step.color];
          const isExpanded = expandedStep === step.step;

          return (
            <div
              key={step.step}
              className={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden transition-all duration-300`}
            >
              {/* Step Header */}
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className={`${colors.badge} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {step.step}
                </div>
                <div className={`${colors.text} text-xl shrink-0`}>
                  <i className={step.icon}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-200">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
                <div className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <i className="fas fa-chevron-down"></i>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0">
                  <div className="ml-14 border-t border-gray-800 pt-4">
                    {/* Commands */}
                    {step.commands.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2 font-medium">推荐命令：</p>
                        <div className="space-y-2">
                          {step.commands.map((cmd, idx) => (
                            <CommandBlock key={idx} command={cmd} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What to look for */}
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                      <p className="text-sm">
                        <span className={`${colors.text} font-semibold`}>
                          <i className="fas fa-eye mr-2"></i>重点关注：
                        </span>
                        <span className="text-gray-400 ml-2">{step.whatToLook}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center bg-gray-950 rounded-lg border border-gray-800 overflow-hidden group">
      <div className="flex-1 px-4 py-2.5 font-mono text-sm text-emerald-300 overflow-x-auto">
        <span className="text-gray-600 mr-2">$</span>
        {command}
      </div>
      <button
        onClick={handleCopy}
        className="px-3 py-2.5 text-gray-500 hover:text-emerald-400 transition-colors border-l border-gray-800"
        title="复制命令"
      >
        {copied ? (
          <i className="fas fa-check text-emerald-400"></i>
        ) : (
          <i className="fas fa-copy"></i>
        )}
      </button>
    </div>
  );
}
