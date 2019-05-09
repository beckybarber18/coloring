function createArena() {
    let arena = new Object();
    arena.height = 50;
    arena.width = 75;
    arena.wallSize = 5;
    arena.tileSize = 1;
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
    ball.keyAxis = [0, 0];
    ball.direction = direction;
    return ball;
}
