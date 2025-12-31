// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И СОХРАНЕНИЕ ==========
let player = {
    name: '',
    ticketNumber: '',
    chocolate: 0,
    candies: 0,
    factoryLevel: 0,
    totalGames: 0,
    highScore: 0,
    playerLevel: 1,
    playTime: 0,
    clickerUpgrades: {
        auto: 0,
        double: false,
        triple: false,
        mega: false
    },
    totalClicks: 0,
    candyRecord: 0,
    recipesCompleted: 0,
    activeGame: 'candyGame' // Новое поле для активной игры
};

let startTime = Date.now();

// ========== ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ИГРАМИ ==========
document.addEventListener('DOMContentLoaded', function() {
    const gameButtons = document.querySelectorAll('.game-btn');
    gameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game');
            switchGame(gameId);
        });
    });
    
    // Показать первую игру по умолчанию
    switchGame('candyGame');
});

function switchGame(gameId) {
    // Скрыть все игровые секции
    const sections = document.querySelectorAll('.game-section');
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Показать выбранную секцию
    const activeSection = document.getElementById(gameId);
    if (activeSection) {
        activeSection.classList.add('active-section');
        player.activeGame = gameId;
        saveGame();
    }
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========
function loadGame() {
    const saved = localStorage.getItem('wonkaGameUltimate');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(player, loaded);
            updateUI();
            document.getElementById('registrationModal').style.display = 'none';
            updateFactoryLevel();
            updateShopAppearance();
            updatePlayTime();
            
            // Восстановить активную игру
            if (player.activeGame) {
                switchGame(player.activeGame);
            }
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            showRegistration();
        }
    } else {
        showRegistration();
    }
}

function saveGame() {
    localStorage.setItem('wonkaGameUltimate', JSON.stringify(player));
}

function showRegistration() {
    document.getElementById('registrationModal').style.display = 'flex';
}

function registerPlayer() {
    const ticketNumber = document.getElementById('ticketNumber').value.trim();
    const name = document.getElementById('playerName').value.trim();
    const errorElement = document.getElementById('registrationError');
    
    errorElement.textContent = '';
    
    if (!name || name.length < 2) {
        errorElement.textContent = 'Имя должно быть не менее 2 символов';
        return;
    }
    
    if (!ticketNumber || !/^\d+$/.test(ticketNumber)) {
        errorElement.textContent = 'Номер билета должен быть числом';
        return;
    }
    
    const ticketNum = parseInt(ticketNumber);
    if (ticketNum < 1 || ticketNum > 1000) {
        errorElement.textContent = 'Номер билета должен быть от 1 до 1000';
        return;
    }
    
    player.name = name.toUpperCase();
    player.ticketNumber = ticketNum;
    
    const bonus = ticketNum % 100;
    player.chocolate = Math.floor(bonus * 2);
    player.candies = Math.floor(bonus * 5);
    player.highScore = player.chocolate;
    
    startTime = Date.now();
    
    document.getElementById('registrationModal').style.display = 'none';
    updateUI();
    saveGame();
    showWelcomeMessage();
}

function showWelcomeMessage() {
    createFloatingMessage(
        `🎉 ДОБРО ПОЖАЛОВАТЬ НА ФАБРИКУ, ${player.name}!\n\n` +
        `ВЫ ПОЛУЧИЛИ СТАРТОВЫЙ БОНУС:\n` +
        `🍫 ${player.chocolate} ШОКОЛАДОК\n` +
        `🍬 ${player.candies} КОНФЕТ\n\n` +
        `УДАЧИ В СОЗДАНИИ ШОКОЛАДНОЙ ИМПЕРИИ!`,
        '#ffd700'
    );
}

function createFloatingMessage(text, color) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, ${color}, rgba(139, 69, 19, 0.9));
        color: white;
        padding: 30px;
        border-radius: 20px;
        font-size: 1.6rem;
        font-weight: bold;
        z-index: 2000;
        border: 5px solid white;
        box-shadow: 0 0 50px ${color};
        text-align: center;
        white-space: pre-line;
        max-width: 600px;
        animation: floatMessage 3s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatMessage {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -100px) scale(0.9); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
        document.head.removeChild(style);
    }, 3000);
}

function updateUI() {
    document.getElementById('playerNameDisplay').textContent = player.name;
    document.getElementById('ticketNumberDisplay').textContent = player.ticketNumber;
    
    document.getElementById('chocolateCount').textContent = player.chocolate.toLocaleString();
    document.getElementById('candyCount').textContent = player.candies.toLocaleString();
    document.getElementById('availableCandies').textContent = player.candies.toLocaleString();
    
    document.getElementById('totalGames').textContent = player.totalGames;
    document.getElementById('highScore').textContent = player.highScore.toLocaleString();
    document.getElementById('playerLevel').textContent = player.playerLevel;
    document.getElementById('candyRecord').textContent = player.candyRecord.toLocaleString();
    document.getElementById('recipesCompleted').textContent = player.recipesCompleted;
    
    updateShopButtons();
}

function updatePlayTime() {
    const now = Date.now();
    const minutes = Math.floor((now - startTime) / 60000);
    player.playTime = minutes;
    document.getElementById('playTime').textContent = minutes;
}

function updateFactoryLevel() {
    const levels = [
        "🏭 ФАБРИКА: БАЗОВЫЙ УРОВЕНЬ",
        "🏭 ФАБРИКА: ШОКОЛАДНЫЙ КОНВЕЙЕР ⚙️",
        "🏭 ФАБРИКА: ВОДОПАД ИЗ ШОКОЛАДА 🌊",
        "🏭 ФАБРИКА: СЛАДКИЙ ЭКСПРЕСС 🚂",
        "🏭 ФАБРИКА: ВОЛШЕБНЫЙ ДВОРЕЦ 🏰"
    ];
    
    const levelText = levels[player.factoryLevel];
    document.getElementById('factoryLevelText').textContent = levelText;
    
    player.playerLevel = Math.floor(player.factoryLevel * 2.5 + player.totalGames / 10) + 1;
}

function updateShopAppearance() {
    for (let i = 1; i <= 4; i++) {
        const item = document.getElementById(`shopItem${i}`);
        if (player.factoryLevel >= i) {
            item.classList.add('unlocked');
        } else {
            item.classList.remove('unlocked');
        }
    }
}

function updateShopButtons() {
    const prices = [200, 500, 1000, 2000];
    
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`upgrade${i}`);
        if (player.factoryLevel >= i) {
            btn.disabled = true;
            btn.textContent = '✅ КУПЛЕНО';
            btn.style.background = 'linear-gradient(145deg, #4CAF50, #2E7D32)';
        } else if (player.chocolate >= prices[i-1] && player.factoryLevel === i-1) {
            btn.disabled = false;
            btn.textContent = 'КУПИТЬ УЛУЧШЕНИЕ';
            btn.style.background = 'linear-gradient(45deg, #8b4513, #4a1c03, #8b4513)';
        } else {
            btn.disabled = true;
            btn.textContent = '❌ НЕДОСТАТУПНО';
            btn.style.background = 'linear-gradient(145deg, #666, #444)';
        }
    }
}

