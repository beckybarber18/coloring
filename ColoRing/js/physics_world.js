function createPhysicsWorld() {
    // Creates physical world.
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    // Creates first physical ball.
    let ballShape = new CANNON.Sphere(ballRadius);
    let mass = 1;
    ball1.physical = new CANNON.Body({
      mass: mass
    });
    ball1.physical.addShape(ballShape);
    ball1.physical.friction = 0.1;
    ball1.physical.position.copy(ball1.position);
    world.addBody(ball1.physical);

    // Creates second physical ball.
    ball2.physical = new CANNON.Body({
        mass: mass
      });
    ball2.physical.addShape(ballShape);
    ball2.physical.friction = 0.1;
    ball2.physical.position.copy(ball2.position);
    world.addBody(ball2.physical);
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

function updatePhysicsWorld() {
    world.step(1 / 60);

    let lv = ball1.physical.velocity;
    ball1.physical.velocity.set(lv.x * (1 - ball1.physical.friction),
        lv.y * (1 - ball1.physical.friction),
        lv.z * (1 - ball1.physical.friction));
    lv = ball2.physical.velocity;
    ball2.physical.velocity.set(lv.x * (1 - ball2.physical.friction),
        lv.y * (1 - ball2.physical.friction),
        lv.z * (1 - ball2.physical.friction));

    let force1 = new CANNON.Vec3(ball1.keyAxis[0] * ball1.physical.mass * 12,
        ball1.keyAxis[1] * ball1.physical.mass * 12, 0);
    let force2 = new CANNON.Vec3(ball2.keyAxis[0] * ball2.physical.mass * 12,
        ball2.keyAxis[1] * ball2.physical.mass * 12, 0);

    ball1.physical.applyImpulse(force1, ball1.physical.position);
    ball2.physical.applyImpulse(force2, ball2.physical.position);
    ball1.keyAxis = [0,0];
    ball2.keyAxis = [0,0];

    // Handles wall collisions.
    handleWallCollisions(ball1.physical);
    handleWallCollisions(ball2.physical);
}
