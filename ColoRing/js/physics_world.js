function createPhysicsWorld() {
    // Create the world object.
    wWorld = new b2World(new b2Vec2(0, 0), true);

    // Create the ball.
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(1.5, 1);
    wBall = wWorld.CreateBody(bodyDef);

    var bodyDef2 = new b2BodyDef();
    bodyDef2.type = b2Body.b2_dynamicBody;
    bodyDef2.position.Set(0.5, 1);
    wBall2 = wWorld.CreateBody(bodyDef2);

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.25;
    fixDef.shape = new b2CircleShape(ballRadius);
    wBall.CreateFixture(fixDef);

    var fixDef2 = new b2FixtureDef();
    fixDef2.density = 1.0;
    fixDef2.friction = 0.0;
    fixDef2.restitution = 0.25;
    fixDef2.shape = new b2CircleShape(ballRadius);
    wBall2.CreateFixture(fixDef2);

    // Create the arena.
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(arenaWidth/2, arenaWidth/2);
    for (var i = 0; i < arena.dimension; i += arenaWidth) {
        for (var j = 0; j < arena.dimension; j += arena.dimension - arenaWidth) {
            bodyDef.position.x = i;
            bodyDef.position.y = j;
            wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
        }
    }
    for (var j = 0; j < arena.dimension; j+=arenaWidth) {
        for (var i = 0; i < arena.dimension; i+=arena.dimension - arenaWidth) {
            bodyDef.position.x = i;
            bodyDef.position.y = j;
            wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
        }
    }
}

function updatePhysicsWorld() {

    // Apply "friction".
    var lv = wBall.GetLinearVelocity();
    var lv2 = wBall2.GetLinearVelocity();
    lv.Multiply(0.95);
    lv2.Multiply(0.95);
    wBall.SetLinearVelocity(lv);
    wBall2.SetLinearVelocity(lv2);

    const scale = 4;

    // Apply user-directed force.
    var f = new b2Vec2(keyAxis[0]*wBall.GetMass() * scale, keyAxis[1]*wBall.GetMass()* scale);
    var f2 = new b2Vec2(keyAxis2[0]*wBall2.GetMass()* scale, keyAxis2[1]*wBall2.GetMass()* scale);
    wBall.ApplyImpulse(f, wBall.GetPosition());
    wBall2.ApplyImpulse(f2, wBall2.GetPosition());
    keyAxis = [0,0];
    keyAxis2 = [0,0];

    // Take a time step.
    wWorld.Step(1/60, 8, 3);
}