function buyUpgrade(level) {
    const prices = [200, 500, 1000, 2000];
    const price = prices[level-1];
    
    if (player.chocolate >= price && player.factoryLevel === level-1) {
        player.chocolate -= price;
        player.factoryLevel = level;
        
        showUpgradeEffect();
        
        const bonuses = [0, 100, 250, 500, 1000];
        player.chocolate += bonuses[level];
        
        if (level === 4) {
            setTimeout(() => {
                document.getElementById('congratulations').style.display = 'flex';
            }, 1500);
        }
        
        updateUI();
        updateFactoryLevel();
        updateShopAppearance();
        saveGame();
        
        showUpgradeMessage(level);
    }
}

function showUpgradeEffect() {
    const effect = document.getElementById('upgradeEffect');
    effect.style.opacity = '1';
    
    for (let i = 0; i < 200; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.setProperty('--c', `hsl(${Math.random() * 360}, 100%, 60%)`);
        confetti.style.width = Math.random() * 20 + 10 + 'px';
        confetti.style.height = Math.random() * 20 + 10 + 'px';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        effect.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
    
    setTimeout(() => {
        effect.style.opacity = '0';
        effect.innerHTML = '';
    }, 4000);
}

function showUpgradeMessage(level) {
    const messages = [
        "",
        "⚙️ ШОКОЛАДНЫЙ КОНВЕЙЕР ЗАПУЩЕН! Производство увеличено на 50%!",
        "🌊 ВОДОПАД ИЗ ШОКОЛАДА РАБОТАЕТ! Доход увеличен в 2 раза!",
        "🚂 СЛАДКИЙ ЭКСПРЕСС ОТПРАВИЛСЯ! Доставка стала мгновенной!",
        "🏰 ВОЛШЕБНЫЙ ДВОРЕЦ ПОСТРОЕН! Ты стал легендой кондитерского искусства!"
    ];
    
    if (messages[level]) {
        createFloatingMessage(messages[level], '#ff1493');
    }
}

function closeCongratulations() {
    document.getElementById('congratulations').style.display = 'none';
}

function exchangeCandies() {
    if (player.candies >= 2) {
        const exchangeAmount = Math.floor(player.candies / 2);
        const chocolateGained = exchangeAmount;
        
        player.chocolate += chocolateGained;
        player.candies -= exchangeAmount * 2;
        
        updateUI();
        saveGame();
        
        createFloatingMessage(
            `🍬→🍫 ОБМЕН УСПЕШЕН!\n\n` +
            `Конфеты: ${exchangeAmount * 2} → 0\n` +
            `Шоколадки: +${chocolateGained}\n\n` +
            `Текущий баланс: ${player.chocolate} 🍫`,
            '#4CAF50'
        );
    } else {
        createFloatingMessage(
            '❌ НЕДОСТАТОЧНО КОНФЕТ!\n\n' +
            'Нужно минимум 2 конфеты для обмена.\n' +
            `У вас: ${player.candies} 🍬`,
            '#ff4444'
        );
    }
}

function resetGame() {
    const confirmMessage = `⚠️ ВНИМАНИЕ! ⚠️\n\n` +
                         `Вы собираетесь сбросить ВЕСЬ прогресс:\n` +
                         `• Все шоколадки и конфеты\n` +
                         `• Прокачку фабрики\n` +
                         `• Всю статистику\n` +
                         `• Все достижения\n\n` +
                         `Это действие НЕОБРАТИМО!\n\n` +
                         `Вы уверены?`;
    
    if (confirm(confirmMessage)) {
        localStorage.removeItem('wonkaGameUltimate');
        
        document.body.style.animation = 'shake 0.5s';
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                20%, 40%, 60%, 80% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.head.removeChild(style);
            document.body.style.animation = '';
            location.reload();
        }, 500);
    }
}

// ========== ИГРА 1: СБОР КОНФЕТ ==========
let candyGameActive = false;
let candyScore = 0;
let candyTimer = 30;
let candyLevel = 1;
let candySpeed = 800;
let candyInterval;
let candyTypes = [
    { emoji: '🍬', value: 1, color: '#FF6B6B', rarity: 60 },
    { emoji: '🍭', value: 2, color: '#4ECDC4', rarity: 25 },
    { emoji: '🎁', value: 3, color: '#FFD166', rarity: 10 },
    { emoji: '💀', value: -2, color: '#2F2F2F', rarity: 5 }
];

document.getElementById('startCandyGame').onclick = startCandyGame;

function startCandyGame() {
    if (candyGameActive) return;
    
    candyGameActive = true;
    candyScore = 0;
    candyTimer = 30;
    candyLevel = 1;
    candySpeed = 800;
    
    document.getElementById('candyScore').textContent = candyScore;
    document.getElementById('candyTimer').textContent = candyTimer;
    document.getElementById('candyLevel').textContent = candyLevel;
    document.getElementById('startCandyGame').style.display = 'none';
    
    const gameArea = document.getElementById('candyGameArea');
    gameArea.innerHTML = '';
    
    player.totalGames++;
    
    // Таймер
    const timer = setInterval(() => {
        candyTimer--;
        document.getElementById('candyTimer').textContent = candyTimer;
        
        if (candyTimer > 0 && candyTimer % 5 === 0) {
            increaseCandyDifficulty();
        }
        
        if (candyTimer <= 0) {
            endCandyGame();
            clearInterval(timer);
        }
    }, 1000);
    
    // Создание конфет
    candyInterval = setInterval(createCandy, candySpeed);
}

function increaseCandyDifficulty() {
    candyLevel++;
    candySpeed = Math.max(200, candySpeed * 0.7);
    
    document.getElementById('candyLevel').textContent = candyLevel;
    
    clearInterval(candyInterval);
    candyInterval = setInterval(createCandy, candySpeed);
    
    createFloatingMessage(
        `📈 УРОВЕНЬ ${candyLevel}!\n` +
        `Скорость увеличена!\n` +
        `Будьте внимательнее!`,
        '#2196F3'
    );
}

