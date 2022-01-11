swe_term_project_backend 
API Docs => localhost:3000/documentation

Components:\
Docker\
NodeJS

Initialization (Installing App Specific Dependencies and Setting Up the Environment):
Instructions specified in this section is required to be applied only once.
1. $ npm i
2. $ cp .env.example .env
3. $ cp ormconfig.example.json ormconfig.json
4. There are basicly 2 groups of users: Root, Consumer. Root users have extra abilities to mutate entities in system-wide. To create a root user(s), you are supposed to pass required credentials into ROOT_CREDS environment variable. E.g. ROOT_CREDS=[{"first_name":"Root","last_name":"User","email":"root@local.com","password":"Root1234"}]
5. Set DB_SEED=1 if you want to seed db for creating groups and roles and root accounts optionally. Once the DB has been seed, it's recommended to set this as 0.


Setting Up Redis:
Redis is used as an in memory cache storage within this app to store session tokens of authenticated users, rather than a relational database to minimize query response time and separating the application logic and identity access management logic. Hosts may not having the Redis or configuring Redis may be quite complicated in certain circumstances therefore, it's preferred to run a Redis instance through Docker, by the help of  a docker compose configuration file which allows hosts to run Redis regardless of the environment.

To run Redis instance run the following command at the root directory of where the project files located in.
1. $ docker compose -f ./src/nonhttp/containers/redis/docker-compose.yml --env-file .env up -d

Starting App:
1. npm start

Documentation Screen:
![chrome_oJimuMSS3g](https://user-images.githubusercontent.com/45673838/148992109-a2469793-1cb2-4c71-abfe-6189f678b67c.png)

DB ER Diagram:
![dbeaver_Ozm5oyy0pn](https://user-images.githubusercontent.com/45673838/148992152-deefb320-f475-4939-a05f-05828843b815.png)

Sample Sequence Diagram:
![image](https://user-images.githubusercontent.com/45673838/148992181-40d49e5b-f0fa-4d4a-88c9-b910a47e773d.png)
