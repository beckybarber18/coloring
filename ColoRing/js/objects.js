function createArena(height, width, wallSize, tileSize) {
    let arena = new Object();
    arena.height = height;
    arena.width = width;
    arena.wallSize = wallSize;
    arena.tileSize = tileSize;
    arena.walls = undefined;
    arena.floor = undefined;
    arena.colors = [];
    return arena;
}

function createBall(color, radius, position, direction, num) {
    let ball = new Object();
    ball.color = color;
    ball.radius = radius;
    ball.position = position;
    ball.direction = direction;
    ball.num = num;
    ball.score = 0;
    ball.keys = [0, 0, 0];
    ball.mesh = undefined;
    ball.physical = undefined;
    ball.camera = undefined;
    return ball;
}
