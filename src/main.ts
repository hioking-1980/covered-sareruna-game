import './style.css';

// ゲーム画面のHTML要素を取得
const gameContainer = document.querySelector<HTMLDivElement>('#app')!;

// プレイヤーキャラクター（カバードピープル）の表示
const playerImage = document.createElement('img');
playerImage.src = '/player_main.png';
playerImage.style.position = 'absolute';
playerImage.style.width = '100px';
playerImage.style.left = '50%';
playerImage.style.top = '50%';
playerImage.style.transform = 'translate(-50%, -50%)';

const enemies: HTMLImageElement[] = [];
let hits = 0;
let currentStage = 1;
let enemyCount = 2;
let timer: number;
let uiElement: HTMLDivElement;

// プレイヤーを動かすための変数とイベントリスナー
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

playerImage.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - playerImage.offsetLeft;
    offsetY = e.clientY - playerImage.offsetTop;
    e.preventDefault();
});

playerImage.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - playerImage.offsetLeft;
    offsetY = touch.clientY - playerImage.offsetTop;
    e.preventDefault();
});

gameContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    playerImage.style.left = `${newX}px`;
    playerImage.style.top = `${newY}px`;
});

gameContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - offsetX;
    const newY = touch.clientY - offsetY;
    playerImage.style.left = `${newX}px`;
    playerImage.style.top = `${newY}px`;
});

gameContainer.addEventListener('mouseup', () => {
    isDragging = false;
});

gameContainer.addEventListener('touchend', () => {
    isDragging = false;
});

// 敵キャラクター（漫画肉）の作成
function createEnemy() {
    const enemyImage = document.createElement('img');
    enemyImage.src = '/tekiyaku.png';
    enemyImage.style.position = 'absolute';
    enemyImage.style.width = '120px';
    const randomX = Math.random() * (window.innerWidth - 120);
    const randomY = 100 + Math.random() * (window.innerHeight - 220);
    enemyImage.style.left = `${randomX}px`;
    enemyImage.style.top = `${randomY}px`;
    gameContainer.appendChild(enemyImage);
    enemies.push(enemyImage);
}

// 衝突判定を行う関数
function checkCollision() {
    const playerRect = playerImage.getBoundingClientRect();

    enemies.forEach((enemy) => {
        const enemyRect = enemy.getBoundingClientRect();
        
        const collisionThreshold = 20;
        if (
            playerRect.left + collisionThreshold < enemyRect.right - collisionThreshold &&
            playerRect.right - collisionThreshold > enemyRect.left + collisionThreshold &&
            playerRect.top + collisionThreshold < enemyRect.bottom - collisionThreshold &&
            playerRect.bottom - collisionThreshold > enemyRect.top + collisionThreshold
        ) {
            hits++;
            console.log(`ヒット数: ${hits}`);
            
            enemy.style.left = '-1000px';

            if (hits >= 2) {
                gameOver();
            }
        }
    });
}

// ゲームオーバー処理
function gameOver() {
    enemies.forEach(enemy => enemy.remove());
    clearTimeout(timer);
    uiElement.remove();
    
    const gameOverImage = document.createElement('img');
    gameOverImage.src = '/covered_sareta.jpg';
    gameOverImage.classList.add('game-over-image');
    gameContainer.appendChild(gameOverImage);
}

// ステージクリア処理
function stageClear() {
    clearTimeout(timer);
    alert('ステージクリア！次のステージへ');
    
    currentStage++;
    enemyCount++;
    uiElement.querySelector<HTMLSpanElement>('#stage-number')!.textContent = currentStage.toString();
    uiElement.querySelector<HTMLSpanElement>('#time-left')!.textContent = '10';

    enemies.forEach(enemy => enemy.remove());
    enemies.length = 0;

    startGame();
}

// ゲーム開始処理
function startGame() {
    // 既存の要素をクリア
    while (gameContainer.firstChild) {
      gameContainer.removeChild(gameContainer.firstChild);
    }
    
    // UIを生成
    uiElement = document.createElement('div');
    uiElement.classList.add('ui');
    uiElement.innerHTML = `
      <div class="stage-text">Stage <span id="stage-number">${currentStage}</span></div>
      <div class="time-text">残り<span id="time-left">10</span>秒</div>
    `;
    gameContainer.appendChild(uiElement);

    // 主人公を再表示
    gameContainer.appendChild(playerImage);

    hits = 0;
    for (let i = 0; i < enemyCount; i++) {
        createEnemy();
    }
    
    // タイマーを開始
    let timeLeft = 10;
    const timeLeftEl = uiElement.querySelector<HTMLSpanElement>('#time-left')!;
    timer = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft.toString();
        if (timeLeft <= 0) {
            stageClear();
        }
    }, 1000);

    gameLoop();
}

// ゲームのメインループ
function gameLoop() {
    const playerX = playerImage.offsetLeft;
    const playerY = playerImage.offsetTop;

    enemies.forEach((enemy) => {
        const enemyX = enemy.offsetLeft;
        const enemyY = enemy.offsetTop;
        
        const dx = playerX - enemyX;
        const dy = playerY - enemyY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 2;

        if (distance > 1) {
            enemy.style.left = `${enemyX + (dx / distance) * speed}px`;
            enemy.style.top = `${enemyY + (dy / distance) * speed}px`;
        }
    });

    checkCollision();

    requestAnimationFrame(gameLoop);
}

// 初回ゲーム開始
startGame();