FROM node:14

WORKDIR /server

COPY package*.json ./
COPY src ./

COPY tsconfig.json .

#PROD
# RUN npm install
# RUN npm run build
# ENTRYPOINT [ "npm", "run", "start" ]

#DEV
ENTRYPOINT [ "npm", "run", "dev" ]