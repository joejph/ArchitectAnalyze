import { useState } from 'react';
import Header from './components/Header';
import ScriptPreview from './components/ScriptPreview';
import { analysisModules, type ModuleId } from './data/modules';
import { generateScript } from './data/scriptGenerator';

export default function App() {
  const [selectedModules, setSelectedModules] = useState<Set<ModuleId>>(
    new Set<ModuleId>(['services', 'ports', 'network', 'process', 'docker', 'config', 'resources'])
  );
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleModule = (id: ModuleId) => {
    const next = new Set(selectedModules);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedModules(next);
  };

  const selectAll = () => {
    setSelectedModules(new Set(analysisModules.map((m) => m.id)));
  };

  const selectNone = () => {
    setSelectedModules(new Set());
  };

  const getScript = () => {
    const modules = analysisModules.filter((m) => selectedModules.has(m.id));
    return generateScript(modules);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const script = getScript();
    const blob = new Blob([script], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analyze_architecture.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Module Selection */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                选择分析模块
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-sm bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 rounded-lg hover:bg-emerald-900/50 transition-colors"
              >
                全选
              </button>
              <button
                onClick={selectNone}
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
              >
                全不选
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {analysisModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  selectedModules.has(mod.id)
                    ? 'bg-emerald-900/20 border-emerald-600/50 shadow-lg shadow-emerald-900/20'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedModules.has(mod.id) ? 'bg-emerald-600' : 'bg-gray-800'
                    }`}
                  >
                    <i className={`${mod.icon} text-white text-sm`}></i>
                  </div>
                  <span className="font-semibold text-gray-200">{mod.name}</span>
                  {selectedModules.has(mod.id) && (
                    <i className="fas fa-check-circle text-emerald-400 ml-auto"></i>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{mod.description}</p>
                <div className="mt-2 text-xs text-gray-600">{mod.commands.length} 个命令</div>
              </button>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleCopy}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:scale-105"
            >
              {copied ? (
                <>
                  <i className="fas fa-check"></i>
                  <span>已复制到剪贴板!</span>
                </>
              ) : (
                <>
                  <i className="fas fa-copy"></i>
                  <span>复制脚本</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-105"
            >
              <i className="fas fa-download"></i>
              <span>下载 .sh 文件</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-3 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl border border-gray-700 transition-all duration-200"
            >
              <i className="fas fa-eye"></i>
              <span>{showPreview ? '隐藏预览' : '预览脚本'}</span>
            </button>
          </div>
        </section>

        {/* Script Preview */}
        {showPreview && (
          <section className="mb-12">
            <ScriptPreview script={getScript()} />
          </section>
        )}

        {/* Usage Instructions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              使用方法
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-emerald-400 font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">下载脚本</h3>
              <p className="text-gray-400 text-sm">
                点击上方"下载 .sh 文件"按钮，将脚本保存到本地。
              </p>
              <div className="mt-3 bg-gray-950 rounded-lg p-3 font-mono text-xs text-cyan-300">
                或复制脚本内容
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-cyan-900/50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-cyan-400 font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">上传到服务器</h3>
              <p className="text-gray-400 text-sm">通过SCP或其他方式将脚本上传到目标Linux服务器。</p>
              <div className="mt-3 bg-gray-950 rounded-lg p-3 font-mono text-xs text-cyan-300">
                scp analyze_architecture.sh user@server:/tmp/
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-purple-400 font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">执行分析</h3>
              <p className="text-gray-400 text-sm">赋予执行权限并运行脚本，生成分析报告。</p>
              <div className="mt-3 bg-gray-950 rounded-lg p-3 font-mono text-xs text-cyan-300">
                chmod +x analyze_architecture.sh
                <br />
                sudo ./analyze_architecture.sh
              </div>
            </div>
          </div>
        </section>

        {/* Output Description */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              输出内容
            </span>
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-emerald-400 font-semibold mb-3">
                  <i className="fas fa-folder-open mr-2"></i>报告目录结构
                </h3>
                <pre className="bg-gray-950 rounded-lg p-4 text-sm text-gray-300 font-mono overflow-x-auto">
{`architecture_report_20240101_120000/
├── report.html          # HTML可视化报告
└── raw_data/            # 原始数据
    ├── all_output.txt   # 所有输出汇总
    ├── services_running.txt
    ├── tcp_listen.txt
    ├── all_connections.txt
    ├── processes.txt
    ├── docker_ps.txt
    └── ...`}
                </pre>
              </div>
              <div>
                <h3 className="text-cyan-400 font-semibold mb-3">
                  <i className="fas fa-file-code mr-2"></i>HTML报告包含
                </h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>系统基本信息（OS版本、内核、运行时间）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>运行中的服务及状态</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>端口监听情况与对应进程</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>网络连接关系</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>进程树与层级关系</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>Docker容器状态（如有）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-emerald-400 mt-1"></i>
                    <span>系统资源使用情况</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              架构还原示例
            </span>
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <p className="text-gray-400 text-center mb-8">
              通过脚本收集信息后，你可以绘制出类似下面的系统架构图：
            </p>
            <ArchitectureDiagram />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Linux系统架构分析脚本生成器</p>
          <p className="mt-2 text-sm">生成可执行脚本 → 上传到服务器 → 自动分析 → 生成报告 🚀</p>
        </div>
      </footer>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl px-8 py-4 text-center">
        <div className="text-blue-400 font-semibold">🌐 客户端 / 浏览器</div>
        <div className="text-gray-500 text-sm">HTTP/HTTPS (80/443)</div>
      </div>

      <div className="text-gray-600">
        <i className="fas fa-arrow-down text-2xl"></i>
      </div>

      <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-8 py-4 text-center">
        <div className="text-emerald-400 font-semibold">⚡ Nginx (反向代理/负载均衡)</div>
        <div className="text-gray-500 text-sm">监听 80/443 → 转发到后端</div>
      </div>

      <div className="text-gray-600">
        <i className="fas fa-arrow-down text-2xl"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-cyan-400 font-semibold text-sm">🖥️ Web应用</div>
          <div className="text-gray-500 text-xs">端口 3000</div>
        </div>
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-purple-400 font-semibold text-sm">🔧 API服务</div>
          <div className="text-gray-500 text-xs">端口 8080</div>
        </div>
        <div className="bg-pink-900/30 border border-pink-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-pink-400 font-semibold text-sm">📋 后台管理</div>
          <div className="text-gray-500 text-xs">端口 8000</div>
        </div>
      </div>

      <div className="text-gray-600">
        <i className="fas fa-arrow-down text-2xl"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-yellow-400 font-semibold text-sm">🗄️ MySQL</div>
          <div className="text-gray-500 text-xs">端口 3306</div>
        </div>
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-red-400 font-semibold text-sm">📮 Redis</div>
          <div className="text-gray-500 text-xs">端口 6379</div>
        </div>
        <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-indigo-400 font-semibold text-sm">📨 RabbitMQ</div>
          <div className="text-gray-500 text-xs">端口 5672</div>
        </div>
      </div>
    </div>
  );
}
