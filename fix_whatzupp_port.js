const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  
  const commands = [
    'pm2 delete whatzupp || echo "not running"',
    'cd /var/www/whatzupp && pm2 start npm --name "whatzupp" -- start -- -p 3001',
    'pm2 save',
    "sed -i 's/proxy_pass http:\\/\\/localhost:3000;/proxy_pass http:\\/\\/localhost:3001;/g' /etc/nginx/sites-enabled/whatzupp",
    'systemctl reload nginx',
    'echo "=== PM2 STATUS ==="',
    'pm2 status whatzupp',
    'echo "=== NGINX CONFIG ==="',
    'cat /etc/nginx/sites-enabled/whatzupp | grep proxy_pass'
  ].join(' ; ');
  
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
