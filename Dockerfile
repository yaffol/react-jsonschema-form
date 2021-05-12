#
# ---- Base Node ----
FROM mhart/alpine-node:10.24.1 as base
#RUN apt-get update
#RUN DEBIAN_FRONTEND="noninteractive" apt install git nodejs npm python3 -y
# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

#RUN groupadd -r app && useradd -rm -g app app
#RUN mkdir /app
#RUN chown -R app:app /app

COPY ./ /app
RUN mkdir -p /app/packages/playground/src/data/dist
RUN chmod a+x /app/docker-entrypoint.sh
#RUN chown -R app:app /app
#USER app

WORKDIR /app
RUN npm config set unsafe-perm true

#
# ---- Dependencies ----
FROM base AS dependencies
RUN npm install

#
# ---- App ----
FROM dependencies AS app
RUN ./update_manifest.sh
RUN npm run build
EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
