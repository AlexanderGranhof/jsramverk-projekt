FROM node:14

WORKDIR /server

COPY package*.json ./
COPY src ./src

COPY tsconfig.json .
COPY jest.config.js .

RUN token=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c10)

ENV JWT_TOKEN=${token}

# PROD
RUN npm install
RUN npm run build
ENTRYPOINT [ "npm", "run", "start" ]

#DEV
# ENTRYPOINT [ "npm", "run", "dev" ]