function createPhysicsWorld() {

    /*
    // Create the world object.
    wWorld = new b2World(new b2Vec2(0, 0), true);

    // Create the ball.
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(1, 1);
    wBall = wWorld.CreateBody(bodyDef);
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.25;
    fixDef.shape = new b2CircleShape(ballRadius);
    wBall.CreateFixture(fixDef);

    // Create the maze.
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(0.5, 0.5);
    for (var i = 0; i < maze.dimension; i++) {
        for (var j = 0; j < maze.dimension; j++) {
            if (maze[i][j]) {
                bodyDef.position.x = i;
                bodyDef.position.y = j;
                wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
            }
        }
    }
    */


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
    // ball1.physical.velocity.set(0,10,0);
    ball1.physical.friction = 0.1;
    ball1.physical.position.copy(ball1.position);
    world.addBody(ball1.physical);

    // create the second ball
    ball2.physical = new CANNON.Body({
        mass: mass
      });
    ball2.physical.addShape(ballShape);
    // ball1.physical.velocity.set(0,10,0);
    ball2.physical.friction = 0.1;
    ball2.physical.position.copy(ball2.position);
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
    /*

    // Apply "friction".
    var lv = wBall.GetLinearVelocity();
    lv.Multiply(0.95);
    wBall.SetLinearVelocity(lv);

    // Apply user-directed force.
    var f = new b2Vec2(keyAxis[0]*wBall.GetMass()*0.25, keyAxis[1]*wBall.GetMass()*0.25);
    wBall.ApplyImpulse(f, wBall.GetPosition());
    keyAxis = [0,0];

    // Take a time step.
    wWorld.Step(1/60, 8, 3);
    */

    world.step(1/60);
    // Copy coordinates from Cannon.js to Three.js
    //console.log(ball1.physical);

    let lv = ball1.physical.velocity;
    ball1.physical.velocity.set(lv.x*(1-ball1.physical.friction), lv.y*(1-ball1.physical.friction), lv.z*(1-ball1.physical.friction));
    lv = ball2.physical.velocity;
    ball2.physical.velocity.set(lv.x*(1-ball2.physical.friction), lv.y*(1-ball2.physical.friction), lv.z*(1-ball2.physical.friction));

    //console.log(keyAxis[0]*ball1.physical.mass*ball1.physical.friction);
    let force1 = new CANNON.Vec3(ball1.keyAxis[0]*ball1.physical.mass*12,
        ball1.keyAxis[1]*ball1.physical.mass*12, 0);
    let force2 = new CANNON.Vec3(ball2.keyAxis[0]*ball2.physical.mass*12,
        ball2.keyAxis[1]*ball2.physical.mass*12, 0);
    // var force = new CANNON.Vec3(500,0,0);
    // var worldpoint = new CANNON.Vec3(0,0,ballRadius);
    ball1.physical.applyImpulse(force1, ball1.physical.position);
    ball2.physical.applyImpulse(force2, ball2.physical.position);
    keyAxis = [0,0];
    ball2.keyAxis = [0,0];

    // handle wall collisions
    handleWallCollisions(ball1.physical);
    handleWallCollisions(ball2.physical);
}
