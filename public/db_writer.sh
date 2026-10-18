#!/bin/bash
# 数据库写入脚本 - 将采集数据存入SQLite
# 用法: ./db_writer.sh <node_data_dir> <db_file>

NODE_DIR="$1"
DB_FILE="${2:-cluster_architecture.db}"

if [ -z "$NODE_DIR" ]; then
    echo "用法: $0 <node_data_dir> [db_file]"
    echo "示例: $0 ./node_web01_20240101 cluster.db"
    exit 1
fi

if [ ! -d "$NODE_DIR" ]; then
    echo "错误: 目录不存在: $NODE_DIR"
    exit 1
fi

# 检查sqlite3是否安装
if ! command -v sqlite3 &> /dev/null; then
    echo "错误: 未安装sqlite3"
    echo "安装方法:"
    echo "  Ubuntu/Debian: sudo apt-get install sqlite3"
    echo "  CentOS/RHEL: sudo yum install sqlite"
    echo "  macOS: brew install sqlite"
    exit 1
fi

# 初始化数据库
if [ ! -f "$DB_FILE" ]; then
    echo "创建数据库: $DB_FILE"
    sqlite3 "$DB_FILE" < schema.sql
fi

# 读取节点基本信息
HOSTNAME=$(cat "$NODE_DIR/hostname.txt" 2>/dev/null || basename "$NODE_DIR")
IP=$(cat "$NODE_DIR/ip.txt" 2>/dev/null || echo "unknown")
OS=$(grep -m1 "PRETTY_NAME" "$NODE_DIR/os_version.txt" 2>/dev/null | cut -d'"' -f2 || echo "unknown")
KERNEL=$(grep -m1 "Linux" "$NODE_DIR/system_info.txt" 2>/dev/null | awk '{print $3}' || echo "unknown")
UPTIME=$(cat "$NODE_DIR/uptime.txt" 2>/dev/null || echo "unknown")
CPU_INFO=$(cat "$NODE_DIR/cpu.txt" 2>/dev/null || echo "")
MEMORY_INFO=$(cat "$NODE_DIR/memory.txt" 2>/dev/null || echo "")
DISK_INFO=$(cat "$NODE_DIR/disk.txt" 2>/dev/null || echo "")
LOAD_AVG=$(cat "$NODE_DIR/load.txt" 2>/dev/null || echo "")

echo "处理节点: $HOSTNAME ($IP)"

