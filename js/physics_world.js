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

function updateImpulse(ball) {
    const factor = (ball.keys[0] - ball.keys[1]) * ball.physical.mass * speed;
    const force = new CANNON.Vec3(factor * ball.direction.x, factor * ball.direction.y, 0);
    ball.physical.applyImpulse(force, ball.physical.position);
}

function handleWallCollisions(ball) {
    // Positive x-axis wall.
    if (ball.position.x < -arena.width + arena.wallSize) {
        ball.position.x = -arena.width + arena.wallSize;
        ball.velocity = calculateVelocity(new CANNON.Vec3(1, 0, 0), ball);
    }
    // Negative x-axis wall.
    else if (ball.position.x > arena.width - arena.wallSize) {
        ball.position.x = arena.width - arena.wallSize;
        ball.velocity = calculateVelocity(new CANNON.Vec3(-1, 0, 0), ball);
    }
    // Positive y-axis wall.
    else if (ball.position.y < -arena.height + arena.wallSize) {
        ball.position.y = -arena.height + arena.wallSize;
        ball.velocity = calculateVelocity(new CANNON.Vec3(0, 1, 0), ball);
    }
    // Negative y-axis wall.
    else if (ball.position.y > arena.height - arena.wallSize) {
        ball.position.y = arena.height - arena.wallSize;
        ball.velocity = calculateVelocity(new CANNON.Vec3(0, -1, 0), ball);
    }
}

function calculateVelocity(normal, ball) {
    const dot = normal.dot(ball.velocity.clone());
    const c = normal.clone().scale(2 * dot);
    return ball.velocity.vsub(c).scale(0.3);
}
