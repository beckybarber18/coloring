function createRenderWorld() {

    // Create the scene object
    scene = new THREE.Scene();

    // Add the camera
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.rotation.x = 10 * Math.PI / 180;
    camera.position.x = arenaDimension / 2;
    camera.position.y = arenaDimension / 2;
    camera.position.z = 100;
    scene.add(camera);

    // Add the light
    light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add(light);

    // Add the balls
    const sphereGeo = new THREE.SphereGeometry(ballRadius, 32, 32);

    // Ball 1
    const sphereMat = new THREE.MeshPhongMaterial({map:ironTexture});
    ballMesh = new THREE.Mesh(sphereGeo, sphereMat);
    // ballMesh.position.set(1.5, 1, ballRadius);
    scene.add(ballMesh);

    // Ball 2
    const sphereMat2 = new THREE.MeshPhongMaterial({map:ironTexture2});
    ballMesh2 = new THREE.Mesh(sphereGeo, sphereMat2);
    // ballMesh2.position.set(0.5, 1, ballRadius);
    scene.add(ballMesh2);

    // const box = new THREE.SphereGeometry(ballRadius, 32, 32);
    const box = new THREE.BoxGeometry(arenaWidth, arenaWidth, arenaWidth);
    const boxMat = new THREE.MeshBasicMaterial({color: 0x76bed0});
    const blah = new THREE.Mesh(box, boxMat);
    blah.position.set(50, 50, 0);
    scene.add(blah);


    /*



    // Add the arena.
    // arenaMesh = generate_arena();
    // scene.add(arenaMesh);

    // Add floor of arena.
    // arenaFloorMeshes = generate_arena_floor();

    // Add the ground.

    g = new THREE.PlaneGeometry(arenaDimension*10, arenaDimension*10, arenaDimension, arenaDimension);
    m = new THREE.MeshPhongMaterial();
    planeMesh = new THREE.Mesh(g, m);
    planeMesh.position.set((arenaDimension-1)/2, (arenaDimension-1)/2, 0);
    planeMesh.rotation.set(Math.PI/2, 0, 0);
    scene.add(planeMesh);
    */

}

function updateRenderWorld() {
    // Update floor color
    let x1 = Math.floor(ballMesh.position.x / 0.05);
    let y1 = Math.floor(ballMesh.position.y / 0.05);

    let x2 = Math.floor(ballMesh2.position.x / 0.05);
    let y2 = Math.floor(ballMesh2.position.y / 0.05);

    // arenaFloorMeshes[x1 * (arenaDimension / 0.05) + y1].material.color = 0xf7cb15;

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
    /*
    var tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(0,1,0), stepX/ballRadius);
    tempMat.multiply(ballMesh.matrix);
    ballMesh.matrix = tempMat;

    var tempMat2 = new THREE.Matrix4();
    tempMat2.makeRotationAxis(new THREE.Vector3(0,1,0), stepX2/ballRadius);
    tempMat2.multiply(ballMesh2.matrix);
    ballMesh2.matrix = tempMat2;

    tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(1,0,0), -stepY/ballRadius);
    tempMat.multiply(ballMesh.matrix);
    ballMesh.matrix = tempMat;
    ballMesh.rotation.getRotationFromMatrix(ballMesh.matrix);

    tempMat2 = new THREE.Matrix4();
    tempMat2.makeRotationAxis(new THREE.Vector3(1,0,0), -stepY2/ballRadius);
    tempMat2.multiply(ballMesh2.matrix);
    ballMesh2.matrix = tempMat2;
    ballMesh2.rotation.getRotationFromMatrix(ballMesh2.matrix);
*/


    // // Update camera and light positions.
    // camera.position.x += (ballMesh.position.x - camera.position.x) * 0.1;
    // camera.position.y += (ballMesh.position.y - camera.position.y) * 0.1;
    // camera.position.z += (5 - camera.position.z) * 0.1;
    // light.position.x = camera.position.x;
    // light.position.y = camera.position.y;
    // light.position.z = camera.position.z - 3.7;
}

function generate_arena() {
  /*
    let dummy = new THREE.Geometry();

    const geometry = new THREE.BoxGeometry(arenaWidth, arenaWidth, arenaWidth);
    const mat = new THREE.MeshPhongMaterial({map: ironTexture});

    for (let x = -arenaDimension / 2; x < arenaDimension / 2; x += arenaWidth) {

      const mesh_ij = new THREE.Mesh(geometry, mat);
      mesh_ij.position.x = x;
      mesh_ij.position.y = arenaDimension / 2;
      dummy.mergeMesh(mesh_ij);
    }



    for (var i = 0; i < arenaDimension; i+=arenaWidth) {
        for (var j = 0; j < arenaDimension; j+=arenaDimension - arenaWidth) {
            var geometry = new THREE.BoxGeometry(arenaWidth,arenaWidth,arenaWidth);
            var mesh_ij = new THREE.Mesh(geometry);
            mesh_ij.position.x = i;
            mesh_ij.position.y = j;
            mesh_ij.position.z = 0.05;
            dummy.mergeMesh(mesh_ij);
        }
    }
    for (var j = 0; j < arenaDimension; j+=arenaWidth) {
        for (var i = 0; i < arenaDimension; i+=arenaDimension - arenaWidth) {
            var geometry = new THREE.BoxGeometry(arenaWidth,arenaWidth,arenaWidth);
            var mesh_ij = new THREE.Mesh(geometry);
            mesh_ij.position.x = i;
            mesh_ij.position.y = j;
            mesh_ij.position.z = 0.05;
            dummy.mergeMesh(mesh_ij);
        }
    }
    // var material = new THREE.MeshPhongMaterial({map: brickTexture});
    var mesh = new THREE.Mesh(dummy)
    return mesh;
    */
}

function generate_arena_floor() {
  /*
  let floor = [];
  for (x = 0; x < arenaDimension; x += 0.05) {
    for (y = 0; y < arenaDimension; y += 0.05) {
      geo = new THREE.BoxGeometry(0.05, 0.05, 0.005);
      mat = new THREE.MeshPhongMaterial({color: 0x878e88, flatShading: true});
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = x;
      mesh.position.y = y;
      floor.push(mesh);
      scene.add(mesh);
    }
  }
  return floor;
  */
}
