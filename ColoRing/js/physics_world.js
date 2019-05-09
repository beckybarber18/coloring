function createPhysicsWorld() {

    world = new CANNON.World();
    //world.gravity.set(0,0,-9.82);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    // create the first ball
    let ballShape = new CANNON.Sphere(ballRadius);
    let mass = 1;
    ball1.physical = new CANNON.Body({
      mass: mass
    });
    ball1.physical.addShape(ballShape);
    // ball1.velocity.set(0,10,0);
    ball1.physical.friction = 0.1;
    ball1.physical.position.set(-arena.width + 2 * arena.wallSize, -arena.height + 2 * arena.wallSize, ballRadius);
    world.addBody(ball1.physical);

    // create the second ball
    ball2.physical = new CANNON.Body({
        mass: mass
      });
    ball2.physical.addShape(ballShape);
    // ball1.velocity.set(0,10,0);
    ball2.physical.friction = 0.1;
    ball2.physical.position.set(arena.width - 2 * arena.wallSize, -arena.height - 2 * arena.wallSize, ballRadius);
    world.addBody(ball2.physical);
}

function handleWallCollisions(ball) {
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

    world.step(1/60);

    let lv = ball1.physical.velocity;
    ball1.physical.velocity.set(lv.x*(1-ball1.physical.friction), 
        lv.y*(1-ball1.physical.friction), lv.z*(1-ball1.physical.friction));
    lv = ball2.physical.velocity;
    ball2.physical.velocity.set(lv.x*(1-ball2.physical.friction), 
        lv.y*(1-ball2.physical.friction), lv.z*(1-ball2.physical.friction));

    //console.log(keyAxis[0]*ball1.mass*ball1.friction);
    let force1 = new CANNON.Vec3(keyAxis[0]*ball1.physical.mass*12,
        keyAxis[1]*ball1.mass*12, 0);
    let force2 = new CANNON.Vec3(keyAxis2[0]*ball2.physical.mass*12,
        keyAxis2[1]*ball2.physical.mass*12, 0);
    // var force = new CANNON.Vec3(500,0,0);
    // var worldpoint = new CANNON.Vec3(0,0,ballRadius);
    ball1.physical.applyImpulse(force1, ball1.physical.position);
    ball2.physical.applyImpulse(force2, ball2.physical.position);
    keyAxis = [0,0];
    keyAxis2 = [0,0];

    // handle wall collisions
    handleWallCollisions(ball1.physical);
    handleWallCollisions(ball2.physical);
}