function createCandy() {
    if (!candyGameActive) return;
    
    const gameArea = document.getElementById('candyGameArea');
    if (!gameArea) return;
    
    const candy = document.createElement('div');
    candy.className = 'candy';
    candy.style.left = Math.random() * 90 + '%';
    candy.style.top = Math.random() * 85 + '%';
    
    // Выбор типа конфеты по редкости
    const totalRarity = candyTypes.reduce((sum, type) => sum + type.rarity, 0);
    let random = Math.random() * totalRarity;
    let selectedType;
    
    for (const type of candyTypes) {
        random -= type.rarity;
        if (random <= 0) {
            selectedType = type;
            break;
        }
    }
    
    candy.textContent = selectedType.emoji;
    candy.style.color = selectedType.color;
    candy.style.textShadow = `0 0 10px ${selectedType.color}`;
    
    candy.onclick = () => {
        if (!candyGameActive) return;
        
        candyScore += selectedType.value;
        if (selectedType.value > 0) {
            player.candies += selectedType.value;
        } else {
            player.candies = Math.max(0, player.candies + selectedType.value);
        }
        
        candy.style.animation = 'none';
        candy.style.transform = 'scale(1.8) rotate(360deg)';
        candy.style.filter = 'blur(2px)';
        
        const valueDisplay = document.createElement('div');
        valueDisplay.textContent = selectedType.value > 0 ? `+${selectedType.value}` : selectedType.value;
        valueDisplay.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            color: ${selectedType.value > 0 ? '#4CAF50' : '#ff4444'};
            font-weight: bold;
            font-size: 1.5rem;
            text-shadow: 1px 1px 0 black;
            animation: floatUp 1s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-50px); }
            }
        `;
        document.head.appendChild(style);
        candy.appendChild(valueDisplay);
        
        document.getElementById('candyScore').textContent = candyScore;
        updateUI();
        
        setTimeout(() => {
            candy.remove();
            document.head.removeChild(style);
        }, 300);
    };
    
    gameArea.appendChild(candy);
    
    setTimeout(() => candy.remove(), 3000);
}

function endCandyGame() {
    candyGameActive = false;
    clearInterval(candyInterval);
    
    const gameArea = document.getElementById('candyGameArea');
    const reward = Math.floor(candyScore * 3);
    player.chocolate += reward;
    
    if (candyScore > player.candyRecord) {
        player.candyRecord = candyScore;
        if (candyScore > player.highScore / 10) {
            player.highScore = Math.max(player.highScore, candyScore * 10);
        }
    }
    
    let message = '';
    if (candyScore > 50) {
        message = `🎊 ФАНТАСТИЧЕСКИ! 🎊\nТы настоящий сборщик конфет!\n`;
        player.chocolate += 50;
    } else if (candyScore > 30) {
        message = `🎉 ОТЛИЧНО! 🎉\nОтличный результат!\n`;
        player.chocolate += 25;
    } else if (candyScore > 15) {
        message = `👍 ХОРОШО! 👍\nНеплохо справился!\n`;
        player.chocolate += 10;
    } else {
        message = `🎮 МОЖНО ЛУЧШЕ! 🎮\nПопробуй ещё раз!\n`;
    }
    
    message += `\n🍬 Собрано конфет: ${candyScore}\n`;
    message += `🏆 Достигнут уровень: ${candyLevel}\n`;
    message += `💰 Награда: ${reward} 🍫\n`;
    if (candyScore > 50) message += `🎁 Бонус за мастерство: +50 🍫\n`;
    message += `\n🎯 Рекорд: ${player.candyRecord} конфет`;
    
    gameArea.innerHTML = `
        <div style="font-size: 2.5rem; margin: 40px 0; color: #8b4513; font-weight: bold;">
            ${candyScore > 50 ? '🏆 ЛЕГЕНДАРНО! 🏆' : '🎮 ИГРА ОКОНЧЕНА 🎮'}
        </div>
        <div style="font-size: 1.6rem; margin: 25px 0; white-space: pre-line; line-height: 1.8; color: #000000; font-weight: bold;">
            ${message}
        </div>
        <button id="restartCandyBtn" style="
            font-size: 1.8rem; 
            padding: 20px 40px; 
            margin: 30px auto;
            background: linear-gradient(145deg, #ff1493, #ffd700);
            color: white;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            border: 5px solid white;
            box-shadow: 0 12px 30px rgba(255, 20, 147, 0.5);
            transition: all 0.3s;
            display: block;
        ">
            🔄 ИГРАТЬ СНОВА
        </button>
    `;
    
    // Добавляем обработчик для кнопки "Играть снова"
    const restartBtn = document.getElementById('restartCandyBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', startCandyGame);
    }
    
    updateUI();
    saveGame();
}

// ========== ИГРА 2: ШОКОЛАДНЫЙ КЛИКЕР ==========
let clickMultiplier = 1;
let autoClicksPerSecond = 0;
let clickerDifficulty = 1;

function clickChocolate() {
    let clicks = clickMultiplier * clickerDifficulty;
    player.chocolate += clicks;
    player.totalClicks++;
    
    if (player.totalClicks % 500 === 0) {
        increaseClickerDifficulty();
    }
    
    updateClickerUI();
    saveGame();
    
    const clickEffect = document.createElement('div');
    clickEffect.textContent = `+${clicks} 🍫`;
    clickEffect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2.5rem;
        font-weight: bold;
        color: #ffd700;
        text-shadow: 3px 3px 0 #8b4513;
        pointer-events: none;
        z-index: 100;
        animation: clickFloat 1.2s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes clickFloat {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -100px) scale(1.3); }
            100% { opacity: 0; transform: translate(-50%, -150px) scale(1.5); }
        }
    `;
    document.head.appendChild(style);
    
    document.getElementById('chocolate').appendChild(clickEffect);
    
    setTimeout(() => {
        document.head.removeChild(style);
        clickEffect.remove();
    }, 1200);
}

function increaseClickerDifficulty() {
    clickerDifficulty = Math.min(5, clickerDifficulty + 0.5);
    
    document.getElementById('difficultyLevel').textContent = clickerDifficulty.toFixed(1);
    
    if (clickerDifficulty > 1) {
        createFloatingMessage(
            `⚡ СЛОЖНОСТЬ УВЕЛИЧЕНА!\n` +
            `Множитель: ${clickerDifficulty.toFixed(1)}x\n` +
            `Так держать, продолжайте кликать!`,
            '#FF9800'
        );
    }
}

function updateClickerUI() {
    document.getElementById('clickerCounter').textContent = player.chocolate.toLocaleString() + ' 🍫';
    document.getElementById('totalClicks').textContent = player.totalClicks.toLocaleString();
    document.getElementById('clickMultiplier').textContent = clickMultiplier + 'x';
    document.getElementById('perSecond').textContent = autoClicksPerSecond.toLocaleString();
    
    updateUpgradeButtons();
    
    updateUI();
}

function updateUpgradePrices() {
    const basePrices = { auto: 100, double: 500, triple: 2000, mega: 5000 };
    const multiplier = Math.pow(1.3, Math.floor(player.totalClicks / 1000));
    
    document.getElementById('autoPrice').textContent = Math.floor(basePrices.auto * multiplier);
    document.getElementById('doublePrice').textContent = Math.floor(basePrices.double * multiplier);
    document.getElementById('triplePrice').textContent = Math.floor(basePrices.triple * multiplier);
    document.getElementById('megaPrice').textContent = Math.floor(basePrices.mega * multiplier);
}

