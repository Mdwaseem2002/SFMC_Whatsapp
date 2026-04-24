const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('pm2 status && lsof -i :3000 && cat /etc/nginx/sites-enabled/whatzupp', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).connect({
  host: '31.97.207.239',
  port: 22,
  username: 'root',
  password: 'Pentacloud@123'
});
