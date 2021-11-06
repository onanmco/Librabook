# swe_term_project_backend 
Requirements:
Redis v6.x or later (For session mgmt.)
NodeJS

Setting Up Redis:
1. Download and install redis from redis.io/download
2. Find port and set as port 6379 at redis.conf
3. Find protected-mode and set as protected-mode yes
4. Find bind and set as bind 127.0.0.1 -::1

If you want to recover latest data after a restart apply following steps:

5. Find appendonly and set as appendonly yes at redis.conf
6. Create a file like <filename>.aof at redis installation directory
7. Find appendfilename and set as appendfilename "<filename>.aof"

Initialization:
1. npm install -g concurrently
2. npm install -g nodemon
3. npm install -g typescript
4. npm install -g ts-node
5. npm i
6. cp .env.example .env
7. cp ormconfig.example.json ormconfig.json
8. Make sure you have set required values for environment variables.
9. Set DB_SEED=1 if you want to seed db for creating groups and roles and root accounts optionally. Once the DB has been seed, it's recommended to set this as 0.

Starting Redis:
1. Change directory to the redis installation directory.
2. Run the following command: src/redis-server <absolute_path_to_redis.conf>

Starting App:
1. npm start