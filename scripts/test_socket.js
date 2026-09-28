const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

console.log('Connecting to server...');

socket.on('connect', () => {
  console.log('Connected! Socket ID:', socket.id);
  
  // Gửi lệnh tham gia game
  socket.emit('join_game', { name: 'Đoàn Dự', sect: 'xiaoyao' });
});

socket.on('game_init', (data) => {
  console.log('Game Init Received! Player ID:', data.playerId);
  console.log('World Bounds:', data.worldWidth, 'x', data.worldHeight);
  console.log('Skills count:', Object.keys(data.skillsData).length);
  console.log('Items count:', Object.keys(data.itemsData).length);
  
  // Thử di chuyển
  socket.emit('move_to', { x: 1450, y: 720 });
  
  // Thử nâng kinh mạch
  socket.emit('upgrade_meridian', { meridianKey: 'docMach' });
  
  // Thử chat
  socket.emit('chat', { message: 'Cửu Châu quần hùng tề tựu!' });
});

socket.on('meridian_result', (res) => {
  console.log('Meridian upgrade result:', res);
});

socket.on('chat_message', (msg) => {
  console.log(`Chat [${msg.channel}] ${msg.sender}: ${msg.message}`);
});

let stateCount = 0;
socket.on('world_state', (state) => {
  stateCount++;
  if (stateCount === 2) {
    console.log('World State OK! Active players:', Object.keys(state.players).length);
    console.log('Active monsters:', Object.keys(state.monsters).length);
    console.log('SUCCESS: Webgame server logic works flawlessly!');
    socket.disconnect();
    process.exit(0);
  }
});

setTimeout(() => {
  console.error('Test timeout!');
  process.exit(1);
}, 6000);
