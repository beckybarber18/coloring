function createRenderWorld() {
    // Create the game scene.
    gameScene = new THREE.Scene();
    gameScene.background = new THREE.Color( Colors.background );
	gameScene.fog = new THREE.Fog( Colors.background, 0, 750 );

    // Creates lights.
    createLights();

    // Creates cameras.
    gameComposers = [];
    for ( var ii = 0; ii < views.length; ++ ii ) {
        const view = views[ ii ];
        const camera = new THREE.PerspectiveCamera( view.fov,
            window.innerWidth / window.innerHeight, 1, 10000 );

        // Applies camera rotation.
        camera.rotateOnWorldAxis(Z_AXIS, view.rotation[2]);
        camera.rotateOnWorldAxis(Y_AXIS, view.rotation[1]);
        camera.rotateOnWorldAxis(X_AXIS, view.rotation[0]);

        // camera.rotation.fromArray( view.rotation );
        camera.position.fromArray( view.eye );
        view.camera = camera;

        const renderScene = new THREE.RenderPass( gameScene, camera );

        const vec = new THREE.Vector2( window.innerWidth, window.innerHeight )
        const bloomPass = new THREE.UnrealBloomPass(vec, 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        composer = new THREE.EffectComposer( renderer );
        composer.setSize( window.innerWidth, window.innerHeight );
        composer.addPass( renderScene );
        composer.addPass( bloomPass );
        gameComposers.push(composer);

    }

    ball1.camera = views[0].camera;
    ball2.camera = views[1].camera;

    // Creates the balls.
    ball1.mesh = createBallMesh(ball1);
    gameScene.add(ball1.mesh);

    ball2.mesh = createBallMesh(ball2);
    gameScene.add(ball2.mesh);

    // Creates arena.
    arena.walls = createWallMesh();
    gameScene.add(arena.walls);

    // Creates arena floor.
    arena.floor = createFloorMesh();

    // Creates stars.
    arena.stars = createStarMesh();
}

function setUpRenderWorld() {
    // Sets color of ball meshes
    ball1.mesh.material.color.set(ball1.color);
    ball2.mesh.material.color.set(ball2.color);

    // Creates color gradient
    const rainbow = new Rainbow();
    rainbow.setSpectrum(palette.ball1str, palette.ball2str);
    arena.colors = [];
    for (let i = 0; i < 101; i++) {
        arena.colors.push('0x' + rainbow.colourAt(i));
    }

    // Sets color of wall mesh
    const color = parseInt(arena.colors[50])
    arena.walls.material.color.set(color);

    // Set timer
    setTimeout(countdown, 500);
}

function updateRenderWorld() {

    // Updates rotation.
    updateRotations(ball1);
    updateRotations(ball2);

    // Updates ball positions.
    updatePositions(ball1);
    updatePositions(ball2);

    // Updates tile colors.
    const pos1 = index(ball1.position.x, ball1.position.y);
    const pos2 = index(ball2.position.x, ball2.position.y);
    updateTile(pos1, ball1);
    updateTile(pos2, ball2);

    // Updates the color of the arena walls.
    updateWallColor();

    // Creates power ups/traps at random.
    if (arena.powers.length < maxPowers) {
        createPowers();
    }

    // Updates power ups/traps.
    updatePowers();
}

function resetRenderWorld() {
    // Resets balls
    resetBall(ball1, initialPos1, initialDir1);
    resetBall(ball2, initialPos2, initialDir2);

    // Resets camera positions
    ball1.camera.position.fromArray( views[0].eye );
    ball2.camera.position.fromArray( views[1].eye );

    // Resets camera rotations
    const vec1 = new THREE.Vector3(0, initialPos1.y,
        initialPos1.z + cameraZ * ballRadius);
    ball1.camera.lookAt(vec1);
    ball1.camera.rotateOnWorldAxis(X_AXIS, 90 * TO_RADIANS);
    ball1.camera.rotateOnWorldAxis(Y_AXIS, 30 * TO_RADIANS);

    const vec2 = new THREE.Vector3(0, initialPos2.y,
        initialPos2.z + cameraZ * ballRadius);
    ball2.camera.lookAt(vec2);
    ball2.camera.rotateOnWorldAxis(X_AXIS, 90 * TO_RADIANS);
    ball2.camera.rotateOnWorldAxis(Y_AXIS, -30 * TO_RADIANS);

    // Resets floor colors
    for (let i = 0; i < arena.floor.length; i++) {
        updateTileColor(i, Colors.floor);
        arena.tileColors[i] = 0;
    }

    // Removes power ups
    for (let i = 0; i < arena.powers.length; i++) {
        removeMesh(arena.powers[i].mesh);
    }
    arena.powers = [];
}

function resetBall(ball, initialPos, initialDir) {
    // Resets positions
    ball.position.copy(initialPos);
    ball.prevPosition.copy(initialPos);
    ball.direction.copy(initialDir);

    // Resets score
    ball.score = 0;

    // Resets canMove
    ball.canMove = true;

    // Removes ice cube
    if (ball.freeze !== undefined) {
        removeMesh(ball.freeze);
        ball.freeze = undefined;
    }
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

    gameScene.add(hemisphereLight);
    gameScene.add(shadowLight);
}

function createBallMesh(ball) {
    const geo = new THREE.SphereGeometry(ball.radius, 9, 12);
    const mat = new THREE.LineBasicMaterial();
    const wireframe = new THREE.WireframeGeometry(geo);

    const line = new THREE.LineSegments(wireframe, mat);
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;
    line.material.linewidth = 1;
    line.position.copy(ball.position);

    // Disposes geometry
    geo.dispose();

    return line;
}

function createStarMesh() {
    let stars = [];

    for (let i = 0; i < 400; i++) {
        const x = generateRandomCoord(100);
        const y = generateRandomCoord(100);

        if (Math.abs(x) < arena.width / 2 && Math.abs(y) < arena.height/2) continue;

        const z = Math.random() * 100 + 15;
        const position = new THREE.Vector3(x, y, z);

        const geo = new THREE.SphereGeometry(0.1, 32, 32);
        const mat = new THREE.MeshPhongMaterial({color: 'white', emissive: 'white', specular: 'white'});
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);

        gameScene.add(mesh);
        stars.push(mesh);
    }

    return stars;
}