function updateUpgradeButtons() {
    updateUpgradePrices();
    
    const prices = {
        auto: parseInt(document.getElementById('autoPrice').textContent),
        double: parseInt(document.getElementById('doublePrice').textContent),
        triple: parseInt(document.getElementById('triplePrice').textContent),
        mega: parseInt(document.getElementById('megaPrice').textContent)
    };
    
    document.getElementById('autoClickerBtn').disabled = player.chocolate < prices.auto;
    
    document.getElementById('doubleClickBtn').disabled = 
        player.chocolate < prices.double || player.clickerUpgrades.double;
    if (player.clickerUpgrades.double) {
        document.getElementById('doubleClickBtn').innerHTML = `
            <span style="font-size: 2rem;">✅</span>
            <div style="font-size: 1.2rem; font-weight: bold;">УЖЕ КУПЛЕНО</div>
            <div style="font-size: 0.9rem;">2x за клик</div>
        `;
    }
    
    document.getElementById('tripleClickBtn').disabled = 
        player.chocolate < prices.triple || player.clickerUpgrades.triple;
    if (player.clickerUpgrades.triple) {
        document.getElementById('tripleClickBtn').innerHTML = `
            <span style="font-size: 2rem;">✅</span>
            <div style="font-size: 1.2rem; font-weight: bold;">УЖЕ КУПЛЕНО</div>
            <div style="font-size: 0.9rem;">3x за клик</div>
        `;
    }
    
    document.getElementById('megaClickBtn').disabled = 
        player.chocolate < prices.mega || player.clickerUpgrades.mega;
    if (player.clickerUpgrades.mega) {
        document.getElementById('megaClickBtn').innerHTML = `
            <span style="font-size: 2rem;">✅</span>
            <div style="font-size: 1.2rem; font-weight: bold;">УЖЕ КУПЛЕНО</div>
            <div style="font-size: 0.9rem;">10x за клик</div>
        `;
    }
}

function buyUpgradeClicker(type) {
    const prices = {
        auto: parseInt(document.getElementById('autoPrice').textContent),
        double: parseInt(document.getElementById('doublePrice').textContent),
        triple: parseInt(document.getElementById('triplePrice').textContent),
        mega: parseInt(document.getElementById('megaPrice').textContent)
    };
    
    let success = false;
    
    switch(type) {
        case 'auto':
            if (player.chocolate >= prices.auto) {
                player.chocolate -= prices.auto;
                autoClicksPerSecond++;
                player.clickerUpgrades.auto++;
                success = true;
            }
            break;
        case 'double':
            if (player.chocolate >= prices.double && !player.clickerUpgrades.double) {
                player.chocolate -= prices.double;
                clickMultiplier *= 2;
                player.clickerUpgrades.double = true;
                success = true;
            }
            break;
        case 'triple':
            if (player.chocolate >= prices.triple && !player.clickerUpgrades.triple) {
                player.chocolate -= prices.triple;
                clickMultiplier *= 3;
                player.clickerUpgrades.triple = true;
                success = true;
            }
            break;
        case 'mega':
            if (player.chocolate >= prices.mega && !player.clickerUpgrades.mega) {
                player.chocolate -= prices.mega;
                clickMultiplier *= 10;
                player.clickerUpgrades.mega = true;
                success = true;
            }
            break;
    }
    
    if (success) {
        updateClickerUI();
        saveGame();
        
        createFloatingMessage(
            `🎉 УЛУЧШЕНИЕ КУПЛЕНО!\n` +
            `Тип: ${type.toUpperCase()}\n` +
            `Новый множитель: ${clickMultiplier}x`,
            '#4CAF50'
        );
    }
}

// Автокликер
setInterval(() => {
    if (autoClicksPerSecond > 0) {
        const clicks = autoClicksPerSecond * clickMultiplier * clickerDifficulty;
        player.chocolate += clicks;
        updateClickerUI();
        saveGame();
    }
}, 1000);

// ========== ИГРА 3: ШОКОЛАДНАЯ ГОЛОВОЛОМКА ==========
let puzzleGameActive = false;
let puzzleTimer = 120;
let currentRecipe = null;
let ingredientsInCauldron = [];
let allIngredients = [
    { emoji: "🍫", name: "Какао", type: "base" },
    { emoji: "🥛", name: "Молоко", type: "base" },
    { emoji: "🍬", name: "Сахар", type: "sweet" },
    { emoji: "🍯", name: "Мёд", type: "sweet" },
    { emoji: "🧈", name: "Масло", type: "fat" },
    { emoji: "🧂", name: "Соль", type: "spice" },
    { emoji: "🌿", name: "Ваниль", type: "spice" },
    { emoji: "🌶️", name: "Перец", type: "spice" },
    { emoji: "🍊", name: "Апельсин", type: "fruit" },
    { emoji: "🌰", name: "Орехи", type: "nut" },
    { emoji: "🌹", name: "Роза", type: "flower" },
    { emoji: "✨", name: "Звёздная пыль", type: "magic" },
    { emoji: "🌈", name: "Радуга", type: "magic" },
    { emoji: "🎪", name: "Смех", type: "magic" },
    { emoji: "🎭", name: "Сюрприз", type: "magic" },
    { emoji: "🌟", name: "Волшебство", type: "magic" },
    { emoji: "🍓", name: "Клубника", type: "fruit" },
    { emoji: "🫐", name: "Черника", type: "fruit" },
    { emoji: "🥥", name: "Кокос", type: "fruit" },
    { emoji: "☕", name: "Кофе", type: "spice" },
    { emoji: "🌿", name: "Мята", type: "spice" },
    { emoji: "🍌", name: "Банан", type: "fruit" },
    { emoji: "🍎", name: "Яблоко", type: "fruit" },
    { emoji: "🥭", name: "Манго", type: "fruit" },
    { emoji: "🍍", name: "Ананас", type: "fruit" },
    { emoji: "🥜", name: "Арахис", type: "nut" },
    { emoji: "🍵", name: "Зелёный чай", type: "spice" },
    { emoji: "🫚", name: "Имбирь", type: "spice" },
    { emoji: "🍯", name: "Карамель", type: "sweet" }
];

let recipes = [
    {
        name: "КЛАССИЧЕСКИЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🥛 Молоко", "🍬 Сахар", "🧈 Масло", "🧂 Соль", "🌿 Ваниль"],
        reward: 50
    },
    {
        name: "ТЁМНЫЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🍯 Мёд", "🧂 Соль", "🌶️ Перец", "🍊 Апельсин", "🌰 Орехи"],
        reward: 75
    },
    {
        name: "БЕЛЫЙ ШОКОЛАД",
        ingredients: ["🥛 Молоко", "🍬 Сахар", "🧈 Масло", "🌿 Ваниль", "🍯 Мёд", "🌹 Роза"],
        reward: 60
    },
    {
        name: "ФИРМЕННЫЙ ШОКОЛАД ВОНКИ",
        ingredients: ["🍫 Какао", "✨ Звёздная пыль", "🌈 Радуга", "🎪 Смех", "🎭 Сюрприз", "🌟 Волшебство"],
        reward: 100
    },
    {
        name: "ЯГОДНЫЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🍓 Клубника", "🫐 Черника", "🍬 Сахар", "🥛 Молоко", "🌿 Ваниль"],
        reward: 80
    },
    {
        name: "КОКОСОВЫЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🥥 Кокос", "🍯 Мёд", "🧈 Масло", "🌿 Ваниль", "🌰 Орехи"],
        reward: 70
    },
    {
        name: "КОФЕЙНЫЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "☕ Кофе", "🍬 Сахар", "🥛 Молоко", "🧈 Масло", "🌿 Ваниль"],
        reward: 75
    },
    {
        name: "МЯТНЫЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🥛 Молоко", "🍬 Сахар", "🌿 Мята", "🌿 Ваниль", "🧊 Лёд"],
        reward: 65
    },
    {
        name: "ТРОПИЧЕСКИЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🥭 Манго", "🍍 Ананас", "🥥 Кокос", "🍬 Сахар", "🌿 Ваниль"],
        reward: 85
    },
    {
        name: "ОРЕХОВЫЙ ШОКОЛАД",
        ingredients: ["🍫 Какао", "🌰 Орехи", "🥜 Арахис", "🍯 Мёд", "🧈 Масло", "🧂 Соль"],
        reward: 70
    }
];