# 插入节点信息
sqlite3 "$DB_FILE" <<EOF
INSERT OR REPLACE INTO nodes (hostname, ip, os, kernel, uptime, cpu_info, memory_info, disk_info, load_avg)
VALUES ('$HOSTNAME', '$IP', '$OS', '$KERNEL', '$UPTIME', 
        '$(echo "$CPU_INFO" | sed "s/'/''/g")', 
        '$(echo "$MEMORY_INFO" | sed "s/'/''/g")', 
        '$(echo "$DISK_INFO" | sed "s/'/''/g")', 
        '$(echo "$LOAD_AVG" | sed "s/'/''/g")');
EOF

NODE_ID=$(sqlite3 "$DB_FILE" "SELECT id FROM nodes WHERE hostname='$HOSTNAME' AND ip='$IP';")
echo "  节点ID: $NODE_ID"

# 解析服务信息
if [ -f "$NODE_DIR/services_running.txt" ]; then
    echo "  写入服务信息..."
    grep -E "^  [a-zA-Z]" "$NODE_DIR/services_running.txt" | while read -r line; do
        SERVICE_NAME=$(echo "$line" | awk '{print $1}')
        STATUS=$(echo "$line" | awk '{print $2}')
        DESC=$(echo "$line" | cut -d' ' -f4-)
        
        sqlite3 "$DB_FILE" <<EOF
INSERT INTO services (node_id, service_name, status, description)
VALUES ($NODE_ID, '$SERVICE_NAME', '$STATUS', '$(echo "$DESC" | sed "s/'/''/g")');
EOF
    done
fi

# 解析端口信息
if [ -f "$NODE_DIR/tcp_listen.txt" ]; then
    echo "  写入端口信息..."
    grep -E "LISTEN" "$NODE_DIR/tcp_listen.txt" | while read -r line; do
        # 解析 ss 输出格式
        ADDR=$(echo "$line" | awk '{print $4}')
        PROCESS=$(echo "$line" | awk '{print $6}')
        
        # 提取IP和端口
        if [[ $ADDR == *":"* ]]; then
            PORT=$(echo "$ADDR" | rev | cut -d':' -f1 | rev)
            ADDRESS=$(echo "$ADDR" | rev | cut -d':' -f2- | rev)
        else
            PORT="0"
            ADDRESS="$ADDR"
        fi
        
        # 提取进程名和PID
        if [[ $PROCESS == *"users:"* ]]; then
            PROC_NAME=$(echo "$PROCESS" | grep -oP '\("\K[^"]+' | head -1)
            PID=$(echo "$PROCESS" | grep -oP 'pid=\K[0-9]+' | head -1)
        else
            PROC_NAME=""
            PID=""
        fi
        
        sqlite3 "$DB_FILE" <<EOF
INSERT INTO ports (node_id, protocol, port, address, process_name, pid, state)
VALUES ($NODE_ID, 'TCP', $PORT, '$ADDRESS', '$PROC_NAME', $PID, 'LISTEN');
EOF
    done
fi

# 解析进程信息
if [ -f "$NODE_DIR/processes.txt" ]; then
    echo "  写入进程信息..."
    tail -n +2 "$NODE_DIR/processes.txt" | head -50 | while read -r line; do
        USER=$(echo "$line" | awk '{print $1}')
        PID=$(echo "$line" | awk '{print $2}')
        CPU=$(echo "$line" | awk '{print $3}')
        MEM=$(echo "$line" | awk '{print $4}')
        VSZ=$(echo "$line" | awk '{print $5}')
        RSS=$(echo "$line" | awk '{print $6}')
        CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
        
        sqlite3 "$DB_FILE" <<EOF
INSERT INTO processes (node_id, pid, user, cpu_percent, mem_percent, vsz, rss, command)
VALUES ($NODE_ID, $PID, '$USER', $CPU, $MEM, $VSZ, $RSS, '$(echo "$CMD" | sed "s/'/''/g")');
EOF
    done
fi

# 解析容器信息
if [ -f "$NODE_DIR/docker_ps.txt" ]; then
    echo "  写入容器信息..."
    tail -n +2 "$NODE_DIR/docker_ps.txt" | while read -r line; do
        CONTAINER_ID=$(echo "$line" | awk '{print $1}')
        IMAGE=$(echo "$line" | awk '{print $2}')
        STATUS=$(echo "$line" | awk '{print $5" "$6" "$7}')
        PORTS=$(echo "$line" | awk '{for(i=8;i<=NF-1;i++) printf "%s ", $i; print ""}')
        NAME=$(echo "$line" | awk '{print $NF}')
        
        sqlite3 "$DB_FILE" <<EOF
INSERT INTO containers (node_id, container_id, container_name, image, status, ports, container_type)
VALUES ($NODE_ID, '$CONTAINER_ID', '$NAME', '$IMAGE', '$(echo "$STATUS" | sed "s/'/''/g")', '$(echo "$PORTS" | sed "s/'/''/g")', 'docker');
EOF
    done
fi

# 分析网络连接，推断架构关系
if [ -f "$NODE_DIR/all_connections.txt" ]; then
    echo "  分析网络连接..."
    grep -E "ESTAB" "$NODE_DIR/all_connections.txt" | while read -r line; do
        LOCAL=$(echo "$line" | awk '{print $4}')
        PEER=$(echo "$line" | awk '{print $5}')
        
        # 提取本地端口
        LOCAL_PORT=$(echo "$LOCAL" | rev | cut -d':' -f1 | rev)
        LOCAL_ADDR=$(echo "$LOCAL" | rev | cut -d':' -f2- | rev)
        
        # 提取对端IP和端口
        PEER_PORT=$(echo "$PEER" | rev | cut -d':' -f1 | rev)
        PEER_ADDR=$(echo "$PEER" | rev | cut -d':' -f2- | rev)
        
        # 查找目标节点ID
        TARGET_NODE_ID=$(sqlite3 "$DB_FILE" "SELECT id FROM nodes WHERE ip='$PEER_ADDR' LIMIT 1;")
        
        if [ -n "$TARGET_NODE_ID" ] && [ "$TARGET_NODE_ID" != "$NODE_ID" ]; then
            # 推断关系类型
            REL_TYPE="unknown"
            case $PEER_PORT in
                3306) REL_TYPE="database" ;;
                5432) REL_TYPE="database" ;;
                6379) REL_TYPE="cache" ;;
                27017) REL_TYPE="database" ;;
                5672|15672) REL_TYPE="mq" ;;
                9200|9300) REL_TYPE="search" ;;
                80|443) REL_TYPE="web" ;;
                8080|8443) REL_TYPE="api" ;;
                *) 
                    if [ $PEER_PORT -lt 1024 ]; then
                        REL_TYPE="service"
                    fi
                    ;;
            esac
            
            sqlite3 "$DB_FILE" <<EOF
INSERT OR IGNORE INTO connections (source_node_id, source_ip, source_port, target_node_id, target_ip, target_port, protocol, state)
VALUES ($NODE_ID, '$LOCAL_ADDR', $LOCAL_PORT, $TARGET_NODE_ID, '$PEER_ADDR', $PEER_PORT, 'TCP', 'ESTABLISHED');

INSERT OR IGNORE INTO architecture_relations (source_node_id, target_node_id, relation_type, protocol, port)
VALUES ($NODE_ID, $TARGET_NODE_ID, '$REL_TYPE', 'TCP', $PEER_PORT);
EOF
        fi
    done
fi

echo "✓ 节点 $HOSTNAME 数据已写入数据库"
