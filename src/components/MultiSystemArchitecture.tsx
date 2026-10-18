import { useEffect, useState } from 'react';

interface System {
  id: number;
  system_name: string;
  system_type?: string;
  environment?: string;
  node_count: number;
}

interface SystemRelation {
  id: number;
  source_system_id: number;
  target_system_id: number;
  relation_type: string;
  protocol?: string;
  port?: number;
  description?: string;
  source_name: string;
  target_name: string;
}

interface Node {
  id: number;
  system_id: number;
  hostname: string;
  ip: string;
  role?: string;
}

interface MultiSystemData {
  systems: System[];
  relations: SystemRelation[];
  nodes: Node[];
}

// 系统类型图标映射
const SYSTEM_ICONS: Record<string, string> = {
  web: '🌐',
  api: '⚡',
  database: '🗄️',
  cache: '📮',
  mq: '📨',
  search: '🔍',
  gateway: '🚪',
  monitor: '📊',
  default: '📦'
};

// 系统类型颜色
const SYSTEM_COLORS: Record<string, string> = {
  web: '#10b981',
  api: '#06b6d4',
  database: '#f59e0b',
  cache: '#ef4444',
  mq: '#8b5cf6',
  search: '#ec4899',
  gateway: '#6366f1',
  monitor: '#14b8a6',
  default: '#64748b'
};

