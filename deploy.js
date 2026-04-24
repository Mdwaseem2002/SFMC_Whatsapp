const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const localEnvPath = path.join(__dirname, '.env.local');

const commands = `
echo "Updating system..."
apt-get update -y || true
echo "Installing prerequisites..."
apt-get install -y curl git nginx certbot python3-certbot-nginx || true
if ! command -v node > /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Installing PM2..."
npm install -g pm2
mkdir -p /var/www
cd /var/www
if [ -d "whatzupp" ]; then
  echo "Pulling latest code..."
  cd whatzupp
  git pull origin main
else
  echo "Cloning repository..."
  git clone https://github.com/Mdwaseem2002/SFMC_Whatsapp.git whatzupp
  cd whatzupp
fi
`;

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const remoteEnvPath = '/var/www/whatzupp/.env.local';
    
    // We execute the setup first so /var/www/whatzupp exists
    conn.exec(commands, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log('Setup Stream :: close :: code: ' + code);
        
        // Now upload .env
        if (fs.existsSync(localEnvPath)) {
          console.log('Uploading .env.local...');
          sftp.fastPut(localEnvPath, remoteEnvPath, (err) => {
            if (err) {
              console.log('Failed to upload env:', err.message);
            } else {
              console.log('Uploaded .env.local successfully.');
            }
            runBuildAndNginx();
          });
        } else {
          console.log('.env.local not found locally! Skipping upload.');
          runBuildAndNginx();
        }
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });
    });
  });
}).connect({
  host: '31.97.207.239',
  port: 22,
  username: 'root',
  password: 'Pentacloud@123'
});

function runBuildAndNginx() {
  const finalCmds = `
cd /var/www/whatzupp
echo "Installing NPM dependencies..."
npm install
echo "Building Next.js app..."
npm run build
echo "Starting PM2..."
pm2 stop whatzupp || true
pm2 start npm --name "whatzupp" -- run start
pm2 save

echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/whatzupp << 'EOF'
server {
    listen 80;
    server_name whatzupp.com www.whatzupp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/whatzupp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx

echo "Attempting Certbot SSL..."
certbot --nginx -d whatzupp.com -d www.whatzupp.com --non-interactive --agree-tos -m admin@whatzupp.com --redirect || echo "Certbot failed (maybe DNS not pointed?). HTTP is active."
echo "DEPLOYMENT COMPLETE!"
  `;

  conn.exec(finalCmds, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Final Stream :: close :: code: ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}
