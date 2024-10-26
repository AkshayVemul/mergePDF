FROM denoland/deno:2.0.1

# The port that your application listens to.
EXPOSE 8080

WORKDIR /src

# Prefer not to run as root.
USER deno

RUN deno install

# These steps will be re-run upon each file change in your working directory:
COPY . .

CMD ["deno", "run", "start"]
