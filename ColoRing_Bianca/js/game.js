const Colors = {
    arena: 0xf0b7a4,
    floor: 0xf5e1da,
    ball1: 0xfdd043,
    ball2: 0xe2598b
}

let camera, scene, renderer, views, gameState,
    windowWidth, windowHeight,
    arena, ball1, ball2, world,
    ballRadius     	= 3,
    ironTexture    	= new THREE.TextureLoader().load('/images/ball.png'),
    ironTexture2   	= new THREE.TextureLoader().load('/images/ball2.png'),
    canvasTexture  	= new THREE.TextureLoader().load('/images/canvas.png'),
    brickTexture   	= new THREE.TextureLoader().load('/images/brick.png');

init();
animate();

function init() {
    container = document.getElementById( 'container' );

    // Create objects.

    // Creates arena object.
    arena = createArena(50, 75, 5, 5);

    // Creates ball1 object.
    let ball1pos = new THREE.Vector3(-arena.width + 2 * arena.wallSize,
        -arena.height + 2 * arena.wallSize, ballRadius);
    let ball1dir = new THREE.Vector3(1,0,0);
    ball1 = createBall(Colors.ball1, ballRadius, ball1pos, ball1dir);

    // Creates ball2 object.
    let ball2pos = new THREE.Vector3(arena.width - 2 * arena.wallSize,
        arena.height - 2 * arena.wallSize, ballRadius);
    let ball2dir = new THREE.Vector3(-1,0,0);
    ball2 = createBall(Colors.ball2, ballRadius, ball2pos, ball2dir);

    // Specifies different view windows
    views = [
        {
            left: 0,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            eye: [-65 + ballRadius, 0, ballRadius],
            rotation: [90 * Math.PI / 180, -90 * Math.PI / 180, 0],
            fov: 45
        },
        {
            left: 0.5,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            eye: [65 - ballRadius, 0, ballRadius],
            rotation: [90 * Math.PI / 180, 90 * Math.PI / 180, 0],
            fov: 45
        },
        {
            left: 0.425,
            bottom: 0.80,
            width: 0.15,
            height: 0.2,
            eye: [0, 0, 100],
            rotation: [0, 0, 0],
            fov: 60
        }
    ]

    // Creates worlds.
    createRenderWorld();
    createPhysicsWorld();

    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Bind keyboard and resize events.
    KeyboardJS.bind.axis('a','d','s','w', onMoveKey);
    KeyboardJS.bind.axis('left', 'right', 'down', 'up', onMoveKey2);

    // Set the initial game state.
    gameState = 'initialize';

}

function animate() {

    requestAnimationFrame(animate);

    updatePhysicsWorld();
    updateRenderWorld();
    render();

}

function render() {
    updateSize();
    for ( var ii = 0; ii < views.length; ++ ii ) {
        var view = views[ ii ];
        var camera = view.camera;
        var left = Math.floor( windowWidth * view.left );
        var bottom = Math.floor( windowHeight * view.bottom );
        var width = Math.floor( windowWidth * view.width );
        var height = Math.floor( windowHeight * view.height );
        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );
        renderer.setScissorTest( true );
        renderer.setClearColor( view.background );
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render( scene, camera );
    }
}

function updateSize() {
    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        renderer.setSize( windowWidth, windowHeight );
    }
}

function onMoveKey(axis) {
    ball1.keyAxis = axis.slice(0);
}

function onMoveKey2(axis) {
    ball2.keyAxis = axis.slice(0);
}
