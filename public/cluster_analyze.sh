#!/bin/bash
#=============================================================
# Linux集群架构分析 - 主控汇总脚本
# 在管理节点运行，汇总各节点数据生成集群报告
#
# 用法:
#   自动模式: sudo ./cluster_analyze.sh auto
#   手动模式: 将各节点数据放到 data/ 目录，运行 sudo ./cluster_analyze.sh manual
#=============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

MODE="${1:-auto}"
REPORT="cluster_report_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT/nodes"

echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  Linux集群架构分析工具${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ============================================
# 自动模式：通过SSH连接各节点采集
# ============================================
if [ "$MODE" = "auto" ]; then
    echo -e "${CYAN}=== 自动采集模式 ===${NC}"
    echo ""
    
    # 检查服务器列表
    if [ ! -f "servers.txt" ]; then
        echo -e "${YELLOW}[提示] 未找到 servers.txt，创建模板...${NC}"
        cat > servers.txt << 'SERVERSEOF'
# 集群服务器列表
# 格式: IP地址 SSH端口 用户名
# 每行一个服务器，# 开头为注释
# 需先配置SSH免密登录:
#   ssh-keygen -t rsa
#   ssh-copy-id user@server_ip
#
# 示例:
# 192.168.1.10 22 root
# 192.168.1.11 22 root
# 192.168.1.12 22 admin
SERVERSEOF
        echo -e "${YELLOW}[操作] 请编辑 servers.txt 添加服务器信息后重新运行${NC}"
        echo -e "${YELLOW}[提示] 确保已配置SSH免密登录${NC}"
        exit 1
    fi
    
    # 检查节点脚本
    if [ ! -f "node_collect.sh" ]; then
        echo -e "${RED}[错误] 未找到 node_collect.sh${NC}"
        echo -e "${YELLOW}[提示] 请将 node_collect.sh 放在当前目录${NC}"
        exit 1
    fi
    
    # 遍历服务器
    while IFS= read -r line; do
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue
        
        SIP=$(echo "$line" | awk '{print $1}')
        SPORT=$(echo "$line" | awk '{print $2}')
        SUSER=$(echo "$line" | awk '{print $3}')
        [ -z "$SIP" ] && continue
        [ -z "$SPORT" ] && SPORT="22"
        [ -z "$SUSER" ] && SUSER="root"
        
        echo -e "${CYAN}[连接] ${SUSER}@${SIP}:${SPORT}${NC}"
        
        # 上传采集脚本
        if scp -P "$SPORT" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
            node_collect.sh "${SUSER}@${SIP}:/tmp/" 2>/dev/null; then
            
            # 远程执行
            REMOTE_OUT=$(ssh -p "$SPORT" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
                "${SUSER}@${SIP}" \
                "chmod +x /tmp/node_collect.sh && cd /tmp && /tmp/node_collect.sh 2>&1 | grep '数据目录' | awk '{print \$NF}'" 2>/dev/null)
            
            if [ -n "$REMOTE_OUT" ]; then
                # 打包下载
                ssh -p "$SPORT" -o StrictHostKeyChecking=no "${SUSER}@${SIP}" \
                    "cd /tmp && tar czf ${REMOTE_OUT}.tar.gz $(basename $REMOTE_OUT)" 2>/dev/null
                
                scp -P "$SPORT" -o StrictHostKeyChecking=no \
                    "${SUSER}@${SIP}:/tmp/$(basename $REMOTE_OUT).tar.gz" \
                    "$REPORT/nodes/${SIP}.tar.gz" 2>/dev/null
                
                if [ $? -eq 0 ]; then
                    cd "$REPORT/nodes" && tar xzf "${SIP}.tar.gz" && rm -f "${SIP}.tar.gz" && cd ../..
                    echo -e "  ${GREEN}✓ 采集成功${NC}"
                else
                    echo -e "  ${RED}✗ 下载数据失败${NC}"
                fi
                
                # 清理远程
                ssh -p "$SPORT" -o StrictHostKeyChecking=no "${SUSER}@${SIP}" \
                    "rm -rf /tmp/node_collect.sh /tmp/node_*" 2>/dev/null
            else
                echo -e "  ${RED}✗ 远程执行失败${NC}"
            fi
        else
            echo -e "  ${RED}✗ 连接失败（请检查SSH免密登录）${NC}"
        fi
        echo ""
    done < servers.txt
fi

# ============================================
# 手动模式：读取已有数据
# ============================================
if [ "$MODE" = "manual" ]; then
    echo -e "${CYAN}=== 手动汇总模式 ===${NC}"
    echo ""
    
    if [ -d "data" ]; then
        # 复制tar包并解压
        for tarfile in data/*.tar.gz; do
            [ -f "$tarfile" ] || continue
            echo -e "${CYAN}[解压] $(basename $tarfile)${NC}"
            tar xzf "$tarfile" -C "$REPORT/nodes/" 2>/dev/null
        done
        
        # 复制目录
        for dir in data/node_*/; do
            [ -d "$dir" ] || continue
            NIP=$(basename "$dir" | sed 's/node_//;s/_[0-9].*$//')
            cp -r "$dir" "$REPORT/nodes/$NIP" 2>/dev/null
            echo -e "  ${GREEN}✓ 已添加${NC}"
        done
    else
        echo -e "${RED}[错误] data/ 目录不存在${NC}"
        echo -e "${YELLOW}[提示] 请将各节点数据放到 data/ 目录${NC}"
        exit 1
    fi
fi

# ============================================
# 统计节点
# ============================================
NODE_COUNT=$(find "$REPORT/nodes" -maxdepth 1 -type d -name "node_*" 2>/dev/null | wc -l)
if [ "$NODE_COUNT" -eq 0 ]; then
    # 尝试其他目录结构
    NODE_COUNT=$(ls -d "$REPORT/nodes/"*/ 2>/dev/null | wc -l)
fi

if [ "$NODE_COUNT" -eq 0 ]; then
    echo -e "${RED}[错误] 没有找到节点数据${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}共收集到 ${NODE_COUNT} 个节点的数据${NC}"
echo ""

# ============================================
# 生成HTML报告
# ============================================
echo -e "${BLUE}--- 生成集群报告 ---${NC}"
HTML="$REPORT/cluster_report.html"

# HTML头部
cat > "$HTML" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>集群架构分析报告</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;line-height:1.6}
.ctn{max-width:1400px;margin:0 auto}
h1{text-align:center;font-size:2em;margin:30px 0;color:#10b981}
h2{color:#06b6d4;margin:25px 0 15px;border-bottom:1px solid #1e293b;padding-bottom:8px}
h3{color:#a5f3fc;margin:12px 0 8px;font-size:0.95em}
.card{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:15px;margin:10px 0}
pre{background:#0f172a;border:1px solid #334155;border-radius:6px;padding:12px;overflow-x:auto;font-size:12px;color:#a5f3fc;white-space:pre-wrap;word-break:break-all}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:12px}
.overview{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:20px 0}
.stat{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:15px;text-align:center}
.stat-v{font-size:1.5em;font-weight:bold;color:#10b981}
.stat-l{color:#94a3b8;font-size:0.85em}
.tabs{display:flex;gap:5px;margin:20px 0;flex-wrap:wrap}
.tab{padding:8px 16px;background:#1e293b;border:1px solid #334155;border-radius:8px;cursor:pointer;color:#94a3b8;font-size:0.9em;transition:all 0.2s}
.tab:hover{border-color:#10b981}
.tab.active{background:#065f46;border-color:#10b981;color:#6ee7b7}
.tc{display:none}.tc.active{display:block}
.info{color:#94a3b8;font-size:0.85em}
.ts{text-align:center;color:#64748b;margin-bottom:20px}
</style>
</head>
<body>
<div class="ctn">
<h1>🖥️ Linux集群架构分析报告</h1>
HTMLEOF

echo "<p class='ts'>生成时间: $(date '+%Y-%m-%d %H:%M:%S') | 节点数: ${NODE_COUNT}</p>" >> "$HTML"

# 概览
echo "<h2>📊 集群概览</h2>" >> "$HTML"
echo "<div class='overview'>" >> "$HTML"
echo "<div class='stat'><div class='stat-v'>${NODE_COUNT}</div><div class='stat-l'>服务器节点</div></div>" >> "$HTML"

# 遍历节点目录
IDX=0
for ndir in "$REPORT/nodes"/node_*/; do
    [ -d "$ndir" ] || continue
    NHOST=$(cat "$ndir/hostname.txt" 2>/dev/null || basename "$ndir")
    NIP=$(cat "$ndir/ip.txt" 2>/dev/null || echo "unknown")
    echo "<div class='stat'><div class='stat-v' style='font-size:1.1em'>${NHOST}</div><div class='stat-l'>${NIP}</div></div>" >> "$HTML"
done
echo "</div>" >> "$HTML"

# Tab导航
echo "<h2>📋 各节点详情</h2>" >> "$HTML"
echo "<div class='tabs'>" >> "$HTML"
IDX=0
for ndir in "$REPORT/nodes"/node_*/; do
    [ -d "$ndir" ] || continue
    NHOST=$(cat "$ndir/hostname.txt" 2>/dev/null || basename "$ndir")
    ACT=""
    [ $IDX -eq 0 ] && ACT=" active"
    echo "<div class='tab${ACT}' onclick='sw(${IDX})'>${NHOST}</div>" >> "$HTML"
    IDX=$((IDX+1))
done
echo "</div>" >> "$HTML"

# 各节点内容
IDX=0
for ndir in "$REPORT/nodes"/node_*/; do
    [ -d "$ndir" ] || continue
    NHOST=$(cat "$ndir/hostname.txt" 2>/dev/null || basename "$ndir")
    NIP=$(cat "$ndir/ip.txt" 2>/dev/null || echo "unknown")
    ACT=""
    [ $IDX -eq 0 ] && ACT=" active"
    
    echo "<div class='tc${ACT}' id='t${IDX}'>" >> "$HTML"
    echo "<div class='card'>" >> "$HTML"
    echo "<h2 style='margin-top:0'>🖥️ ${NHOST} <span class='info'>(${NIP})</span></h2>" >> "$HTML"
    
    # 基础信息
    echo "<h3>📌 基础信息</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in system_info.txt os_version.txt uptime.txt memory.txt disk.txt cpu.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    # 服务
    echo "<h3>🔧 服务状态</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in services_running.txt services_enabled.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    # 端口
    echo "<h3>🔌 端口监听</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in tcp_listen.txt udp_listen.txt all_connections.txt established.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    # 进程
    echo "<h3>⚙️ 进程信息</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in processes.txt process_tree.txt java_processes.txt python_processes.txt node_processes.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    # 容器
    echo "<h3>📦 容器环境</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in docker_ps.txt docker_ps_all.txt docker_networks.txt k8s_pods.txt k8s_services.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    # 网络
    echo "<h3>🌐 网络配置</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in network_interfaces.txt routes.txt dns.txt hosts.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    # 配置
    echo "<h3>📄 配置文件</h3>" >> "$HTML"
    echo "<div class='grid'>" >> "$HTML"
    for f in nginx_conf.txt custom_services.txt crontab.txt env_vars.txt; do
        [ -f "$ndir/$f" ] || continue
        FNAME="${f%.txt}"
        echo "<div class='card'><h3>${FNAME}</h3><pre>$(cat "$ndir/$f" 2>/dev/null)</pre></div>" >> "$HTML"
    done
    echo "</div>" >> "$HTML"
    
    echo "</div></div>" >> "$HTML"
    IDX=$((IDX+1))
done

# JS
cat >> "$HTML" << 'JSEOF'
<script>
function sw(i){
    document.querySelectorAll('.tab').forEach((t,j)=>t.classList.toggle('active',j===i));
    document.querySelectorAll('.tc').forEach((c,j)=>c.classList.toggle('active',j===i));
}
</script>
</div>
</body>
</html>
JSEOF

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  ✅ 集群分析完成！${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${CYAN}报告目录: ${REPORT}${NC}"
echo -e "${CYAN}HTML报告: ${HTML}${NC}"
echo -e "${CYAN}节点数量: ${NODE_COUNT}${NC}"
echo ""
echo -e "${YELLOW}提示: 将 cluster_report.html 下载到本地用浏览器打开${NC}"
