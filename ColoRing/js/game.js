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
            eye: [ball1.position.x - 1.5 * ballRadius, ball1.position.y,
                ball1.position.z + 1.5 * ballRadius],
            rotation: [90 * Math.PI / 180, -90 * Math.PI / 180, 0],
            fov: 60
        },
        {
            left: 0.5,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            eye: [ball2.position.x + 1.5 * ballRadius, ball2.position.y,
                ball2.position.z + 1.5 * ballRadius],
            rotation: [90 * Math.PI / 180, 90 * Math.PI / 180, 0],
            fov: 60
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

    // Creates worlds
    createRenderWorld();
    createPhysicsWorld();

    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Bind keyboard and resize events.
    // KeyboardJS.bind.axis('a','d','s','w', onMoveKey);
    // KeyboardJS.bind.axis('left', 'right', 'down', 'up', onMoveKey2);
    // document.addEventListener("keydown", onKeyDown, false);
    // document.addEventListener("keyup", onKeyUp, false);

    document.addEventListener('keydown', function(event){

        switch (event.keyCode) {

            case 38: // up
                ball2.keys[0] = 1;
                break;

            case 87: // w
                ball1.keys[0] = 1;
                break;

            case 37: // left
                ball2.keys[1] = 1;
                break;

            case 65: // a
                ball1.keys[1] = 1;
                break;

            case 39: // right
                ball2.keys[2] = 1;
                break;

            case 68: // d
                ball1.keys[2] = 1;
                break;

        }

    } );

    document.addEventListener('keyup', function(event){

        switch (event.keyCode) {

            case 38: // up
                ball2.keys[0] = 0;
                break;

            case 87: // w
                ball1.keys[0] = 0;
                break;

            case 37: // left
                ball2.keys[1] = 0;
                break;

            case 65: // a
                ball1.keys[1] = 0;
                break;

            case 39: // right
                ball2.keys[2] = 0;
                break;

            case 68: // d
                ball1.keys[2] = 0;
                break;

        }

    } );

    // Set the initial game state.
    gameState = 'start';

}

function animate() {

    switch(gameState) {
        case 'play':
            updatePhysicsWorld();
            updateRenderWorld();
            render();
            break;

        case 'start':
            ball1.score = 0;
            ball2.score = 0;
            createRenderWorld();
            createPhysicsWorld();
            gameState = 'play';
            countdown();
            break;

        case 'end':
            displayResult();
            break;
    }

    requestAnimationFrame(animate);
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

var onKeyDown = function (event) {

    switch (event.keyCode) {

        case 38: // up
            ball2.keys[0] = 1;
            break;
    }
}

var onKeyUp = function (event) {

    switch (event.keyCode) {

        case 38: // up
            ball2.keys[0] = 0;
            break;
    }
}


function displayResult() {
    $('#counter').hide();
    let s1 = 0;
    let s2 = 0;

    // calculate scores
    for (let i = 0; i < arena.floor.length; i++) {
        if (arena.floor[i].material.color === ball1.color) {
            s1++;
        }
        else if (arena.floor[i].material.color === ball2.color) {
            s2++;
        }
    }
    // console.log(s1, s2);
    if (s1 > s2) {
        $('#instructions1').show();
    }
    else if (s1 < s2) {
        $('#instructions2').show();
    }
    else {
        $('#instructions3').show();
    }
    KeyboardJS.bind.key('space',
                             function(){hideResult()});
}

function hideResult() {
    if (ball1.score > ball2.score) {
        $('#instructions1').hide();
    }
    else if (ball1.score < ball2.score) {
        $('#instructions2').hide();
    }
    else {
        $('#instructions3').hide();
    }
    gameState = 'start';
    KeyboardJS.unbind.key('space',
                             function(){hideResult()});
}

function countdown() {
    $('#counter').show();
    var seconds = 60;
    function tick() {
        var counter = document.getElementById("counter");
        seconds--;
        counter.innerHTML = (seconds < 10 ? "0" : "") + String(seconds);
        if( seconds > 0 ) {
            setTimeout(tick, 1000);
        } else {
            gameState = 'end';
        }
    }
    tick();
}