export default function MultiSystemArchitecture() {
  const [data, setData] = useState<MultiSystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'systems' | 'detailed'>('systems');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/multi-system-architecture');
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          <p className="mt-4 text-gray-400">加载多系统架构数据...</p>
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
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data || data.systems.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <i className="fas fa-cubes text-gray-600 text-4xl mb-4"></i>
        <p className="text-gray-400 mb-2">暂无系统数据</p>
        <p className="text-gray-500 text-sm mb-4">请先使用 system_manager.sh 添加系统信息</p>
        <div className="bg-gray-950 rounded-lg p-4 text-left max-w-md mx-auto">
          <p className="text-gray-400 text-sm mb-2">示例命令：</p>
          <code className="text-cyan-300 text-xs">
            ./system_manager.sh cluster.db add "订单系统" api production
            <br />
            ./system_manager.sh cluster.db add "用户系统" api production
            <br />
            ./system_manager.sh cluster.db add "数据库" database production
          </code>
        </div>
      </div>
    );
  }

  // 计算系统位置（分层布局）
  const systemPositions = calculateSystemLayout(data.systems, data.relations);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-purple-400">
          <i className="fas fa-cubes mr-2"></i>
          多系统架构图
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('systems')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              viewMode === 'systems'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            系统视图
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              viewMode === 'detailed'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            详细视图
          </button>
          <button
            onClick={() => exportToPNG()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm"
          >
            <i className="fas fa-download mr-2"></i>
            导出
          </button>
        </div>
      </div>

      {/* 架构图 */}
      <div className="bg-gray-950 rounded-lg p-4 overflow-auto mb-6">
        <svg
          id="multi-system-svg"
          width="100%"
          height={viewMode === 'detailed' ? '800' : '600'}
          viewBox={viewMode === 'detailed' ? '0 0 1200 800' : '0 0 1200 600'}
          className="min-w-[1000px]"
        >
          {/* 绘制系统间关系线 */}
          {data.relations.map((relation, idx) => {
            const source = systemPositions[relation.source_system_id];
            const target = systemPositions[relation.target_system_id];
            if (!source || !target) return null;

            return (
              <g key={`relation-${idx}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                  markerEnd="url(#arrowhead)"
                />
                {/* 关系标签 */}
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 10}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#a78bfa"
                >
                  {relation.relation_type}
                  {relation.protocol && ` (${relation.protocol})`}
                </text>
              </g>
            );
          })}

          {/* 箭头定义 */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
            </marker>
          </defs>

          {/* 绘制系统节点 */}
          {data.systems.map((system) => {
            const pos = systemPositions[system.id];
            if (!pos) return null;

            const icon = SYSTEM_ICONS[system.system_type || 'default'] || SYSTEM_ICONS.default;
            const color = SYSTEM_COLORS[system.system_type || 'default'] || SYSTEM_COLORS.default;
            const isSelected = selectedSystem === system.id;

            return (
              <g
                key={`system-${system.id}`}
                onClick={() => setSelectedSystem(isSelected ? null : system.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* 系统圆圈 */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '55' : '50'}
                  fill="#1e293b"
                  stroke={color}
                  strokeWidth={isSelected ? '4' : '3'}
                  opacity={isSelected ? '1' : '0.9'}
                />
                {/* 图标 */}
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize="28"
                >
                  {icon}
                </text>
                {/* 系统名称 */}
                <text
                  x={pos.x}
                  y={pos.y + 70}
                  textAnchor="middle"
                  className="text-sm font-semibold"
                  fill="#e2e8f0"
                >
                  {system.system_name}
                </text>
                {/* 节点数 */}
                <text
                  x={pos.x}
                  y={pos.y + 88}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#94a3b8"
                >
                  {system.node_count} 个节点
                </text>
                {/* 类型标签 */}
                {system.system_type && (
                  <text
                    x={pos.x}
                    y={pos.y - 60}
                    textAnchor="middle"
                    className="text-xs"
                    fill={color}
                  >
                    [{system.system_type}]
                  </text>
                )}

                {/* 详细视图：显示系统内的节点 */}
                {viewMode === 'detailed' && isSelected && (
                  <g>
                    {data.nodes
                      .filter(n => n.system_id === system.id)
                      .slice(0, 5)
                      .map((node, idx) => {
                        const angle = (2 * Math.PI * idx) / Math.min(5, data.nodes.filter(n => n.system_id === system.id).length);
                        const nodeX = pos.x + 120 * Math.cos(angle);
                        const nodeY = pos.y + 120 * Math.sin(angle);
                        
                        return (
                          <g key={`node-${node.id}`}>
                            <circle
                              cx={nodeX}
                              cy={nodeY}
                              r="25"
                              fill="#0f172a"
                              stroke={color}
                              strokeWidth="2"
                            />
                            <text
                              x={nodeX}
                              y={nodeY + 4}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#e2e8f0"
                            >
                              {node.hostname.substring(0, 8)}
                            </text>
                            <text
                              x={nodeX}
                              y={nodeY + 35}
                              textAnchor="middle"
                              fontSize="8"
                              fill="#94a3b8"
                            >
                              {node.ip}
                            </text>
                          </g>
                        );
                      })}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{data.systems.length}</div>
          <div className="text-gray-500 text-sm">系统数量</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{data.nodes.length}</div>
          <div className="text-gray-500 text-sm">总节点数</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{data.relations.length}</div>
          <div className="text-gray-500 text-sm">系统关系</div>
        </div>
        <div className="bg-gray-950 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {new Set(data.relations.map(r => r.relation_type)).size}
          </div>
          <div className="text-gray-500 text-sm">关系类型</div>
        </div>
      </div>

      {/* 系统列表 */}
      <div className="bg-gray-950 rounded-lg p-4">
        <h4 className="text-gray-300 font-semibold mb-3">
          <i className="fas fa-list mr-2"></i>
          系统详情
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.systems.map(system => {
            const icon = SYSTEM_ICONS[system.system_type || 'default'] || SYSTEM_ICONS.default;
            const color = SYSTEM_COLORS[system.system_type || 'default'] || SYSTEM_COLORS.default;
            
            return (
              <div
                key={system.id}
                className="bg-gray-900 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-200">{system.system_name}</div>
                    <div className="text-xs text-gray-500">
                      {system.system_type && <span style={{ color }}>{system.system_type}</span>}
                      {system.environment && <span className="ml-2">[{system.environment}]</span>}
                      <span className="ml-2">{system.node_count} 节点</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {Object.entries(SYSTEM_ICONS).slice(0, 6).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="text-gray-400">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 计算系统布局（分层布局）
function calculateSystemLayout(
  systems: System[],
  relations: SystemRelation[]
): Record<number, { x: number; y: number }> {
  const positions: Record<number, { x: number; y: number }> = {};
  
  // 计算每个系统的入度和出度
  const inDegree: Record<number, number> = {};
  const outDegree: Record<number, number> = {};
  
  systems.forEach(s => {
    inDegree[s.id] = 0;
    outDegree[s.id] = 0;
  });
  
  relations.forEach(r => {
    outDegree[r.source_system_id] = (outDegree[r.source_system_id] || 0) + 1;
    inDegree[r.target_system_id] = (inDegree[r.target_system_id] || 0) + 1;
  });
  
  // 分层：根据入度分层
  const layers: number[][] = [];
  const assigned = new Set<number>();
  
  // 第一层：入度为0的系统（源系统）
  let currentLayer = systems.filter(s => inDegree[s.id] === 0).map(s => s.id);
  if (currentLayer.length === 0 && systems.length > 0) {
    currentLayer = [systems[0].id];
  }
  
  while (currentLayer.length > 0) {
    layers.push(currentLayer);
    currentLayer.forEach(id => assigned.add(id));
    
    // 下一层：当前层指向的未分配系统
    const nextLayer: number[] = [];
    currentLayer.forEach(sourceId => {
      relations
        .filter(r => r.source_system_id === sourceId && !assigned.has(r.target_system_id))
        .forEach(r => {
          if (!nextLayer.includes(r.target_system_id)) {
            nextLayer.push(r.target_system_id);
          }
        });
    });
    
    currentLayer = nextLayer;
  }
  
  // 添加未分配的系统
  systems.forEach(s => {
    if (!assigned.has(s.id)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1].push(s.id);
    }
  });
  
  // 计算位置
  const layerHeight = 600 / Math.max(layers.length, 1);
  const centerX = 600;
  
  layers.forEach((layer, layerIdx) => {
    const layerWidth = 1000 / Math.max(layer.length + 1, 2);
    layer.forEach((systemId, idx) => {
      positions[systemId] = {
        x: centerX - 500 + layerWidth * (idx + 1),
        y: 100 + layerIdx * layerHeight
      };
    });
  });
  
  return positions;
}

// 导出为PNG
function exportToPNG() {
  const svg = document.getElementById('multi-system-svg');
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
    link.download = `multi_system_architecture_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = 'image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}
