const DISTRICTS = [
  { name: 'Jayanagar',      bounds: { minLat:12.920, maxLat:12.945, minLng:77.575, maxLng:77.605 } },
  { name: 'JP Nagar',       bounds: { minLat:12.895, maxLat:12.925, minLng:77.565, maxLng:77.595 } },
  { name: 'Banashankari',   bounds: { minLat:12.910, maxLat:12.935, minLng:77.540, maxLng:77.575 } },
  { name: 'Basavanagudi',   bounds: { minLat:12.940, maxLat:12.965, minLng:77.560, maxLng:77.590 } },
  { name: 'BTM Layout',     bounds: { minLat:12.900, maxLat:12.925, minLng:77.595, maxLng:77.630 } },
  { name: 'Bommanahalli',   bounds: { minLat:12.875, maxLat:12.910, minLng:77.610, maxLng:77.650 } },
  { name: 'Electronic City',bounds: { minLat:12.830, maxLat:12.875, minLng:77.650, maxLng:77.700 } },
  { name: 'Whitefield',     bounds: { minLat:12.950, maxLat:12.995, minLng:77.725, maxLng:77.780 } },
  { name: 'Marathahalli',   bounds: { minLat:12.940, maxLat:12.975, minLng:77.690, maxLng:77.735 } },
  { name: 'HSR Layout',     bounds: { minLat:12.900, maxLat:12.935, minLng:77.625, maxLng:77.665 } },
  { name: 'Bellandur',      bounds: { minLat:12.915, maxLat:12.950, minLng:77.650, maxLng:77.690 } },
  { name: 'Koramangala',    bounds: { minLat:12.920, maxLat:12.955, minLng:77.605, maxLng:77.645 } },
  { name: 'Majestic',       bounds: { minLat:12.970, maxLat:12.998, minLng:77.560, maxLng:77.590 } },
  { name: 'Indiranagar',    bounds: { minLat:12.965, maxLat:12.995, minLng:77.630, maxLng:77.665 } },
  { name: 'MG Road',        bounds: { minLat:12.965, maxLat:12.985, minLng:77.595, maxLng:77.625 } },
  { name: 'Brigade Road',   bounds: { minLat:12.960, maxLat:12.980, minLng:77.600, maxLng:77.625 } },
  { name: 'Malleswaram',    bounds: { minLat:12.995, maxLat:13.025, minLng:77.555, maxLng:77.585 } },
  { name: 'Frazer Town',    bounds: { minLat:12.975, maxLat:13.000, minLng:77.605, maxLng:77.640 } },
  { name: 'Hebbal',         bounds: { minLat:13.025, maxLat:13.060, minLng:77.575, maxLng:77.615 } },
  { name: 'Yelahanka',      bounds: { minLat:13.085, maxLat:13.125, minLng:77.575, maxLng:77.620 } },
  { name: 'Rajajinagar',    bounds: { minLat:12.985, maxLat:13.015, minLng:77.540, maxLng:77.575 } },
  { name: 'Yeshwanthpur',   bounds: { minLat:13.005, maxLat:13.040, minLng:77.535, maxLng:77.570 } },
  { name: 'Kengeri',        bounds: { minLat:12.885, maxLat:12.925, minLng:77.475, maxLng:77.525 } },
];

function getDistrictForPoint(lat, lng) {
  return DISTRICTS.find(d =>
    lat >= d.bounds.minLat && lat <= d.bounds.maxLat &&
    lng >= d.bounds.minLng && lng <= d.bounds.maxLng
  )?.name || null;
}

function getDistrictsFromRoute(route) {
  const distanceByDistrict = {};
  for (let i = 1; i < route.length; i++) {
    const district = getDistrictForPoint(route[i].lat, route[i].lng);
    if (!district) continue;
    const dist = haversine(route[i-1], route[i]);
    distanceByDistrict[district] = (distanceByDistrict[district] || 0) + dist;
  }
  return distanceByDistrict;
}

function haversine(a, b) {
  const R = 6371e3;
  const φ1 = a.lat * Math.PI/180, φ2 = b.lat * Math.PI/180;
  const Δφ = (b.lat - a.lat) * Math.PI/180;
  const Δλ = (b.lng - a.lng) * Math.PI/180;
  const x = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

module.exports = { getDistrictsFromRoute, DISTRICTS };
