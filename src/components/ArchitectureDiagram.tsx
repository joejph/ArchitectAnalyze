import { useEffect, useState } from 'react';

interface Node {
  id: number;
  hostname: string;
  ip: string;
  os?: string;
}

interface Relation {
  id: number;
  source_node_id: number;
  target_node_id: number;
  relation_type: string;
  protocol?: string;
  port?: number;
  source_hostname: string;
  target_hostname: string;
}

interface ArchitectureData {
  nodes: Node[];
  relations: Relation[];
}

// 节点类型图标映射
const NODE_ICONS: Record<string, string> = {
  web: '🌐',
  api: '⚡',
  database: '🗄️',
  cache: '📮',
  mq: '📨',
  search: '🔍',
  service: '🔧',
  default: '🖥️'
};

// 根据端口和服务推断节点类型
function inferNodeType(node: Node, relations: Relation[]): string {
  const nodeRelations = relations.filter(r => 
    r.source_node_id === node.id || r.target_node_id === node.id
  );
  
  // 检查是否有数据库连接
  const dbRelation = nodeRelations.find(r => r.relation_type === 'database');
  if (dbRelation && dbRelation.target_node_id === node.id) return 'database';
  
  // 检查端口
  // 这里简化处理，实际应该从数据库查询端口信息
  if (node.hostname.includes('web') || node.hostname.includes('nginx')) return 'web';
  if (node.hostname.includes('api')) return 'api';
  if (node.hostname.includes('db') || node.hostname.includes('mysql') || node.hostname.includes('postgres')) return 'database';
  if (node.hostname.includes('cache') || node.hostname.includes('redis')) return 'cache';
  if (node.hostname.includes('mq') || node.hostname.includes('rabbit')) return 'mq';
  
  return 'default';
}

export default function ArchitectureDiagram() {
  const [data, setData] = useState<ArchitectureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchitectureData();
  }, []);

  const fetchArchitectureData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/architecture');
      if (!response.ok) throw new Error('获取数据失败');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <p className="mt-4 text-gray-400">加载架构数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
        <i className="fas fa-exclamation-triangle text-red-400 text-2xl mb-3"></i>
        <p className="text-red-300 mb-2">加载失败</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={fetchArchitectureData}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <i className="fas fa-database text-gray-600 text-4xl mb-4"></i>
        <p className="text-gray-400 mb-2">暂无架构数据</p>
        <p className="text-gray-500 text-sm">请先运行采集脚本并导入数据到数据库</p>
      </div>
    );
  }

  // 计算节点位置（简单的圆形布局）
  const nodePositions = calculateNodePositions(data.nodes);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-emerald-400">
          <i className="fas fa-project-diagram mr-2"></i>
          系统架构图
        </h3>
        <button
          onClick={() => exportToPNG()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm"
        >
          <i className="fas fa-download mr-2"></i>
          导出图片
        </button>
      </div>

      <div className="bg-gray-950 rounded-lg p-4 overflow-auto">
        <svg
          id="architecture-svg"
          width="100%"
          height="600"
          viewBox="0 0 1000 600"
          className="min-w-[800px]"
        >
          {/* 绘制连接线 */}
          {data.relations.map((relation, idx) => {
            const source = nodePositions[relation.source_node_id];
            const target = nodePositions[relation.target_node_id];
            if (!source || !target) return null;

            return (
              <g key={`relation-${idx}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
                {/* 关系标签 */}
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 10}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#06b6d4"
                >
                  {relation.relation_type}
                  {relation.port && `:${relation.port}`}
                </text>
              </g>
            );
          })}

          {/* 绘制节点 */}
          {data.nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const nodeType = inferNodeType(node, data.relations);
            const icon = NODE_ICONS[nodeType] || NODE_ICONS.default;

            return (
              <g key={`node-${node.id}`}>
                {/* 节点圆圈 */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="40"
                  fill="#1e293b"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                {/* 图标 */}
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize="24"
                >
                  {icon}
                </text>
                {/* 主机名 */}
                <text
                  x={pos.x}
                  y={pos.y + 60}
                  textAnchor="middle"
                  className="text-sm font-semibold"
                  fill="#e2e8f0"
                >
                  {node.hostname}
                </text>
                {/* IP地址 */}
                <text
                  x={pos.x}
                  y={pos.y + 78}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#94a3b8"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <span className="text-gray-400">Web服务</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-gray-400">API服务</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🗄️</span>
          <span className="text-gray-400">数据库</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">📮</span>
          <span className="text-gray-400">缓存</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">📨</span>
          <span className="text-gray-400">消息队列</span>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{data.nodes.length}</div>
          <div className="text-gray-500 text-sm">服务器节点</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{data.relations.length}</div>
          <div className="text-gray-500 text-sm">连接关系</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {new Set(data.relations.map(r => r.relation_type)).size}
          </div>
          <div className="text-gray-500 text-sm">服务类型</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {new Set(data.relations.map(r => r.port).filter(Boolean)).size}
          </div>
          <div className="text-gray-500 text-sm">通信端口</div>
        </div>
      </div>
    </div>
  );
}

// 计算节点位置（圆形布局）
function calculateNodePositions(nodes: Node[]): Record<number, { x: number; y: number }> {
  const positions: Record<number, { x: number; y: number }> = {};
  const centerX = 500;
  const centerY = 300;
  const radius = 200;

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  return positions;
}

// 导出为PNG
function exportToPNG() {
  const svg = document.getElementById('architecture-svg');
  if (!svg) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    const link = document.createElement('a');
    link.download = `architecture_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}
