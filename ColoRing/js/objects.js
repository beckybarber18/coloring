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
    ball.radius = radius;
    ball.color = color;
    ball.position = position;
    ball.mesh = undefined;
    ball.physical = undefined;
    ball.keyAxis = [0,0,0];
    ball.direction = direction;
    return ball;
}