document.getElementById('startPuzzleBtn').onclick = startPuzzleGame;
document.getElementById('checkRecipeBtn').onclick = checkRecipe;
document.getElementById('resetPuzzleBtn').onclick = resetPuzzle;
document.getElementById('hintBtn').onclick = hintRecipe;

function startPuzzleGame() {
    if (puzzleGameActive) return;
    
    puzzleGameActive = true;
    puzzleTimer = 120;
    ingredientsInCauldron = [];
    
    document.getElementById('puzzleStatus').textContent = '⏱️ ВРЕМЯ ПОШЛО! СОБИРАЙТЕ РЕЦЕПТ!';
    document.getElementById('puzzleStatus').style.background = 'rgba(33, 150, 243, 0.2)';
    document.getElementById('puzzleStatus').style.borderColor = '#2196F3';
    document.getElementById('startPuzzleBtn').style.display = 'none';
    
    player.totalGames++;
    
    initializePuzzleGame();
    
    const timer = setInterval(() => {
        if (!puzzleGameActive) {
            clearInterval(timer);
            return;
        }
        
        puzzleTimer--;
        document.getElementById('puzzleTimer').textContent = puzzleTimer;
        
        if (puzzleTimer <= 30) {
            document.getElementById('puzzleTimer').style.color = '#ff4444';
            if (puzzleTimer <= 10) {
                document.getElementById('puzzleStatus').textContent = 
                    `⏰ СРОЧНО! ОСТАЛОСЬ ${puzzleTimer} СЕКУНД!`;
                document.getElementById('puzzleStatus').style.background = 'rgba(255, 68, 68, 0.2)';
                document.getElementById('puzzleStatus').style.borderColor = '#ff4444';
            }
        }
        
        if (puzzleTimer <= 0) {
            endPuzzleGame(false);
            clearInterval(timer);
        }
    }, 1000);
}

function initializePuzzleGame() {
    // Выбираем случайный рецепт
    currentRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    ingredientsInCauldron = [];
    
    // Очищаем панели
    document.getElementById('ingredientsList').innerHTML = '';
    document.getElementById('cauldronContent').innerHTML = '<p style="color: white; text-align: center; font-size: 1.2rem; padding: 20px;">Перетащите ингредиенты сюда!</p>';
    document.getElementById('recipeDisplay').innerHTML = '';
    
    // Показываем рецепт
    document.getElementById('totalIngredients').textContent = currentRecipe.ingredients.length;
    document.getElementById('correctIngredients').textContent = '0';
    document.getElementById('puzzleReward').textContent = currentRecipe.reward;
    document.getElementById('currentReward').textContent = currentRecipe.reward;
    
    // Добавляем заголовок рецепта
    const recipeTitle = document.createElement('div');
    recipeTitle.style.cssText = `
        color: #ffd700;
        font-weight: bold;
        font-size: 1.3rem;
        margin-bottom: 15px;
        text-align: center;
        padding: 10px;
        background: rgba(139, 69, 19, 0.3);
        border-radius: 10px;
    `;
    recipeTitle.textContent = currentRecipe.name;
    document.getElementById('recipeDisplay').appendChild(recipeTitle);
    
    // Добавляем ингредиенты рецепта
    currentRecipe.ingredients.forEach((ingredient, index) => {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        recipeItem.id = `recipeItem${index}`;
        recipeItem.innerHTML = `
            <span>${ingredient}</span>
            <span style="color: #ffd700;">❌</span>
        `;
        document.getElementById('recipeDisplay').appendChild(recipeItem);
    });
    
    // Создаем список доступных ингредиентов (12 штук)
    const availableIngredients = [];
    
    // Сначала добавляем все ингредиенты из рецепта
    currentRecipe.ingredients.forEach(recipeIngredient => {
        const ingredientName = recipeIngredient.split(' ').slice(1).join(' ');
        const ingredient = allIngredients.find(ing => ing.name === ingredientName);
        if (ingredient && !availableIngredients.find(ai => ai.name === ingredient.name)) {
            availableIngredients.push(ingredient);
        }
    });
    
    // Затем добавляем случайные ингредиенты до 12 штук
    const remainingIngredients = allIngredients.filter(ing => 
        !availableIngredients.find(ai => ai.name === ing.name)
    );
    
    // Перемешиваем оставшиеся ингредиенты
    const shuffledRemaining = [...remainingIngredients].sort(() => Math.random() - 0.5);
    const needed = Math.max(0, 12 - availableIngredients.length);
    
    // Добавляем нужное количество случайных ингредиентов
    availableIngredients.push(...shuffledRemaining.slice(0, needed));
    
    // Перемешиваем весь список
    availableIngredients.sort(() => Math.random() - 0.5);
    
    // Создаем элементы ингредиентов
    availableIngredients.forEach(ingredient => {
        const ingredientElement = document.createElement('div');
        ingredientElement.className = 'ingredient-item';
        ingredientElement.draggable = true;
        ingredientElement.innerHTML = `
            <div class="ingredient-icon">${ingredient.emoji}</div>
            <div>${ingredient.name}</div>
        `;
        ingredientElement.dataset.name = ingredient.name;
        ingredientElement.dataset.emoji = ingredient.emoji;
        
        ingredientElement.addEventListener('dragstart', (e) => {
            if (!puzzleGameActive) return;
            e.dataTransfer.setData('text/plain', JSON.stringify({
                name: ingredient.name,
                emoji: ingredient.emoji
            }));
            ingredientElement.classList.add('dragging');
        });
        
        ingredientElement.addEventListener('dragend', () => {
            ingredientElement.classList.remove('dragging');
        });
        
        document.getElementById('ingredientsList').appendChild(ingredientElement);
    });
    
    // Настраиваем зону перетаскивания для котла
    const cauldron = document.getElementById('chocolateCauldron');
    cauldron.addEventListener('dragover', (e) => {
        if (!puzzleGameActive) return;
        e.preventDefault();
        cauldron.style.borderColor = '#ffd700';
        cauldron.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
    });
    
    cauldron.addEventListener('dragleave', () => {
        cauldron.style.borderColor = '#d2691e';
        cauldron.style.boxShadow = '';
    });
    
    cauldron.addEventListener('drop', (e) => {
        if (!puzzleGameActive) return;
        e.preventDefault();
        cauldron.style.borderColor = '#d2691e';
        cauldron.style.boxShadow = '';
        
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        addIngredientToCauldron(data.emoji, data.name);
    });
    
    // Активируем кнопки
    document.getElementById('checkRecipeBtn').disabled = false;
    document.getElementById('hintBtn').disabled = false;
}

