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
          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/50 rounded-xl p-6 mb-6">
            <p className="text-center text-gray-300 mb-4">
              <i className="fas fa-info-circle text-emerald-400 mr-2"></i>
              脚本会根据你选择的模块动态生成，点击下方按钮即可获取
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-105"
              >
                <i className="fas fa-download"></i>
                <span>下载 analyze_architecture.sh</span>
              </button>
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
                    <span>复制脚本内容</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-3 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl border border-gray-700 transition-all duration-200"
              >
                <i className="fas fa-eye"></i>
                <span>{showPreview ? '隐藏预览' : '预览脚本'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Script Preview */}
        {showPreview && (
          <section className="mb-12">
            <ScriptPreview script={getScript()} />
          </section>
        )}

        {/* Usage Instructions - Detailed Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              完整运行指南
            </span>
          </h2>

          {/* Quick Start */}
          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">
              <i className="fas fa-rocket mr-2"></i>快速开始（3步完成）
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-200 font-medium">下载脚本</span>
                </div>
                <p className="text-gray-400 text-xs">点击上方"下载 .sh 文件"按钮</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-200 font-medium">上传到服务器</span>
                </div>
                <p className="text-gray-400 text-xs">使用SCP或FTP上传到Linux服务器</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-200 font-medium">执行脚本</span>
                </div>
                <p className="text-gray-400 text-xs">赋予权限并运行，生成HTML报告</p>
              </div>
            </div>
          </div>

          {/* Detailed Methods */}
          <div className="space-y-6">
            {/* Method 1: SCP Upload */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
                <i className="fas fa-upload text-emerald-400 mr-2"></i>
                方式一：SCP上传（推荐）
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">在你的本地电脑上执行：</p>
                  <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-500 mb-1"># 1. 上传脚本到服务器</div>
                    <div className="text-cyan-300">scp analyze_architecture.sh user@your-server:/tmp/</div>
                    <div className="text-gray-500 mt-3 mb-1"># 2. SSH登录到服务器</div>
                    <div className="text-cyan-300">ssh user@your-server</div>
                    <div className="text-gray-500 mt-3 mb-1"># 3. 赋予执行权限</div>
                    <div className="text-cyan-300">chmod +x /tmp/analyze_architecture.sh</div>
                    <div className="text-gray-500 mt-3 mb-1"># 4. 运行脚本（建议用sudo获取完整信息）</div>
                    <div className="text-cyan-300">sudo /tmp/analyze_architecture.sh</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Method 2: Copy Paste */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
                <i className="fas fa-copy text-cyan-400 mr-2"></i>
                方式二：复制粘贴（无需上传文件）
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">直接在服务器上创建并执行：</p>
                  <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-500 mb-1"># 1. SSH登录到服务器</div>
                    <div className="text-cyan-300">ssh user@your-server</div>
                    <div className="text-gray-500 mt-3 mb-1"># 2. 创建脚本文件</div>
                    <div className="text-cyan-300">nano /tmp/analyze_architecture.sh</div>
                    <div className="text-gray-500 mt-3 mb-1"># 3. 粘贴脚本内容（从网页复制），保存退出</div>
                    <div className="text-gray-500 mt-3 mb-1"># 4. 赋予执行权限并运行</div>
                    <div className="text-cyan-300">chmod +x /tmp/analyze_architecture.sh</div>
                    <div className="text-cyan-300">sudo /tmp/analyze_architecture.sh</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Method 3: Direct Command */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
                <i className="fas fa-terminal text-purple-400 mr-2"></i>
                方式三：一行命令（高级用户）
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">直接在服务器上执行（需要curl或wget）：</p>
                  <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-500 mb-1"># 使用curl下载并执行（不推荐，仅用于测试）</div>
                    <div className="text-cyan-300">curl -s URL_TO_SCRIPT | sudo bash</div>
                    <div className="text-gray-500 mt-3 mb-1"># 或使用wget</div>
                    <div className="text-cyan-300">wget -qO- URL_TO_SCRIPT | sudo bash</div>
                    <div className="text-yellow-400 mt-3 text-xs">⚠️ 注意：这种方式需要脚本托管在可访问的URL上</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Output */}
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              <i className="fas fa-check-circle text-emerald-400 mr-2"></i>
              预期输出
            </h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm mb-4">
              <div className="text-gray-500"># 脚本运行时会显示：</div>
              <div className="text-blue-400">========================================</div>
              <div className="text-green-400">  Linux系统架构自动分析工具</div>
              <div className="text-blue-400">========================================</div>
              <div className="text-cyan-400">报告将保存到: ./architecture_report_20240101_120000</div>
              <div className="text-gray-500 mt-2"># 然后逐项分析...</div>
              <div className="text-yellow-400">[分析] 系统基本信息...</div>
              <div className="text-green-400">  ✓ 完成</div>
              <div className="text-yellow-400">[分析] 运行中的服务列表...</div>
              <div className="text-green-400">  ✓ 完成</div>
              <div className="text-gray-500">...</div>
              <div className="text-blue-400 mt-2">========================================</div>
              <div className="text-green-400">  ✅ 分析完成！</div>
              <div className="text-blue-400">========================================</div>
              <div className="text-cyan-400">报告目录: ./architecture_report_20240101_120000</div>
              <div className="text-cyan-400">HTML报告: ./architecture_report_20240101_120000/report.html</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-950/50 rounded-lg p-4">
                <p className="text-emerald-400 font-medium mb-2">
                  <i className="fas fa-folder-open mr-2"></i>生成的文件
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• <code className="text-cyan-300">report.html</code> - 可视化HTML报告</li>
                  <li>• <code className="text-cyan-300">raw_data/</code> - 原始数据目录</li>
                  <li>• <code className="text-cyan-300">all_output.txt</code> - 所有输出汇总</li>
                </ul>
              </div>
              <div className="bg-gray-950/50 rounded-lg p-4">
                <p className="text-cyan-400 font-medium mb-2">
                  <i className="fas fa-eye mr-2"></i>查看报告
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• 将 <code className="text-cyan-300">report.html</code> 下载到本地</li>
                  <li>• 用浏览器打开查看完整分析结果</li>
                  <li>• 或直接在服务器上用 <code className="text-cyan-300">cat</code> 查看原始数据</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Runtime Requirements */}
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              <i className="fas fa-server text-blue-400 mr-2"></i>
              运行环境要求
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-950/50 rounded-lg p-4">
                  <p className="text-emerald-400 font-medium mb-2">
                    <i className="fas fa-check-circle mr-2"></i>必需环境
                  </p>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• <strong className="text-gray-300">操作系统：</strong>Linux（任何发行版）</li>
                    <li>• <strong className="text-gray-300">Shell：</strong>Bash 4.0+</li>
                    <li>• <strong className="text-gray-300">权限：</strong>建议 root 或 sudo</li>
                    <li>• <strong className="text-gray-300">磁盘空间：</strong>至少 10MB 可用空间</li>
                  </ul>
                </div>
                <div className="bg-gray-950/50 rounded-lg p-4">
                  <p className="text-cyan-400 font-medium mb-2">
                    <i className="fas fa-terminal mr-2"></i>必需命令
                  </p>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• <code className="text-cyan-300">bash</code> - Shell解释器</li>
                    <li>• <code className="text-cyan-300">systemctl</code> - 服务管理（systemd）</li>
                    <li>• <code className="text-cyan-300">ss</code> 或 <code className="text-cyan-300">netstat</code> - 网络查看</li>
                    <li>• <code className="text-cyan-300">ps</code> - 进程查看</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-950/50 rounded-lg p-4">
                <p className="text-yellow-400 font-medium mb-2">
                  <i className="fas fa-info-circle mr-2"></i>可选命令（部分模块需要）
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-gray-400 text-sm">
                  <div>• <code className="text-cyan-300">docker</code> - 容器分析模块</div>
                  <div>• <code className="text-cyan-300">kubectl</code> - K8s分析</div>
                  <div>• <code className="text-cyan-300">pstree</code> - 进程树显示</div>
                  <div>• <code className="text-cyan-300">iostat</code> - I/O统计（需sysstat包）</div>
                  <div>• <code className="text-cyan-300">iptables</code> / <code className="text-cyan-300">nft</code> - 防火墙</div>
                  <div>• <code className="text-cyan-300">rpm</code> / <code className="text-cyan-300">dpkg</code> - 包管理</div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  💡 缺失的命令会被自动跳过，不影响其他模块的运行
                </p>
              </div>

              <div className="bg-gray-950/50 rounded-lg p-4">
                <p className="text-purple-400 font-medium mb-2">
                  <i className="fab fa-linux mr-2"></i>支持的Linux发行版
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">Ubuntu</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">Debian</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">CentOS</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">RHEL</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">Fedora</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">Arch Linux</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">openSUSE</span>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">Alpine</span>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>注意：</strong>脚本只在Linux环境下运行。不支持Windows、macOS或BSD系统。如果是Windows服务器，请使用WSL或远程连接到Linux服务器执行。
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              <i className="fas fa-question-circle text-yellow-400 mr-2"></i>
              常见问题
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-emerald-400 font-medium mb-1">Q: 需要用root用户运行吗？</p>
                <p className="text-gray-400 text-sm">A: 建议使用sudo运行，这样可以获取更完整的信息（如所有进程、完整网络信息等）。普通用户也能运行，但部分信息可能受限。</p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium mb-1">Q: 脚本会修改系统吗？</p>
                <p className="text-gray-400 text-sm">A: 不会。脚本只读取系统信息，不做任何修改。所有输出都保存在当前目录下的报告文件夹中。</p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium mb-1">Q: 支持哪些Linux发行版？</p>
                <p className="text-gray-400 text-sm">A: 支持所有主流Linux发行版：CentOS、RHEL、Ubuntu、Debian、Fedora、Arch等。脚本会自动检测系统类型。</p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium mb-1">Q: 如何查看生成的报告？</p>
                <p className="text-gray-400 text-sm">A: 将 <code className="text-cyan-300">report.html</code> 文件下载到本地，用浏览器打开即可。或者用 <code className="text-cyan-300">cat raw_data/*.txt</code> 查看原始数据。</p>
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
