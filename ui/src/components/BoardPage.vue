<template>
    <div>
      <b-container>
        <b-row>
          <b-col>
            <div>
    <svg id="chessboard" width="480" height="480" @click="placePiece">
        <rect x="0" y="0" width="100%" height="100%" fill="#FFC" />
      <!-- horizontal line -->
      <line
        v-for="i in 15"
        :key="'h' + i"
        :x1 ="30"
        :y1="i * 30"
        :x2="450"
        :y2="i * 30"
        stroke="black"
      />
      <!-- vertical line -->
      <line
        v-for="i in 15"
        :key="'v' + i"
        :x1="i * 30"
        :y1="30"
        :x2="i * 30"
        :y2="450"
        stroke="black"
      />
        <!-- pieces -->
        <template v-for="(row, rowIndex) in chessboard">
        <circle v-for="(col, colIndex) in row" 
            :key="`${rowIndex}-${colIndex}`"
            :cx="colIndex * 30 + 30" 
            :cy="rowIndex * 30 + 30" 
            r="12" 
            :fill="col === 1 ? 'black' : col === 2 ? 'white' : 'none'" 
        />
        </template>
 </svg>
  </div>
          </b-col>
          <b-col>
            <!-- player info and counter -->
            <b-card
              :header="currentPlayer" 
              header-tag="header"
              header-bg-variant="primary"
              header-text-variant="white"
              align="center"
            >
              <b-progress :value="timeLeft" max="13" animated></b-progress>
              <b-button @click="resetTimer">Reset Timer</b-button>
            </b-card>
            <b-card-group deck>
              <b-card header="Alice" align="center">
                <p>Win Rate: 96%</p>
                <p>Total Games: 100</p>
              </b-card>
              <b-card header="Bob" align="center">
                <p>Win Rate: 33%</p>
                <p>Total Games: 23</p>
              </b-card>
            </b-card-group>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { io } from 'socket.io-client';
  import { GameSocket } from '../gameSocket';
  import { useRoute, useRouter } from 'vue-router';
  const route = useRoute();
  const userId = route.query.userId;
  // alert(userId);

  const currentPlayer = ref('Alice');
  const timeLeft = ref(13);
  // pieces is a 15 * 15 array initialized with all 0
  const chessboard = ref(Array.from({ length: 15 }, () => Array(15).fill(0)));

  let timer = null;
  
  // 初始化棋盘
  const gameSocket = new GameSocket('http://localhost:8181');
  onMounted(() => {
    // initialize the chessboard
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        chessboard.value[i][j] = 0;
      }
    }
    // connect to the server
    gameSocket.connect("your_jwt_token_here");
    gameSocket.onGameStart((res) => {

      console.log('Game started');
        updateGameState(res.board, res.round);
    });
    gameSocket.onGameState((res) => {
      console.log('Game state updated');
        updateGameState(res.board, res.round);
    });
    gameSocket.onGameEnd((res) => {
        alert(`Game ended. Winner is ${res.winner}`);
        updateGameState(res.board, 2);
    });

  });
  
function updateGameState(board, round) {
  // alert('Game state updated');
  console.log(board);
    chessboard.value = board;
    currentPlayer.value = round === 1 ? 'Alice' : 'Bob';

}

  // 计时器函数
  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
    }, 13000);
  }
  

  function placePiece(event) {
    const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left - 30; 
  const y = event.clientY - rect.top - 30; 

  const gridSize = rect.width / 15; 
  const gridX = Math.round(x / 30);
  const gridY = Math.round(y / 30);

      // place the piece
      if (gridX < 0 || gridX >= 15 || gridY < 0 || gridY >= 15 || chessboard.value[gridY][gridX] !== 0) {
        return;
      }
        gameSocket.placePiece("roomId1", gridX, gridY, userId);
    //   chessboard.value[gridY][gridX] = currentPlayer.value === 'Alice' ? 1 : 2;

    //   currentPlayer.value = currentPlayer.value === 'Alice' ? 'Bob' : 'Alice';
      resetTimer();
  }
  


  </script>
  
  <style scoped>
  /* 添加你的样式 */
  #chessboard {
    /* 棋盘样式 */
  }
  circle {
    /* 棋子样式 */
  }
  </style>
  