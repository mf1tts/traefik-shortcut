
const fs = require('fs');
var yaml = require('js-yaml');
var argv = require('minimist')(process.argv.slice(2));


let doc = yaml.safeLoad(fs.readFileSync(argv.f, 'utf8'));

for (let [key, value] of Object.entries(doc.services)) {
  doc.services[key]['labels'] = remapLabels(key, value);
}

fs.writeFileSync(argv.o, yaml.safeDump(doc).replace(/: null\n/g, ':\n'));

function remapLabels(key, data){
  let traefik = data.labels.find(item => Object.keys(item).includes('traefik')).traefik;

  let labels = data.labels.filter(item => typeof item == 'string').concat(
      [
        'traefik.enable=true',
        `traefik.http.routers.${key}-rtr-http.rule=${traefik['rule']}`,
        `traefik.http.routers.${key}-rtr-http.entrypoints=http`,
        `traefik.http.routers.${key}-rtr-http.middlewares=force-https@file`,
        `traefik.http.routers.${key}-rtr.entrypoints=https`,
        `traefik.http.routers.${key}-rtr.rule=${traefik.rule}`,
        `traefik.http.routers.${key}-rtr.tls=true`,
        `traefik.http.routers.${key}-rtr.tls.certresolver=${traefik.certresolver}`,
        `traefik.http.routers.${key}-rtr.service=${key}-svc`,
        `traefik.http.services.${key}-svc.loadbalancer.server.port=${traefik.port}`
      ]
    );

  if (Object.keys(traefik).includes('middlewares')){
    labels.push(`traefik.http.routers.${key}-rtr.middlewares=${traefik.middlewares}`);
  }
  return labels;
}