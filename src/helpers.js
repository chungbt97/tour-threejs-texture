import { BoxGeometry, Mesh, SphereGeometry, TorusGeometry } from 'three';

export function factoryGeometries(type, quantity = 1, rangeRandom, materials) {
  let geo;
  const groupMesh = [];

  for (let i = 0; i < quantity; i++) {
    const r = 0.5;
    switch (type) {
      case 'donut':
        geo = new TorusGeometry(r, 0.25, 16, 100);
        break;
      case 'ball':
        geo = new BoxGeometry(r, r, r);
        break;
      default:
        geo = new SphereGeometry(r, 32, 32);
        break;
    }

    const mesh = new Mesh(geo, materials);
    const [x, y, z] = [randomCoorinate(rangeRandom), randomCoorinate(rangeRandom), randomCoorinate(rangeRandom)];

    mesh.position.set(x, y, z);
    groupMesh.push(mesh);
  }
  return groupMesh;
}

export function randomCoorinate(range = 40) {
  return Math.ceil((Math.random() - 0.5) * range);
}

export function randomNumber(range = 1) {
  return Math.random() * range;
}
