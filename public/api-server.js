const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 数据库路径
const DB_PATH = process.env.DB_PATH || './cluster_architecture.db';

// 测试连接
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: DB_PATH });
});

// 获取所有节点
app.get('/api/nodes', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  db.all('SELECT * FROM nodes ORDER BY hostname', [], (err, rows) => {
    db.close();
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 获取单个节点详情
app.get('/api/nodes/:id', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  const nodeId = req.params.id;
  
  db.get('SELECT * FROM nodes WHERE id = ?', [nodeId], (err, node) => {
    if (err || !node) {
      db.close();
      res.status(404).json({ error: 'Node not found' });
      return;
    }
    
    // 获取关联数据
    const queries = {
      services: 'SELECT * FROM services WHERE node_id = ?',
      ports: 'SELECT * FROM ports WHERE node_id = ?',
      processes: 'SELECT * FROM processes WHERE node_id = ? ORDER BY cpu_percent DESC LIMIT 20',
      containers: 'SELECT * FROM containers WHERE node_id = ?',
      connections: 'SELECT * FROM connections WHERE source_node_id = ?',
    };
    
    const result = { ...node, details: {} };
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.keys(queries).forEach(key => {
      db.all(queries[key], [nodeId], (err, rows) => {
        result.details[key] = rows || [];
        completed++;
        if (completed === total) {
          db.close();
          res.json(result);
        }
      });
    });
  });
});

// 获取架构关系
app.get('/api/architecture', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  // 获取所有节点
  db.all('SELECT id, hostname, ip, os FROM nodes', [], (err, nodes) => {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    
    // 获取架构关系
    db.all(`
      SELECT 
        ar.*,
        s.hostname as source_hostname,
        s.ip as source_ip,
        t.hostname as target_hostname,
        t.ip as target_ip
      FROM architecture_relations ar
      JOIN nodes s ON ar.source_node_id = s.id
      JOIN nodes t ON ar.target_node_id = t.id
    `, [], (err, relations) => {
      db.close();
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          nodes: nodes,
          relations: relations
        });
      }
    });
  });
});

// 获取端口统计
app.get('/api/stats/ports', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  db.all(`
    SELECT 
      port,
      COUNT(*) as count,
      GROUP_CONCAT(DISTINCT process_name) as processes
    FROM ports
    WHERE state = 'LISTEN'
    GROUP BY port
    ORDER BY count DESC
  `, [], (err, rows) => {
    db.close();
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 获取服务统计
app.get('/api/stats/services', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  db.all(`
    SELECT 
      service_name,
      COUNT(*) as count,
      GROUP_CONCAT(DISTINCT n.hostname) as nodes
    FROM services s
    JOIN nodes n ON s.node_id = n.id
    GROUP BY service_name
    ORDER BY count DESC
  `, [], (err, rows) => {
    db.close();
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
  console.log(`数据库: ${DB_PATH}`);
});
