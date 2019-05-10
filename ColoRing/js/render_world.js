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
    arena.walls = createArenaMesh();
    scene.add(arena.walls);

    // Creates arena floor.
    arena.floor = createArenaFloorMesh();
    scene.add(arena.floor);

    const numStars = 400;
    const largeNum = 100;

    for (let i = 0; i < numStars; i++) {

        let starX = generateRandomCoord(largeNum);
        let starY = generateRandomCoord(largeNum);
        if (Math.abs(starX) < arena.width/2 && Math.abs(starY) < arena.height/2) continue;

        let starZ = Math.random() * largeNum + 12;
        let starPos = new THREE.Vector3(starX,starY,starZ);
        let star = new createStar('white', .1, starPos);
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
    updateArenaColor();

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
        arena.floor[index].material.color.set(Colors.floor);
        arena.tileColors[index] = 0;
    }

    arena.walls = updateArenaColor();
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
    const geo = new THREE.SphereGeometry(ball.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({color: ball.color});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(ball.position);
    return mesh;
}

function createStarMesh(star) {
    const geo = new THREE.SphereGeometry(star.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({color: star.color, emissive: star.color, specular: star.color});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(star.position);
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
    line.material.linewidth = 1;

    //console.log(line);

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

function createPowers() {
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
        const bomb = createPower('bomb', position);
        bomb.mesh = createBombMesh(bomb);
        scene.add(bomb.mesh);
        powers.push(bomb);
    }
    else {
        const freeze = createPower('freeze', position);
        console.log(freeze.size);
        freeze.mesh = createFreezeMesh(freeze);
        scene.add(freeze.mesh);
        powers.push(freeze);
    }
}

function createBombMesh(bomb) {
    const geo = new THREE.SphereGeometry(bomb.size, 32, 32);
    const mat = new THREE.MeshPhongMaterial({color: Colors.bomb});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(bomb.position);
    return mesh;
}

function createFreezeMesh(freeze) {
    const side = 2 * freeze.size;
    const geo = new THREE.BoxGeometry(side, side, side);
    const mat = new THREE.MeshPhongMaterial({color: Colors.freeze});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(freeze.position);
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
    pos.sub(ball.direction.clone().normalize().multiplyScalar(cameraX * ballRadius));
    pos.z += cameraZ * ballRadius;
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
    const i = index(ball.position.x, ball.position.y);

    // deal with scores
    let oldColor = arena.tileColors[i];
    if (oldColor == 1) ball1.score -= 1;
    else if (oldColor == 2) ball2.score -= 1;
    ball.score += 1;

    arena.floor[i].material.color.set(ball.color);
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

            // Removes power.
            powers.splice(i, 1);
        }
        else if (intersectPower(powers[i], ball2)) {
            // Activates power for ball2.
            if (powers[i].type == 'bomb') activateBomb(powers[i], ball2);
            else if (powers[i].type == 'freeze') activateFreeze(powers[i], ball1);

            // Removes power.
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
    scene.remove(bomb.mesh);

    const i = index(bomb.position.x, bomb.position.y);
    const width = (arena.height / arena.tileSize) * 2 + 1;

    arena.floor[i - width - 1].material.color.set(ball.color);
    arena.floor[i - width].material.color.set(ball.color);
    arena.floor[i - width + 1].material.color.set(ball.color);
    arena.floor[i - 1].material.color.set(ball.color);
    arena.floor[i].material.color.set(ball.color);
    arena.floor[i + 1].material.color.set(ball.color);
    arena.floor[i + width - 1].material.color.set(ball.color);
    arena.floor[i + width].material.color.set(ball.color);
    arena.floor[i + width + 1].material.color.set(ball.color);
}

function activateFreeze(bomb, ball) {
    scene.remove(bomb.mesh);

    ball.canMove = false;
}

function index(x, y) {
    const floorx = Math.round((x + arena.width) / arena.tileSize);
    const floory = Math.round((y + arena.height) / arena.tileSize);
    return floory + ((arena.height / arena.tileSize) * 2 + 1) * floorx;
}
