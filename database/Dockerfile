FROM mysql:9.2

COPY db/ /docker-entrypoint-initdb.d/

EXPOSE 3306

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 CMD mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" || exit 1