function addIngredientToCauldron(emoji, name) {
    if (ingredientsInCauldron.length >= 12) {
        createFloatingMessage('❌ КОТЁЛ ПЕРЕПОЛНЕН!\nУберите лишние ингредиенты.', '#ff4444');
        return;
    }
    
    if (ingredientsInCauldron.some(item => item.name === name)) {
        createFloatingMessage('❌ ЭТОТ ИНГРЕДИЕНТ УЖЕ В КОТЛЕ!', '#ff4444');
        return;
    }
    
    ingredientsInCauldron.push({ emoji, name });
    updateCauldronDisplay();
    updateRecipeProgress();
}

function updateCauldronDisplay() {
    const cauldronContent = document.getElementById('cauldronContent');
    cauldronContent.innerHTML = '';
    
    if (ingredientsInCauldron.length === 0) {
        cauldronContent.innerHTML = '<p style="color: white; text-align: center; font-size: 1.2rem; padding: 20px;">Перетащите ингредиенты сюда!</p>';
        return;
    }
    
    ingredientsInCauldron.forEach(ing => {
        const ingEl = document.createElement('div');
        ingEl.className = 'ingredient-in-cauldron';
        ingEl.innerHTML = `
            <div style="font-size: 1.8rem;">${ing.emoji}</div>
            <div style="font-size: 0.9rem;">${ing.name}</div>
        `;
        ingEl.addEventListener('click', () => {
            if (!puzzleGameActive) return;
            const idx = ingredientsInCauldron.findIndex(item => item.name === ing.name);
            if (idx > -1) {
                ingredientsInCauldron.splice(idx, 1);
                updateCauldronDisplay();
                updateRecipeProgress();
            }
        });
        cauldronContent.appendChild(ingEl);
    });
}

function updateRecipeProgress() {
    let correctCount = 0;
    
    currentRecipe.ingredients.forEach((recipeIngredient, index) => {
        const recipeItem = document.getElementById(`recipeItem${index}`);
        const ingredientName = recipeIngredient.split(' ').slice(1).join(' ');
        
        const isInCauldron = ingredientsInCauldron.some(
            ing => ing.name === ingredientName
        );
        
        if (isInCauldron) {
            recipeItem.classList.add('correct');
            recipeItem.querySelector('span:last-child').textContent = '✅';
            correctCount++;
        } else {
            recipeItem.classList.remove('correct');
            recipeItem.querySelector('span:last-child').textContent = '❌';
        }
    });
    
    document.getElementById('correctIngredients').textContent = correctCount;
    
    if (correctCount === currentRecipe.ingredients.length) {
        document.getElementById('checkRecipeBtn').style.background = 
            'linear-gradient(145deg, #4CAF50, #2E7D32)';
        document.getElementById('checkRecipeBtn').style.boxShadow = 
            '0 0 30px rgba(76, 175, 80, 0.5)';
    } else {
        document.getElementById('checkRecipeBtn').style.background = 
            'linear-gradient(145deg, #ff1493, #c71585, #ff1493)';
        document.getElementById('checkRecipeBtn').style.boxShadow = '';
    }
}

function checkRecipe() {
    if (!puzzleGameActive) return;
    
    let correctCount = 0;
    currentRecipe.ingredients.forEach(recipeIngredient => {
        const ingredientName = recipeIngredient.split(' ').slice(1).join(' ');
        if (ingredientsInCauldron.some(ing => ing.name === ingredientName)) {
            correctCount++;
        }
    });
    
    if (correctCount === currentRecipe.ingredients.length) {
        endPuzzleGame(true);
    } else {
        puzzleTimer = Math.max(0, puzzleTimer - 5);
        document.getElementById('puzzleTimer').textContent = puzzleTimer;
        
        createFloatingMessage(
            `❌ НЕПРАВИЛЬНЫЙ РЕЦЕПТ!\n` +
            `Правильных ингредиентов: ${correctCount}/${currentRecipe.ingredients.length}\n` +
            `Штраф: -5 секунд`,
            '#ff4444'
        );
    }
}

function endPuzzleGame(success) {
    puzzleGameActive = false;
    
    if (success) {
        const reward = currentRecipe.reward;
        player.chocolate += reward;
        player.recipesCompleted++;
        
        document.getElementById('puzzleStatus').innerHTML = `
            <div style="color: #4CAF50; font-size: 1.5rem; margin-bottom: 10px;">
                🎉 РЕЦЕПТ УСПЕШНО СОБРАН! 🎉
            </div>
            <div style="font-size: 1.2rem; color: #000000; font-weight: bold;">
                Рецепт: ${currentRecipe.name}<br>
                Награда: ${reward} 🍫<br>
                Всего рецептов: ${player.recipesCompleted}
            </div>
        `;
        document.getElementById('puzzleStatus').style.background = 'rgba(76, 175, 80, 0.2)';
        document.getElementById('puzzleStatus').style.borderColor = '#4CAF50';
        
        createFloatingMessage(
            `🏆 РЕЦЕПТ СОБРАН!\n\n` +
            `${currentRecipe.name}\n` +
            `Награда: ${reward} 🍫\n` +
            `Всего собрано: ${player.recipesCompleted} рецептов`,
            '#4CAF50'
        );
        
        document.getElementById('checkRecipeBtn').disabled = true;
        document.getElementById('hintBtn').disabled = true;
    } else {
        document.getElementById('puzzleStatus').innerHTML = `
            <div style="color: #ff4444; font-size: 1.5rem; margin-bottom: 10px;">
                ⏰ ВРЕМЯ ВЫШЛО! ⏰
            </div>
            <div style="font-size: 1.2rem; color: #000000; font-weight: bold;">
                Рецепт не собран<br>
                Попробуйте ещё раз!
            </div>
        `;
        document.getElementById('puzzleStatus').style.background = 'rgba(255, 68, 68, 0.2)';
        document.getElementById('puzzleStatus').style.borderColor = '#ff4444';
    }
    
    updateUI();
    saveGame();
    
    document.getElementById('startPuzzleBtn').style.display = 'inline-block';
    document.getElementById('startPuzzleBtn').textContent = '🔄 НОВАЯ ГОЛОВОЛОМКА';
}

function resetPuzzle() {
    if (puzzleGameActive) {
        puzzleTimer = 120;
        initializePuzzleGame();
        
        document.getElementById('puzzleStatus').textContent = '🔄 РЕЦЕПТ СБРОШЕН! НАЧИНАЙТЕ ЗАНОВО!';
        document.getElementById('puzzleStatus').style.background = 'rgba(255, 215, 0, 0.2)';
        document.getElementById('puzzleStatus').style.borderColor = '#ffd700';
        document.getElementById('puzzleTimer').textContent = puzzleTimer;
        document.getElementById('puzzleTimer').style.color = '';
        
        createFloatingMessage('🔄 РЕЦЕПТ СБРОШЕН!\nНачинайте заново!', '#ffd700');
    }
}

