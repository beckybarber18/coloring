let camera			= undefined,
    scene          	= undefined,
    renderer		= undefined,
    light			= undefined,
    mouseX         	= undefined,
    mouseY         	= undefined,
    arena           = undefined,
    arenaMesh       = undefined,
    arenaFloorMesh  = undefined,
    arenaHeight		= 50,
    arenaWidth		= 75,
    arenaSize      	= 5,
    tileSize		= 1,
    planeMesh      	= undefined,
    ballMesh       	= undefined,
    ballMesh2		= undefined,
    ballRadius     	= 2,
    keyAxis        	= [0, 0],
    keyAxis2       	= [0, 0],
    ironTexture    	= new THREE.TextureLoader().load('/images/ball.png'),
    ironTexture2   	= new THREE.TextureLoader().load('/images/ball2.png'),
    planeTexture   	= new THREE.TextureLoader().load('/images/concrete.png'),
    brickTexture   	= new THREE.TextureLoader().load('/images/brick.png'),
    gameState      	= undefined,

    // Box2D world variables
    wWorld         = undefined,
    wBall          = undefined;

init();
animate();

function init() {
    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Bind keyboard and resize events.
    KeyboardJS.bind.axis('left', 'right', 'down', 'up', onMoveKey);
    KeyboardJS.bind.axis('a','d','s','w', onMoveKey2);

    // Set the initial game state.
    gameState = 'initialize';

}

function animate() {
    
    requestAnimationFrame(animate);

    switch(gameState) {

        case 'initialize':
            // arena = generateSquareMaze(arenaDimension);
            // arena[arenaDimension-1][arenaDimension-2] = false;
            // createPhysicsWorld();
            createRenderWorld();
            gameState = 'fade in';
            break;

        case 'fade in':
            light.intensity += 0.1 * (1.0 - light.intensity);
            renderer.render(scene, camera);
            if (Math.abs(light.intensity - 1.0) < 0.05) {
                light.intensity = 1.0;
                gameState = 'play'
            }
            break;

        case 'play':
            // updatePhysicsWorld();
            updateRenderWorld();
            renderer.render(scene, camera);
            break;

        case 'fade out':
            // updatePhysicsWorld();
            updateRenderWorld();
            light.intensity += 0.1 * (0.0 - light.intensity);
            renderer.render(scene, camera);
            if (Math.abs(light.intensity - 0.0) < 0.1) {
                light.intensity = 0.0;
                renderer.render(scene, camera);
                gameState = 'initialize'
            }
            break;

    }

}

function onMoveKey(axis) {
    keyAxis = axis.slice(0);
}

function onMoveKey2(axis) {
    keyAxis2 = axis.slice(0);
}
