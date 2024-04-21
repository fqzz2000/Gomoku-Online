# esbuild build
FROM library/node:18-alpine as esbuild
WORKDIR /home/node/app
COPY *.js* ./
COPY *.ts* ./
COPY src/ ./src/
COPY *.json ./
RUN npm i
RUN ls -al && npm run build
ENTRYPOINT [ "node", "dist/server.js" ]
EXPOSE 8181