function createWallMesh() {
    const dummy = new THREE.Geometry();
    const geo = new THREE.BoxGeometry(arena.wallSize, arena.wallSize,
        arena.wallHeight);

    const mat = new THREE.LineBasicMaterial();

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

    // Disposes geometries
    geo.dispose();
    dummy.dispose();

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
            gameScene.add(mesh);
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

    if (type < 0.4) {
        const bomb = createPower('bomb', position);
        bomb.mesh = createBombMesh(bomb);
        gameScene.add(bomb.mesh);
        arena.powers.push(bomb);
    }
    else if (type < 0.6) {
        const freeze = createPower('freeze', position);
        freeze.mesh = createFreezeMesh(freeze);
        gameScene.add(freeze.mesh);
        arena.powers.push(freeze);
    }
    else {
        const cross = createPower('cross', position);
        cross.mesh = createCrossMesh(cross);
        gameScene.add(cross.mesh);
        arena.powers.push(cross);
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

    // Disposes geometry
    geo.dispose();
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

    // Disposes geometry
    geo.dispose();
    return line;
}

function createCrossMesh(cross) {
    const side = 2 / 3 * cross.size;
    const dummy = new THREE.Geometry();
    const boxes = [];
    const geo = new THREE.BoxGeometry(side, side, side);
    const mat = new THREE.LineBasicMaterial({color: Colors.cross});

    for (let i = 0; i < 5; i++) {
        boxes.push(new THREE.Mesh(geo));
    }

    boxes[1].position.set(0, 0, side);
    boxes[2].position.set(0, 0, -side);
    boxes[3].position.set(side, 0, 0);
    boxes[4].position.set(-side, 0, 0);

    for (let i = 0; i < 5; i++) {
        dummy.mergeMesh(boxes[i]);
    }

    const wireframe = new THREE.WireframeGeometry(dummy);
    const line = new THREE.LineSegments(wireframe, mat);
    line.material.depthTest = false;
    line.material.opacity = 1;
    line.material.transparent = true;
    line.material.linewidth = 1;
    line.position.copy(cross.position);

    // Disposes geometry
    geo.dispose();
    dummy.dispose();
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
    const velocity = ball.position.clone().sub(ball.prevPosition);
    const distance = velocity.length();
    const angle = distance / ball.radius;
    const rotation = new THREE.Vector3(velocity.y, -velocity.x ,0).normalize();
    ball.mesh.rotateOnWorldAxis(rotation, angle);

    // Updates camera position.
    const pos = ball.position.clone()
    pos.sub(ball.direction.clone().normalize().multiplyScalar(cameraX * ballRadius));
    pos.z += cameraZ * ballRadius;
    ball.camera.position.copy(pos);

    // Updates freeze cube
    if (!ball.canMove) {
        ball.freeze.position.copy(ball.position);
    }
}

function updateRotations(ball) {
    const angle = turning * TO_RADIANS;
    const rotation =  new THREE.Euler(0, 0, 0);

    if (ball.keys[2] == 1) {
        rotation.z += angle;
        ball.camera.rotateOnWorldAxis(Z_AXIS, angle);
    }

    if (ball.keys[3] == 1) {
        rotation.z -= angle;
        ball.camera.rotateOnWorldAxis(Z_AXIS, -angle);
    }

    ball.direction.applyEuler(rotation);
}

function updateTile(i, ball) {
    // Count scores
    const oldColor = arena.tileColors[i];
    if (oldColor == 1) ball1.score--;
    else if (oldColor == 2) ball2.score--;
    ball.score++;

    // Updates color
    updateTileColor(i, ball.color);
    arena.tileColors[i] = ball.num;
}

function updatePowers() {
    for (let i = 0; i < arena.powers.length; i++) {
        let activated;

        // Changes direction of motion of power.
        if ((arena.powers[i].position.z < (1 / 3) * ballRadius) ||
            (arena.powers[i].position.z > (5 / 3) * ballRadius)) {
            arena.powers[i].direction.multiplyScalar(-1);
        }

        // Changes position of power.
        arena.powers[i].position.add(arena.powers[i].direction);
        arena.powers[i].mesh.position.add(arena.powers[i].direction);

        // Changes rotation of power.
        arena.powers[i].mesh.rotation.x += 0.05;
		arena.powers[i].mesh.rotation.y += 0.05;
        arena.powers[i].mesh.rotation.z += 0.05;

        if (intersectPower(arena.powers[i], ball1)) {
            // Activates power for ball1.
            if (arena.powers[i].type == 'bomb') activateBomb(arena.powers[i], ball1);
            else if (arena.powers[i].type == 'freeze') activateFreeze(arena.powers[i], ball2);
            else if (arena.powers[i].type == 'cross') activateCross(arena.powers[i], ball1);

            // Removes power from arena.powers array.
            removeMesh(arena.powers[i].mesh);
            arena.powers.splice(i, 1);
        }
        else if (intersectPower(arena.powers[i], ball2)) {
            // Activates power for ball2.
            if (arena.powers[i].type == 'bomb') activateBomb(arena.powers[i], ball2);
            else if (arena.powers[i].type == 'freeze') activateFreeze(arena.powers[i], ball1);
            else if (arena.powers[i].type == 'cross') activateCross(arena.powers[i], ball2);

            // Removes power mesh from gameScene and power from arena.powers array.
            gameScene.remove(arena.powers[i].mesh);
            arena.powers.splice(i, 1);
        }
    }
}

function intersectPower(power, ball) {
    const powerPos = new THREE.Vector2(power.position.x, power.position.y);
    const ballPos = new THREE.Vector2(ball.position.x, ball.position.y);
    return powerPos.distanceTo(ballPos) < power.size + ball.radius;
}

function activateBomb(bomb, ball) {
    // Makes surrounding tiles ball color.
    const i = index(bomb.position.x, bomb.position.y);
    const width = (arena.height / arena.tileSize) * 2 + 1;

    for (let x = -2 * width; x < 2 * width + 1; x += width) {
        for (let y = -2; y < 3; y++) {
            updateTile(i + x + y, ball);
        }
    }
}

function activateFreeze(freeze, ball) {
    if (!ball.canMove) {
        removeMesh(ball.freeze);
        ball.freeze = undefined;
    }

    // Stops ball from moving.
    ball.canMove = false;

    // Creates ice cube around frozen ball
    const side = 2 * ball.radius;
    const geo = new THREE.BoxGeometry(side, side, side);
    const mat = new THREE.MeshPhongMaterial({ color: Colors.freeze });
    mat.transparent = true;
    mat.opacity = 0.4;
    ball.freeze = new THREE.Mesh(geo, mat);
    ball.freeze.position.copy(ball.position);
    gameScene.add(ball.freeze);

    // Waits until time is up before letting ball move again
    ball.seconds = 3;
    tick();

    function tick() {
        ball.seconds--;
        if (ball.seconds > 0) {
            setTimeout(tick, 1000);
        } else {
            // Allows ball to move and removes ice cube
            ball.canMove = true;
            removeMesh(ball.freeze);
            ball.freeze = undefined;
        }
    }
}

function activateCross(cross, ball) {
    const height = 2 * (arena.height / arena.tileSize) + 1;
    const width = 2 * (arena.width / arena.tileSize) + 1;
    const i = index(cross.position.x, cross.position.y);
    const x = i % height;
    const y = Math.floor(i / height);

    // Vertical line
    for (let j = -x; j < height - x; j++) {
        updateTile(i + j, ball);
    }

    // Horizontal line
    for (let j = -y; j < width - y; j++) {
        updateTile(i + j * height, ball);
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

function generateRandomCoord(largeNum) {
    const sRand = Math.random();
    let sign = 1;
    if (sRand < 0.5) sign = -1;

    const mag = Math.random() * largeNum;
    return mag * sign;
}

function removeMesh(mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
    gameScene.remove(mesh);
}
