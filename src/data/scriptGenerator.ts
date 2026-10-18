import type { AnalysisModule } from './modules';

export function generateScript(modules: AnalysisModule[]): string {
  const lines: string[] = [];

  lines.push('#!/bin/bash');
  lines.push('#=============================================================');
  lines.push('# Linux系统架构自动分析脚本');
  lines.push('# 功能: 自动收集系统运行信息，生成架构分析报告');
  lines.push('# 使用方法: chmod +x analyze_architecture.sh && sudo ./analyze_architecture.sh');
  lines.push('#=============================================================');
  lines.push('');
  lines.push('set -uo pipefail');
  lines.push('');
  lines.push("# 颜色定义");
  lines.push("RED='\\033[0;31m'");
  lines.push("GREEN='\\033[0;32m'");
  lines.push("YELLOW='\\033[1;33m'");
  lines.push("BLUE='\\033[0;34m'");
  lines.push("CYAN='\\033[0;36m'");
  lines.push("NC='\\033[0m'");
  lines.push('');
  lines.push('# 输出目录');
  lines.push('REPORT_DIR="./architecture_report_$(date +%Y%m%d_%H%M%S)"');
  lines.push('mkdir -p "$REPORT_DIR"');
  lines.push('REPORT_FILE="$REPORT_DIR/report.html"');
  lines.push('RAW_DIR="$REPORT_DIR/raw_data"');
  lines.push('mkdir -p "$RAW_DIR"');
  lines.push('');
  lines.push('echo -e "${BLUE}========================================${NC}"');
  lines.push('echo -e "${GREEN}  Linux系统架构自动分析工具${NC}"');
  lines.push('echo -e "${BLUE}========================================${NC}"');
  lines.push('echo -e "${CYAN}报告将保存到: ${REPORT_DIR}${NC}"');
  lines.push('echo ""');
  lines.push('');
  lines.push('# 通用函数：执行命令并保存结果');
  lines.push('run_cmd() {');
  lines.push('    local title="$1"');
  lines.push('    local cmd="$2"');
  lines.push('    local filename="$3"');
  lines.push('    ');
  lines.push('    echo -e "${YELLOW}[分析] ${title}...${NC}"');
  lines.push('    echo "=== $title ===" >> "$RAW_DIR/all_output.txt"');
  lines.push('    echo "命令: $cmd" >> "$RAW_DIR/all_output.txt"');
  lines.push('    echo "---" >> "$RAW_DIR/all_output.txt"');
  lines.push('    ');
  lines.push('    if eval "$cmd" > "$RAW_DIR/$filename" 2>&1; then');
  lines.push('        echo -e "  ${GREEN}✓ 完成${NC}"');
  lines.push('    else');
  lines.push('        echo -e "  ${RED}✗ 失败或无权限${NC}"');
  lines.push('    fi');
  lines.push('    echo "" >> "$RAW_DIR/all_output.txt"');
  lines.push('    cat "$RAW_DIR/$filename" >> "$RAW_DIR/all_output.txt"');
  lines.push('    echo "" >> "$RAW_DIR/all_output.txt"');
  lines.push('}');
  lines.push('');
  lines.push('# 检查是否以root运行');
  lines.push('if [ "$EUID" -ne 0 ]; then');
  lines.push('    echo -e "${YELLOW}[提示] 建议使用sudo运行以获取完整信息${NC}"');
  lines.push('    echo ""');
  lines.push('fi');
  lines.push('');
  lines.push('echo -e "${BLUE}--- 开始系统架构分析 ---${NC}"');
  lines.push('echo ""');
  lines.push('');
  lines.push('# === 基础信息（始终收集）===');
  lines.push('run_cmd "系统基本信息" "uname -a" "system_info.txt"');
  lines.push('run_cmd "主机名" "hostname" "hostname.txt"');
  lines.push('run_cmd "系统运行时间与负载" "uptime" "uptime.txt"');
  lines.push('run_cmd "操作系统版本" "cat /etc/os-release 2>/dev/null || cat /etc/redhat-release 2>/dev/null || echo Unknown" "os_version.txt"');
  lines.push('');

  // Module commands
  modules.forEach((mod) => {
    lines.push(`# === ${mod.name} ===`);
    mod.commands.forEach((cmd) => {
      lines.push(`run_cmd "${cmd.title}" "${cmd.cmd}" "${cmd.filename}"`);
    });
    lines.push('');
  });

  // HTML report generation
  lines.push('# ============================================');
  lines.push('# 生成HTML报告');
  lines.push('# ============================================');
  lines.push('echo -e "${BLUE}--- 生成HTML报告 ---${NC}"');
  lines.push('');
  lines.push("cat > \"$REPORT_FILE\" << 'HTMLEOF'");
  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="zh-CN">');
  lines.push('<head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  lines.push('<title>Linux系统架构分析报告</title>');
  lines.push('<style>');
  lines.push('* { margin: 0; padding: 0; box-sizing: border-box; }');
  lines.push("body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.6; padding: 20px; }");
  lines.push('.container { max-width: 1200px; margin: 0 auto; }');
  lines.push('h1 { text-align: center; font-size: 2em; margin: 30px 0; color: #10b981; }');
  lines.push('h2 { color: #06b6d4; margin: 30px 0 15px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; }');
  lines.push('h3 { color: #a5f3fc; margin: 15px 0 8px; font-size: 1em; }');
  lines.push('.card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 15px 0; }');
  lines.push("pre { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; overflow-x: auto; font-size: 13px; color: #a5f3fc; margin: 10px 0; white-space: pre-wrap; word-break: break-all; }");
  lines.push('.info { color: #94a3b8; font-size: 0.9em; }');
  lines.push('.timestamp { text-align: center; color: #64748b; margin-bottom: 30px; }');
  lines.push('.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 15px; }');
  lines.push('</style>');
  lines.push('</head>');
  lines.push('<body>');
  lines.push('<div class="container">');
  lines.push('<h1>🖥️ Linux系统架构分析报告</h1>');
  lines.push('HTMLEOF');
  lines.push('');
  lines.push("echo \"<p class='timestamp'>生成时间: $(date '+%Y-%m-%d %H:%M:%S')</p>\" >> \"$REPORT_FILE\"");
  lines.push('');

  // Basic info section
  lines.push('echo "<h2>📋 系统基本信息</h2>" >> "$REPORT_FILE"');
  lines.push("echo \"<div class='grid'>\" >> \"$REPORT_FILE\"");
  lines.push("echo \"<div class='card'><h3>系统信息 (uname -a)</h3><pre>$(cat \"$RAW_DIR/system_info.txt\" 2>/dev/null)</pre></div>\" >> \"$REPORT_FILE\"");
  lines.push("echo \"<div class='card'><h3>操作系统版本</h3><pre>$(cat \"$RAW_DIR/os_version.txt\" 2>/dev/null)</pre></div>\" >> \"$REPORT_FILE\"");
  lines.push("echo \"<div class='card'><h3>运行时间</h3><pre>$(cat \"$RAW_DIR/uptime.txt\" 2>/dev/null)</pre></div>\" >> \"$REPORT_FILE\"");
  lines.push("echo \"<div class='card'><h3>主机名</h3><pre>$(cat \"$RAW_DIR/hostname.txt\" 2>/dev/null)</pre></div>\" >> \"$REPORT_FILE\"");
  lines.push('echo "</div>" >> "$REPORT_FILE"');
  lines.push('');

  // Module sections in HTML
  modules.forEach((mod) => {
    lines.push(`echo "<h2>${mod.icon} ${mod.name}</h2>" >> "$REPORT_FILE"`);
    lines.push("echo \"<div class='grid'>\" >> \"$REPORT_FILE\"");
    mod.commands.forEach((cmd) => {
      lines.push(`echo "<div class='card'><h3>${cmd.title}</h3><pre>$(cat \"$RAW_DIR/${cmd.filename}\" 2>/dev/null || echo '无数据')</pre></div>" >> "$REPORT_FILE"`);
    });
    lines.push('echo "</div>" >> "$REPORT_FILE"');
    lines.push('');
  });

  // Summary
  lines.push("cat >> \"$REPORT_FILE\" << 'HTMLEOF'");
  lines.push('<h2>🏗️ 架构分析总结</h2>');
  lines.push('<div class="card">');
  lines.push('<h3>分析建议</h3>');
  lines.push('<p class="info">根据以上收集的信息，您可以：</p>');
  lines.push('<ul style="margin: 10px 0; padding-left: 20px; color: #94a3b8;">');
  lines.push('<li>查看"端口监听"确定对外暴露的服务和端口</li>');
  lines.push('<li>查看"网络详情"确定服务间的通信关系</li>');
  lines.push('<li>查看"进程信息"确定进程层级关系和资源占用</li>');
  lines.push('<li>查看"配置文件"确定服务的具体配置和依赖</li>');
  lines.push('<li>综合以上信息绘制系统架构图</li>');
  lines.push('</ul>');
  lines.push('</div>');
  lines.push('<h2>📁 原始数据文件列表</h2>');
  lines.push('<div class="card">');
  lines.push('<p class="info">所有原始数据保存在 raw_data/ 目录下，可进一步分析。</p>');
  lines.push('<pre>');
  lines.push('HTMLEOF');
  lines.push('');
  lines.push('ls -la "$RAW_DIR/" >> "$REPORT_FILE"');
  lines.push('');
  lines.push("cat >> \"$REPORT_FILE\" << 'HTMLEOF'");
  lines.push('</pre>');
  lines.push('</div>');
  lines.push('</div>');
  lines.push('</body>');
  lines.push('</html>');
  lines.push('HTMLEOF');
  lines.push('');

  // Final output
  lines.push('echo ""');
  lines.push('echo -e "${BLUE}========================================${NC}"');
  lines.push('echo -e "${GREEN}  ✅ 分析完成！${NC}"');
  lines.push('echo -e "${BLUE}========================================${NC}"');
  lines.push('echo -e "${CYAN}报告目录: ${REPORT_DIR}${NC}"');
  lines.push('echo -e "${CYAN}HTML报告: ${REPORT_FILE}${NC}"');
  lines.push('echo -e "${CYAN}原始数据: ${RAW_DIR}/${NC}"');
  lines.push('echo ""');
  lines.push('echo -e "${YELLOW}提示: 用浏览器打开HTML报告查看完整分析结果${NC}"');
  lines.push('echo -e "${YELLOW}      命令: xdg-open ${REPORT_FILE}${NC}"');

  return lines.join('\n');
}
