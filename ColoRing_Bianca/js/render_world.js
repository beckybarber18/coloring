function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    createLights();

    // Add the camera.
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, -20, 130);
    camera.rotation.x = 10 * Math.PI / 180;
    scene.add(camera);

    // Add the ball.
    const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 16);

    const ballMat1 = new THREE.MeshPhongMaterial({map: ironTexture});
    ballMesh = new THREE.Mesh(ballGeo, ballMat1);
    ballMesh.position.set(-65, 0, ballRadius);
    scene.add(ballMesh);

    const ballMat2 = new THREE.MeshPhongMaterial({map: ironTexture2});
    ballMesh2 = new THREE.Mesh(ballGeo, ballMat2);
    ballMesh2.position.set(65, 0, ballRadius);
    scene.add(ballMesh2);

    // Add the arena.
    arenaMesh = generateArena();
    scene.add(arenaMesh);

    // Add the arena floor.
    arenaFloorMesh = generateArenaFloor();
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

function createLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);

    const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 4096;
    shadowLight.shadow.mapSize.height = 4096;

    var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

    scene.add(hemisphereLight);
    scene.add(shadowLight);
}

function generateArena() {
    const dummy = new THREE.Geometry();

    const geo = new THREE.BoxGeometry(arenaSize, arenaSize, arenaSize);
    const mat = new THREE.MeshPhongMaterial({color: Colors.arena});

    for (let x = -arenaWidth; x < arenaWidth + 1; x += arenaSize) {
        const mesh1 = new THREE.Mesh(geo);
        mesh1.position.set(x, -arenaHeight, arenaSize / 2);
        dummy.mergeMesh(mesh1);

        const mesh2 = new THREE.Mesh(geo);
        mesh2.position.set(x, arenaHeight, arenaSize / 2);
        dummy.mergeMesh(mesh2);
    }

    for (let y = -arenaHeight; y < arenaHeight + 1; y += arenaSize) {
        const mesh1 = new THREE.Mesh(geo);
        mesh1.position.set(-arenaWidth, y, arenaSize / 2);
        dummy.mergeMesh(mesh1);


        const mesh2 = new THREE.Mesh(geo);
        mesh2.position.set(arenaWidth, y, arenaSize / 2);
        dummy.mergeMesh(mesh2);
    }

    return new THREE.Mesh(dummy, mat);
}

function generateArenaFloor() {
    let floor = [];

    const geo = new THREE.BoxGeometry(tileSize, tileSize, tileSize / 2);
    const mat = new THREE.MeshPhongMaterial({color: Colors.floor, flatShading: true});
    const mat2 = new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true});

    for (let x = -arenaWidth; x < arenaWidth + 1; x += tileSize) {
        for (let y = -arenaHeight; y < arenaHeight + 1; y += tileSize) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, -tileSize / 4);
            floor.push(mesh);
            scene.add(mesh);
        }
     }
     return floor;
}
