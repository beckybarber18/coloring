function generateSquareMaze(dimension) {

    function iterate(field, x, y) {
        field[x][y] = false;
        while(true) {
            directions = [];
            if(x > 1 && field[x-2][y] == true) {
                directions.push([-1, 0]);
            }
            if(x < field.dimension - 2 && field[x+2][y] == true) {
                directions.push([1, 0]);
            }
            if(y > 1 && field[x][y-2] == true) {
                directions.push([0, -1]);
            }
            if(y < field.dimension - 2 && field[x][y+2] == true) {
                directions.push([0, 1]);
            }
            if(directions.length == 0) {
                return field;
            }
            dir = directions[Math.floor(Math.random()*directions.length)];
            field[x+dir[0]][y+dir[1]] = false;
            field = iterate(field, x+dir[0]*2, y+dir[1]*2);
        }
    }

    // Initialize the field.
    var field = new Array(dimension);
    field.dimension = dimension;
    for(var i = 0; i < dimension; i++) {
        field[i] = new Array(dimension);
        for (var j = 0; j < dimension; j++) {
            field[i][j] = true;
        }
    }

    // Generate the maze recursively.
    field = iterate(field, 1, 1);
    
    return field;

}

function generateArena() {
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
      // scene.add(tile);
    }
  }

  return tiles;

  // create walls
  const wallHorGeo = new THREE.BoxGeometry( 131, 10, 10 );
  const wallVerGeo = new THREE.BoxGeometry( 10, 131, 10 );

  // top wall
  const wallTop = new THREE.Mesh(wallHorGeo, mat);
  scene.add(wallTop);
}



