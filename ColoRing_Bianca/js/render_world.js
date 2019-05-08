function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();

    // Add the light.
    light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add(light);

    // Add the camera.
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.z = 140;
    scene.add(camera);

    // Add the ball.
    const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 16);

    const ballMat1 = new THREE.MeshPhongMaterial({map:ironTexture});
    ballMesh = new THREE.Mesh(ballGeo, ballMat1);
    ballMesh.position.set(-65, 0, ballRadius);
    scene.add(ballMesh);

    const ballMat2 = new THREE.MeshPhongMaterial({map:ironTexture2});
    ballMesh2 = new THREE.Mesh(ballGeo, ballMat2);
    ballMesh2.position.set(65, 0, ballRadius);
    scene.add(ballMesh2);

    // Add the arena.
    arenaMesh = generateArena();
    scene.add(arenaMesh);

}

function updateRenderWorld() {
    /*
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
    */
}

function generateArena() {
    const dummy = new THREE.Geometry();

    const geo = new THREE.BoxGeometry(arenaSize, arenaSize, arenaSize);
    const mat = new THREE.MeshPhongMaterial({color: 0xf7cb15});

    for (let x = -arenaWidth; x < arenaWidth + 1; x += arenaSize) {
        const mesh1 = new THREE.Mesh(geo, mat);
        mesh1.position.x = x;
        mesh1.position.y = -arenaHeight;
        mesh1.position.z = arenaSize / 2;
        dummy.mergeMesh(mesh1);


        const mesh2 = new THREE.Mesh(geo, mat);
        mesh2.position.x = x;
        mesh2.position.y = arenaHeight;
        mesh2.position.z = arenaSize / 2;
        dummy.mergeMesh(mesh2);
    }

    for (let y = -arenaHeight; y < arenaHeight + 1; y += arenaSize) {
        const mesh1 = new THREE.Mesh(geo, mat);
        mesh1.position.x = -arenaWidth;
        mesh1.position.y = y;
        mesh1.position.z = arenaSize / 2;
        dummy.mergeMesh(mesh1);


        const mesh2 = new THREE.Mesh(geo, mat);
        mesh2.position.x = arenaWidth;
        mesh2.position.y = y;
        mesh2.position.z = arenaSize / 2;
        dummy.mergeMesh(mesh2);
    }

    /*

    for (let i = -arenaDimension; i < arenaDimension; i += arenaWidth) {
        for (let j = -arenaDimension; j < arenaDimension; j += arenaDimension - arenaWidth) {
            const mesh_ij = new THREE.Mesh(geometry);
            mesh_ij.position.x = i;
            mesh_ij.position.y = j;
            mesh_ij.position.z = 0.05;
            dummy.mergeMesh(mesh_ij);
        }
    }
    for (let j = -arenaDimension; j < arenaDimension; j+=arenaWidth) {
        for (let i = -arenaDimension; i < arenaDimension; i+=arenaDimension - arenaWidth) {
            const mesh_ij = new THREE.Mesh(geometry);
            mesh_ij.position.x = i;
            mesh_ij.position.y = j;
            mesh_ij.position.z = arenaWidth / 2;
            dummy.mergeMesh(mesh_ij);
        }
    }

    // var material = new THREE.MeshPhongMaterial({map: brickTexture});
    */
    return new THREE.Mesh(dummy);
}
