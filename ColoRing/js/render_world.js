function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();

    // Add the light.
    light= new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light.position.set(1, 1, 1.3);
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
    // camera = new THREE.OrthographicCamera(-10*aspect, 10*aspect, -10, 10, 1, 1000);
    // camera.position.set(100, 0, 0);
    scene.add(camera);

    // Add the maze.
    mazeMesh = generate_maze_mesh(maze);
    scene.add(mazeMesh);

    // Add floor of maze.
    arenaFloorMeshes = generate_maze_floor();

    // Add the ground.
    g = new THREE.PlaneGeometry(mazeDimension*10, mazeDimension*10, mazeDimension, mazeDimension);
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(mazeDimension*5, mazeDimension*5);
    m = new THREE.MeshPhongMaterial({map:planeTexture});
    planeMesh = new THREE.Mesh(g, m);
    planeMesh.position.set((mazeDimension-1)/2, (mazeDimension-1)/2, 0);
    planeMesh.rotation.set(Math.PI/2, 0, 0);
    scene.add(planeMesh);

}

function updateRenderWorld() {
    // Update floor color
    let x1 = Math.floor(ballMesh.position.x / 0.05);
    let y1 = Math.floor(ballMesh.position.y / 0.05);

    let x2 = Math.floor(ballMesh2.position.x / 0.05);
    let y2 = Math.floor(ballMesh2.position.y / 0.05);

    arenaFloorMeshes[x1 * (mazeDimension / 0.05) + y1].material.color = 0xf7cb15;

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
