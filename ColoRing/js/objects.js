function createArena(height, width, wallSize, wallHeight, tileSize) {
    let arena = new Object();
    arena.height = height;
    arena.width = width;
    arena.wallSize = wallSize;
    arena.wallHeight = wallHeight
    arena.tileSize = tileSize;
    arena.walls = undefined;
    arena.floor = undefined;
    arena.tileColors = [];
    arena.colors = [];
    return arena;
}

function createBall(color, radius, position, direction, num) {
    let ball = new Object();
    ball.color = color;
    ball.radius = radius;
    ball.position = position;
    ball.position.z = radius;
    ball.direction = direction;
    ball.num = num;
    ball.score = 0;
    ball.keys = [0, 0, 0];
    ball.mesh = undefined;
    ball.physical = undefined;
    ball.camera = undefined;
    ball.canMove = true;
    ball.seconds = 0;
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

function createStar(color, radius, position) {
    let star = new Object();
    star.color = color;
    star.radius = radius;
    star.position = position;
    return star;
}
