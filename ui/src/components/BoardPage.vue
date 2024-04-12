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
              <b-card :header="user1.name" align="center">
                <p>Win Rate: {{ Number(user1.winRate).toFixed(2) }} %</p>
                <p>Total Games: {{ user1.games }}</p>
              </b-card>
              <b-card :header="user2.name" align="center">
                <p>Win Rate: {{ Number(user2.winRate).toFixed(2) }} %</p>
                <p>Total Games: {{ user2.games}} </p>
              </b-card>
            </b-card-group>
            <b-button v-if="gameEnded" @click="leaveRoom">Leave Room</b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { io } from 'socket.io-client';
  import { GameSocket } from '../gameSocket';
  import { routerKey, useRoute, useRouter } from 'vue-router';
  import { Data } from '../data';
  const router = useRouter();
  const route = useRoute();
  const roomId = route.query.roomId;
  const userId = route.query.userId;
  const  user1 = ref({
    name: route.query.user1name,
    avatar : route.query.user1avatar,
    games : route.query.user1games,
    winRate : route.query.user1winRate
  })
const user2 = ref({
    name: route.query.user2name,
    avatar : route.query.user2avatar,
    games : route.query.user2games,
    winRate : route.query.user2winRate
})


  // alert(userId);

  const currentPlayer = ref('Alice');
  const timeLeft = ref(13);
  // pieces is a 15 * 15 array initialized with all 0
  const chessboard = ref(Array.from({ length: 15 }, () => Array(15).fill(0)));
  const gameEnded = ref(false);
  let timer = null;
  
  // 初始化棋盘
  const gameSocket = new GameSocket('http://localhost:8181', localStorage.getItem('token'));
  onMounted(() => {
    // initialize the chessboard
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        chessboard.value[i][j] = 0;
      }
    }
    // connect to the server
    gameSocket.connect(localStorage.getItem('token'));
    gameSocket.onGameStart((res) => {

      console.log('Game started');
        updateGameState(res.board, res.round);
    });
    gameSocket.onGameState((res) => {
      console.log('Game state updated');
        updateGameState(res.board, res.round);
    });
    gameSocket.onGameEnd((res) => {
      let winner = res.winner === 1 ? user1.value.name : user2.value.name;
        alert(`Game ended. Winner is ${winner}`);
        updateGameState(res.board, 2);
        gameEnded.value = true;
    });
    gameSocket.getGameState(roomId);


  });
  
function updateGameState(board, round) {
  // alert('Game state updated');
  console.log(board);
    chessboard.value = board;
    currentPlayer.value = round === 1 ? user1.value.name : user2.value.name;

}

function leaveRoom() {
  router.push('/');
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
        gameSocket.placePiece(roomId, gridX, gridY, userId);
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
  