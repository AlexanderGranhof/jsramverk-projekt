FROM node:14

WORKDIR /client

COPY package*.json ./
COPY public ./
COPY src ./

COPY tsconfig.json .

# RUN npm install
ENTRYPOINT [ "npm", "run", "start" ]