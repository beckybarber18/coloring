const Colors = {
    background: 0x000000,
    floor: 0x000000,
    ball1: 0x0055ff,
    ball2: 0xe2598b,
    bomb: 0x15cda8,
    freeze: 0x0075f6,
    cross: 0xff5959
}

const palettes = [
    {
        ball1: 0xffba5a,
        ball2: 0xe2598b,
        ball1str: 'ffba5a',
        ball2str: 'e2598b'
    },
    {
        ball1: 0x6effbf,
        ball2: 0x8158fc,
        ball1str: '6effbf',
        ball2str: '8158fc'
    },
    {
        ball1: 0x207dff,
        ball2: 0xff5982,
        ball1str: '207dff',
        ball2str: 'ff5982'
    }
];

const   X_AXIS = new THREE.Vector3(1, 0, 0),
        Y_AXIS = new THREE.Vector3(0, 1, 0),
        Z_AXIS = new THREE.Vector3(0, 0, 1),
        TO_RADIANS = Math.PI / 180,
        turning = 3,
        speed = 10,
        cameraX = 3.5,
        cameraZ = 4,
        ballRadius = 3,
        maxPowers = 5,
        powerProb = 0.975;

let renderer, state, windowWidth, windowHeight,
    menuScene, menuCamera, menuComposer, mouse, raycaster,
    options, intersected = [], oldColor = [],
    gameScene, views, gameComposers,
    stars, arena, palette, ball1, ball2, world,
    initialPos1, initialDir1, initialPos2, initialDir2,
    powers;

const params = {
    exposure: 0.8,
    bloomStrength: 1.75,
    bloomThreshold: 0,
    bloomRadius: 0.5
};

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Creates mouse vector.
    mouse = new THREE.Vector2()

    // Menu event listeners.
    document.addEventListener( 'mousemove', onDocumentMouseMove );
    document.addEventListener( 'click', onClick );

    // Key event listeners.
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Creates start menu.
    createMenuScreen();

    // Creates stars.

    // Go to menu screne.
    state = 'menu';
}

function animate() {

    switch(state) {
        case 'menu':
            renderMenu();
            // $('#logo').show();
            $('#instructions').show();
            break;
        case 'start':
            // Hides menu text.
            // $('#logo').hide();
            $('#instructions').hide();

            // Creates arena object.
            arena = createArena(50, 75, 5, 10, 5);

            // Set initial positions and directions of ball objects.
            initialPos1 = new THREE.Vector3(-arena.width + 2 * arena.wallSize,
                -arena.height + 2 * arena.wallSize, ballRadius);
            initialDir1 = new THREE.Vector3(1, 0, 0);
            initialPos2 = new THREE.Vector3(arena.width - 2 * arena.wallSize,
                arena.height - 2 * arena.wallSize, ballRadius);
            initialDir2 = new THREE.Vector3(-1, 0, 0);

            // Specifies different view windows.
            views = createViews();

            // Create ball objects.
            ball1 = createBall(palette.ball1, ballRadius, initialPos1.clone(),
                initialDir1.clone(), 1);
            ball2 = createBall(palette.ball2, ballRadius, initialPos2.clone(),
                initialDir2.clone(), 2);

            // Create color gradient.
            const rainbow = new Rainbow();
            rainbow.setSpectrum(palette.ball1str, palette.ball2str);
            for (let i = 0; i < 101; i++) {
                arena.colors.push('0x' + rainbow.colourAt(i));
            }

            createRenderWorld();
            createPhysicsWorld();
            countdown();

            state = 'play';
            break;

        case 'play':
            updatePhysicsWorld();
            updateRenderWorld();
            renderGame();
            break;

        case 'end':
            displayResult();
            break;
    }

    requestAnimationFrame(animate);
}

