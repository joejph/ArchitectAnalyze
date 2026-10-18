#!/bin/bash
#=============================================================
# Linux集群节点信息采集脚本
# 在每台服务器上运行，采集本机信息
# 用法: chmod +x node_collect.sh && sudo ./node_collect.sh
#=============================================================

HOSTNAME_VAL=$(hostname 2>/dev/null || echo "unknown")
IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "unknown")
TS=$(date +%Y%m%d_%H%M%S)
OUT="./node_${HOSTNAME_VAL}_${TS}"
mkdir -p "$OUT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

save() {
    local title="$1"
    local filename="$2"
    local cmd="$3"
    echo "=== $title ===" > "$OUT/$filename"
    echo "命令: $cmd" >> "$OUT/$filename"
    echo "---" >> "$OUT/$filename"
    eval "$cmd" >> "$OUT/$filename" 2>&1 || echo "(执行失败)" >> "$OUT/$filename"
    echo -e "  ${GREEN}✓ ${title}${NC}"
}

echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  节点信息采集: ${HOSTNAME_VAL} (${IP_ADDR})${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# === 基础信息 ===
echo "$HOSTNAME_VAL" > "$OUT/hostname.txt"
echo "$IP_ADDR" > "$OUT/ip.txt"
save "系统信息" "system_info.txt" "uname -a"
save "操作系统" "os_version.txt" "cat /etc/os-release 2>/dev/null || cat /etc/redhat-release 2>/dev/null || echo Unknown"
save "运行时间" "uptime.txt" "uptime"
save "内存" "memory.txt" "free -h"
save "磁盘" "disk.txt" "df -hT"
save "CPU" "cpu.txt" "lscpu 2>/dev/null | head -15"
save "负载" "load.txt" "cat /proc/loadavg"

# === 服务状态 ===
save "运行中的服务" "services_running.txt" "systemctl list-units --type=service --state=running --no-pager 2>/dev/null || echo 'systemctl不可用'"
save "已启用的服务" "services_enabled.txt" "systemctl list-unit-files --type=service --state=enabled --no-pager 2>/dev/null || echo 'systemctl不可用'"

# === 端口监听 ===
save "TCP监听端口" "tcp_listen.txt" "ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null || echo 'ss/netstat不可用'"
save "UDP监听端口" "udp_listen.txt" "ss -ulnp 2>/dev/null || netstat -ulnp 2>/dev/null || echo '不可用'"
save "所有网络连接" "all_connections.txt" "ss -tunap 2>/dev/null || netstat -tunap 2>/dev/null || echo '不可用'"
save "已建立连接" "established.txt" "ss -tnp state established 2>/dev/null || echo '不可用'"

# === 进程信息 ===
save "所有进程" "processes.txt" "ps aux --sort=-%mem"
save "进程树" "process_tree.txt" "ps -ef --forest 2>/dev/null || ps -ef"
save "Java进程" "java_processes.txt" "ps aux | grep java | grep -v grep || echo '无Java进程'"
save "Python进程" "python_processes.txt" "ps aux | grep python | grep -v grep || echo '无Python进程'"
save "Node进程" "node_processes.txt" "ps aux | grep node | grep -v grep || echo '无Node进程'"

# === 容器环境 ===
save "Docker容器" "docker_ps.txt" "docker ps 2>/dev/null || echo 'Docker未安装或未运行'"
save "Docker所有容器" "docker_ps_all.txt" "docker ps -a 2>/dev/null || echo 'Docker未安装'"
save "Docker网络" "docker_networks.txt" "docker network ls 2>/dev/null || echo 'Docker未安装'"
save "K8s Pods" "k8s_pods.txt" "kubectl get pods -A 2>/dev/null || echo 'K8s未安装或无权限'"
save "K8s Services" "k8s_services.txt" "kubectl get svc -A 2>/dev/null || echo 'K8s未安装或无权限'"

# === 网络配置 ===
save "网络接口" "network_interfaces.txt" "ip addr show 2>/dev/null || ifconfig 2>/dev/null"
save "路由表" "routes.txt" "ip route show 2>/dev/null || route -n 2>/dev/null"
save "DNS配置" "dns.txt" "cat /etc/resolv.conf 2>/dev/null"
save "hosts文件" "hosts.txt" "cat /etc/hosts 2>/dev/null"

# === 配置文件 ===
save "Nginx配置" "nginx_conf.txt" "cat /etc/nginx/nginx.conf 2>/dev/null || echo 'Nginx配置未找到'"
save "自定义systemd服务" "custom_services.txt" "ls -la /etc/systemd/system/*.service 2>/dev/null || echo '无自定义服务'"
save "定时任务" "crontab.txt" "crontab -l 2>/dev/null || echo '当前用户无crontab'"
save "环境变量" "env_vars.txt" "env | sort"

# === 生成摘要 ===
echo "节点: $HOSTNAME_VAL" > "$OUT/summary.txt"
echo "IP: $IP_ADDR" >> "$OUT/summary.txt"
echo "时间: $(date)" >> "$OUT/summary.txt"
echo "采集文件:" >> "$OUT/summary.txt"
ls "$OUT/" >> "$OUT/summary.txt"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ 节点采集完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "数据目录: ${YELLOW}${OUT}${NC}"
echo -e "文件数量: ${YELLOW}$(ls "$OUT/" | wc -l)${NC}"
echo ""
echo -e "${YELLOW}请将此目录打包传回管理节点:${NC}"
echo -e "  tar czf ${OUT}.tar.gz ${OUT}"
echo -e "  scp ${OUT}.tar.gz admin@管理节点:/path/to/data/"
