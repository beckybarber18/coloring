function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();

    // Add the light.
    light= new THREE.PointLight(0xffffff, 1);
    light.position.set(1, 1, 7);
    scene.add(light);
    
    // Add the ball.
    g = new THREE.SphereGeometry(ballRadius, 32, 16);
    m = new THREE.MeshPhongMaterial({map:ironTexture});
    ballMesh = new THREE.Mesh(g, m);
    ballMesh.position.set(1.5, 1, ballRadius);
    scene.add(ballMesh);

    m2 = new THREE.MeshPhongMaterial({map:ironTexture2});
    ballMesh2 = new THREE.Mesh(g, m2);
    ballMesh2.position.set(0.5, 1, ballRadius);
    scene.add(ballMesh2);

    // Add the camera.
    var aspect = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    console.log(camera.view);
    // camera = new THREE.OrthographicCamera(-10*aspect, 10*aspect, -10, 10, 1, 1000);
    camera.position.set(50, 50, 150);
    // camera.position.x = -10000;
    // camera.position.y = -10000;
    // camera.position.z = -10000;
    // camera.setViewOffset(aspect*50, 50, 20, 10, aspect*50, 50);
    scene.add(camera);

    // Add the maze.
    mazeMesh = generate_maze_mesh(maze);
    scene.add(mazeMesh);

    // Add the ground.
    // g = new THREE.PlaneGeometry(mazeDimension*10, mazeDimension*10, mazeDimension, mazeDimension);
    // planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    // planeTexture.repeat.set(mazeDimension*5, mazeDimension*5);
    // // m = new THREE.MeshPhongMaterial({map:planeTexture});
    // planeMesh = new THREE.Mesh(g);
    // planeMesh.position.set((mazeDimension-1)/2, (mazeDimension-1)/2, 0);
    // planeMesh.rotation.set(Math.PI/2, 0, 0);
    // scene.add(planeMesh);                

}


function updateRenderWorld() {

    // Update ball position.
    var stepX = wBall.GetPosition().x - ballMesh.position.x;
    var stepY = wBall.GetPosition().y - ballMesh.position.y;
    ballMesh.position.x += stepX;
    ballMesh.position.y += stepY;

    var stepX2 = wBall2.GetPosition().x - ballMesh2.position.x;
    var stepY2 = wBall2.GetPosition().y - ballMesh2.position.y;
    ballMesh2.position.x += stepX2;
    ballMesh2.position.y += stepY2;

    // Update ball rotation.
    var tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(0,1,0), stepX/ballRadius);
    tempMat.multiplySelf(ballMesh.matrix);
    ballMesh.matrix = tempMat;

    var tempMat2 = new THREE.Matrix4();
    tempMat2.makeRotationAxis(new THREE.Vector3(0,1,0), stepX2/ballRadius);
    tempMat2.multiplySelf(ballMesh2.matrix);
    ballMesh2.matrix = tempMat2;

    tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(1,0,0), -stepY/ballRadius);
    tempMat.multiplySelf(ballMesh.matrix);
    ballMesh.matrix = tempMat;
    ballMesh.rotation.getRotationFromMatrix(ballMesh.matrix);

    tempMat2 = new THREE.Matrix4();
    tempMat2.makeRotationAxis(new THREE.Vector3(1,0,0), -stepY2/ballRadius);
    tempMat2.multiplySelf(ballMesh2.matrix);
    ballMesh2.matrix = tempMat2;
    ballMesh2.rotation.getRotationFromMatrix(ballMesh2.matrix);
    
    // // Update camera and light positions.
    // camera.position.x += (ballMesh.position.x - camera.position.x) * 0.1;
    // camera.position.y += (ballMesh.position.y - camera.position.y) * 0.1;
    // camera.position.z += (5 - camera.position.z) * 0.1;
    // light.position.x = camera.position.x;
    // light.position.y = camera.position.y;
    // light.position.z = camera.position.z - 3.7;
}

function generate_maze_mesh(field) {
    var dummy = new THREE.Geometry();
    for (var i = 0; i < mazeDimension; i+=mazeWidth) {
        for (var j = 0; j < mazeDimension; j+=mazeDimension - mazeWidth) {
            var geometry = new THREE.CubeGeometry(mazeWidth,mazeWidth,mazeWidth,1,1,1);
            var mesh_ij = new THREE.Mesh(geometry);
            mesh_ij.position.x = i;
            mesh_ij.position.y = j;
            mesh_ij.position.z = 0.05;
            THREE.GeometryUtils.merge(dummy, mesh_ij);
        }
    }
    for (var j = 0; j < mazeDimension; j+=mazeWidth) {
        for (var i = 0; i < mazeDimension; i+=mazeDimension - mazeWidth) {
            var geometry = new THREE.CubeGeometry(mazeWidth,mazeWidth,mazeWidth,1,1,1);
            var mesh_ij = new THREE.Mesh(geometry);
            mesh_ij.position.x = i;
            mesh_ij.position.y = j;
            mesh_ij.position.z = 0.05;
            THREE.GeometryUtils.merge(dummy, mesh_ij);
        }
    }
    // var material = new THREE.MeshPhongMaterial({map: brickTexture});
    var mesh = new THREE.Mesh(dummy)
    return mesh;
}

function generate_maze_floor() {
  let floor = [];
  for (x = 0; x < mazeDimension; x += 0.05) {
    floor[x * 20] = [];
    for (y = 0; y < mazeDimension; y += 0.05) {
      geo = new THREE.CubeGeometry(0.05, 0.05, 0.005, 1, 1, 1);
      mat = new THREE.MeshPhongMaterial({color: 0x878e88, shading: THREE.FlatShading});
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = x;
      mesh.position.y = y;
      floor[x * 20][y * 20] = mesh;
      scene.add(mesh);
    }
  }
  return floor;
}
