# traefik-shortcut

I host a lot of incredibly low-traffic things on a droplet using [traefik](https://github.com/containous/traefik) as a reverse proxy.  Traefik v2 improved a lot of things, but unfortunately, my basic setup went from this:

```yml
    labels:
      - traefik.enable=true
      - traefik.port=8080
      - traefik.frontend.rule=Host:website.com
```

To this:
```yml
    labels:
      - traefik.enable=true
      # Routers
      - traefik.http.routers.website-rtr-http.rule=Host(`website.com`)
      - traefik.http.routers.website-rtr-http.entrypoints=http
      - traefik.http.routers.website-rtr-http.middlewares=force-https@file
      - traefik.http.routers.website-rtr.entrypoints=https
      - traefik.http.routers.website-rtr.rule=Host(`website.com`)
      - traefik.http.routers.website-rtr.tls=true
      - traefik.http.routers.website-rtr.tls.certresolver=websiteresolver
      # Services
      - traefik.http.routers.website-rtr.service=website-svc
      - traefik.http.services.website-svc.loadbalancer.server.port=8080
```
That's a lot more typing, and more copy-paste to mess up.  This automates that--just give it the essentials:

```yml
    labels:
      - traefik:
          rule: Host(`website.com`)
          certresolver: websiteresolver
          port: 8080
```
It'll output a docker-compose that'll work.