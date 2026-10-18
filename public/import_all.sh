#!/bin/bash
# 批量导入脚本 - 将所有节点数据导入数据库
# 用法: ./import_all.sh <data_directory> [db_file]

DATA_DIR="${1:-./node_data}"
DB_FILE="${2:-cluster_architecture.db}"

if [ ! -d "$DATA_DIR" ]; then
    echo "错误: 数据目录不存在: $DATA_DIR"
    echo "用法: $0 <data_directory> [db_file]"
    echo "示例: $0 ./node_data cluster.db"
    exit 1
fi

# 检查依赖
if ! command -v sqlite3 &> /dev/null; then
    echo "错误: 未安装sqlite3"
    exit 1
fi

if [ ! -f "db_writer.sh" ]; then
    echo "错误: 未找到 db_writer.sh"
    exit 1
fi

if [ ! -f "schema.sql" ]; then
    echo "错误: 未找到 schema.sql"
    exit 1
fi

# 初始化数据库
echo "初始化数据库: $DB_FILE"
sqlite3 "$DB_FILE" < schema.sql

# 统计
TOTAL=0
SUCCESS=0

# 遍历所有节点目录
for node_dir in "$DATA_DIR"/node_*; do
    if [ -d "$node_dir" ]; then
        TOTAL=$((TOTAL + 1))
        echo ""
        echo "========================================"
        if ./db_writer.sh "$node_dir" "$DB_FILE"; then
            SUCCESS=$((SUCCESS + 1))
        fi
    fi
done

echo ""
echo "========================================"
echo "导入完成!"
echo "总计节点: $TOTAL"
echo "成功导入: $SUCCESS"
echo "失败: $((TOTAL - SUCCESS))"
echo ""
echo "数据库文件: $DB_FILE"
echo ""
echo "下一步:"
echo "  1. 查看数据: sqlite3 $DB_FILE"
echo "  2. 查询节点: SELECT hostname, ip FROM nodes;"
echo "  3. 启动Web应用查看架构图"
