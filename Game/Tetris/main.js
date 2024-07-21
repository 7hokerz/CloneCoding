class Tetris{
    constructor (){//생성자
        this.level = 2;
        this.stageWidth = 10;//X축
        this.stageHeight = 20;//Y축
        this.stageCanvas = document.getElementById("stage");
        this.nextCanvas = document.getElementById("next");

        let cellWidth = this.stageCanvas.width / this.stageWidth;//한 셀의 너비
        let cellHeight = this.stageCanvas.height / this.stageHeight;//한 셀의 높이

        this.cellSize = cellWidth < cellHeight ? cellWidth : cellHeight;//한 셀의 사이즈(여기선 25가 되겠네)
        
        this.stageLeftPadding = (this.stageCanvas.width - this.cellSize * this.stageWidth) / 2;
        this.stageTopPadding = (this.stageCanvas.height - this.cellSize * this.stageHeight) / 2;

        this.blocks = this.createBlocks();//블록 정보
        this.deletedLines = 0;//총 지운 줄의 수

        window.onkeydown = (e) => {
            switch(e.keyCode){
                case 37://←
                    this.moveLeft(); break;
                case 38://↻
                    this.rotate(); break;
                case 39://→
                    this.moveRight(); break;
                case 40://↓
                    this.fall(); break;
            }
        }

        document.getElementById("left-button").onmousedown = () => this.moveLeft();
        document.getElementById("rotate-button").onmousedown = () => this.rotate();
        document.getElementById("right-button").onmousedown = () => this.moveRight();
        document.getElementById("fall-button").onmousedown = () => this.fall();
        
        //내가 추가한 기능(2)
        document.getElementById("start-button").onmousedown = () => this.startGame();
    }
    /*blocks[type]
        type: 모양, 색, 선 색, 그림자
        shape[angle][cell][x, y]
        angle: 각도(모양의 방향. 4가지)
        cell: 각 셀의 좌표값([cell][0] >> x, [cell][1] >> y)
    */
    createBlocks() {
        let blocks = [//블록의 종류들
            {
                shape: [[[-1, 0], [0, 0], [1, 0], [2, 0]],
                        [[0, -1], [0, 0], [0, 1], [0, 2]],
                        [[-1, 0], [0, 0], [1, 0], [2, 0]],
                        [[0, -1], [0, 0], [0, 1], [0, 2]]],

                color: "rgb(0, 255, 255)",//채우기 색
                highlight: "rgb(255, 255, 255)",//선 색
                shadow: "rgb(0, 128, 128)"//그림자 색
            },
            {
                shape: [[[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]]],
                color: "rgb(255, 255, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 128, 0)"
            },
            {
                shape: [[[0, 0], [1, 0], [-1, 1], [0, 1]],
                        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
                        [[0, 0], [1, 0], [-1, 1], [0, 1]],
                        [[-1, -1], [-1, 0], [0, 0], [0, 1]]],
                color: "rgb(0, 255, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 128, 0)"
            },
            {
                shape: [[[-1, 0], [0, 0], [0, 1], [1, 1]],
                        [[0, -1], [-1, 0], [0, 0], [-1, 1]],
                        [[-1, 0], [0, 0], [0, 1], [1, 1]],
                        [[0, -1], [-1, 0], [0, 0], [-1, 1]]],
                color: "rgb(255, 0, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 0, 0)"
            },{
                shape: [[[-1, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [1, -1], [0, 0], [0, 1]],
                        [[-1, 0], [0, 0], [1, 0], [1, 1]],
                        [[0, -1], [0, 0], [-1, 1], [0, 1]]],
                color: "rgb(0, 0, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 0, 128)"
            },
            {
                shape: [[[1, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [0, 0], [0, 1], [1, 1]],
                        [[-1, 0], [0, 0], [1, 0], [-1, 1]],
                        [[-1, -1], [0, -1], [0, 0], [0, 1]]],
                color: "rgb(255, 165, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 82, 0)"
            },
            {
                shape: [[[0, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [0, 0], [1, 0], [0, 1]],
                        [[-1, 0], [0, 0], [1, 0], [0, 1]],
                        [[0, -1], [-1, 0], [0, 0], [0, 1]]],
                color: "rgb(255, 0, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 0, 128)"
            }
        ]
        return blocks;
    }

    drawBlock(x, y, type, angle, canvas){
        let context = canvas.getContext("2d");
        let block = this.blocks[type];
        for(let i = 0;i < block.shape[angle].length; i++){
            this.drawCell(context, 
                x + (block.shape[angle][i][0] * this.cellSize),
                y + (block.shape[angle][i][1] * this.cellSize),
                this.cellSize,
                type
            );
        }
    }

    drawCell(context, cellX, cellY, cellSize, type){
        let block = this.blocks[type];
        let adjustedX = cellX + 0.5;
        let adjustedY = cellY + 0.5;
        let adjustedSize = cellSize - 1;
        context.fillStyle = block.color;
        context.fillRect(adjustedX, adjustedY, adjustedSize, adjustedSize);

        context.strokeStyle = block.highlight;
        context.beginPath();//새로운 경로
        context.moveTo(adjustedX, adjustedY + adjustedSize);//경로의 시작점
        context.lineTo(adjustedX, adjustedY);
        context.lineTo(adjustedX + adjustedSize, adjustedY);
        context.stroke();//선 그리기

        context.strokeStyle = block.shadow;
        context.beginPath();
        context.moveTo(adjustedX, adjustedY + adjustedSize);//경로의 시작점
        context.lineTo(adjustedX + adjustedSize, adjustedY + adjustedSize);
        context.lineTo(adjustedX + adjustedSize, adjustedY);
        context.stroke();//선 그리기
    }

    startGame(){//시작
        //스테이지 초기화
        let virtualStage = new Array(this.stageWidth);
        for(let i = 0; i < this.stageWidth;i++){
            virtualStage[i] = new Array(this.stageHeight).fill(null);
        }
        this.virtualStage = virtualStage;
        this.currentBlock = null;//현재 블록
        this.nextBlock = this.getRandomBlock();//무작위 블록

        //start 버튼 숨김
        document.getElementById("start-button").style.display = "none";
        this.mainLoop();
    }

    mainLoop(){//블록을 놓을 수 있는 동안 무한 루프
        if(this.currentBlock == null){//현재 블록이 정해지지 않은 경우
            if(!this.createNewBlock()){//새 블록을 생성
                //게임 오버 시 start 버튼 다시 보이게
                document.getElementById("start-button").style.display = "block";
                return;//블록을 만들 수 없으면 리턴
            }
        }else{//블록을 떨어뜨림
            this.fallBlock();
        }
        this.drawStage();//스테이지 그리기
        if(this.currentBlock != null){//블록을 그리기
            this.drawBlock(this.stageLeftPadding + this.blockX * this.cellSize,
                this.stageTopPadding + this.blockY * this.cellSize,
                this.currentBlock, this.blockAngle, this.stageCanvas
            );
        }
        setTimeout(this.mainLoop.bind(this), 500);//항상 this(Tetris?)를 참조
    }

    createNewBlock(){//새 블록 생성
        this.currentBlock = this.nextBlock;//현재 블록을 다음 블록으로
        this.nextBlock = this.getRandomBlock();//다음 블록은 랜덤하게 생성
        this.blockX = Math.floor(this.stageWidth / 2 - 2);
        this.blockY = 0;
        this.blockAngle = 0;
        this.drawNextBlock();//새로운 다음 블록 그리기

        //블록이 모두 차 새로운 블록을 놓을 수 없으면 false 리턴
        if(!this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, this.blockAngle)){
            let messageElem = document.getElementById("message");
            messageElem.innerText = "GAME OVER";
            return false;
        }
        return true;
    }

    drawNextBlock(){//캔버스 초기화 및 다음 블록 그리기
        this.clear(this.nextCanvas);
        this.drawBlock(this.cellSize * 2, this.cellSize, this.nextBlock,
            0, this.nextCanvas
        );
    }

    getRandomBlock(){//무작위 수 생성(소수부 버림)
        return Math.floor(Math.random() * 7);
    }

    fallBlock(){//블록 이동 가능하면 좌표 값 +1, 아니면 블록 고정 및 현재 블록 null로 설정
        if(this.checkBlockMove(this.blockX, this.blockY + 1, this.currentBlock, this.blockAngle)){
            this.blockY++;
        }else{
            this.fixBlock(this.blockX, this.blockY, this.currentBlock, this.blockAngle);
            this.currentBlock = null;
        }
    }

    checkBlockMove(x, y, type, angle){//위치 및 각도로 블록 이동 가능 여부 확인
        for(let i = 0;i < this.blocks[type].shape[angle].length;i++){
            let cellX = x + this.blocks[type].shape[angle][i][0];
            let cellY = y + this.blocks[type].shape[angle][i][1];
            if(cellX < 0 || cellX > this.stageWidth - 1){
                return false;
            }//범위를 벗어나는 경우
            if(cellY > this.stageHeight - 1){
                return false;
            }//범위를 벗어나는 경우
            if(this.virtualStage[cellX][cellY] != null){
                return false;
            }//블록이 존재하는 경우
        }
        return true;
    }

    fixBlock(x, y, type, angle){
        for(let i = 0;i < this.blocks[type].shape[angle].length; i++){
            let cellX = x + this.blocks[type].shape[angle][i][0];
            let cellY = y + this.blocks[type].shape[angle][i][1];
            if(cellY >= 0){
                this.virtualStage[cellX][cellY] = type;
            }
        }
        for(let y = this.stageHeight - 1; y >= 0;){
            let filled = true;
            for(let x = 0; x < this.stageWidth; x++){
                if(this.virtualStage[x][y] == null){
                    filled = false;//채워지지 않은 경우로 변경
                    break;
                }
            }
            if(filled){//채워진 경우(즉 한 줄을 삭제 가능한 경우)
                for(let y2 = y;y2 > 0; y2--){
                    for(let x = 0; x < this.stageWidth; x++){
                        this.virtualStage[x][y2] = this.virtualStage[x][y2 - 1];
                    }
                }
                for(let x = 0;x < this.stageWidth; x++){
                    this.virtualStage[x][0] = null;
                }
                let linesElem = document.getElementById("lines");
                this.deletedLines++;//블록 삭제 및 지운 줄의 개수 증가
                linesElem.innerText = "" + this.deletedLines;
            }else{
                y--;
            }
        }
    }

    drawStage(){
        this.clear(this.stageCanvas);//캔버스 초기화

        let context = this.stageCanvas.getContext("2d");
        for(let x = 0;x < this.virtualStage.length; x++){
            for(let y = 0;y < this.virtualStage[x].length; y++){
                if(this.virtualStage[x][y] != null){//각 셀이 비어있지 않으면 셀을 그리기
                    this.drawCell(context,
                        this.stageLeftPadding + (x * this.cellSize),
                        this.stageTopPadding + (y * this.cellSize),
                        this.cellSize,
                        this.virtualStage[x][y]
                    );
                }
            }
        }
    }

    moveLeft(){//왼쪽으로 이동
        if(this.checkBlockMove(this.blockX - 1, this.blockY, this.currentBlock, this.blockAngle)){
            this.blockX--;
            this.refreshStage();
        }
    }

    moveRight(){//오른쪽으로 이동
        if(this.checkBlockMove(this.blockX + 1, this.blockY, this.currentBlock, this.blockAngle)){
            this.blockX++;
            this.refreshStage();
        }
    }

    rotate(){//회전
        let newAngle = (this.blockAngle + 1) % 4;//나머지 연산으로 고침(1)

        if(this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, newAngle)){
            this.blockAngle = newAngle;
            this.refreshStage();
        }
    }

    fall(){//가장 아래로 떨어뜨리기
        while(this.checkBlockMove(this.blockX, this.blockY + 1, this.currentBlock, this.blockAngle)){
            this.blockY++;
            this.refreshStage();
        }
    }

    refreshStage(){//스테이지 초기화 및 스테이지 및 블록 다시 그리기
        this.clear(this.stageCanvas);
        this.drawStage();
        this.drawBlock(this.stageLeftPadding + this.blockX * this.cellSize,
            this.stageTopPadding + this.blockY * this.cellSize,
            this.currentBlock, this.blockAngle, this.stageCanvas
        );
    }

    clear(canvas){//캔버스를 검은색으로 모두 채우기(즉 지우기)
        let context = canvas.getContext("2d");
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}
/*
window.onkeydown: 키보드 이벤트 감지 및 처리 이벤트 핸들러
예:
window.onkeydown = function(event) {
  console.log("Key pressed: " + event.key);
};
- key: 눌린 키의 값을 문자열로 반환
- code: 눌린 키의 물리적인 키 코드를 반환
- keyCode: 눌린 키의 유니코드 반환(이 속성은 더 이상 권장되지 않음)

onmousedown: 마우스 버튼을 누를 때 발생하는 이벤트


bind(객체): 함수의 this 값을 명시적으로 설정, 선택적으로 일부 인수를 미리
지정하는 방법 제공(고정된 this 값을 필요로 할 때 유용)


canvas.getContext: 캔버스 렌더링 컨텍스트 반환(2D, 3D 등..)
.getContext("2d"): 2d 그래픽
.fillstyle: 채우기 색 지정
.fillRect(x,y,width,height): 위치, 크기, 길이 지정
.strokeStyle: 선 색 지정

.beginPath(): 새로운 도형이나 경로를 그릴 때 사용
.moveTo(x, y): 경로의 시작점 설정
.lineTo(x, y): 지나가는 경로 정의
.stroke(): 선 그리기



+ 내가 고친 부분

(1)
if (this.blockAngle < 3) {
    newAngle = this.blockAngle + 1;
} else {
    newAngle = 0;
}

(2)
start 버튼을 만들어서 버튼을 누르면 게임을 시작하고, 버튼을 숨김.
게임 오버 시 다시 버튼이 보이게 하여 다시 시작 가능
*/