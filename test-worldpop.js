const lat = -6.8948;
const lng = 110.6385;
const radius = 5; // km
const points = 32;
const coords = [];
for (let i = 0; i < points; i++) {
  const angle = (i * 360) / points;
  const rad = angle * Math.PI / 180;
  const dx = radius * Math.cos(rad);
  const dy = radius * Math.sin(rad);
  const rLat = lat + (dy / 111.32);
  const rLng = lng + (dx / (40075 * Math.cos(lat * Math.PI / 180) / 360));
  coords.push([rLng, rLat]);
}
coords.push(coords[0]);

const geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  }]
};

const url = `https://api.worldpop.org/v1/services/stats?dataset=wpgppop&year=2020&geojson=${encodeURIComponent(JSON.stringify(geojson))}`;
console.log(url);
fetch(url).then(res => res.json()).then(console.log).catch(console.error);
