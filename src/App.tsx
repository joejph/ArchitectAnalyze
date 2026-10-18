import { useState } from 'react';
import Header from './components/Header';
import WorkflowSection from './components/WorkflowSection';
import CommandCategory from './components/CommandCategory';
import { commandCategories } from './data/commands';

export default function App() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">
              <i className="fas fa-lightbulb mr-2"></i>
              为什么要分析系统架构？
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              当你接手一套运行在Linux上的信息系统时，往往缺乏完整的架构文档。通过Linux提供的各种命令，
              你可以像"考古"一样，从进程、网络、服务、端口等多个维度，逐步还原出系统的完整运行架构。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-emerald-400 font-semibold mb-2">
                  <i className="fas fa-search mr-2"></i>发现服务
                </div>
                <p className="text-gray-400 text-sm">找出系统运行了哪些服务，它们之间的关系是什么</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-cyan-400 font-semibold mb-2">
                  <i className="fas fa-network-wired mr-2"></i>理解通信
                </div>
                <p className="text-gray-400 text-sm">了解各服务之间的网络连接和通信方式</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-purple-400 font-semibold mb-2">
                  <i className="fas fa-sitemap mr-2"></i>绘制架构
                </div>
                <p className="text-gray-400 text-sm">根据收集的信息，绘制出完整的系统架构图</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <WorkflowSection />

        {/* Command Categories */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              命令速查手册
            </span>
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {commandCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === idx
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                <i className={`${cat.icon} mr-2`}></i>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Active Category Content */}
          <CommandCategory category={commandCategories[activeCategory]} />
        </section>

        {/* Architecture Diagram Example */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              架构还原示例
            </span>
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <p className="text-gray-400 text-center mb-8">
              通过以上命令收集信息后，你可以绘制出类似下面的系统架构图：
            </p>
            <div className="relative">
              <ArchitectureDiagram />
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              实用技巧
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TipCard
              icon="fas fa-terminal"
              title="组合使用命令"
              description="将多个命令通过管道(|)组合，可以过滤出你需要的信息。例如：ps aux | grep nginx 可以快速找到Nginx相关进程。"
              color="emerald"
            />
            <TipCard
              icon="fas fa-file-alt"
              title="查看配置文件"
              description="进程的配置文件通常在 /etc/ 目录下，通过查看配置可以了解服务的详细设置。例如 /etc/nginx/nginx.conf"
              color="cyan"
            />
            <TipCard
              icon="fas fa-history"
              title="查看启动脚本"
              description="systemd的服务文件在 /etc/systemd/system/ 或 /lib/systemd/system/ 下，包含了服务的启动参数和依赖关系。"
              color="purple"
            />
            <TipCard
              icon="fas fa-chart-line"
              title="持续监控"
              description="使用 watch 命令可以持续监控某个命令的输出变化。例如：watch -n 2 'ss -tlnp' 每2秒刷新一次端口监听情况。"
              color="orange"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Linux系统架构分析指南 | 通过命令行工具还原信息系统运行架构</p>
          <p className="mt-2 text-sm">掌握这些命令，让你对系统了如指掌 🚀</p>
        </div>
      </footer>
    </div>
  );
}

function TipCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'border-emerald-800/50 bg-emerald-900/20',
    cyan: 'border-cyan-800/50 bg-cyan-900/20',
    purple: 'border-purple-800/50 bg-purple-900/20',
    orange: 'border-orange-800/50 bg-orange-900/20',
  };
  const iconColors: Record<string, string> = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  return (
    <div className={`rounded-xl p-6 border ${colorClasses[color]}`}>
      <div className={`text-2xl mb-3 ${iconColors[color]}`}>
        <i className={icon}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Client Layer */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl px-8 py-4 text-center">
        <div className="text-blue-400 font-semibold">🌐 客户端 / 浏览器</div>
        <div className="text-gray-500 text-sm">HTTP/HTTPS (80/443)</div>
      </div>
      
      <div className="text-gray-600">
        <i className="fas fa-arrow-down text-2xl"></i>
      </div>

      {/* Nginx */}
      <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-8 py-4 text-center">
        <div className="text-emerald-400 font-semibold">⚡ Nginx (反向代理/负载均衡)</div>
        <div className="text-gray-500 text-sm">监听 80/443 → 转发到后端</div>
      </div>

      <div className="text-gray-600">
        <i className="fas fa-arrow-down text-2xl"></i>
      </div>

      {/* Application Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-cyan-400 font-semibold text-sm">🖥️ Web应用 (Node.js)</div>
          <div className="text-gray-500 text-xs">端口 3000</div>
        </div>
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-purple-400 font-semibold text-sm">🔧 API服务 (Java/Spring)</div>
          <div className="text-gray-500 text-xs">端口 8080</div>
        </div>
        <div className="bg-pink-900/30 border border-pink-700/50 rounded-xl px-4 py-4 text-center">
          <div className="text-pink-400 font-semibold text-sm">📋 后台管理 (Python/Django)</div>
          <div className="text-gray-500 text-xs">端口 8000</div>
        </div>
      </div>

      <div className="text-gray-600">
        <i className="fas fa-arrow-down text-2xl"></i>
      </div>

      {/* Data Layer */}
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
