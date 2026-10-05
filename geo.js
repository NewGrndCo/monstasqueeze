const EARTH_RADIUS_MILES = 3958.8;
const radians = degrees => degrees * Math.PI / 180;

export function distanceMiles(origin, destination) {
  const latitudeDelta = radians(destination.lat - origin.lat);
  const longitudeDelta = radians(destination.lon - origin.lon);
  const originLatitude = radians(origin.lat);
  const destinationLatitude = radians(destination.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(haversine));
}

export function formatDistance(miles) {
  if (miles < 0.1) return 'Less than 0.1 mi away';
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi away`;
}