function renderGame() {
    updateSize();

    for ( let ii = 0; ii < views.length; ++ ii ) {
        const view = views[ ii ];
        const camera = view.camera;
        const left = Math.floor( window.innerWidth * view.left );
        const bottom = Math.floor( window.innerHeight * view.bottom );
        const width = Math.floor( window.innerWidth * view.width );
        const height = Math.floor( window.innerHeight * view.height );
        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );
        renderer.setScissorTest( true );
        renderer.setClearColor( view.background );
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render( gameScene, camera );
        gameComposers[ii].render();
    }
}

function renderMenu() {
    updateSize();

    // Updates camera when resizing.
    menuCamera.aspect = windowWidth / windowHeight;
    menuCamera.updateProjectionMatrix();

    // Finds intersection of mouse.
    raycaster.setFromCamera( mouse, menuCamera );
	const intersects = raycaster.intersectObjects( menuScene.children );

    // Highlights pair of balls that mouse intersects with.
	if ( intersects.length > 0 ) {
		if (intersected[0] !== undefined) {
            intersected[0].material.color.set(oldColor[0]);
            intersected[1].material.color.set(oldColor[1]);
        }

        intersected[0] = intersects[0].object;
        intersected[1] = intersected[0].pair;
        oldColor[0] = intersected[0].material.color.clone();
        oldColor[1] = intersected[1].material.color.clone();

        intersected[0].material.color.set(0xffffff);
        intersected[1].material.color.set(0xffffff);
	}
    else {
        if ( intersected[0] !== undefined ) {
            for (let i = 0; i < intersected.length; i++) {
                intersected[i].material.color.set(oldColor[i]);
                intersected[i] = undefined;
                oldColor[i] = undefined;
            }
        }
    }

    renderer.render( menuScene, menuCamera );
    menuComposer.render()
}

function updateSize() {
    if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if (views !== undefined) {
            views[2].width = 250 / windowWidth;
            views[2].height = 175 / windowHeight;
            views[2].left = (1 - views[2].width) / 2;
            views[2].bottom = 1 - views[2].height;
        }

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
            rotation: [0 * TO_RADIANS, -60 * TO_RADIANS, -90 * TO_RADIANS],
            fov: 75
        },
        {
            left: 0.5,
            bottom: 0,
            width: 0.5,
            height: 1.0,
            eye: [initialPos2.x + cameraX * ballRadius, initialPos2.y,
                initialPos2.z + cameraZ * ballRadius],
            rotation: [0 * TO_RADIANS, 60 * TO_RADIANS, 90 * TO_RADIANS],
            fov: 75
        },
        {
            left: (1 - 250 / window.innerWidth) / 2,
            bottom: 1 - 175 / window.innerHeight,
            width: 250 / window.innerWidth,
            height: 175 / window.innerHeight,
            eye: [0, 0, 100],
            rotation: [0, 0, 0],
            fov: 60
        }
    ]

    return canvases;
}

function onDocumentMouseMove(event) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onClick(event) {
    if (intersected[0] !== undefined) {
        palette = palettes[intersected[0].palette];
        state = 'start';
    }
}

function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // w
            ball1.keys[0] = 1;
            break;

        case 38: // up
            ball2.keys[0] = 1;
            break;

        case 83: // s
            ball1.keys[1] = 1;
            break;

        case 40: // down
            ball2.keys[1] = 1;
            break;

        case 65: // a
            ball1.keys[2] = 1;
            break;

        case 37: // left
            ball2.keys[2] = 1;
            break;

        case 68: // d
            ball1.keys[3] = 1;
            break;

        case 39: // right
            ball2.keys[3] = 1;
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

        case 83: // s
            ball1.keys[1] = 0;
            break;

        case 40: // down
            ball2.keys[1] = 0;
            break;

        case 65: // a
            ball1.keys[2] = 0;
            break;

        case 37: // left
            ball2.keys[2] = 0;
            break;

        case 68: // d
            ball1.keys[3] = 0;
            break;

        case 39: // right
            ball2.keys[3] = 0;
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
    state = 'start';
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
    state = 'start';
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
            state = 'end';
        }
    }
    tick();
}
