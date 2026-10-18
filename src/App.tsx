import { useState } from 'react';
import Header from './components/Header';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'cluster'>('cluster');
  const [copied, setCopied] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mode Selection */}
        <section className="mb-12">
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'single'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-server mr-2"></i>单台服务器
            </button>
            <button
              onClick={() => setActiveTab('cluster')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'cluster'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-project-diagram mr-2"></i>集群（多台服务器）
            </button>
          </div>
        </section>

        {activeTab === 'cluster' ? <ClusterMode copied={copied} onCopy={handleCopy} /> : <SingleMode copied={copied} onCopy={handleCopy} />}

        {/* Architecture Diagram */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              集群架构示例
            </span>
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <ClusterDiagram />
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Linux集群架构分析工具</p>
          <p className="mt-2 text-sm">采集 → 汇总 → 生成报告 🚀</p>
        </div>
      </footer>
    </div>
  );
}

function SingleMode({ copied, onCopy }: { copied: string; onCopy: (text: string, id: string) => void }) {
  return (
    <>
      {/* Download Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-emerald-400 mb-4">
            <i className="fas fa-download mr-2"></i>下载单节点分析脚本
          </h3>
          <p className="text-gray-400 mb-6">在每台服务器上运行此脚本，自动采集系统信息并生成HTML报告</p>
          <a
            href="./node_collect.sh"
            download
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <i className="fas fa-download"></i>
            <span>下载 node_collect.sh</span>
          </a>
        </div>
      </section>

      {/* Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            运行步骤
          </span>
        </h2>
        <div className="space-y-4">
          <StepCard
            step={1}
            title="上传脚本到服务器"
            color="emerald"
            commands={[
              { label: '从本地上传', cmd: 'scp node_collect.sh user@服务器IP:/tmp/' }
            ]}
          />
          <StepCard
            step={2}
            title="SSH登录并执行"
            color="cyan"
            commands={[
              { label: '登录服务器', cmd: 'ssh user@服务器IP' },
              { label: '赋予权限', cmd: 'chmod +x /tmp/node_collect.sh' },
              { label: '运行采集', cmd: 'sudo /tmp/node_collect.sh' },
            ]}
          />
          <StepCard
            step={3}
            title="查看结果"
            color="purple"
            commands={[
              { label: '查看报告', cmd: 'ls -la node_*' },
              { label: '打包传回', cmd: 'tar czf node_data.tar.gz node_*' },
              { label: '下载到本地', cmd: 'scp user@服务器IP:/path/node_data.tar.gz ./' },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function ClusterMode({ copied, onCopy }: { copied: string; onCopy: (text: string, id: string) => void }) {
  return (
    <>
      {/* Overview */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-3">
            <i className="fas fa-project-diagram mr-2"></i>集群分析工作流程
          </h3>
          <p className="text-gray-400 mb-4">
            集群分析需要两个脚本配合工作：一个在每台服务器上采集数据，一个在管理节点汇总生成报告。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📥</div>
              <div className="text-gray-300 text-sm font-medium">下载脚本</div>
              <div className="text-gray-500 text-xs">获取两个脚本文件</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🖥️</div>
              <div className="text-gray-300 text-sm font-medium">各节点采集</div>
              <div className="text-gray-500 text-xs">每台服务器运行采集脚本</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-gray-300 text-sm font-medium">汇总数据</div>
              <div className="text-gray-500 text-xs">将数据传到管理节点</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-gray-300 text-sm font-medium">生成报告</div>
              <div className="text-gray-500 text-xs">运行主控脚本生成HTML</div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            下载脚本文件
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center">
                <i className="fas fa-server text-emerald-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-200">节点采集脚本</h3>
                <p className="text-gray-500 text-sm">在每台服务器上运行</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              采集本机的服务、端口、进程、容器、网络等信息，保存到本地目录。
            </p>
            <a
              href="./node_collect.sh"
              download
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              <i className="fas fa-download"></i>
              <span>下载 node_collect.sh</span>
            </a>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center">
                <i className="fas fa-project-diagram text-purple-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-200">主控汇总脚本</h3>
                <p className="text-gray-500 text-sm">在管理节点运行</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              通过SSH自动连接各节点采集数据，或汇总已采集的数据，生成集群HTML报告。
            </p>
            <a
              href="./cluster_analyze.sh"
              download
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
            >
              <i className="fas fa-download"></i>
              <span>下载 cluster_analyze.sh</span>
            </a>
          </div>
        </div>
      </section>

      {/* Two Modes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            两种使用模式
          </span>
        </h2>

        {/* Mode A: Auto */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">
            <i className="fas fa-bolt mr-2"></i>
            模式A：自动采集（推荐）
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            在管理节点运行主控脚本，自动通过SSH连接各服务器执行采集。需要配置SSH免密登录。
          </p>
          <div className="space-y-4">
            <StepCard
              step={1}
              title="配置SSH免密登录"
              color="emerald"
              commands={[
                { label: '生成密钥（如已有可跳过）', cmd: 'ssh-keygen -t rsa -b 4096' },
                { label: '分发到各节点', cmd: 'ssh-copy-id root@192.168.1.10' },
                { label: '（对每台节点执行）', cmd: 'ssh-copy-id root@192.168.1.11' },
              ]}
            />
            <StepCard
              step={2}
              title="准备文件"
              color="cyan"
              commands={[
                { label: '在管理节点创建工作目录', cmd: 'mkdir ~/cluster_analysis && cd ~/cluster_analysis' },
                { label: '上传两个脚本到管理节点', cmd: 'scp node_collect.sh cluster_analyze.sh admin@管理节点:~/cluster_analysis/' },
              ]}
            />
            <StepCard
              step={3}
              title="配置服务器列表"
              color="purple"
              commands={[
                { label: '创建服务器列表文件', cmd: 'nano servers.txt' },
                { label: '格式: IP 端口 用户名', cmd: '192.168.1.10 22 root' },
                { label: '', cmd: '192.168.1.11 22 root' },
                { label: '', cmd: '192.168.1.12 22 admin' },
              ]}
            />
            <StepCard
              step={4}
              title="运行主控脚本"
              color="orange"
              commands={[
                { label: '赋予权限', cmd: 'chmod +x cluster_analyze.sh node_collect.sh' },
                { label: '执行自动采集', cmd: 'sudo ./cluster_analyze.sh auto' },
              ]}
            />
          </div>
        </div>

        {/* Mode B: Manual */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            <i className="fas fa-hand-pointer mr-2"></i>
            模式B：手动采集（无SSH免密时）
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            分别在每台服务器上手动运行采集脚本，然后将数据汇总到管理节点。
          </p>
          <div className="space-y-4">
            <StepCard
              step={1}
              title="各节点运行采集脚本"
              color="emerald"
              commands={[
                { label: '上传脚本到每台服务器', cmd: 'scp node_collect.sh user@节点IP:/tmp/' },
                { label: '在每台服务器上执行', cmd: 'ssh user@节点IP' },
                { label: '', cmd: 'chmod +x /tmp/node_collect.sh' },
                { label: '', cmd: 'sudo /tmp/node_collect.sh' },
              ]}
            />
            <StepCard
              step={2}
              title="收集数据到管理节点"
              color="cyan"
              commands={[
                { label: '在各节点上打包数据', cmd: 'tar czf node_data.tar.gz node_*' },
                { label: '传回管理节点', cmd: 'scp node_data.tar.gz admin@管理节点:~/data/' },
                { label: '（对每台节点执行）', cmd: '# 重复以上步骤' },
              ]}
            />
            <StepCard
              step={3}
              title="在管理节点汇总"
              color="purple"
              commands={[
                { label: '创建工作目录', cmd: 'mkdir ~/cluster_analysis && cd ~/cluster_analysis' },
                { label: '创建data目录并放入数据', cmd: 'mkdir data && mv ~/data/*.tar.gz data/' },
                { label: '解压所有数据', cmd: 'cd data && for f in *.tar.gz; do tar xzf $f; done && cd ..' },
                { label: '运行汇总脚本', cmd: 'sudo ./cluster_analyze.sh manual' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Output */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            输出结果
          </span>
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-emerald-400 font-semibold mb-3">
                <i className="fas fa-folder-open mr-2"></i>目录结构
              </h3>
              <pre className="bg-gray-950 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-x-auto">
{`cluster_report_20240101/
├── cluster_report.html    ← 用浏览器打开
└── nodes/
    ├── node_web01_202401/
    │   ├── hostname.txt
    │   ├── ip.txt
    │   ├── services_running.txt
    │   ├── tcp_listen.txt
    │   ├── processes.txt
    │   ├── docker_ps.txt
    │   └── ...
    ├── node_db01_202401/
    │   └── ...
    └── node_cache01_202401/
        └── ...`}
              </pre>
            </div>
            <div>
              <h3 className="text-cyan-400 font-semibold mb-3">
                <i className="fas fa-file-code mr-2"></i>HTML报告功能
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>集群概览：所有节点一览</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>Tab切换：按节点查看详细信息</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>服务状态：各节点运行的服务对比</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>端口监听：各节点暴露的端口</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>进程信息：资源占用和进程树</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>容器状态：Docker/K8s信息</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-400 mt-1"></i>
                  <span>网络配置：接口、路由、DNS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            常见问题
          </span>
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <p className="text-emerald-400 font-medium mb-1">Q: 需要多少台服务器？</p>
              <p className="text-gray-400 text-sm">A: 任意数量。2台到100台都可以，脚本会自动处理。</p>
            </div>
            <div>
              <p className="text-emerald-400 font-medium mb-1">Q: 管理节点需要特殊配置吗？</p>
              <p className="text-gray-400 text-sm">A: 管理节点可以是集群中的任意一台服务器，只要能SSH到其他节点即可。也可以是一台独立的跳板机。</p>
            </div>
            <div>
              <p className="text-emerald-400 font-medium mb-1">Q: SSH免密登录怎么配置？</p>
              <p className="text-gray-400 text-sm">
                A: 在管理节点执行 <code className="text-cyan-300">ssh-keygen -t rsa</code> 生成密钥，
                然后对每台节点执行 <code className="text-cyan-300">ssh-copy-id user@节点IP</code>。
              </p>
            </div>
            <div>
              <p className="text-emerald-400 font-medium mb-1">Q: 可以只分析部分节点吗？</p>
              <p className="text-gray-400 text-sm">A: 可以。在 servers.txt 中只添加需要分析的服务器，或手动模式只收集部分节点数据。</p>
            </div>
            <div>
              <p className="text-emerald-400 font-medium mb-1">Q: 脚本会修改服务器配置吗？</p>
              <p className="text-gray-400 text-sm">A: 不会。脚本只读取系统信息，不做任何修改。采集完成后会自动清理临时文件。</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function StepCard({ step, title, color, commands }: {
  step: number;
  title: string;
  color: string;
  commands: { label: string; cmd: string }[];
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-600',
    cyan: 'bg-cyan-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className={`${colorMap[color]} text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold`}>
          {step}
        </span>
        <span className="text-gray-200 font-medium">{title}</span>
      </div>
      <div className="space-y-1.5 ml-10">
        {commands.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {c.label && <span className="text-gray-500 text-xs min-w-[100px]">{c.label}</span>}
            <code className="text-cyan-300 text-sm font-mono bg-gray-900 px-2 py-1 rounded flex-1 overflow-x-auto">
              {c.cmd}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClusterDiagram() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Management Node */}
      <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl px-8 py-4 text-center w-full max-w-md">
        <div className="text-purple-400 font-semibold">🎯 管理节点 (cluster_analyze.sh)</div>
        <div className="text-gray-500 text-sm">SSH连接各节点 → 汇总数据 → 生成HTML报告</div>
      </div>

      <div className="text-gray-600">
        <i className="fas fa-arrows-alt-v text-2xl"></i>
      </div>

      {/* Server Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-emerald-400 font-semibold text-sm">🖥️ Web服务器 #1</div>
          <div className="text-gray-500 text-xs">192.168.1.10</div>
          <div className="text-gray-600 text-xs mt-1">Nginx + Node.js</div>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-emerald-400 font-semibold text-sm">🖥️ Web服务器 #2</div>
          <div className="text-gray-500 text-xs">192.168.1.11</div>
          <div className="text-gray-600 text-xs mt-1">Nginx + Node.js</div>
        </div>
        <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-cyan-400 font-semibold text-sm">🖥️ API服务器</div>
          <div className="text-gray-500 text-xs">192.168.1.12</div>
          <div className="text-gray-600 text-xs mt-1">Java Spring Boot</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-yellow-400 font-semibold text-sm">🗄️ 数据库主节点</div>
          <div className="text-gray-500 text-xs">192.168.1.20</div>
          <div className="text-gray-600 text-xs mt-1">MySQL Master</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-yellow-400 font-semibold text-sm">🗄️ 数据库从节点</div>
          <div className="text-gray-500 text-xs">192.168.1.21</div>
          <div className="text-gray-600 text-xs mt-1">MySQL Slave</div>
        </div>
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-red-400 font-semibold text-sm">📮 缓存服务器</div>
          <div className="text-gray-500 text-xs">192.168.1.30</div>
          <div className="text-gray-600 text-xs mt-1">Redis Cluster</div>
        </div>
      </div>

      <div className="mt-4 text-center text-gray-500 text-sm">
        <i className="fas fa-info-circle mr-1"></i>
        每台服务器运行 node_collect.sh 采集信息，管理节点汇总生成完整架构报告
      </div>
    </div>
  );
}
