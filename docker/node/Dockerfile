FROM node:14.15.0-alpine

WORKDIR /app

RUN npm install -g nodemon

# COPY ./start.sh /scripts/start.sh

#shフォルダの権限追加（全員実行可）
# RUN chmod +x /scripts/*

# 初期実行
CMD [ "sh" ]
# ENTRYPOINT [ "/scripts/start.sh" ]