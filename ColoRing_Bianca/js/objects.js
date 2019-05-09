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

function createBall(color) {
    let ball = new Object();
    ball.radius = 2;
    ball.color = color;
    ball.position = undefined;
    ball.mesh = undefined;
    ball.physical = undefined;
    ball.keyAxis = [0, 0];

    return ball;
}
