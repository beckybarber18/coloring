function createArena() {
  // create walls
  var geometry = new THREE.BoxGeometry( 10, 10, 10 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
}
