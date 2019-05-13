function createMenuScreen() {
    // Creates the menu scene.
    menuScene = new THREE.Scene();
    menuScene.background = new THREE.Color( Colors.background );
	menuScene.fog = new THREE.Fog( Colors.background, 0, 750 );

    // Creates light.
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.5);
    menuScene.add(hemisphereLight);

    // Creates camera.
    menuCamera = new THREE.PerspectiveCamera( 45,
        window.innerWidth / window.innerHeight, 1, 10000 );
    menuCamera.position.set(0, 0, 20);

    // Creates raycaster.
    raycaster = new THREE.Raycaster();

    // Create pairs of balls.
    options = [];
    const geo = new THREE.SphereGeometry(1, 9, 12);
    const wireframe = new THREE.WireframeGeometry(geo);

    geo.dispose();

    for (let i = 0; i < palettes.length; i++) {
        const dummy = new THREE.Geometry();
        const mat1 = new THREE.LineBasicMaterial({color: palettes[i].ball1});
        const mat2 = new THREE.LineBasicMaterial({color: palettes[i].ball2});

        const line1 = new THREE.LineSegments(wireframe, mat1);
        line1.material.depthTest = false;
        line1.material.opacity = 1;
        line1.material.transparent = true;
        line1.material.linewidth = 1;
        line1.palette = i;

        const line2 = new THREE.LineSegments(wireframe, mat2);
        line2.material.depthTest = false;
        line2.material.opacity = 1;
        line2.material.transparent = true;
        line2.material.linewidth = 1;
        line2.palette = i;

        line1.pair = line2;
        line2.pair = line1;

        menuScene.add(line1);
        menuScene.add(line2);
        options.push(line1);
        options.push(line2);

        // Dispose dummy.
        dummy.dispose();
    }

    // Dispose geometry.
    geo.dispose();

    // Position balls.
    for (let i = 0; i < options.length; i += 2) {
        options[i].position.set(-9.5 + i * 4, 0, 0);
        options[i + 1].position.set(-6.5 + i * 4, 0, 0);
        console.log(-9.5 + i * 4);
        console.log(-6.5 + i * 4);
    }
}
