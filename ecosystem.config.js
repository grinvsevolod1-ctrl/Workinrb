module.exports = {
  apps: [
    {
      name: 'workinrb',
      script: 'npx',
      args: 'next start -p 3001',
      cwd: '/var/www/workinrb',
      env: {
        NODE_ENV: 'production',
        // Facebook token должен быть в .env.local или передан через PM2
        // FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
      },
      // Загружаем переменные из .env.local
      env_file: '/var/www/workinrb/.env.local',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
}
