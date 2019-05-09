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
    const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);

    const ballMat1 = new THREE.MeshPhongMaterial({color: ball1.color});
    ball1.mesh = new THREE.Mesh(ballGeo, ballMat1);
    ball1.mesh.position.copy(ball1.position);
    scene.add(ball1.mesh);

    const ballMat2 = new THREE.MeshPhongMaterial({color: ball2.color});
    ball2.mesh = new THREE.Mesh(ballGeo, ballMat2);
    ball2.mesh.position.copy(ball2.position);
    scene.add(ball2.mesh);

    // Creates arena.
    arena.walls = generateArena();
    scene.add(arena.walls);

    // Creates arena floor.
    arena.floor = generateArenaFloor();
}

function updateRenderWorld() {
    // Updates ball positions.
    ball1.position.copy(ball1.physical.position);
    ball1.mesh.position.copy(ball1.position);
    ball1.mesh.quaternion.copy(ball1.physical.quaternion);

    ball2.position.copy(ball2.physical.position);
    ball2.mesh.position.copy(ball2.position);
    ball2.mesh.quaternion.copy(ball2.physical.quaternion);

    // Updates camera positions.
    views[0].camera.position.set(ball1.position.x - 1.5 * ballRadius, ball1.position.y,
        ball1.position.z + 1.5 * ballRadius);
    views[1].camera.position.set(ball2.position.x + 1.5 * ballRadius, ball2.position.y,
        ball2.position.z + 1.5 * ballRadius);

    // Updates rotation.
    updateRotation(ball1, views[0]);
    updateRotation(ball2, views[1]);

    // Updates tile colors.
    updateTile(ball1.position, ball1.color);
    updateTile(ball2.position, ball2.color);



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

    const geo = new THREE.BoxGeometry(arena.wallSize, arena.wallSize, arena.wallSize);
    const mat = new THREE.MeshPhongMaterial({color: Colors.arena});

    for (let x = -arena.width; x < arena.width + 1; x += arena.wallSize) {
        const mesh1 = new THREE.Mesh(geo);
        mesh1.position.set(x, -arena.height, arena.wallSize / 2);
        dummy.mergeMesh(mesh1);

        const mesh2 = new THREE.Mesh(geo);
        mesh2.position.set(x, arena.height, arena.wallSize / 2);
        dummy.mergeMesh(mesh2);
    }

    for (let y = -arena.height; y < arena.height + 1; y += arena.wallSize) {
        const mesh1 = new THREE.Mesh(geo);
        mesh1.position.set(-arena.width, y, arena.wallSize / 2);
        dummy.mergeMesh(mesh1);


        const mesh2 = new THREE.Mesh(geo);
        mesh2.position.set(arena.width, y, arena.wallSize / 2);
        dummy.mergeMesh(mesh2);
    }

    return new THREE.Mesh(dummy, mat);
}

function generateArenaFloor() {
    let floor = [];

    const geo = new THREE.BoxGeometry(arena.tileSize, arena.tileSize, arena.tileSize / 2);

    for (let x = -arena.width; x < arena.width + 1; x += arena.tileSize) {
        for (let y = -arena.height; y < arena.height + 1; y += arena.tileSize) {
            const mat = new THREE.MeshPhongMaterial({color: Colors.floor, flatShading: true});
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, -arena.tileSize / 4);
            floor.push(mesh);
            scene.add(mesh);
        }
     }
     return floor;
}

function updateRotation(ball, camera) {

    const rotation =  new THREE.Euler(0, 0, 0, 'XYZ');

    if (ball.keyAxis[1] == 1) {
        rotation.set(0, 0, 10 * Math.PI / 180, 'XYZ');
        camera.rotation.z += 10 * Math.PI / 180;
    }

    if (ball.keyAxis[2] == 1) {
        rotation.set(0, 0, rotation.z - 10 * Math.PI / 180, 'XYZ');
        camera.rotation.z += -10 * Math.PI / 180;
    }

    ball.direction.applyEuler(rotation);
}

function updateTile(position, color) {
    const x = Math.floor((position.x + arena.width) / arena.tileSize);
    const y = Math.floor((position.y + arena.height) / arena.tileSize);
    const index = y + ((arena.height / arena.tileSize) * 2 + 1) * x;
    arena.floor[index].material.color.set(color);
}
