export interface Command {
  command: string;
  description: string;
  output?: string;
  tip?: string;
}

export interface Category {
  name: string;
  icon: string;
  description: string;
  commands: Command[];
}

export const commandCategories: Category[] = [
  {
    name: '进程分析',
    icon: 'fas fa-microprocess',
    description: '查看系统中正在运行的进程，了解有哪些服务在运行、它们的资源占用情况以及进程之间的父子关系。',
    commands: [
      {
        command: 'ps aux',
        description: '列出所有正在运行的进程的详细信息',
        output: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1 169344 13000 ?        Ss   10:00   0:03 /sbin/init\nroot       456  0.2  1.5 723456 62000 ?        Ssl  10:01   1:23 /usr/bin/java -jar /opt/app/api.jar\nwww-data   789  0.1  0.8 145678 32000 ?        S    10:01   0:45 nginx: worker process',
        tip: 'aux 参数：a=所有用户, u=详细信息, x=包括无终端的进程'
      },
      {
        command: 'ps aux --sort=-%mem',
        description: '按内存使用量降序排列所有进程',
        tip: '使用 --sort=-%mem 按内存降序，--sort=-%cpu 按CPU降序'
      },
      {
        command: 'ps -ef --forest',
        description: '以树形结构显示进程之间的父子关系',
        output: 'UID        PID  PPID  C STIME TTY          TIME CMD\nroot         1     0  0 10:00 ?        00:00:03 /sbin/init\nroot       100     1  0 10:00 ?        00:00:01  \\_ /usr/sbin/sshd\nroot       456     1  0 10:01 ?        00:01:23  \\_ /usr/bin/java -jar api.jar\nroot       457   456  0 10:01 ?        00:00:10  |   \\_ java thread-pool-1\nwww-data   789     1  0 10:01 ?        00:00:45  \\_ nginx: master process',
        tip: '--forest 参数可以清晰看到进程间的层级关系，帮助理解服务架构'
      },
      {
        command: 'pstree -p',
        description: '以树形图显示进程及其PID',
        tip: 'pstree 是 ps --forest 的更直观版本，-p 显示PID号'
      },
      {
        command: 'top -b -n 1',
        description: '以批处理模式获取一次系统进程快照（适合脚本使用）',
        tip: '-b 批处理模式，-n 1 只执行一次。不加参数则进入交互式监控'
      },
      {
        command: 'pgrep -a java',
        description: '查找所有包含"java"关键字的进程并显示完整命令行',
        output: '456 /usr/bin/java -jar /opt/app/api.jar --server.port=8080\n512 /usr/bin/java -cp /opt/worker worker.Main',
        tip: '-a 显示完整命令行，-l 只显示进程名。非常适合查找特定服务'
      },
      {
        command: 'pidof nginx',
        description: '查找指定名称进程的所有PID',
        output: '788 789 790',
        tip: '快速找到某个服务的所有进程ID'
      },
      {
        command: 'ls -l /proc/456/exe',
        description: '查看指定PID对应的可执行文件路径',
        output: 'lrwxrwxrwx 1 root root 0 Jan 1 10:01 /proc/456/exe -> /usr/bin/java',
        tip: '/proc/[PID]/ 目录下有进程的详细信息，exe是符号链接指向实际可执行文件'
      },
      {
        command: 'cat /proc/456/cmdline | tr "\\0" " "',
        description: '查看指定进程的完整启动命令（参数以空格分隔）',
        tip: '/proc/[PID]/cmdline 中的参数以\\0分隔，用tr转换'
      }
    ]
  },
  {
    name: '网络连接',
    icon: 'fas fa-network-wired',
    description: '查看系统中的网络连接情况，了解服务之间的通信关系、连接状态和数据流向。',
    commands: [
      {
        command: 'ss -tunap',
        description: '显示所有TCP/UDP连接及其对应的进程信息（推荐，替代netstat）',
        output: 'State    Recv-Q   Send-Q   Local Address:Port     Peer Address:Port   Process\ntcp      LISTEN   0        128      0.0.0.0:80             0.0.0.0:*           users:(("nginx",pid=789,fd=6))\ntcp      LISTEN   0        128      0.0.0.0:443            0.0.0.0:*           users:(("nginx",pid=789,fd=8))\ntcp      ESTAB    0        0        192.168.1.10:8080      192.168.1.20:54321  users:(("java",pid=456,fd=42))\ntcp      LISTEN   0        128      127.0.0.1:3306         0.0.0.0:*           users:(("mysqld",pid=321,fd=25))',
        tip: '-t TCP, -u UDP, -n 数字显示, -a 所有状态, -p 显示进程。ss比netstat更快更现代'
      },
      {
        command: 'ss -tlnp',
        description: '只显示正在监听的TCP端口及其进程',
        output: 'State    Recv-Q   Send-Q   Local Address:Port     Peer Address:Port   Process\ntcp      LISTEN   0        128      0.0.0.0:80             0.0.0.0:*           users:(("nginx",pid=789))\ntcp      LISTEN   0        128      0.0.0.0:443            0.0.0.0:*           users:(("nginx",pid=789))\ntcp      LISTEN   0        128      127.0.0.1:3306         0.0.0.0:*           users:(("mysqld",pid=321))\ntcp      LISTEN   0        128      0.0.0.0:8080           0.0.0.0:*           users:(("java",pid=456))',
        tip: '这是最常用的命令之一，可以快速看到所有服务监听的端口'
      },
      {
        command: 'ss -s',
        description: '显示网络连接的统计摘要信息',
        output: 'Total: 1234 (kernel 1500)\nTCP:   456 (estab 234, closed 12, orphaned 0, timewait 12)\n\nTransport Total     IP IPv6\n*         1500      -    -\nRAW       0         0    0\nUDP       12        8    4\nTCP       444       300  144',
        tip: '快速了解系统整体网络连接状况'
      },
      {
        command: 'netstat -tunlp',
        description: '显示所有监听和已连接的TCP/UDP端口（传统命令，部分系统可能未安装）',
        tip: '如果ss不可用，可以用netstat替代。功能类似但性能稍差'
      },
      {
        command: 'lsof -i :8080',
        description: '查看哪个进程正在使用8080端口',
        output: 'COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\njava     456 root   42u  IPv6  12345      0t0  TCP *:http-alt (LISTEN)\njava     456 root   43u  IPv6  12346      0t0  TCP 192.168.1.10:8080->192.168.1.20:54321 (ESTABLISHED)',
        tip: 'lsof -i 可以查看网络连接，:端口号 过滤特定端口'
      },
      {
        command: 'lsof -i -P -n',
        description: '显示所有网络连接（不转换端口号为服务名，不解析主机名）',
        tip: '-P 不转换端口号，-n 不解析主机名，加快速度'
      },
      {
        command: 'ss -tnp state established',
        description: '只显示已建立的TCP连接',
        tip: '可以过滤各种连接状态：established, time-wait, close-wait 等'
      }
    ]
  },
  {
    name: '服务管理',
    icon: 'fas fa-cogs',
    description: '查看和管理系统服务（systemd），了解哪些服务已启用、运行状态和依赖关系。',
    commands: [
      {
        command: 'systemctl list-units --type=service --state=running',
        description: '列出所有正在运行的服务',
        output: '  UNIT                    LOAD   ACTIVE SUB     DESCRIPTION\n  nginx.service           loaded active running A high performance web server\n  mysqld.service          loaded active running MySQL database server\n  redis.service           loaded active running Advanced key-value store\n  api-server.service      loaded active running Backend API service',
        tip: '这是了解系统架构的第一步，可以看到所有正在运行的服务'
      },
      {
        command: 'systemctl list-units --type=service --all',
        description: '列出所有服务（包括未运行的）',
        tip: '--all 显示所有服务，包括已停止的、失败的等'
      },
      {
        command: 'systemctl list-unit-files --type=service --state=enabled',
        description: '列出所有开机自启动的服务',
        tip: '了解哪些服务会在系统重启后自动启动'
      },
      {
        command: 'systemctl status nginx',
        description: '查看指定服务的详细状态信息',
        output: '● nginx.service - A high performance web server\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n   Active: active (running) since Mon 2024-01-01 10:00:00 CST; 3h ago\n  Process: 788 ExecStart=/usr/sbin/nginx (code=exited, status=0/SUCCESS)\n Main PID: 789 (nginx)\n    Tasks: 3\n   Memory: 15.2M\n   CGroup: /system.slice/nginx.service\n           ├─789 nginx: master process /usr/sbin/nginx\n           ├─790 nginx: worker process\n           └─791 nginx: worker process',
        tip: '可以看到服务的运行状态、PID、内存占用、进程树等详细信息'
      },
      {
        command: 'systemctl cat nginx.service',
        description: '查看服务的配置文件内容',
        output: '[Unit]\nDescription=A high performance web server\nAfter=network.target\n\n[Service]\nType=forking\nPIDFile=/run/nginx.pid\nExecStart=/usr/sbin/nginx\nExecReload=/bin/kill -s HUP $MAINPID\nExecStop=/bin/kill -s QUIT $MAINPID\n\n[Install]\nWantedBy=multi-user.target',
        tip: '查看服务的启动配置、依赖关系、启动命令等'
      },
      {
        command: 'systemctl show api-server.service -p ExecStart,WorkingDirectory,User',
        description: '查看服务的特定属性（启动命令、工作目录、运行用户）',
        tip: '快速提取服务的关键配置信息'
      },
      {
        command: 'systemctl list-dependencies api-server.service',
        description: '查看服务的依赖关系树',
        output: 'api-server.service\n● ├─network-online.target\n● │ └─NetworkManager-wait-online.service\n● └─sysinit.target\n●   ├─ ...',
        tip: '了解服务之间的依赖关系，帮助理解启动顺序'
      },
      {
        command: 'journalctl -u nginx --since "1 hour ago"',
        description: '查看指定服务最近1小时的日志',
        tip: 'journalctl 是查看systemd服务日志的工具，-u 指定服务名'
      }
    ]
  },
  {
    name: '端口与监听',
    icon: 'fas fa-plug',
    description: '专门查看端口监听情况，了解每个端口对应什么服务，以及服务的监听地址。',
    commands: [
      {
        command: 'ss -tlnp',
        description: '查看所有TCP监听端口及对应进程',
        output: 'State    Recv-Q   Send-Q   Local Address:Port     Peer Address:Port   Process\ntcp      LISTEN   0        128      0.0.0.0:22              0.0.0.0:*           users:(("sshd",pid=100))\ntcp      LISTEN   0        128      0.0.0.0:80              0.0.0.0:*           users:(("nginx",pid=789))\ntcp      LISTEN   0        128      0.0.0.0:443             0.0.0.0:*           users:(("nginx",pid=789))\ntcp      LISTEN   0        128      127.0.0.1:3306          0.0.0.0:*           users:(("mysqld",pid=321))\ntcp      LISTEN   0        128      127.0.0.1:6379          0.0.0.0:*           users:(("redis",pid=234))\ntcp      LISTEN   0        128      0.0.0.0:8080            0.0.0.0:*           users:(("java",pid=456))',
        tip: '注意监听地址：0.0.0.0 表示对外可访问，127.0.0.1 表示仅本机可访问'
      },
      {
        command: 'ss -ulnp',
        description: '查看所有UDP监听端口及对应进程',
        tip: 'UDP不像TCP有连接状态，所以只看监听端口'
      },
      {
        command: 'lsof -i -P -n | grep LISTEN',
        description: '用lsof查看所有监听中的端口',
        output: 'sshd      100  root    3u  IPv4   1234      0t0  TCP *:22 (LISTEN)\nnginx     789  root    6u  IPv4   5678      0t0  TCP *:80 (LISTEN)\nnginx     789  root    8u  IPv4   5679      0t0  TCP *:443 (LISTEN)\nmysqld    321  mysql  25u  IPv4   9012      0t0  TCP 127.0.0.1:3306 (LISTEN)\njava      456  root   42u  IPv6   3456      0t0  TCP *:8080 (LISTEN)',
        tip: 'lsof的另一种查看方式，信息更详细'
      },
      {
        command: 'nmap -sT -p- localhost',
        description: '扫描本机所有开放的TCP端口（需要安装nmap）',
        tip: 'nmap是专业的端口扫描工具，-sT TCP扫描，-p- 扫描所有65535端口'
      },
      {
        command: 'cat /etc/services | grep -w 8080',
        description: '查看端口号对应的标准服务名',
        tip: '/etc/services 文件记录了端口号与服务名的映射关系'
      },
      {
        command: 'ss -tlnp | awk \'{print $4, $6}\' | sort',
        description: '提取监听地址和进程信息并排序',
        tip: '用awk提取特定列，方便快速浏览'
      }
    ]
  },
  {
    name: '系统资源',
    icon: 'fas fa-chart-bar',
    description: '查看系统资源使用情况，包括CPU、内存、磁盘、网络等，帮助评估系统负载。',
    commands: [
      {
        command: 'free -h',
        description: '查看内存使用情况（人类可读格式）',
        output: '              total        used        free      shared  buff/cache   available\nMem:           15Gi       8.2Gi       2.1Gi       456Mi       5.0Gi       6.3Gi\nSwap:         4.0Gi       128Mi       3.9Gi',
        tip: '-h 以人类可读格式显示（GB/MB），关注available而非free'
      },
      {
        command: 'df -hT',
        description: '查看磁盘使用情况（含文件系统类型）',
        output: 'Filesystem     Type   Size  Used Avail Use% Mounted on\n/dev/sda1      ext4    50G   23G   25G  48% /\n/dev/sdb1      ext4   200G   89G  101G  47% /data\ntmpfs          tmpfs  7.8G     0  7.8G   0% /dev/shm',
        tip: '-h 人类可读，-T 显示文件系统类型'
      },
      {
        command: 'uptime',
        description: '查看系统运行时间和负载',
        output: ' 14:23:45 up 30 days,  4:23,  2 users,  load average: 0.45, 0.38, 0.42',
        tip: 'load average 三个值分别是1分钟、5分钟、15分钟的平均负载'
      },
      {
        command: 'top -bn1 | head -20',
        description: '获取系统资源使用快照（前20行）',
        tip: '-bn1 批处理模式执行一次，配合head取前N行'
      },
      {
        command: 'iostat -x 1 3',
        description: '查看磁盘I/O统计信息（每秒刷新，共3次）',
        tip: '需要安装sysstat包。-x 显示扩展统计'
      },
      {
        command: 'vmstat 1 5',
        description: '查看虚拟内存统计（每秒1次，共5次）',
        output: 'procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 2  0 131072 2150400 320000 5120000    0    0    10    20  100  200 15  5 78  2  0',
        tip: '关注 r(运行队列)、b(阻塞)、si/so(交换)、wa(IO等待)'
      },
      {
        command: 'dmesg | tail -30',
        description: '查看最近的内核消息（可能包含硬件或OOM信息）',
        tip: 'dmesg 显示内核环形缓冲区消息，可以排查硬件问题和OOM killer'
      }
    ]
  },
  {
    name: '容器与虚拟化',
    icon: 'fas fa-cube',
    description: '检查系统是否运行了Docker容器、Kubernetes等容器化服务。',
    commands: [
      {
        command: 'docker ps',
        description: '查看所有正在运行的Docker容器',
        output: 'CONTAINER ID   IMAGE          COMMAND                  STATUS        PORTS                  NAMES\na1b2c3d4e5f6   nginx:latest   "/docker-entrypoint.…"   Up 3 days     0.0.0.0:80->80/tcp     web\nb2c3d4e5f6a7   mysql:8.0      "docker-entrypoint.s…"   Up 3 days     3306/tcp, 33060/tcp    db\nc3d4e5f6a7b8   redis:7        "docker-entrypoint.s…"   Up 3 days     6379/tcp               cache',
        tip: 'docker ps -a 可以查看所有容器（包括已停止的）'
      },
      {
        command: 'docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Ports}}\\t{{.Status}}"',
        description: '以自定义格式显示容器信息',
        tip: '--format 可以自定义输出格式，方便查看关键信息'
      },
      {
        command: 'docker inspect web --format=\'{{.Config.Cmd}}\'',
        description: '查看容器的启动命令',
        tip: 'docker inspect 可以查看容器的详细配置信息'
      },
      {
        command: 'docker network ls',
        description: '查看Docker网络列表',
        tip: '了解容器之间的网络拓扑'
      },
      {
        command: 'docker-compose ps 2>/dev/null || true',
        description: '如果使用了docker-compose，查看服务状态',
        tip: 'docker-compose 项目通常在项目目录下有 docker-compose.yml'
      },
      {
        command: 'kubectl get pods -A 2>/dev/null || true',
        description: '如果运行了Kubernetes，查看所有Pod',
        tip: '-A 表示所有命名空间。需要kubectl和集群访问权限'
      },
      {
        command: 'kubectl get svc -A 2>/dev/null || true',
        description: '查看Kubernetes所有服务',
        tip: '可以看到K8s集群中暴露的服务和端口'
      },
      {
        command: 'find / -name "docker-compose.yml" 2>/dev/null',
        description: '查找系统中的docker-compose配置文件',
        tip: '找到compose文件就能了解容器编排的完整架构'
      }
    ]
  },
  {
    name: '综合诊断',
    icon: 'fas fa-stethoscope',
    description: '组合使用多种命令进行综合诊断，快速了解系统全貌。',
    commands: [
      {
        command: 'echo "=== 监听端口 ===" && ss -tlnp && echo "\\n=== 运行服务 ===" && systemctl list-units --type=service --state=running --no-pager',
        description: '一键查看监听端口和运行服务的组合命令',
        tip: '用 && 连接多个命令，一次性获取系统关键信息'
      },
      {
        command: 'echo "=== 系统概览 ===" && uname -a && echo "\\n=== 运行时间 ===" && uptime && echo "\\n=== 内存 ===" && free -h && echo "\\n=== 磁盘 ===" && df -h / && echo "\\n=== 监听端口 ===" && ss -tlnp',
        description: '系统全面概览（一键执行）',
        tip: '适合初次接触系统时快速了解整体情况'
      },
      {
        command: 'ps aux | awk \'{print $11}\' | sort | uniq -c | sort -rn | head -20',
        description: '统计运行最多的进程（按可执行文件分组）',
        tip: '快速了解系统上运行了哪些类型的应用'
      },
      {
        command: 'ss -tlnp | awk \'NR>1 {split($6,a,"\\\""); print $4, a[2]}\' | sort',
        description: '列出所有监听端口及其对应的服务名',
        tip: '提取端口和进程名的对应关系，方便整理'
      },
      {
        command: 'find /etc/systemd/system /lib/systemd/system -name "*.service" -exec grep -l "ExecStart" {} \\; 2>/dev/null | head -20',
        description: '查找所有自定义的systemd服务文件',
        tip: '自定义服务通常在 /etc/systemd/system/ 下'
      },
      {
        command: 'cat /etc/nginx/nginx.conf 2>/dev/null || cat /etc/nginx/conf.d/*.conf 2>/dev/null',
        description: '查看Nginx配置（如果安装了Nginx）',
        tip: 'Nginx配置可以揭示反向代理关系和后端服务地址'
      },
      {
        command: 'crontab -l 2>/dev/null; for user in $(cut -f1 -d: /etc/passwd); do echo "--- $user ---"; crontab -u $user -l 2>/dev/null; done',
        description: '查看所有用户的定时任务',
        tip: '定时任务可能包含重要的后台处理逻辑'
      },
      {
        command: 'ls -la /var/log/ | head -30',
        description: '查看系统日志目录，了解有哪些日志文件',
        tip: '日志文件可以揭示系统中运行了哪些服务和应用'
      }
    ]
  }
];
