# swe_term_project_backend 
Requirements:
Docker
NodeJS

Initialization:
1. npm install -g concurrently
2. npm install -g nodemon
3. npm install -g typescript
4. npm install -g ts-node
5. npm i
6. $ cp .env.example .env
7. $ cp ormconfig.example.json ormconfig.json
8. Make sure you have set required values for environment variables.
9. Set DB_SEED=1 if you want to seed db for creating groups and roles and root accounts optionally. Once the DB has been seed, it's recommended to set this as 0.

Setting Up Redis:
1. cd ./src/nonhttp/containers/redis
2. docker compose up

Starting App:
1. npm start