-- Linux集群架构分析数据库Schema
-- 使用SQLite，轻量级，无需额外安装

-- 系统信息表（多系统支持）
CREATE TABLE IF NOT EXISTS systems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_name TEXT NOT NULL UNIQUE,
    description TEXT,
    system_type TEXT,  -- web, api, database, cache, mq等
    environment TEXT,  -- production, staging, development
    owner TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 节点信息表
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_id INTEGER,  -- 关联到系统
    hostname TEXT NOT NULL,
    ip TEXT NOT NULL,
    os TEXT,
    kernel TEXT,
    uptime TEXT,
    cpu_info TEXT,
    memory_info TEXT,
    disk_info TEXT,
    load_avg TEXT,
    role TEXT,  -- 节点角色：web, api, db, cache等
    collect_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE SET NULL,
    UNIQUE(hostname, ip)
);

-- 服务信息表
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    status TEXT,
    description TEXT,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 端口监听表
CREATE TABLE IF NOT EXISTS ports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    protocol TEXT NOT NULL,  -- TCP/UDP
    port INTEGER NOT NULL,
    address TEXT,  -- 0.0.0.0, 127.0.0.1等
    process_name TEXT,
    pid INTEGER,
    state TEXT,  -- LISTEN, ESTABLISHED等
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 进程信息表
CREATE TABLE IF NOT EXISTS processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    pid INTEGER NOT NULL,
    user TEXT,
    cpu_percent REAL,
    mem_percent REAL,
    vsz INTEGER,
    rss INTEGER,
    command TEXT,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 容器信息表
CREATE TABLE IF NOT EXISTS containers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    container_id TEXT,
    container_name TEXT,
    image TEXT,
    status TEXT,
    ports TEXT,
    container_type TEXT DEFAULT 'docker',  -- docker/k8s
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 网络连接表（服务间关系）
CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_node_id INTEGER,
    source_ip TEXT,
    source_port INTEGER,
    target_node_id INTEGER,
    target_ip TEXT,
    target_port INTEGER,
    protocol TEXT,
    state TEXT,
    FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 配置信息表
CREATE TABLE IF NOT EXISTS configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL,
    config_type TEXT NOT NULL,  -- nginx, systemd, crontab等
    config_key TEXT,
    config_value TEXT,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 架构关系表（用于绘制架构图）
CREATE TABLE IF NOT EXISTS architecture_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_node_id INTEGER NOT NULL,
    target_node_id INTEGER NOT NULL,
    relation_type TEXT NOT NULL,  -- proxy, db, cache, mq等
    protocol TEXT,
    port INTEGER,
    description TEXT,
    FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 系统间关系表（多系统架构图）
CREATE TABLE IF NOT EXISTS system_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_system_id INTEGER NOT NULL,
    target_system_id INTEGER NOT NULL,
    relation_type TEXT NOT NULL,  -- api_call, data_sync, message, dependency等
    protocol TEXT,  -- HTTP, gRPC, TCP, MQ等
    port INTEGER,
    description TEXT,
    direction TEXT DEFAULT 'unidirectional',  -- unidirectional, bidirectional
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_system_id) REFERENCES systems(id) ON DELETE CASCADE,
    FOREIGN KEY (target_system_id) REFERENCES systems(id) ON DELETE CASCADE,
    UNIQUE(source_system_id, target_system_id, relation_type)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_id INTEGER NOT NULL,
    config_key TEXT NOT NULL,
    config_value TEXT,
    description TEXT,
    FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE,
    UNIQUE(system_id, config_key)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_services_node ON services(node_id);
CREATE INDEX IF NOT EXISTS idx_ports_node ON ports(node_id);
CREATE INDEX IF NOT EXISTS idx_processes_node ON processes(node_id);
CREATE INDEX IF NOT EXISTS idx_containers_node ON containers(node_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_node_id);
CREATE INDEX IF NOT EXISTS idx_relations_source ON architecture_relations(source_node_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON architecture_relations(target_node_id);
