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

    ball1.camera = views[0].camera;
    ball2.camera = views[1].camera;

    // Creates the balls.
    ball1.mesh = createBallMesh(ball1);
    scene.add(ball1.mesh);

    ball2.mesh = createBallMesh(ball2);
    scene.add(ball2.mesh);

    // Creates arena.
    arena.walls = generateArena();
    scene.add(arena.walls);

    // Creates arena floor.
    arena.floor = generateArenaFloor();
}

function updateRenderWorld() {
    // Updates ball positions.
    updatePosition(ball1);
    updatePosition(ball2);

    // Updates camera positions.
    ball1.camera.position.copy(ball1.position);
    ball1.camera.position.sub(ball1.direction.clone().normalize().multiplyScalar(1.5 * ballRadius));
    ball1.camera.position.z = ball1.position.z + 1.5 * ballRadius;

    ball2.camera.position.copy(ball2.position);
    ball2.camera.position.sub(ball2.direction.clone().normalize().multiplyScalar(1.5 * ballRadius));
    ball2.camera.position.z = ball2.position.z + 1.5 * ballRadius;

    // Updates rotation.
    updateRotation(ball1);
    updateRotation(ball2);

    // Updates tile colors.
    updateTile(ball1);
    updateTile(ball2);



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

function createBallMesh(ball) {
    const geo = new THREE.SphereGeometry(ball.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({color: ball.color});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(ball.position);
    return mesh;
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

function updatePosition(ball) {
    ball.position.copy(ball.physical.position);
    ball.mesh.position.copy(ball.position);
    ball.mesh.quaternion.copy(ball.physical.quaternion);
}

function updateRotation(ball) {
    const deg = 2;
    const angle = deg * Math.PI / 180;
    const rotation =  new THREE.Euler(0, 0, 0, 'XYZ');

    if (ball.keyAxis[1] == 1) {
        rotation.set(0, 0, angle, 'XYZ');
        ball.camera.rotation.y += angle;
        // ball.camera.position.x = 1.5 * Math.sqrt(2) * ballRadius * Math.cos(angle);
        // ball.camera.position.z = 1.5 * Math.sqrt(2) * ballRadius * Math.sin(angle);
    }

    if (ball.keyAxis[2] == 1) {
        rotation.set(0, 0, rotation.z - angle, 'XYZ');
        ball.camera.rotation.y += -angle;
        // ball.camera.position.x = 1.5 * Math.sqrt(2) * ballRadius * Math.cos(-angle);
        // ball.camera.position.z = 1.5 * Math.sqrt(2) * ballRadius * Math.sin(-angle);
    }

    ball.direction.applyEuler(rotation);
}

function updateTile(ball) {
    const x = Math.round((ball.position.x + arena.width) / arena.tileSize);
    const y = Math.round((ball.position.y + arena.height) / arena.tileSize);
    const index = y + ((arena.height / arena.tileSize) * 2 + 1) * x;
    arena.floor[index].material.color.set(ball.color);
}
