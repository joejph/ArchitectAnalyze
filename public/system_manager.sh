#!/bin/bash
# 系统管理脚本 - 管理多系统信息
# 用法: ./system_manager.sh [命令] [参数]

DB_FILE="${1:-cluster_architecture.db}"

if [ ! -f "$DB_FILE" ]; then
    echo "错误: 数据库文件不存在: $DB_FILE"
    exit 1
fi

show_help() {
    echo "系统管理工具"
    echo ""
    echo "用法: $0 <数据库文件> <命令> [参数]"
    echo ""
    echo "命令:"
    echo "  list                              - 列出所有系统"
    echo "  add <系统名称> [类型] [环境]      - 添加系统"
    echo "  delete <系统ID>                   - 删除系统"
    echo "  update <系统ID> <字段> <值>       - 更新系统信息"
    echo "  nodes <系统ID>                    - 查看系统下的节点"
    echo "  relations                         - 查看所有系统关系"
    echo "  add-relation <源系统ID> <目标系统ID> <关系类型> [协议] [端口] [描述]"
    echo "  delete-relation <关系ID>          - 删除系统关系"
    echo "  architecture                      - 显示完整架构"
    echo ""
    echo "系统类型: web, api, database, cache, mq, search, gateway, monitor"
    echo "环境: production, staging, development, test"
    echo "关系类型: api_call, data_sync, message, dependency, proxy"
}

list_systems() {
    echo "========================================"
    echo "系统列表"
    echo "========================================"
    sqlite3 -header -column "$DB_FILE" "
        SELECT 
            s.id,
            s.system_name as '系统名称',
            s.system_type as '类型',
            s.environment as '环境',
            (SELECT COUNT(*) FROM nodes n WHERE n.system_id = s.id) as '节点数',
            s.create_time as '创建时间'
        FROM systems s
        ORDER BY s.id;
    "
}

add_system() {
    local name="$1"
    local type="${2:-unknown}"
    local env="${3:-unknown}"
    
    if [ -z "$name" ]; then
        echo "错误: 请提供系统名称"
        exit 1
    fi
    
    sqlite3 "$DB_FILE" "INSERT INTO systems (system_name, system_type, environment) VALUES ('$name', '$type', '$env');"
    echo "✓ 系统 '$name' 已添加"
    list_systems
}

delete_system() {
    local id="$1"
    if [ -z "$id" ]; then
        echo "错误: 请提供系统ID"
        exit 1
    fi
    
    sqlite3 "$DB_FILE" "DELETE FROM systems WHERE id=$id;"
    echo "✓ 系统ID $id 已删除"
}

update_system() {
    local id="$1"
    local field="$2"
    local value="$3"
    
    if [ -z "$id" ] || [ -z "$field" ] || [ -z "$value" ]; then
        echo "错误: 请提供系统ID、字段和值"
        exit 1
    fi
    
    sqlite3 "$DB_FILE" "UPDATE systems SET $field='$value' WHERE id=$id;"
    echo "✓ 系统ID $id 已更新"
}

show_nodes() {
    local system_id="$1"
    if [ -z "$system_id" ]; then
        echo "错误: 请提供系统ID"
        exit 1
    fi
    
    echo "========================================"
    echo "系统 $system_id 的节点列表"
    echo "========================================"
    sqlite3 -header -column "$DB_FILE" "
        SELECT 
            n.id,
            n.hostname as '主机名',
            n.ip as 'IP地址',
            n.role as '角色',
            n.os as '操作系统'
        FROM nodes n
        WHERE n.system_id = $system_id
        ORDER BY n.id;
    "
}

list_relations() {
    echo "========================================"
    echo "系统间关系"
    echo "========================================"
    sqlite3 -header -column "$DB_FILE" "
        SELECT 
            sr.id,
            s1.system_name as '源系统',
            s2.system_name as '目标系统',
            sr.relation_type as '关系类型',
            sr.protocol as '协议',
            sr.port as '端口',
            sr.description as '描述'
        FROM system_relations sr
        JOIN systems s1 ON sr.source_system_id = s1.id
        JOIN systems s2 ON sr.target_system_id = s2.id
        ORDER BY sr.id;
    "
}

add_relation() {
    local source_id="$1"
    local target_id="$2"
    local rel_type="$3"
    local protocol="${4:-HTTP}"
    local port="${5:-0}"
    local desc="${6:-}"
    
    if [ -z "$source_id" ] || [ -z "$target_id" ] || [ -z "$rel_type" ]; then
        echo "错误: 请提供源系统ID、目标系统ID和关系类型"
        exit 1
    fi
    
    sqlite3 "$DB_FILE" "
        INSERT INTO system_relations (source_system_id, target_system_id, relation_type, protocol, port, description)
        VALUES ($source_id, $target_id, '$rel_type', '$protocol', $port, '$desc');
    "
    echo "✓ 系统关系已添加"
    list_relations
}

delete_relation() {
    local id="$1"
    if [ -z "$id" ]; then
        echo "错误: 请提供关系ID"
        exit 1
    fi
    
    sqlite3 "$DB_FILE" "DELETE FROM system_relations WHERE id=$id;"
    echo "✓ 关系ID $id 已删除"
}

show_architecture() {
    echo "========================================"
    echo "完整架构视图"
    echo "========================================"
    echo ""
    echo "【系统列表】"
    list_systems
    echo ""
    echo "【系统间关系】"
    list_relations
    echo ""
    echo "【各系统节点详情】"
    
    sqlite3 "$DB_FILE" "SELECT id, system_name FROM systems;" | while IFS='|' read -r sys_id sys_name; do
        echo ""
        echo "--- $sys_name (ID: $sys_id) ---"
        show_nodes "$sys_id"
    done
}

# 主命令处理
case "$2" in
    list)
        list_systems
        ;;
    add)
        add_system "$3" "$4" "$5"
        ;;
    delete)
        delete_system "$3"
        ;;
    update)
        update_system "$3" "$4" "$5"
        ;;
    nodes)
        show_nodes "$3"
        ;;
    relations)
        list_relations
        ;;
    add-relation)
        add_relation "$3" "$4" "$5" "$6" "$7" "$8"
        ;;
    delete-relation)
        delete_relation "$3"
        ;;
    architecture)
        show_architecture
        ;;
    *)
        show_help
        ;;
esac
