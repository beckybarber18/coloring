function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xfff8f3 );
	scene.fog = new THREE.Fog( 0xfff8f3, 0, 750 );

    // Creates lights.
    createLights();

    // Creates cameras.
    for ( var ii = 0; ii < views.length; ++ ii ) {
        var view = views[ ii ];
        var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.rotation.fromArray( view.rotation );
        camera.position.fromArray( view.eye );
        view.camera = camera;
    }

    // Creats the balls.
    const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 16);

    const ballMat1 = new THREE.MeshPhongMaterial({color: Colors.ball1});
    ballMesh = new THREE.Mesh(ballGeo, ballMat1);
    ballMesh.position.set(arenaWidth - 2 * arenaSize, arenaHeight - 2 * arenaSize, ballRadius);
    scene.add(ballMesh);

    const ballMat2 = new THREE.MeshPhongMaterial({color: Colors.ball2});
    ballMesh2 = new THREE.Mesh(ballGeo, ballMat2);
    ballMesh2.position.set(-arenaWidth + 2 * arenaSize, -arenaHeight + 2 * arenaSize, ballRadius);
    scene.add(ballMesh2);

    // Creates arena.
    arenaMesh = generateArena();
    scene.add(arenaMesh);

    // Creates arena floor.
    arenaFloorMesh = generateArenaFloor();
}

function updateRenderWorld() {
    // Updates ball positions.
    ballMesh.position.copy(ball1.position);
    ballMesh.quaternion.copy(ball1.quaternion);
    views[0].camera.position.copy(ball1.position);


    ballMesh2.position.copy(ball2.position);
    ballMesh2.quaternion.copy(ball2.quaternion);
    views[1].camera.position.copy(ball2.position);

    // Updates tile colors.
    updateTile(ballMesh.position, Colors.ball1);
    updateTile(ballMesh2.position, Colors.ball2);

    /*

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

    for (let x = -arenaWidth; x < arenaWidth + 1; x += tileSize) {
        for (let y = -arenaHeight; y < arenaHeight + 1; y += tileSize) {
            const mat = new THREE.MeshPhongMaterial({color: Colors.floor, flatShading: true});
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, -tileSize / 4);
            floor.push(mesh);
            scene.add(mesh);
        }
     }
     return floor;
}

function updateTile(position, color) {
    const x = Math.floor((position.x + arenaWidth) / tileSize);
    const y = Math.floor((position.y + arenaHeight) / tileSize);
    const index = y + ((arenaHeight / tileSize) * 2 + 1) * x;
    arenaFloorMesh[index].material.color.set(color);
}