function hintRecipe() {
    if (!puzzleGameActive || player.chocolate < 10) {
        createFloatingMessage(
            '❌ НЕДОСТАТОЧНО ШОКОЛАДОК!\nНужно 10 🍫 для подсказки.',
            '#ff4444'
        );
        return;
    }
    
    player.chocolate -= 10;
    
    let missingIngredient = null;
    currentRecipe.ingredients.forEach(recipeIngredient => {
        const ingredientName = recipeIngredient.split(' ').slice(1).join(' ');
        if (!ingredientsInCauldron.some(ing => ing.name === ingredientName)) {
            missingIngredient = ingredientName;
        }
    });
    
    if (missingIngredient) {
        const ingredients = document.querySelectorAll('.ingredient-item');
        ingredients.forEach(ing => {
            if (ing.dataset.name === missingIngredient) {
                ing.style.animation = 'pulse 1s infinite';
                ing.style.borderColor = '#4CAF50';
                ing.style.boxShadow = '0 0 20px #4CAF50';
                
                setTimeout(() => {
                    ing.style.animation = '';
                    ing.style.borderColor = '';
                    ing.style.boxShadow = '';
                }, 3000);
            }
        });
        
        createFloatingMessage(
            `💡 ПОДСКАЗКА!\n\n` +
            `Не хватает: ${missingIngredient}\n` +
            `Потрачено: 10 🍫`,
            '#2196F3'
        );
    }
    
    updateUI();
    saveGame();
}

// ========== ИГРА 4: НАЙДИ ЗОЛОТОЙ БИЛЕТ ==========
let ticketGameActive = false;
let ticketsFound = 0;
let ticketsNeeded = 15;
let ticketTimer = 45;
let ticketDifficulty = "НОВИЧОК";
let ticketBonus = 1;

document.getElementById('startTicketGame').onclick = startTicketGame;

function startTicketGame() {
    if (ticketGameActive) return;
    
    ticketGameActive = true;
    ticketsFound = 0;
    ticketsNeeded = 15 + player.factoryLevel * 5;
    ticketTimer = 45 - player.factoryLevel * 3;
    ticketBonus = 1 + player.factoryLevel * 0.5;
    
    const difficulties = ["НОВИЧОК", "ЛЁГКИЙ", "СРЕДНИЙ", "СЛОЖНЫЙ", "ЭКСПЕРТ"];
    ticketDifficulty = difficulties[Math.min(player.factoryLevel, 4)];
    
    document.getElementById('ticketsFound').textContent = ticketsFound;
    document.getElementById('ticketsNeeded').textContent = ticketsNeeded;
    document.getElementById('ticketTimer').textContent = ticketTimer;
    document.getElementById('ticketDifficulty').textContent = ticketDifficulty;
    document.getElementById('ticketBonus').textContent = `x${ticketBonus.toFixed(1)}`;
    document.getElementById('startTicketGame').style.display = 'none';
    
    const gameArea = document.getElementById('ticketGameArea');
    gameArea.innerHTML = '';
    
    player.totalGames++;
    
    // Таймер
    const timer = setInterval(() => {
        ticketTimer--;
        document.getElementById('ticketTimer').textContent = ticketTimer;
        
        if (ticketTimer <= 10) {
            document.getElementById('ticketTimer').style.color = '#ff4444';
        }
        
        if (ticketTimer <= 0) {
            endTicketGame(false);
            clearInterval(timer);
        }
    }, 1000);
    
    // Создание билетов
    const ticketInterval = setInterval(() => {
        if (!ticketGameActive) {
            clearInterval(ticketInterval);
            return;
        }
        
        if (document.querySelectorAll('.ticket').length < 8) {
            createTicket();
        }
    }, 800 - player.factoryLevel * 100);
}

function createTicket() {
    if (!ticketGameActive) return;
    
    const gameArea = document.getElementById('ticketGameArea');
    if (!gameArea) return;
    
    const ticket = document.createElement('div');
    ticket.className = 'ticket';
    ticket.style.left = Math.random() * 85 + '%';
    ticket.style.top = Math.random() * 80 + '%';
    
    const isFake = Math.random() < (0.2 + player.factoryLevel * 0.05);
    if (isFake) {
        ticket.classList.add('fake');
        ticket.style.background = 'linear-gradient(145deg, silver, #aaa, silver)';
        ticket.textContent = '💀 ПОДДЕЛКА';
    } else {
        ticket.textContent = '🎫 ЗОЛОТОЙ БИЛЕТ';
    }
    
    ticket.onclick = () => {
        if (!ticketGameActive) return;
        
        if (isFake) {
            player.chocolate = Math.max(0, player.chocolate - 3);
            ticket.style.animation = 'none';
            ticket.style.transform = 'scale(1.3) rotate(-15deg)';
            ticket.style.background = 'linear-gradient(145deg, #ff4444, #cc0000, #ff4444)';
            
            createFloatingMessage(
                '💀 ПОДДЕЛЬНЫЙ БИЛЕТ!\nШтраф: -3 🍫',
                '#ff4444'
            );
            
            setTimeout(() => {
                ticket.remove();
            }, 300);
        } else {
            ticketsFound++;
            player.chocolate += Math.floor(10 * ticketBonus);
            
            ticket.style.animation = 'none';
            ticket.style.transform = 'scale(1.5)';
            ticket.style.background = 'linear-gradient(145deg, #ffd700, #ffed4e, #ffd700)';
            ticket.style.boxShadow = '0 0 40px #ffd700';
            ticket.textContent = '🎉 НАЙДЕНО! +' + Math.floor(10 * ticketBonus) + '🍫';
            
            document.getElementById('ticketsFound').textContent = ticketsFound;
            updateUI();
            
            setTimeout(() => {
                ticket.remove();
            }, 500);
            
            if (ticketsFound >= ticketsNeeded) {
                endTicketGame(true);
            }
        }
        
        updateUI();
    };
    
    gameArea.appendChild(ticket);
    
    setTimeout(() => {
        if (ticket.parentNode) {
            ticket.style.opacity = '0';
            ticket.style.transform = 'scale(0.5)';
            setTimeout(() => ticket.remove(), 300);
        }
    }, 2500);
}

