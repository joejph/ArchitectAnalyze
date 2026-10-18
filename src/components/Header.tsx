export default function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-emerald-950/20 to-gray-950"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          {/* Terminal icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-600 shadow-2xl shadow-emerald-600/30 mb-8">
            <i className="fas fa-terminal text-3xl text-white"></i>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Linux系统架构分析指南
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            通过Linux命令行工具，逐步还原信息系统的运行架构。
            <br className="hidden sm:block" />
            从进程、网络、服务、端口等多个维度，全面掌握系统运行状态。
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2">
              <i className="fas fa-list-check text-emerald-400"></i>
              <span className="text-gray-300 text-sm">7大分析维度</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2">
              <i className="fas fa-terminal text-cyan-400"></i>
              <span className="text-gray-300 text-sm">50+实用命令</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2">
              <i className="fas fa-route text-purple-400"></i>
              <span className="text-gray-300 text-sm">完整分析流程</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
