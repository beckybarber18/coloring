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
    const factor = ball.keys[0] * ball.physical.mass * 12;
    const force = new CANNON.Vec3(factor * ball.direction.x,
        factor * ball.direction.y, 0);
    ball.physical.applyImpulse(force, ball.physical.position);
}

function handleWallCollisions(ball) {
    // TODO: Decrease velocity of ball (rather then set to negative velocity)
    if(ball.position.x < -arena.width + arena.wallSize) {
        ball.position.x = -arena.width + arena.wallSize;
        let v = ball.velocity;
        ball.velocity.set(-v.x, -v.y, -v.z);
    }
    else if(ball.position.x > arena.width - arena.wallSize) {
        ball.position.x = arena.width - arena.wallSize;
        let v = ball.velocity;
        ball.velocity.set(-v.x, -v.y, -v.z);
    }
    else if(ball.position.y < -arena.height + arena.wallSize) {
        ball.position.y = -arena.height + arena.wallSize;
        let v = ball.velocity;
        ball.velocity.set(-v.x, -v.y, -v.z);
    }
    else if(ball.position.y > arena.height - arena.wallSize) {
        ball.position.y = arena.height - arena.wallSize;
        let v = ball.velocity;
        ball.velocity.set(-v.x, -v.y, -v.z);
    }
}