function endTicketGame(success) {
    ticketGameActive = false;
    
    const gameArea = document.getElementById('ticketGameArea');
    const totalReward = Math.floor(ticketsFound * 10 * ticketBonus);
    
    if (success) {
        player.chocolate += totalReward * 2;
        player.totalGames++;
        
        let message = `🏆 ПОБЕДА! ВСЕ БИЛЕТЫ НАЙДЕНЫ! 🏆\n\n`;
        message += `Найдено билетов: ${ticketsFound}/${ticketsNeeded}\n`;
        message += `Сложность: ${ticketDifficulty}\n`;
        message += `Бонус: x${ticketBonus.toFixed(1)}\n`;
        message += `Награда: ${totalReward * 2} 🍫\n\n`;
        message += `✨ ОТЛИЧНАЯ РАБОТА! ✨`;
        
        gameArea.innerHTML = `
            <div style="font-size: 2.5rem; margin: 40px 0; color: #8b4513; font-weight: bold;">
                🎊 ПОБЕДА! 🎊
            </div>
            <div style="font-size: 1.6rem; margin: 25px 0; white-space: pre-line; line-height: 1.8; color: #000000; font-weight: bold;">
                ${message}
            </div>
            <button id="restartTicketBtn" style="
                font-size: 1.8rem; 
                padding: 20px 40px; 
                margin: 30px auto;
                background: linear-gradient(145deg, #ff1493, #ffd700);
                color: white;
                border: none;
                border-radius: 15px;
                cursor: pointer;
                border: 5px solid white;
                box-shadow: 0 12px 30px rgba(255, 20, 147, 0.5);
                transition: all 0.3s;
                display: block;
            ">
                🔄 ИГРАТЬ СНОВА
            </button>
        `;
        
        // Добавляем обработчик для кнопки "Играть снова"
        const restartBtn = document.getElementById('restartTicketBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', startTicketGame);
        }
        
        createFloatingMessage(
            `🎖️ ЗОЛОТЫЕ БИЛЕТЫ НАЙДЕНЫ!\n+${totalReward * 2} 🍫`,
            '#ffd700'
        );
    } else {
        let message = `⏰ ВРЕМЯ ВЫШЛО! ⏰\n\n`;
        message += `Найдено билетов: ${ticketsFound}/${ticketsNeeded}\n`;
        message += `Сложность: ${ticketDifficulty}\n`;
        message += `Бонус: x${ticketBonus.toFixed(1)}\n`;
        message += `Награда: ${totalReward} 🍫\n\n`;
        message += `🎯 Попробуйте ещё раз!`;
        
        player.chocolate += totalReward;
        
        gameArea.innerHTML = `
            <div style="font-size: 2rem; margin: 40px 0; color: #8b4513; font-weight: bold;">
                ⌛ ИГРА ОКОНЧЕНА ⌛
            </div>
            <div style="font-size: 1.6rem; margin: 25px 0; white-space: pre-line; line-height: 1.8; color: #000000; font-weight: bold;">
                ${message}
            </div>
            <button id="restartTicketBtn" style="
                font-size: 1.8rem; 
                padding: 20px 40px; 
                margin: 30px auto;
                background: linear-gradient(145deg, #ff1493, #ffd700);
                color: white;
                border: none;
                border-radius: 15px;
                cursor: pointer;
                border: 5px solid white;
                box-shadow: 0 12px 30px rgba(255, 20, 147, 0.5);
                transition: all 0.3s;
                display: block;
            ">
                🔄 ИГРАТЬ СНОВА
            </button>
        `;
        
        // Добавляем обработчик для кнопки "Играть снова"
        const restartBtn = document.getElementById('restartTicketBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', startTicketGame);
        }
    }
    
    updateUI();
    saveGame();
    
    document.getElementById('startTicketGame').style.display = 'inline-block';
}

// ========== ИНИЦИАЛИЗАЦИЯ ИГРЫ ==========
loadGame();

// Обновление времени каждую минуту
setInterval(updatePlayTime, 60000);

// Обновление интерфейса каждые 10 секунд
setInterval(updateUI, 10000);

// Запуск анимации плавающих сообщений каждые 30 секунд
setInterval(() => {
    const messages = [
        "🎪 Добро пожаловать на фабрику Вонки!",
        "🍫 Не забывайте собирать шоколадки!",
        "🎁 Секретные рецепты ждут вас!",
        "✨ Волшебство повсюду!",
        "🏆 Станьте лучшим кондитером!"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const msgElement = document.createElement('div');
    msgElement.textContent = randomMsg;
    msgElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(139, 69, 19, 0.9);
        color: #ffd700;
        padding: 15px 30px;
        border-radius: 15px;
        font-size: 1.4rem;
        font-weight: bold;
        z-index: 999;
        border: 3px solid #ff1493;
        animation: fadeMessage 5s forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeMessage {
            0% { opacity: 0; top: 0; }
            20% { opacity: 1; top: 20px; }
            80% { opacity: 1; top: 20px; }
            100% { opacity: 0; top: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(msgElement);
    
    setTimeout(() => {
        document.body.removeChild(msgElement);
        document.head.removeChild(style);
    }, 5000);
}, 30000);
// ========== ФУНКЦИИ ПЕРЕЗАПУСКА ИГР ==========
function restartCandyGame() {
    candyGameActive = false;
    candyScore = 0;
    candyTimer = 30;
    candyLevel = 1;
    candySpeed = 800;
    
    const gameArea = document.getElementById('candyGameArea');
    gameArea.innerHTML = `
        <button id="startCandyGame" style="
            font-size: 2rem; 
            padding: 25px 50px; 
            margin: 50px auto;
            background: linear-gradient(145deg, #ff1493, #ffd700);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            border: 6px solid white;
            box-shadow: 0 15px 35px rgba(255, 20, 147, 0.5);
            transition: all 0.3s;
            display: block;
        ">
            🚀 НАЧАТЬ ШТУРМ КОНФЕТ!
        </button>
    `;
    
    document.getElementById('candyScore').textContent = candyScore;
    document.getElementById('candyTimer').textContent = candyTimer;
    document.getElementById('candyLevel').textContent = candyLevel;
    
    // Привязываем обработчик снова
    document.getElementById('startCandyGame').onclick = startCandyGame;
}

function restartTicketGame() {
    ticketGameActive = false;
    ticketsFound = 0;
    ticketsNeeded = 15;
    ticketTimer = 45;
    
    const gameArea = document.getElementById('ticketGameArea');
    gameArea.innerHTML = `
        <button id="startTicketGame" style="
            font-size: 2rem; 
            padding: 25px 50px; 
            margin: 50px auto;
            background: linear-gradient(145deg, #2196F3, #4CAF50);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            border: 6px solid white;
            box-shadow: 0 15px 35px rgba(33, 150, 243, 0.5);
            transition: all 0.3s;
            display: block;
        ">
            🚀 НАЧАТЬ ОХОТУ ЗА БИЛЕТАМИ!
        </button>
    `;
    
    document.getElementById('ticketsFound').textContent = ticketsFound;
    document.getElementById('ticketsNeeded').textContent = ticketsNeeded;
    document.getElementById('ticketTimer').textContent = ticketTimer;
    document.getElementById('ticketTimer').style.color = '';
    
    // Привязываем обработчик снова
    document.getElementById('startTicketGame').onclick = startTicketGame;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    loadGame();
    
    // Обновление времени каждую минуту
    setInterval(updatePlayTime, 60000);
    
    // Привязка обработчиков к кнопкам навигации по играм
    const gameButtons = document.querySelectorAll('.game-btn');
    gameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game');
            switchGame(gameId);
        });
    });
    
    // Инициализация обработчиков для кнопок игр
    document.getElementById('startCandyGame').onclick = startCandyGame;
    document.getElementById('startPuzzleBtn').onclick = startPuzzleGame;
    document.getElementById('checkRecipeBtn').onclick = checkRecipe;
    document.getElementById('resetPuzzleBtn').onclick = resetPuzzle;
    document.getElementById('hintBtn').onclick = hintRecipe;
    document.getElementById('startTicketGame').onclick = startTicketGame;
    
    // Показать первую игру по умолчанию
    switchGame('candyGame');
});

function switchGame(gameId) {
    // Скрыть все игровые секции
    const sections = document.querySelectorAll('.game-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Показать выбранную секцию
    const activeSection = document.getElementById(gameId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// Автоматическое обновление UI
setInterval(updateUI, 1000);