FROM debian:stable-slim

RUN apt-get update && apt-get install -y wget git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV ZOLA_VERSION=0.19.2
RUN wget -q -O - \
    "https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
    | tar xzf - -C /usr/local/bin

WORKDIR /app
COPY . /app
RUN chmod +x /app/build.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
