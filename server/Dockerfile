FROM node:14

WORKDIR /server

COPY package*.json ./
COPY src ./src

COPY tsconfig.json .
COPY jest.config.js .

ENV JWT_SECRET=unVajVBjBiWaZpDV413vVcgn

# PROD
RUN npm install
RUN npm run build
ENTRYPOINT [ "npm", "run", "start" ]

#DEV
# ENTRYPOINT [ "npm", "run", "dev" ]