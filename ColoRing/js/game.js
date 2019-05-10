const Colors = {
    //background: 0xfff8f3,
    background: 0x000000,
    //arena: 0xf0b7a4,
    //floor: 0xf5e1da,
    floor: 0x000000,
    //ball1: 0xfdd043,
    //ball2: 0xe2598b
    bomb: 0x000000
}


const   TO_DEGREES = Math.PI / 180,
        cameraX = 1.5,
        cameraZ = 1.5,
        ballRadius = 3,
        maxPowers = 3;

let camera, scene, renderer, composers = [], views, gameState,
    windowWidth, windowHeight,
    arena, numArenaColors, ball1, ball2, world,
    initialPos1, initialDir1, initialPos2, initialDir2,
    ball1Color, ball2Color,
    ball1ColorStr, ball2ColorStr,
    powers;

var params = {
    exposure: 1,
    bloomStrength: .8,
    bloomThreshold: 0,
    bloomRadius: 0
};



init();
animate();

function init() {

    container = document.getElementById( 'container' );

    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Key event listeners.
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Set the initial game state.
    // gameState = 'beforeStart';

    // just so we dont have to pick a color every time
    gameState = 'start';
    ball1ColorStr = "fdd043";
    let colorString = '0x' + ball1ColorStr.substring(1, ball1ColorStr.length);
    ball1Color = parseInt(colorString);
    ball2ColorStr = "e2598b";
    colorString = '0x' + ball2ColorStr.substring(1, ball2ColorStr.length);
    ball2Color = parseInt(colorString);


}

function animate() {

    switch(gameState) {
        case 'beforeStart':
            displayColor1Choose();
            // gameState = 'start';
            break;
        case 'start':
            // Creates arena object.
            arena = createArena(50, 75, 5, 5);

            // Set initial positions and directions of ball objects.
            initialPos1 = new THREE.Vector3(-arena.width + 2 * arena.wallSize,
                -arena.height + 2 * arena.wallSize, ballRadius);
            initialDir1 = new THREE.Vector3(1, 0, 0);
            initialPos2 = new THREE.Vector3(arena.width - 2 * arena.wallSize,
                arena.height - 2 * arena.wallSize, ballRadius);
            initialDir2 = new THREE.Vector3(-1, 0, 0);

            // Create ball objects.
            ball1 = createBall(ball1Color, ballRadius, initialPos1.clone(),
                initialDir1.clone(), 1);
            ball2 = createBall(ball2Color, ballRadius, initialPos2.clone(),
                initialDir2.clone(), 2);

            // Specifies different view windows.
            views = createViews();

            // create color gradient
            numArenaColors = 100;

            const myRainbow = new Rainbow();
            myRainbow.setNumberRange(1, numArenaColors);
            myRainbow.setSpectrum(ball1ColorStr, ball2ColorStr);
            const s = '';
            for (var i = 1; i <= numArenaColors; i++) {
                arena.colors.push('0x' + myRainbow.colourAt(i));;
            }

            createRenderWorld();
            createPhysicsWorld();

            gameState = 'play';
            countdown();
            break;

        case 'play':
            updatePhysicsWorld();
            updateRenderWorld();
            render();
            break;

        case 'end':
            displayResult();
            break;
    }

    requestAnimationFrame(animate);
    for ( var ii = 0; ii < composers.length; ++ ii ) {
        var view = views[ ii ];
        var left = Math.floor( window.innerWidth * view.left );
        var bottom = Math.floor( window.innerHeight * view.bottom );
        var width = Math.floor( window.innerWidth * view.width );
        var height = Math.floor( window.innerHeight * view.height );
        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );

        composers[ii].render();
    }

}

function render() {
    updateSize();
    for ( var ii = 0; ii < views.length; ++ ii ) {
        var view = views[ ii ];
        var camera = view.camera;
        var left = Math.floor( window.innerWidth * view.left );
        var bottom = Math.floor( window.innerHeight * view.bottom );
        var width = Math.floor( window.innerWidth * view.width );
        var height = Math.floor( window.innerHeight * view.height );
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

function createViews() {
    let canvases = [
        {
            left: 0,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            eye: [initialPos1.x + cameraX * ballRadius, initialPos1.y,
                initialPos1.z + cameraZ * ballRadius],
            rotation: [90 * TO_DEGREES, -90 * TO_DEGREES, 0],
            fov: 75
        },
        {
            left: 0.5,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            eye: [initialPos2.x + cameraX * ballRadius, initialPos2.y,
                initialPos2.z + cameraZ * ballRadius],
            rotation: [90 * TO_DEGREES, 90 * TO_DEGREES, 0],
            fov: 75
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

    return canvases;
}

function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // w
            ball1.keys[0] = 1;
            break;

        case 38: // up
            ball2.keys[0] = 1;
            break;

        case 65: // a
            ball1.keys[1] = 1;
            break;

        case 37: // left
            ball2.keys[1] = 1;
            break;

        case 68: // d
            ball1.keys[2] = 1;
            break;

        case 39: // right
            ball2.keys[2] = 1;
            break;
    }
}

function onKeyUp(event) {
    switch (event.keyCode) {
        case 87: // w
            ball1.keys[0] = 0;
            break;

        case 38: // up
            ball2.keys[0] = 0;
            break;

        case 65: // a
            ball1.keys[1] = 0;
            break;

        case 37: // left
            ball2.keys[1] = 0;
            break;

        case 68: // d
            ball1.keys[2] = 0;
            break;

        case 39: // right
            ball2.keys[2] = 0;
            break;
    }
}

function displayColor1Choose() {

    $('#counter').hide();

    $('#chooseColor1').show();
}

function hideColor1Choose() {

    $('#chooseColor1').hide();

    ball1ColorStr = document.getElementById("p1color").value;
    let colorString = '0x' + ball1ColorStr.substring(1, ball1ColorStr.length);
    ball1Color = parseInt(colorString);

    displayColor2Choose();


}

function displayColor2Choose() {

    $('#counter').hide();

    $('#chooseColor2').show();
}

function hideColor2Choose() {

    $('#chooseColor1').hide();
    $('#chooseColor2').hide();

    ball2ColorStr = document.getElementById("p2color").value;
    let colorString = '0x' + ball2ColorStr.substring(1, ball2ColorStr.length);
    ball2Color = parseInt(colorString);

    //console.log(colorString, ball2Color);
    gameState = 'start';
    // KeyboardJS.unbind.key('space',
                             // function(){hideColorChoose()});
}

function displayResult() {
    $('#counter').hide();

    if (ball1.score > ball2.score) {
        $('#instructions1').show();
    }
    else if (ball1.score < ball2.score) {
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
    ball1.score = 1;
    ball2.score = 1;
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
