function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();
    scene.background = new THREE.Color( Colors.background );
	scene.fog = new THREE.Fog( Colors.background, 0, 750 );

    // Creates lights.
    createLights();

    // Creates cameras.
    for ( var ii = 0; ii < views.length; ++ ii ) {
        var view = views[ ii ];
        var camera = new THREE.PerspectiveCamera( view.fov,
            window.innerWidth / window.innerHeight, 1, 10000 );
        camera.rotation.fromArray( view.rotation );
        camera.position.fromArray( view.eye );
        view.camera = camera;

        // console.log(camera);

        var renderScene = new THREE.RenderPass( scene, camera );

        let vec = new THREE.Vector2( window.innerWidth, window.innerHeight )
        var bloomPass = new THREE.UnrealBloomPass(vec, 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        
        composer = new THREE.EffectComposer( renderer );
        composer.setSize( window.innerWidth, window.innerHeight );
        composer.addPass( renderScene );
        composer.addPass( bloomPass );

        composers.push(composer);

    }

    //console.log(composers);

    ball1.camera = views[0].camera;
    ball2.camera = views[1].camera;

    // Creates the balls.
    ball1.mesh = createBallMesh(ball1);
    scene.add(ball1.mesh);

    ball2.mesh = createBallMesh(ball2);
    scene.add(ball2.mesh);

    // Creates arena.
    arena.walls = createArenaMesh();
    scene.add(arena.walls);

    // Creates arena floor.
    arena.floor = createArenaFloorMesh();

    // Initialiazes powers array.
    powers = [];
}

function updateRenderWorld() {

    // Updates rotation.
    updateRotations(ball1);
    updateRotations(ball2);

    // Updates ball positions.
    updatePositions(ball1);
    updatePositions(ball2);

    // Updates tile colors.
    updateTile(ball1);
    updateTile(ball2);

    // Updates the color of the arena walls.
    updateArenaColor();

    // Creates power ups/traps at random.
    if (powers.length < maxPowers) {
        createPower();
    }

    // Updates power ups/traps.
    updatePowers();
}

function resetRenderWorld() {
    ball1.position = initialPos1.clone();
    ball1.physical.position = initialPos1.clone();
    ball1.direction = initialDir1.clone();

    ball2.position = initialPos2.clone().multiplyScalar(-1);
    ball2.physical.position = initialPos2.clone();
    ball2.direction = initialDir2.clone();

    for (let i = 0; i < arena.floor.length; i++) {
        arena.floor[index].material.color.set(Colors.floor);
        arena.tileColors[index] = 0;
    }

    arena.walls = updateArenaColor();
    scene.add(arena.walls);
}

function createLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, 1);

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

function createArenaMesh() {
    const dummy = new THREE.Geometry();
    const geo = new THREE.BoxGeometry(arena.wallSize, arena.wallSize,
        arena.wallSize);

    let currArenaColor = parseInt(arena.colors[Math.floor(numArenaColors/2)]);
    const mat = new THREE.MeshPhongMaterial({color: currArenaColor});

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

    var wireframe = new THREE.WireframeGeometry( dummy );

    var line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;

    return line;
}

function createArenaFloorMesh() {
    let floor = [];
    const geo = new THREE.BoxGeometry(arena.tileSize, arena.tileSize,
        arena.tileSize / 2);

    for (let x = -arena.width; x < arena.width + 1; x += arena.tileSize) {
        for (let y = -arena.height; y < arena.height + 1; y += arena.tileSize) {
            const mat = new THREE.MeshPhongMaterial({color: Colors.floor,
                flatShading: true});
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, -arena.tileSize / 4);
            floor.push(mesh);
            arena.tileColors.push(0);
            scene.add(mesh);
        }
     }
     return floor;
}

