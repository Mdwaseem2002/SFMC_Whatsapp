const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  
  // Check current nginx config and PM2 processes
  const commands = [
    'cat /etc/nginx/sites-enabled/whatzupp',
    'pm2 list',
    'pm2 show whatzupp 2>/dev/null || echo "checking id 7..."',
    'pm2 show 7 2>/dev/null | grep -E "port|script|cwd"',
    'cat /etc/nginx/sites-enabled/default 2>/dev/null | head -30',
    'ls /etc/nginx/sites-enabled/',
  ].join(' && echo "===SEPARATOR===" && ');
  
  conn.exec(commands, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let output = '';
    stream.on('data', (data) => { output += data.toString(); });
    stream.stderr.on('data', (data) => { output += data.toString(); });
    stream.on('close', () => {
      console.log(output);
      conn.end();
    });
  });
});

conn.on('error', (err) => console.error('Connection error:', err));
conn.connect({
  host: '31.97.207.239',
  port: 22,
  username: 'root',
  password: 'Pentacloud@123',
});
