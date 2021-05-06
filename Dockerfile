FROM nikolaik/python-nodejs:python3.9-nodejs14-alpine

WORKDIR /app
COPY ./ .

RUN npm ci
RUN pip install requirements.txt
RUN node translate.js
WORKDIR /app/packages/playground/src/data
RUN python3 generate-manifest.py
WORKDIR /app
RUN npm run build
# RUN npm run start