const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  const commands = `
set -e
echo "Reconfiguring WhatZupp to run on Port 3001..."

# 1. Update PM2
pm2 delete whatzupp || true
cd /var/www/whatzupp
pm2 start npm --name "whatzupp" -- start -- -p 3001
pm2 save

# 2. Update Nginx Config
cat > /etc/nginx/sites-available/whatzupp << 'EOF'
server {
    server_name whatzupp.com www.whatzupp.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/whatzupp.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/whatzupp.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if (\\$host = www.whatzupp.com) {
        return 301 https://\\$host\\$request_uri;
    } # managed by Certbot

    if (\\$host = whatzupp.com) {
        return 301 https://\\$host\\$request_uri;
    } # managed by Certbot

    listen 80;
    server_name whatzupp.com www.whatzupp.com;
    return 404; # managed by Certbot
}
EOF

systemctl reload nginx
echo "DONE!"
  `;

  conn.exec(commands, (err, stream) => {
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
