function createArena() {
  // material
  const mat = new THREE.MeshBasicMaterial( { color: 0x878e88 } );

  // create tiles
  const tileGeo = new THREE.BoxGeometry( 1, 1, 0.1 );

  tiles = [];
  for (let x = -70; x < 71; x++) {
    for (let y = -50; y < 51; y++) {
      const tile = new THREE.Mesh( tileGeo, mat );
      tile.position.x = x;
      tile.position.y = y;
      tile.position.z = 0.05;
      tiles.push(tile);
      scene.add(tile);
    }
  }

  // create walls
  const wallHorGeo = new THREE.BoxGeometry( 131, 10, 10 );
  const wallVerGeo = new THREE.BoxGeometry( 10, 131, 10 );

  // top wall
  const wallTop = new THREE.Mesh(wallHorGeo, mat);
  scene.add(wallTop);
}
