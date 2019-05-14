function createArena(height, width, wallSize, wallHeight, tileSize) {
    let arena = new Object();
    arena.height = height;
    arena.width = width;
    arena.wallSize = wallSize;
    arena.wallHeight = wallHeight
    arena.tileSize = tileSize;
    arena.walls = undefined;
    arena.floor = undefined;
    arena.stars = undefined;
    arena.colors = undefined;
    arena.tileColors = [];
    arena.powers = [];
    return arena;
}

function createBall(radius, position, direction, num) {
    let ball = new Object();
    ball.color = undefined;
    ball.radius = radius;
    ball.position = position;
    ball.prevPosition = position.clone();
    ball.direction = direction;
    ball.num = num;
    ball.score = 0;
    ball.keys = [0, 0, 0, 0];
    ball.mesh = undefined;
    ball.physical = undefined;
    ball.camera = undefined;
    ball.canMove = true;
    ball.freeze = undefined;
    return ball;
}

function createPower(type, position) {
    let power = new Object();
    power.type = type;
    power.size = ballRadius / 3;
    power.position = position;
    power.direction = new THREE.Vector3(0, 0, 0.1);
    power.mesh = undefined;
    return power;
}
