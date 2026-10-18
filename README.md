# Linux集群架构分析工具

一个完整的工具集，用于采集多台Linux服务器信息，存入数据库，并自动生成可视化架构图。

## 📦 组件说明

### 1. 采集脚本
- **node_collect.sh** - 在每台服务器上运行，采集系统信息
- **cluster_analyze.sh** - 在管理节点运行，汇总生成HTML报告

### 2. 数据库组件
- **schema.sql** - SQLite数据库表结构
- **db_writer.sh** - 将单个节点数据写入数据库
- **import_all.sh** - 批量导入所有节点数据
- **api-server.js** - Node.js API服务，提供数据查询接口

### 3. Web应用
- 基于React的可视化界面
- 动态架构图绘制
- 数据查询和统计

## 🚀 快速开始

### 方式一：仅生成HTML报告（简单）

```bash
# 1. 在各节点采集数据
scp node_collect.sh user@节点IP:/tmp/
ssh user@节点IP
chmod +x /tmp/node_collect.sh
sudo /tmp/node_collect.sh

# 2. 将数据传回管理节点
scp -r node_* admin@管理节点:~/data/

# 3. 生成HTML报告
chmod +x cluster_analyze.sh
sudo ./cluster_analyze.sh manual
```

### 方式二：数据库 + 架构图（完整功能）

```bash
# 1. 安装依赖
sudo apt-get install sqlite3 nodejs npm  # Ubuntu/Debian
# 或
sudo yum install sqlite nodejs npm      # CentOS/RHEL

# 2. 采集各节点数据（同上）

# 3. 初始化数据库
sqlite3 cluster_architecture.db < schema.sql

# 4. 批量导入数据
chmod +x import_all.sh db_writer.sh
./import_all.sh ./node_data cluster_architecture.db

# 5. 安装API依赖
npm install express sqlite3 cors

# 6. 启动API服务
node api-server.js

# 7. 访问Web应用
# 打开浏览器访问 http://localhost:3001
```

## 📊 数据库结构

### 核心表
- **nodes** - 节点基本信息
- **services** - 运行的服务
- **ports** - 监听端口
- **processes** - 进程信息
- **containers** - 容器信息

### 关系表
- **connections** - 网络连接
- **architecture_relations** - 架构关系（自动推断）
- **configurations** - 配置信息

## 🎨 架构图功能

- 自动根据数据库数据绘制
- 节点类型智能识别（Web/API/数据库/缓存/消息队列）
- 连接关系可视化
- 支持导出为PNG图片
- 实时统计信息

## 🔍 常用SQL查询

```sql
-- 查看所有节点
SELECT hostname, ip, os FROM nodes;

-- 查看某节点的服务
SELECT * FROM services WHERE node_id = 1;

-- 查看所有监听端口
SELECT n.hostname, p.port, p.process_name 
FROM ports p 
JOIN nodes n ON p.node_id = n.id 
WHERE p.state = 'LISTEN';

-- 查看架构关系
SELECT 
  s.hostname as source,
  t.hostname as target,
  ar.relation_type,
  ar.port
FROM architecture_relations ar
JOIN nodes s ON ar.source_node_id = s.id
JOIN nodes t ON ar.target_node_id = t.id;

-- 统计各端口使用次数
SELECT port, COUNT(*) as count 
FROM ports 
WHERE state = 'LISTEN' 
GROUP BY port 
ORDER BY count DESC;
```

## 📁 文件结构

```
.
├── node_collect.sh          # 节点采集脚本
├── cluster_analyze.sh       # 集群汇总脚本
├── schema.sql               # 数据库Schema
├── db_writer.sh             # 单节点数据写入
├── import_all.sh            # 批量导入
├── api-server.js            # API服务
├── cluster_architecture.db  # SQLite数据库（生成）
└── node_data/               # 采集的数据目录
    ├── node_web01_20240101/
    ├── node_db01_20240101/
    └── ...
```

## ⚙️ 系统要求

- **操作系统**: Linux（任何发行版）
- **数据库**: SQLite 3
- **Node.js**: 14+ （仅API服务需要）
- **权限**: 建议root或sudo

## 🔐 安全说明

- 所有脚本只读取系统信息，不做任何修改
- 数据库文件可设置权限保护
- API服务默认只监听localhost
- 生产环境建议配置防火墙和认证

## 📝 许可证

MIT License
