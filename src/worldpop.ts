export const fetchPopulation = async (lat: number, lng: number, radiusKm: number): Promise<number> => {
    try {
        const points = 32;
        const coords = [];
        for (let i = 0; i < points; i++) {
            const angle = (i * 360) / points;
            const rad = angle * Math.PI / 180;
            const dx = radiusKm * Math.cos(rad);
            const dy = radiusKm * Math.sin(rad);
            const rLat = lat + (dy / 111.32);
            const rLng = lng + (dx / (40075 * Math.cos(lat * Math.PI / 180) / 360));
            coords.push([rLng, rLat]);
        }
        coords.push(coords[0]); // close polygon
        
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
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.taskid) {
            let resultData = null;
            let attempts = 0;
            while (attempts < 15) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const taskRes = await fetch(`https://api.worldpop.org/v1/tasks/${data.taskid}`);
                const taskData = await taskRes.json();
                if (taskData.status === 'finished') {
                    return Math.floor(taskData.data.total_population || 0);
                } else if (taskData.status === 'error') {
                    throw new Error("WorldPop task error");
                }
                attempts++;
            }
        }
        return 5000; // fallback if timeout
    } catch (e) {
        console.error("WorldPop Error:", e);
        return 5000; // fallback
    }
}
