export type ModuleId = 'services' | 'ports' | 'network' | 'process' | 'docker' | 'config' | 'resources';

export interface ModuleCommand {
  title: string;
  cmd: string;
  filename: string;
}

export interface AnalysisModule {
  id: ModuleId;
  name: string;
  icon: string;
  description: string;
  commands: ModuleCommand[];
}

export const analysisModules: AnalysisModule[] = [
  {
    id: 'services',
    name: '服务状态',
    icon: 'fas fa-server',
    description: '查看所有systemd服务的运行状态',
    commands: [
      { title: '运行中的服务列表', cmd: 'systemctl list-units --type=service --state=running --no-pager', filename: 'services_running.txt' },
      { title: '所有已启用的服务', cmd: 'systemctl list-unit-files --type=service --state=enabled --no-pager', filename: 'services_enabled.txt' },
      { title: '失败的服务', cmd: 'systemctl list-units --type=service --state=failed --no-pager', filename: 'services_failed.txt' },
      { title: '服务详细信息', cmd: 'systemctl list-units --type=service --all --no-pager | head -60', filename: 'services_all.txt' },
    ]
  },
  {
    id: 'ports',
    name: '端口监听',
    icon: 'fas fa-plug',
    description: '查看所有端口监听情况及对应进程',
    commands: [
      { title: 'TCP监听端口', cmd: 'ss -tlnp', filename: 'tcp_listen.txt' },
      { title: 'UDP监听端口', cmd: 'ss -ulnp', filename: 'udp_listen.txt' },
      { title: '所有网络连接', cmd: 'ss -tunap', filename: 'all_connections.txt' },
      { title: '已建立连接', cmd: 'ss -tnp state established', filename: 'established.txt' },
      { title: '端口统计摘要', cmd: 'ss -s', filename: 'network_stats.txt' },
    ]
  },
  {
    id: 'network',
    name: '网络详情',
    icon: 'fas fa-network-wired',
    description: '查看网络接口、路由、防火墙等网络配置',
    commands: [
      { title: '网络接口信息', cmd: 'ip addr show', filename: 'network_interfaces.txt' },
      { title: '路由表', cmd: 'ip route show', filename: 'routes.txt' },
      { title: 'DNS配置', cmd: 'cat /etc/resolv.conf', filename: 'dns.txt' },
      { title: '防火墙规则(iptables)', cmd: 'iptables -L -n -v 2>/dev/null || echo "无权限或未安装iptables"', filename: 'iptables.txt' },
      { title: '防火墙规则(nftables)', cmd: 'nft list ruleset 2>/dev/null || echo "无nftables"', filename: 'nftables.txt' },
      { title: 'hosts文件', cmd: 'cat /etc/hosts', filename: 'hosts.txt' },
    ]
  },
  {
    id: 'process',
    name: '进程信息',
    icon: 'fas fa-microchip',
    description: '查看所有进程、进程树和资源占用',
    commands: [
      { title: '所有进程列表', cmd: 'ps aux --sort=-%mem', filename: 'processes.txt' },
      { title: '进程树', cmd: 'ps -ef --forest', filename: 'process_tree.txt' },
      { title: 'pstree视图', cmd: 'pstree -p -a 2>/dev/null || echo "pstree未安装"', filename: 'pstree.txt' },
      { title: '按CPU排序的进程', cmd: 'ps aux --sort=-%cpu | head -30', filename: 'processes_cpu.txt' },
      { title: 'Java进程详情', cmd: 'ps aux | grep java | grep -v grep || echo "无Java进程"', filename: 'java_processes.txt' },
      { title: 'Python进程详情', cmd: 'ps aux | grep python | grep -v grep || echo "无Python进程"', filename: 'python_processes.txt' },
      { title: 'Node进程详情', cmd: 'ps aux | grep node | grep -v grep || echo "无Node进程"', filename: 'node_processes.txt' },
    ]
  },
  {
    id: 'docker',
    name: '容器环境',
    icon: 'fas fa-cube',
    description: '检查Docker/K8s容器化部署情况',
    commands: [
      { title: '运行中的容器', cmd: 'docker ps 2>/dev/null || echo "Docker未安装或未运行"', filename: 'docker_ps.txt' },
      { title: '所有容器(含已停止)', cmd: 'docker ps -a 2>/dev/null || echo "Docker未安装"', filename: 'docker_ps_all.txt' },
      { title: 'Docker网络', cmd: 'docker network ls 2>/dev/null || echo "Docker未安装"', filename: 'docker_networks.txt' },
      { title: 'Docker镜像', cmd: 'docker images 2>/dev/null || echo "Docker未安装"', filename: 'docker_images.txt' },
      { title: 'docker-compose文件', cmd: 'find / -maxdepth 4 -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null | head -10 || echo "未找到"', filename: 'compose_files.txt' },
      { title: 'K8s Pods', cmd: 'kubectl get pods -A 2>/dev/null || echo "K8s未安装或无权限"', filename: 'k8s_pods.txt' },
      { title: 'K8s Services', cmd: 'kubectl get svc -A 2>/dev/null || echo "K8s未安装或无权限"', filename: 'k8s_services.txt' },
    ]
  },
  {
    id: 'config',
    name: '配置文件',
    icon: 'fas fa-file-code',
    description: '收集关键服务的配置文件信息',
    commands: [
      { title: 'Nginx配置', cmd: 'cat /etc/nginx/nginx.conf 2>/dev/null && echo "---conf.d---" && cat /etc/nginx/conf.d/*.conf 2>/dev/null || echo "Nginx配置未找到"', filename: 'nginx_conf.txt' },
      { title: '自定义systemd服务', cmd: 'ls -la /etc/systemd/system/*.service 2>/dev/null || echo "无自定义服务"', filename: 'custom_services.txt' },
      { title: '定时任务', cmd: 'crontab -l 2>/dev/null || echo "当前用户无crontab"', filename: 'crontab.txt' },
      { title: '系统crontab', cmd: 'cat /etc/crontab 2>/dev/null; ls /etc/cron.d/ 2>/dev/null', filename: 'system_crontab.txt' },
      { title: '环境变量', cmd: 'env | sort', filename: 'env_vars.txt' },
      { title: '已安装软件包(RPM)', cmd: 'rpm -qa 2>/dev/null | sort | head -100 || echo "非RPM系统"', filename: 'rpm_packages.txt' },
      { title: '已安装软件包(DEB)', cmd: 'dpkg -l 2>/dev/null | head -100 || echo "非DEB系统"', filename: 'deb_packages.txt' },
    ]
  },
  {
    id: 'resources',
    name: '系统资源',
    icon: 'fas fa-chart-bar',
    description: '查看CPU、内存、磁盘等系统资源使用情况',
    commands: [
      { title: '内存使用', cmd: 'free -h', filename: 'memory.txt' },
      { title: '磁盘使用', cmd: 'df -hT', filename: 'disk.txt' },
      { title: 'CPU信息', cmd: 'lscpu', filename: 'cpu_info.txt' },
      { title: '系统负载', cmd: 'uptime; cat /proc/loadavg', filename: 'load.txt' },
      { title: '磁盘I/O', cmd: 'iostat -x 1 1 2>/dev/null || echo "需要安装sysstat"', filename: 'iostat.txt' },
      { title: '大文件TOP20', cmd: 'find / -type f -size +100M 2>/dev/null | head -20 | xargs ls -lh 2>/dev/null || echo "无大文件"', filename: 'large_files.txt' },
      { title: '登录用户', cmd: 'who; echo "---"; last -10', filename: 'users.txt' },
      { title: '内核日志(最近)', cmd: 'dmesg | tail -30', filename: 'dmesg.txt' },
    ]
  },
];
