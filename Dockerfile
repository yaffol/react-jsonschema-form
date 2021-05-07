#
# ---- Base Node ----
FROM ubuntu:20.04 as base
RUN apt-get update
RUN DEBIAN_FRONTEND="noninteractive" apt install git nodejs npm python3 -y

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
CMD bash cmd.sh