function createPower() {
    // Determines if power will be made.
    const create = Math.random();
    if (create < 0.5) return;

    // Randomly determine position of power.
    const x = (Math.random() * 2 - 1) * (arena.width - arena.wallSize);
    const y = (Math.random() * 2 - 1) * (arena.height - arena.wallSize);
    const position = new THREE.Vector3(x, y, ballRadius);

    // Randomly determines type of power.
    const type = Math.random();

    if (type < 0.5) {
        const bomb = createBomb('bomb', ballRadius / 2, position);
        bomb.mesh = createBombMesh(bomb);
        scene.add(bomb.mesh);
        powers.push(bomb);
    }
}

function createBombMesh(bomb) {
    const geo = new THREE.SphereGeometry(bomb.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({color: Colors.bomb});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(bomb.position);
    return mesh;
}

function updateArenaColor() {
    let colorIndex;
    if (ball1.score + ball2.score == 0) {
        colorIndex = parseInt(arena.colors[Math.floor(numArenaColors/2)]);
    }
    else {
        let perc = ball2.score/(ball1.score + ball2.score);
        colorIndex = Math.round(perc * numArenaColors);
    }

    const currArenaColor = parseInt(arena.colors[colorIndex]);
    arena.walls.material.color.set(currArenaColor);

}

function updatePositions(ball) {
    // Updates ball position.
    ball.position.copy(ball.physical.position);
    ball.mesh.position.copy(ball.position);
    ball.mesh.quaternion.copy(ball.physical.quaternion);

    // Updates camera position.
    const pos = ball.position.clone()
    pos.sub(ball.direction.clone().normalize().multiplyScalar(3 * ballRadius));
    pos.z += 5 * ballRadius;
    ball.camera.position.copy(pos);
}

function updateRotations(ball) {
    const deg = 2;
    const angle = deg * Math.PI / 180;
    const rotation = new THREE.Euler(0, 0, 0, 'XYZ');

    if (ball.keys[1] == 1) {
        rotation.set(0, 0, angle, 'XYZ');
        ball.camera.rotation.y += angle;
    }

    if (ball.keys[2] == 1) {
        rotation.set(0, 0, rotation.z - angle, 'XYZ');
        ball.camera.rotation.y += -angle;
    }

    ball.direction.applyEuler(rotation);
}

function updateTile(ball) {
    const x = Math.round((ball.position.x + arena.width) / arena.tileSize);
    const y = Math.round((ball.position.y + arena.height) / arena.tileSize);
    const index = y + ((arena.height / arena.tileSize) * 2 + 1) * x;

    // deal with scores
    let oldColor = arena.tileColors[index];
    if (oldColor == 1) ball1.score -= 1;
    else if (oldColor == 2) ball2.score -= 1;
    ball.score += 1;

    arena.floor[index].material.color.set(ball.color);
    arena.tileColors[index] = ball.num;
}

function updatePowers() {
    for (let i = 0; i < powers.length; i++) {
        let activated;

        // Checks type of power and calls proper update function.
        if (powers[i].type == 'bomb') {
            activated = updateBomb(powers[i]);
        }

        // Removes current power from powers array.
        if (activated) {
            powers.splice(i, 1);
        }
    }
}

function updateBomb(bomb) {

    // Activates bomb if ball runs over it.
    if (intersectBomb(bomb, ball1)) {
        activateBomb(bomb, ball1);
        return true;
    }
    else if (intersectBomb(bomb, ball2)) {
        activateBomb(bomb, ball2);
        return true;
    }

    // Changes direction of motion of bomb.
    if ((bomb.position.z < (1 / 3) * ballRadius) ||
        (bomb.position.z > (5 / 3) * ballRadius)) {
        bomb.direction.multiplyScalar(-1);
    }

    // Changes position of bomb.
    bomb.position.add(bomb.direction);
    bomb.mesh.position.add(bomb.direction);

    return false;
}

function intersectBomb(bomb, ball) {
    const bombPos = new THREE.Vector2(bomb.position.x, bomb.position.y);
    const ballPos = new THREE.Vector2(ball.position.x, ball.position.y);
    return bombPos.distanceTo(ballPos) < bomb.mesh.radius
}

function activateBomb(bomb, ball1) {

}

function updateFreeze() {

}
