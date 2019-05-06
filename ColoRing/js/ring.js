function createArena() {
  // create tiles
  const tileGeo = new THREE.BoxGeometry( 1, 1, 0.1 );
  const tileMat = new THREE.MeshBasicMaterial( { color: 0x878e88 } );

  tiles = [];
  for (let x = -70; x < 71; x++) {
    for (let y = -50; y < 51; y++) {
      const tile = new THREE.Mesh( tileGeo, tileMat );
      tile.position.x = x;
      tile.position.y = y;
      tile.position.z = 0.05;
      tiles.push(tile);
      scene.add(tile);
    }
  }
}
