fetch("https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/25/query?where=1=1&outFields=*&f=pjson")
  .then(res => res.json())
  .then(data => {
    console.log(data.features.slice(0, 2).map(f => f.attributes));
  });
