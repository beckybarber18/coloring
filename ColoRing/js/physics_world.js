function createPhysicsWorld() {

    // Creates physical world.
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    // Creates physical balls.
    ball1.physical = createBallPhysical(ball1);
    world.addBody(ball1.physical);

    ball2.physical = createBallPhysical(ball2);
    world.addBody(ball2.physical);

    // createWallPhysical();
}

function updatePhysicsWorld() {

    world.step(1 / 60);

    // Updates velocity.
    ball1.physical.velocity.scale(1 - ball1.physical.friction,
        ball1.physical.velocity);
    ball2.physical.velocity.scale(1 - ball2.physical.friction,
        ball2.physical.velocity);

    // Updates impulse.
    if (ball1.canMove) {
        updateImpulse(ball1);
    }

    if (ball2.canMove) {
        updateImpulse(ball2);
    }

    // Handles wall collisions.
    handleWallCollisions(ball1.physical);
    handleWallCollisions(ball2.physical);
}

function createBallPhysical(ball) {
    const ballShape = new CANNON.Sphere(ball.radius);
    const mass = 1;

    const physical = new CANNON.Body({ mass: mass });
    physical.addShape(ballShape);
    physical.friction = 0.1;
    physical.position.copy(ball.position);

    return physical;
}

function createWallPhysical() {
    const plane = new CANNON.Plane();
    const mass = 0;

    const position = new CANNON.Vec3(0, arena.height - arena.wallSize, 0);
    const quaternion = new CANNON.Quaternion()
    quaternion.setFromEuler(90 * TO_DEGREES, 0, 0, 'XYZ');

    const physical = new CANNON.Body({ mass: mass});
    physical.addShape(plane, position, quaternion)
    physical.friction = 0;

    world.addBody(physical);
}

function updateImpulse(ball) {
    const factor = ball.keys[0] * ball.physical.mass * 12;
    const force = new CANNON.Vec3(factor * ball.direction.x,
        factor * ball.direction.y, 0);
    ball.physical.applyImpulse(force, ball.physical.position);
}

function handleWallCollisions(ball) {
    // Positive x-axis wall.
    if (ball.position.x < -arena.width + arena.wallSize) {
        // Updates position.
        ball.position.x = -arena.width + arena.wallSize;

        // Calculates velocity.
        const normal = new CANNON.Vec3(1, 0, 0);
        const dot = normal.dot(ball.velocity.clone());
        const c1 = normal.clone().scale(2 * dot);
        ball.velocity = ball.velocity.vsub(c1).scale(0.3);
    }
    // Negative x-axis wall.
    else if (ball.position.x > arena.width - arena.wallSize) {
        // Updates position.
        ball.position.x = arena.width - arena.wallSize;

        // Calculates velocity.
        const normal = new CANNON.Vec3(-1, 0, 0);
        const dot = normal.dot(ball.velocity.clone());
        const c1 = normal.clone().scale(2 * dot);
        ball.velocity = ball.velocity.vsub(c1).scale(0.3);
    }
    // Positive y-axis wall.
    else if (ball.position.y < -arena.height + arena.wallSize) {
        // Updates position.
        ball.position.y = -arena.height + arena.wallSize;

        // Calculates velocity.
        const normal = new CANNON.Vec3(0, 1, 0);
        const dot = normal.dot(ball.velocity.clone());
        const c1 = normal.clone().scale(2 * dot);
        ball.velocity = ball.velocity.vsub(c1).scale(0.3);
    }
    // Negative y-axis wall.
    else if (ball.position.y > arena.height - arena.wallSize) {
        // Updates position.
        ball.position.y = arena.height - arena.wallSize;

        // Calculates velocity.
        const normal = new CANNON.Vec3(0, -1, 0);
        const dot = normal.dot(ball.velocity.clone());
        const c1 = normal.clone().scale(2 * dot);
        ball.velocity = ball.velocity.vsub(c1).scale(0.3);
    }
}
