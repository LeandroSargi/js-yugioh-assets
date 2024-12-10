const state = {
    score: {
        playerScore: 0,
        computerScore: 0,
        scoreBox: document.getElementById("score_points"),
    },
    cardSprites: {
        avatar: document.getElementById("card-image"),
        name: document.getElementById("card-name"),
        type: document.getElementById("card-type"),
    },
    fieldCards: {
        player: document.getElementById("player-field-card"),
        computer: document.getElementById("computer-field-card")
    },
    playerSides: {
        player1: "player-cards",
        computer: "computer-cards",
        player1BOX: document.querySelector("#player-cards"),
        computerBOX: document.querySelector("#computer-cards"),
    },
    actions: {
        button: document.getElementById("next-duel"),
    }
};

const pathImages = "./src/assets/icons/";

const cardData = [
    {
        id: 0,
        name: "Blue Eyes White Dragon",
        type: "Paper",
        img: `${pathImages}dragon.png`,
        winOf: [1],
        loseOf: [2],
    },
    {
        id: 1,
        name: "Dark Magician",
        type: "Rock",
        img: `${pathImages}magician.png`,
        winOf: [2],
        loseOf: [0],
    },
    {
        id: 2,
        name: "Exodia",
        type: "Scissors",
        img: `${pathImages}exodia.png`,
        winOf: [0],
        loseOf: [1],
    },
];

async function getRandomCardId() {
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex]; // Retorna o card aleatório
}

async function createCardImage(randomIdCard, fieldSide) {
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", "100px");
    cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
    cardImage.setAttribute("data-id", randomIdCard.id);
    cardImage.classList.add("card");

    if (fieldSide === state.playerSides.player1) {
        // Corrigido para passar o índice correto
        cardImage.addEventListener("mouseover", () => {
            drawSelectCard(randomIdCard.id);  // Passa o id do card como índice
        });
        cardImage.addEventListener("click", () => {
            setCardsField(cardImage.getAttribute("data-id"));
        });
    }

    return cardImage;
}

async function setCardsField(cardId) {
    // Remover todas as cartas antigas *antes* de colocar as novas
    await removeAllCardsImages();
    
    // Colocar as novas cartas no campo
    let computerCard = await getRandomCardId(); // Agora retornando um objeto de carta

    await showHiddenCardFieldsImages(true);
    await hiddenCardDetails();
    await drawCardsInfield(cardId, computerCard.id);

    // Verificar os resultados do duelo e atualizar a pontuação
    let duelResults = await checkDuelResults(cardId, computerCard);

    await updateScore();
    await drawButton(duelResults);

}

async function drawCardsInfield(cardId, computerCardId) {
    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;
}

async function showHiddenCardFieldsImages(value) {
    if (value === true) {
        state.fieldCards.player.style.display = "block";
        state.fieldCards.computer.style.display = "block";
    }

    if (value === false) {
        state.fieldCards.player.style.display = "none";
        state.fieldCards.computer.style.display = "none";
    }
}

async function hiddenCardDetails() {
    state.cardSprites.avatar.src = "";
    state.cardSprites.name.innerText = "";
    state.cardSprites.type.innerText = "";
}

async function drawButton(text) {
    state.actions.button.innerText = text;
    state.actions.button.style.display = "block";

}

async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function checkDuelResults(playerCardId, computerCard) {
    let duelResults = "draw";
    let playerCard = cardData[playerCardId];
    
    if(playerCard.winOf.includes(computerCard.id)) {
        duelResults = "win";
        state.score.playerScore++;
    }

    if(playerCard.loseOf.includes(computerCard.id)) {
        duelResults = "lose";
        state.score.computerScore++;
    }
    
    await playAudio(duelResults);
    return duelResults;
}

async function removeAllCardsImages() {
    // Garantir que estamos removendo as cartas dos campos corretos
    let { computerBOX, player1BOX } = state.playerSides;

    let imgElements = computerBOX.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());

    imgElements = player1BOX.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());
}

async function drawSelectCard(index) {
    // Acessa o card diretamente pelo índice
    const card = cardData[index];  
    state.cardSprites.avatar.src = card.img;
    state.cardSprites.name.innerText = card.name;
    state.cardSprites.type.innerText = `Attribute: ${card.type}`;
}

async function drawCards(cardNumbers, fieldSide) {
    const fieldElement = document.getElementById(fieldSide);

    if (!fieldElement) {
        console.error(`Elemento com ID "${fieldSide}" não encontrado.`);
        return;
    }

    // Adiciona as cartas no campo
    for (let i = 0; i < cardNumbers; i++) {
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide); 
        fieldElement.appendChild(cardImage);
    }
}

async function resetDuel() {
    state.cardSprites.avatar.src = ""
    state.actions.button.style.display = "none"
    state.fieldCards.player.style.display = "none"
    state.fieldCards.computer.style.display = "none"
    init();
}

async function playAudio(status) {
    const audio = new Audio(`./src/assets/audios/${status}.wav`);
    try {
        audio.play();
    } catch {}

}

function init() {
    showHiddenCardFieldsImages(false);
    drawCards(5, state.playerSides.player1);  // 5 cartas para o jogador
    drawCards(5, state.playerSides.computer);  // 5 cartas para o computador

    const bgm = document.getElementById("bgm");
    bgm.play();
};

init();
