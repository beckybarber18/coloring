function createArena(height, width, wallSize, tileSize) {
    let arena = new Object();
    arena.height = height;
    arena.width = width;
    arena.wallSize = wallSize;
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
    return ball;
}

function createStar(color, radius, position) {
    let star = new Object();
    star.color = color;
    star.radius = radius;
    star.position = position;
    return star;
}

function createBomb(type, radius, position) {
    let bomb = new Object();
    bomb.type = type;
    bomb.radius = radius;
    bomb.position = position;
    bomb.direction = new THREE.Vector3(0, 0, 0.1);
    bomb.mesh = undefined;
    return bomb;
}
