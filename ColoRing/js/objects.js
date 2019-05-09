function createArena(height, width, wallSize, tileSize) {
    let arena = new Object();
    arena.height = height;
    arena.width = width;
    arena.wallSize = wallSize;
    arena.tileSize = tileSize;
    arena.walls = undefined;
    arena.floor = undefined;
    return arena;
}

function createBall(color, radius, position, direction) {
    let ball = new Object();
    ball.color = color;
    ball.radius = radius;
    ball.position = position;
    ball.direction = direction;
    ball.keyAxis = [0, 0, 0];
    ball.mesh = undefined;
    ball.physical = undefined;
    ball.camera = undefined;
    return ball;
}
