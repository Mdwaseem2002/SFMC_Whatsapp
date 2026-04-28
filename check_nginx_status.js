const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  
  const commands = [
    'nginx -t',
    'systemctl status nginx --no-pager',
    'cat /etc/nginx/sites-enabled/whatzupp',
  ].join(' ; echo "===SEPARATOR===" ; ');
  
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
