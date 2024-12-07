var board1 = Chessboard('board1', 'start')
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var whiteTime = 300; // 5 minutes in seconds
var blackTime = 300; // 5 minutes in seconds
var whiteTimeout = 120; // 2 minutes in seconds
var blackTimeout = 120; // 2 minutes in seconds
var currentTimer = null;
var currentTimeout = null;

function startTimer() {
  if (currentTimer) clearInterval(currentTimer);
  currentTimer = setInterval(function() {
    if (game.turn() === 'w') {
      whiteTime--;
      whiteTimeout--;
      updateTimerDisplay('white', whiteTime, whiteTimeout);
      if (whiteTimeout === 0) {
        alert("Black wins! White didn't respond in time.");
        clearInterval(currentTimer);
        game.reset();
        updateStatus();
      }
    } else {
      blackTime--;
      blackTimeout--;
      updateTimerDisplay('black', blackTime, blackTimeout);
      if (blackTimeout === 0) {
        alert("White wins! Black didn't respond in time.");
        clearInterval(currentTimer);
        game.reset();
        updateStatus();
      }
    }
  }, 1000); // update every second
}

function updateTimerDisplay(player, time, timeout) {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;
  var timeoutMinutes = Math.floor(timeout / 60);
  var timeoutSeconds = timeout % 60;
  if (player === 'white') {
    $('#white-timer').text(`White: ${minutes}:${seconds < 10 ? '0' : ''}${seconds} (${timeoutMinutes}:${timeoutSeconds < 10 ? '0' : ''}${timeoutSeconds})`);
  } else {
    $('#black-timer').text(`Black: ${minutes}:${seconds < 10 ? '0' : ''}${seconds} (${timeoutMinutes}:${timeoutSeconds < 10 ? '0' : ''}${timeoutSeconds})`);
  }
}

function onMove() {
  if (game.turn() === 'w') {
    whiteTimeout = 120; // reset white timeout
  } else {
    blackTimeout = 120; // reset black timeout
  }
  updateStatus();
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  onMove();
  updateStatus();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
    alert('Game over, ' + moveColor + ' is in checkmate.')
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
    alert('Game over, drawn position')
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())

  startTimer(); // start/restart the timer when the status is updated
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('board1', config)

startTimer(); // start the timer initially
updateStatus();
