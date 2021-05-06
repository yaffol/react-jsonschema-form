FROM ubuntu:20.04
RUN apt-get update
RUN DEBIAN_FRONTEND="noninteractive" apt install git nodejs npm -y

RUN groupadd -r app && useradd -rm -g app app
RUN mkdir /app
RUN chown -R app:app /app

COPY ./ /app
RUN chown -R app:app /app
USER app

WORKDIR /app

RUN npm install
RUN npm run build
EXPOSE 8080
