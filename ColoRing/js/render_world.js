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

        // Applies camera rotation.
        camera.rotateOnWorldAxis(Z_AXIS, view.rotation[2]);
        camera.rotateOnWorldAxis(Y_AXIS, view.rotation[1]);
        camera.rotateOnWorldAxis(X_AXIS, view.rotation[0]);

        // camera.rotation.fromArray( view.rotation );
        camera.position.fromArray( view.eye );
        view.camera = camera;

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

    ball1.camera = views[0].camera;
    ball2.camera = views[1].camera;

    // Creates the balls.
    ball1.mesh = createBallMesh(ball1);
    scene.add(ball1.mesh);

    ball2.mesh = createBallMesh(ball2);
    scene.add(ball2.mesh);

    // Creates arena.
    arena.walls = createWallMesh();
    scene.add(arena.walls);

    // Creates arena floor.
    arena.floor = createFloorMesh();
    scene.add(arena.floor);

    const numStars = 400;
    const largeNum = 100;

    for (let i = 0; i < numStars; i++) {

        let starX = generateRandomCoord(largeNum);
        let starY = generateRandomCoord(largeNum);
        if (Math.abs(starX) < arena.width/2 && Math.abs(starY) < arena.height/2) continue;

        let starZ = Math.random() * largeNum + 12;
        let starPos = new THREE.Vector3(starX,starY,starZ);
        let star = createStar('white', 0.1, starPos);
        scene.add(createStarMesh(star));
    }

    // Initialiazes powers array.
    powers = [];
}

function generateRandomCoord(largeNum) {

    let sRand = Math.random();
    let sign = 1;
    if (sRand < 0.5) sign = -1;

    let mag = Math.random() * largeNum;
    return mag * sign;
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
    updateWallColor();

    // Creates power ups/traps at random.
    if (powers.length < maxPowers) {
        createPowers();
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
        updateTileColor(i, Colors.floor);
        arena.tileColors[i] = 0;
    }

    arena.walls = updateWallColor();
    scene.add(arena.walls);
}

function createLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.5);

    const shadowLight = new THREE.DirectionalLight(0xffffff, .05);
    shadowLight.position.set(0, 0, 500);
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
    const geo = new THREE.SphereGeometry(ball.radius, 16, 16);
    const mat = new THREE.LineBasicMaterial({color: ball.color});
    const wireframe = new THREE.WireframeGeometry(geo);

    const line = new THREE.LineSegments(wireframe, mat);
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;
    line.material.linewidth = 1;
    line.position.copy(ball.position);

    return line;
}

