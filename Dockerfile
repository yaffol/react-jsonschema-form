FROM nikolaik/python-nodejs:python3.8-nodejs14-alpine
RUN apk add git gcc python3-dev

WORKDIR /app
RUN git clone https://github.com/yaffol/react-jsonschema-form.git /app
RUN git checkout crossref-playground

RUN npm install
RUN npm install cross-env
RUN npm i -D chokidar
RUN npm run build
# RUN pip install -r requirements.txt
WORKDIR /app/packages/playground/src
RUN npm install
RUN node translate.js
WORKDIR /app/packages/playground/src/data
RUN python3 generate-manifest.py
WORKDIR /app
RUN npm run build
# RUN npm run start
