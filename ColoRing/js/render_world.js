function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();

    // Add the light.
    light = new THREE.AmbientLight(0xff0000);
    scene.add(light);

    // Add the camera.
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.z = 100;
    scene.add(camera);

    // Add the ball.
    const ballGeo = new THREE.CubeGeometry(ballRadius, 32, 32, 1, 1, 1);

    const ballMat1 = new THREE.MeshPhongMaterial({map:ironTexture});
    ballMesh1 = new THREE.Mesh(ballGeo, ballMat1);
    // ballMesh1.position.set(1.5, 1, ballRadius);
    scene.add(ballMesh1);

    const ballMat2 = new THREE.MeshPhongMaterial({map:ironTexture2});
    ballMesh2 = new THREE.Mesh(ballGeo, ballMat2);
    // ballMesh2.position.set(1.5, 1, ballRadius);
    scene.add(ballMesh2);

    // Add the arena.
    arenaMesh = generateArena();
    scene.add(arenaMesh);

    // Add arena floor.
    arenaFloorMeshes = generateArenaFloor();

    /*
    // Add the ground.
    g = new THREE.PlaneGeometry(arenaDimension*10, arenaDimension*10, arenaDimension, arenaDimension);
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(arenaDimension*5, arenaDimension*5);
    // m = new THREE.MeshPhongMaterial({map:planeTexture});
    planeMesh = new THREE.Mesh(g);
    planeMesh.position.set((arenaDimension-1)/2, (arenaDimension-1)/2, 0);
    planeMesh.rotation.set(Math.PI/2, 0, 0);
    scene.add(planeMesh);
    */
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


function generateArena() {
    const dummy = new THREE.Geometry();

    const geo = new THREE.CubeGeometry(arenaSize, arenaSize, arenaSize, 1, 1, 1);
    const mat = new THREE.MeshPhongMaterial({color: 0xf7cb15});

    for (let x = -arenaDimension; x < arenaDimension + 1; x += arenaWidth) {
        const mesh1 = new THREE.Mesh(geo, mat);
        mesh1.position.x = x;
        mesh1.position.y = -arenaDimension;
        mesh1.position.z = arenaSize / 2;
        THREE.GeometryUtils.merge(dummy, mesh1);


        const mesh2 = new THREE.Mesh(geo, mat);
        mesh2.position.x = x;
        mesh2.position.y = arenaDimension;
        mesh2.position.z = arenaSize / 2;
        THREE.GeometryUtils.merge(dummy, mesh2);
    }

    for (let y = -arenaDimension; y < arenaDimension + 1; y += arenaWidth) {
        const mesh1 = new THREE.Mesh(geo, mat);
        mesh1.position.x = -arenaDimension;
        mesh1.position.y = y;
        mesh1.position.z = arenaSize / 2;
        THREE.GeometryUtils.merge(dummy, mesh1);


        const mesh2 = new THREE.Mesh(geo, mat);
        mesh2.position.x = arenaDimension;
        mesh2.position.y = y;
        mesh2.position.z = arenaSize / 2;
        THREE.GeometryUtils.merge(dummy, mesh2);
    }

    return new THREE.Mesh(dummy);
}

function generateArenaFloor() {
  let floor = [];
  for (x = -arenaDimension; x < arenaDimension + 1; x += arenaSize) {
    floor[x * 20] = [];
    for (y = 0; y < arenaDimension; y += 0.05) {
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