function createStarMesh(star) {
    const geo = new THREE.SphereGeometry(star.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({color: star.color, emissive: star.color, specular: star.color});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(star.position);
    return mesh;
}

function createWallMesh() {
    const dummy = new THREE.Geometry();
    const geo = new THREE.BoxGeometry(arena.wallSize, arena.wallSize,
        arena.wallHeight);

    const color = parseInt(arena.colors[Math.floor(numArenaColors / 2)]);
    const mat = new THREE.LineBasicMaterial({color: color});

    for (let x = -arena.width; x < arena.width + 1; x += arena.wallSize) {
        const mesh1 = new THREE.Mesh(geo);
        mesh1.position.set(x, -arena.height, arena.wallHeight / 2);
        dummy.mergeMesh(mesh1);

        const mesh2 = new THREE.Mesh(geo);
        mesh2.position.set(x, arena.height, arena.wallHeight / 2);
        dummy.mergeMesh(mesh2);
    }

    for (let y = -arena.height; y < arena.height + 1; y += arena.wallSize) {
        const mesh1 = new THREE.Mesh(geo);
        mesh1.position.set(-arena.width, y, arena.wallHeight / 2);
        dummy.mergeMesh(mesh1);

        const mesh2 = new THREE.Mesh(geo);
        mesh2.position.set(arena.width, y, arena.wallHeight / 2);
        dummy.mergeMesh(mesh2);
    }

    const wireframe = new THREE.WireframeGeometry(dummy);

    const line = new THREE.LineSegments(wireframe, mat);
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;
    line.material.linewidth = 1;

    return line;
}

function createFloorMesh() {
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

function createPowers() {
    // Determines if power will be made.
    const create = Math.random();
    if (create < powerProb) return;

    // Randomly determine position of power.
    const x = (Math.random() * 2 - 1) * (arena.width - arena.wallSize);
    const y = (Math.random() * 2 - 1) * (arena.height - arena.wallSize);
    const position = new THREE.Vector3(x, y, ballRadius);

    // Randomly determines type of power.
    const type = Math.random();

    if (type < 0.75) {
        const bomb = createPower('bomb', position);
        bomb.mesh = createBombMesh(bomb);
        scene.add(bomb.mesh);
        powers.push(bomb);
    }
    else {
        const freeze = createPower('freeze', position);
        freeze.mesh = createFreezeMesh(freeze);
        scene.add(freeze.mesh);
        powers.push(freeze);
    }
}

function createBombMesh(bomb) {
    const geo = new THREE.SphereGeometry(bomb.size, 6, 6);
    const mat = new THREE.LineBasicMaterial({color: Colors.bomb});
    const wireframe = new THREE.WireframeGeometry(geo);

    const line = new THREE.LineSegments(wireframe, mat);
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;
    line.material.linewidth = 1;
    line.position.copy(bomb.position);

    return line;
}

function createFreezeMesh(freeze) {
    const side = 2 * freeze.size;
    const geo = new THREE.BoxGeometry(side, side, side);
    const mat = new THREE.LineBasicMaterial({color: Colors.freeze});
    const wireframe = new THREE.WireframeGeometry(geo);

    const line = new THREE.LineSegments(wireframe, mat);
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;
    line.material.linewidth = 1;
    line.position.copy(freeze.position);

    return line;
}

function updateWallColor() {
    let index;
    if (ball1.score + ball2.score == 0) {
        index = 50;
    }
    else {
        index = Math.round(ball2.score * 100 / (ball1.score + ball2.score));
    }
    const color = parseInt(arena.colors[index]);
    arena.walls.material.color.set(color);
}

function updatePositions(ball) {
    // Updates ball position.
    ball.prevPosition.copy(ball.position);
    ball.position.copy(ball.physical.position);
    ball.mesh.position.copy(ball.physical.position);

    // Rolls ball (updates rotation).

    const distance = ball.position.distanceTo(ball.prevPosition);
    const angle = distance / ball.radius;
    ball.mesh.rotateOnAxis(Y_AXIS, -angle);

    /*
    const distance = ball.position.clone().sub(ball.prevPosition);
    const anglex = distance.x / ball.radius;
    const angley = distance.y / ball.radius;
    ball.mesh.rotateOnWorldAxis(X_AXIS, -angley);
    ball.mesh.rotateOnWorldAxis(Y_AXIS, -anglex);
    */

    // Updates camera position.
    const pos = ball.position.clone()
    pos.sub(ball.direction.clone().normalize().multiplyScalar(cameraX * ballRadius));
    pos.z += cameraZ * ballRadius;
    ball.camera.position.copy(pos);
}

function updateRotations(ball) {
    const deg = 2;
    const angle = deg * TO_RADIANS;
    const rotation =  new THREE.Euler(0, 0, 0);

    if (ball.keys[2] == 1) {
        rotation.z += angle;
        ball.mesh.rotateOnWorldAxis(Z_AXIS, angle);
        ball.camera.rotateOnWorldAxis(Z_AXIS, angle);
    }

    if (ball.keys[3] == 1) {
        rotation.z -= angle;
        ball.mesh.rotateOnWorldAxis(Z_AXIS, -angle);
        ball.camera.rotateOnWorldAxis(Z_AXIS, -angle);
    }

    ball.direction.applyEuler(rotation);
}

function updateTile(ball) {
    const i = index(ball.position.x, ball.position.y);

    // deal with scores
    let oldColor = arena.tileColors[i];
    if (oldColor == 1) ball1.score -= 1;
    else if (oldColor == 2) ball2.score -= 1;
    ball.score += 1;

    updateTileColor(i, ball.color);
    arena.tileColors[i] = ball.num;
}

function updatePowers() {
    for (let i = 0; i < powers.length; i++) {
        let activated;

        // Changes direction of motion of power.
        if ((powers[i].position.z < (1 / 3) * ballRadius) ||
            (powers[i].position.z > (5 / 3) * ballRadius)) {
            powers[i].direction.multiplyScalar(-1);
        }

        // Changes position of power.
        powers[i].position.add(powers[i].direction);
        powers[i].mesh.position.add(powers[i].direction);

        if (intersectPower(powers[i], ball1)) {
            // Activates power for ball1.
            if (powers[i].type == 'bomb') activateBomb(powers[i], ball1);
            else if (powers[i].type == 'freeze') activateFreeze(powers[i], ball2);

            // Removes power from powers array.
            powers.splice(i, 1);
        }
        else if (intersectPower(powers[i], ball2)) {
            // Activates power for ball2.
            if (powers[i].type == 'bomb') activateBomb(powers[i], ball2);
            else if (powers[i].type == 'freeze') activateFreeze(powers[i], ball1);

            // Removes power from powers array.
            powers.splice(i, 1);
        }
    }
}

function intersectPower(power, ball) {
    const powerPos = new THREE.Vector2(power.position.x, power.position.y);
    const ballPos = new THREE.Vector2(ball.position.x, ball.position.y);
    return powerPos.distanceTo(ballPos) < power.size + ball.radius;
}

function activateBomb(bomb, ball) {
    // Removes bomb mesh from scene.
    scene.remove(bomb.mesh);

    // Makes surrounding tiles ball color.
    const i = index(bomb.position.x, bomb.position.y);
    const width = (arena.height / arena.tileSize) * 2 + 1;

    for (let x = -2 * width; x < 2 * width + 1; x += width) {
        for (let y = -2; y < 3; y++) {
            updateTileColor(i + x + y, ball.color);
        }
    }
}

function activateFreeze(freeze, ball) {
    // Removes freeze mesh from scene.
    scene.remove(freeze.mesh);

    // Stops ball from moving.
    ball.canMove = false;

    // Waits until time is up before letting ball move again.
    ball.seconds = 4;
    tick();

    function tick() {
        ball.seconds--;
        if (ball.seconds > 0) {
            setTimeout(tick, 1000);
        } else {
            ball.canMove = true;
        }
    }
}

function updateTileColor(i, color) {
    const height = 2 * (arena.height / arena.tileSize) + 1;
    if (i < height) return;
    if (i > arena.floor.length - height - 1) return;
    if (i % height == 0) return;
    if (i % height == height - 1) return;
    arena.floor[i].material.color.set(color);
}

function index(x, y) {
    const floorx = Math.round((x + arena.width) / arena.tileSize);
    const floory = Math.round((y + arena.height) / arena.tileSize);
    return floory + ((arena.height / arena.tileSize) * 2 + 1) * floorx;
}
