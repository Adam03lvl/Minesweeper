import {TILE_STATUS, createBoard, markTile, revealTile} from './minesweeper.js'
const {ipcRenderer}=require('electron')
const ipc=ipcRenderer

document.getElementById("closeBtn").addEventListener("click", ()=>{
    ipc.send('close')
});

var DIFFICULTY=document.getElementById('diff').value
var BOARD_SIZE=10
var NUMBER_OF_MINES=BOARD_SIZE*DIFFICULTY
var board = createBoard(BOARD_SIZE,NUMBER_OF_MINES)
var gameend=false
var counter=null

const timer=document.getElementById('timer')
const boardElement=document.querySelector('#board')
const minesLeft=document.getElementById('mines-left')
const startButton=document.getElementById('update')
startButton.addEventListener('click',start)
window.addEventListener('load',start)

function start(){  
    startTimer()
    boardElement.innerHTML=''

    BOARD_SIZE=document.getElementById('size').value||10
    DIFFICULTY=document.getElementById('diff').value
    NUMBER_OF_MINES=BOARD_SIZE*DIFFICULTY

    board = createBoard(BOARD_SIZE,NUMBER_OF_MINES)
    boardElement.style.setProperty('--size',BOARD_SIZE)
    minesLeft.textContent=NUMBER_OF_MINES
    board.forEach(row=>{
    row.forEach(tile=>{
        boardElement.append(tile.element)
        tile.element.addEventListener('click',(e)=>{
            e.preventDefault()
            revealTile(board,tile)
            checkLose()
            checkWin()
        })
        tile.element.addEventListener('contextmenu',(e)=>{
            e.preventDefault()
            markTile(tile)
            listMinesLeft()
            checkWin()
        })
    })
})
}

function startTimer(){
    let minutes=0
    let seconds=0
    if(counter)clearInterval(counter)
    counter= setInterval(()=>{
        if (seconds<60) seconds++
        else{
            seconds=0
            minutes++
        } 
        if(seconds<10)timer.innerText=minutes+':0'+seconds
        else timer.innerText=minutes+':'+seconds
    },1000) 
}

function listMinesLeft(){
    let count=0 
    board.forEach(row=>{
        row.forEach(tile=>{
            if(tile.status===TILE_STATUS.MARKED)count++
        })
    })
    minesLeft.textContent=NUMBER_OF_MINES-count
}

function checkLose(){
    board.forEach(row=>{
        row.forEach(tile=>{
            if(tile.status===TILE_STATUS.MINE){
                gameend=true
                board.forEach(row=>{
                    row.forEach(tile=>{
                        if(tile.isMine){
                            tile.status=TILE_STATUS.MINE
                            tile.element.textContent='💣'
                        }
                    })
                })
                clearInterval(counter)
                setTimeout(()=>{
                    const loss=document.createElement('button')
                    loss.textContent='YOU LOSE'
                    loss.className='you lose'
                    loss.addEventListener('click',restart)
                    loss.addEventListener('mouseover',()=>{
                        loss.textContent='REPLAY?'
                    })
                    loss.addEventListener('mouseout',()=>{
                        loss.textContent='YOU LOSE'
                    })
                    document.body.append(loss)                
                },300)
            }
        })
    }) 
    
}

function checkWin(){
    let markedMines=0
    let hidden=0
    board.forEach(row=>{
        row.forEach(tile=>{
            if(tile.isMine&&tile.status===TILE_STATUS.MARKED)markedMines++
            if(tile.status===TILE_STATUS.HIDDEN && !tile.isMine)hidden++
        })
    })

    if(markedMines!==NUMBER_OF_MINES && hidden!==0)return

    gameend=true
    clearInterval(counter)
    setTimeout(()=>{
        const win=document.createElement('button')
        win.textContent='YOU WIN'
        win.className='you win'
        win.addEventListener('click',restart)
        win.addEventListener('mouseover',()=>{
            win.textContent='REPLAY?'
        })
        win.addEventListener('mouseout',()=>{
            win.textContent='YOU WIN'
        })
        document.body.append(win)                
    },300)
}

function restart(){
    gameend=false
    document.querySelectorAll('.you').forEach(e=>{e.remove()})
    start()   
}

