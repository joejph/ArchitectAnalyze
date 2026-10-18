export default function Header() {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl shadow-purple-600/30 mb-8">
            <i className="fas fa-project-diagram text-3xl text-white"></i>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
              Linux集群架构分析工具
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4 leading-relaxed">
            一键采集多台服务器信息，自动生成集群架构分析报告
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            支持单节点和集群模式 · SSH自动采集 · HTML可视化报告
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <i className="fas fa-server text-emerald-400"></i>
              <span className="text-gray-300 text-sm">多节点采集</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <i className="fas fa-network-wired text-cyan-400"></i>
              <span className="text-gray-300 text-sm">SSH自动连接</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <i className="fas fa-file-code text-purple-400"></i>
              <span className="text-gray-300 text-sm">HTML集群报告</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <i className="fas fa-shield-alt text-orange-400"></i>
              <span className="text-gray-300 text-sm">只读不修改</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
