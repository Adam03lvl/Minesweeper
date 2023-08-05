
export const TILE_STATUS={
    HIDDEN: 'hidden',
    MARKED: 'marked',
    MINE: 'mine',
    NUMBER: 'number'
}

export function createBoard(boardSize,numberOfMines){
    const board=[]
    const minePositions=getMinePostions(boardSize,numberOfMines)
    for(let y=0;y<boardSize;y++){
        const row=[] 
        for(let x=0;x<boardSize;x++){
            const element = document.createElement('div') 
            element.dataset.status=TILE_STATUS.HIDDEN 
            const tile={
                element,
                set:false,
                x,
                y,
                isMine: minePositions.some(p=>positionMatch(p,{x,y})),
                get status(){
                    return this.element.dataset.status
                },
                set status(value){
                    this.element.dataset.status=value 
                }
            } 
            row.push(tile)
        }
        board.push(row)
    }
    return board
}

export function revealTile(board,tile){
    if(tile.status===TILE_STATUS.MARKED)return

    if(tile.isMine){
        tile.status=TILE_STATUS.MINE
        tile.element.textContent='💣'
        return
    }
    
    if(tile.set){
        let marked=0
        const adjacent=calcProxy(board,tile)
        const mines=adjacent.filter(t=>t.isMine)

        adjacent.forEach(tile=>{
            if (tile.status===TILE_STATUS.MARKED)marked++ 
        })

        if (marked>=mines.length) {
            adjacent.forEach(tile=>{
                if(!tile.set)revealTile(board,tile)
            })
        }
    }

    if (tile.status===TILE_STATUS.HIDDEN ) {
        tile.status=TILE_STATUS.NUMBER    

        const adjacent=calcProxy(board,tile)
        const mines=adjacent.filter(t=>t.isMine) 
        if (mines.length===0) {
            adjacent.forEach(tile=>{
                revealTile(board,tile)
            })    
        }else{
            tile.element.textContent=mines.length
            tile.set=true
        }
    }   
}

function calcProxy(board,tile){
    const proxy=[] 
    for (let y = -1; y <= 1; y++) {
        for (let x = -1; x < 2; x++) {
            if (board?.[tile.y+y]?.[tile.x+x]) {
                proxy.push(board[tile.y+y][tile.x+x])    
            }
        }  
    }
    return proxy
}

export function markTile(tile){
    if (tile.status!==TILE_STATUS.HIDDEN && tile.status!==TILE_STATUS.MARKED) {
        return 
    } 
    if (tile.status==TILE_STATUS.MARKED) {
        tile.status=TILE_STATUS.HIDDEN
    }else{
        tile.status=TILE_STATUS.MARKED
    }
}

function getMinePostions(boardSize,numberOfMines){
    const mines=[] 
    while(mines.length<numberOfMines){
        const position={
            x:Math.floor(Math.random()*boardSize),
            y:Math.floor(Math.random()*boardSize)
        }
        if (!mines.some(p=>positionMatch(p,position))) {
            mines.push(position) 
        }
    }
    return mines
}

function positionMatch(a,b) { 
    return a.x==b.x && a.y==b.y
}