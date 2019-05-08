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
    ball1 = new CANNON.Body({
      mass: mass
    });
    ball1.addShape(ballShape);
    // ball1.velocity.set(0,10,0);
    ball1.friction = 0.25;
    world.addBody(ball1);
    //console.log(ball1);

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
    //console.log(ball1);

    //console.log(keyAxis[0]*ball1.mass*ball1.friction);
    let force1 = new CANNON.Vec3(keyAxis[0]*ball1.mass*ball1.friction, 
        keyAxis[1]*ball1.mass*ball1.friction, 0);
    var force = new CANNON.Vec3(500,0,0);
    var worldpoint = new CANNON.Vec3(0,0,ballRadius);
    ball1.applyForce(force, worldpoint);
    keyAxis = [0,0];

    ballMesh.position.copy(ball1.position);
    ballMesh.quaternion.copy(ball1.quaternion);
}
