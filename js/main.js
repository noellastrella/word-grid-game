(()=>{

//-- VARIABLES ----------------------------------------------------------------------------
    let tiles = [];
    let words = [];
    let wordsGuessed = [];
    let score = 0;
    let selectedLetters = [];
    let reset = false;
    let currLVL = 1; 
    let errorMsg = "";

    const randomtimer = 100;
    const minTimer = 100;
    const bonusMultiplier = 100;
    const fps = 35;  //affects render 
    const tileCount = 25;
    const bonusDegradationRate = .2; // bonusMultiplier is divided by (1 + bonusDegradationRate)

    let highScore = localStorage.getItem("highScore")?localStorage.getItem("highScore"):0;

    const letters = [
        //main set of letters
        {letter: "A", val: 1}, {letter: "B", val: 2}, {letter: "C", val: 3},
        {letter: "D", val: 4}, {letter: "E", val: 1}, {letter: "F", val: 5},
        {letter: "G", val: 5}, {letter: "H", val: 4}, {letter: "I", val: 1},
        
        {letter: "J", val: 7}, {letter: "K", val: 8}, {letter: "L", val: 3},
        {letter: "M", val: 3}, {letter: "N", val: 3}, {letter: "O", val: 1},
        {letter: "P", val: 3}, {letter: "Q", val: 7}, {letter: "R", val: 2},
        
        {letter: "S", val: 2}, {letter: "T", val: 2}, {letter: "U", val: 1},
        {letter: "V", val: 5}, {letter: "W", val: 5}, {letter: "X", val: 7},
        {letter: "Y", val: 8}, {letter: "Z", val: 10},

        //extra letters
        {letter: "B", val: 2},  {letter: "C", val: 3},  {letter: "D", val: 4},
        {letter: "L", val: 3},  {letter: "M", val: 3},  {letter: "N", val: 3},
        {letter: "P", val: 3},  {letter: "R", val: 2},  {letter: "S", val: 2},
        {letter: "T", val: 2},

        //extra vowels
        {letter: "A", val: 1}, {letter: "E", val: 1}, {letter: "I", val: 1},
        {letter: "O", val: 1}, {letter: "U", val: 1}, {letter: "A", val: 1},
        {letter: "E", val: 1}, {letter: "I", val: 1}, {letter: "O", val: 1},
        {letter: "U", val: 1},

        //★ ✪ 💣 ⏰
        {letter: "⏰", val: 0}, {letter: "💣", val: 0}, //{letter: "x2", val: 0},
    ]

    let upComingLetters =[];
    
    for(let i=0; i<15; i++) addUpcoming(i);

//-- FETCH ----------------------------------------------------------------------------

    var wordFile = './js/wordlist/wordsFiltered.json' +"?num="+Math.random();  //'/js/wordlist/words273k.json'
  
    fetch(wordFile)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        words = data.reduce((acc,curr)=>{
            curr.length > 3 && acc.push(curr)
            return acc;
        }, []);
        init();
      })
      .catch(error => console.error('Fetch error:', error) );

//-- INIT ----------------------------------------------------------------------------

    function init(){
        populateTiles();

        document.querySelector("#clear").addEventListener("click", clearLetters)
        document.querySelector("#submit").addEventListener('click', checkWord)
        document.querySelector("#reset").addEventListener("click", gameOver)
        document.querySelector("#restart").addEventListener("click", resetState)
        document.addEventListener("keydown", (e)=>{if(e.key=="Enter") checkWord();})

        updateState();
        checkUpcoming();
        render();
    }
//-- POPULATE TILES -------------------------------------------------------------------------

function populateTiles(){
    document.querySelector("#game-grid").innerHTML = "";
    for(let i=0; i<tileCount; i++){
        tiles.push(createTile());
        populateTile(tiles[i], letters[Math.floor(Math.random()*letters.length)])
        document.querySelector("#game-grid").appendChild (tiles[i]);
        tiles[i].addEventListener("click", addLetter);
    }
}

//-- GAME OVER ------------------------------------------------------------------------------

function gameOver(){
    document.querySelector("#game-over").classList.remove("hidden");
}

//-- RESET STATE ----------------------------------------------------------------------------

    function resetState(e){
        reset = true;
        
        wordsGuessed = [];
        selectedLetters = [];
        tiles = [];

        score = 0;
        bonusTime = 0;
        
        document.querySelector("#game-over").classList.add("hidden");
        document.querySelector("#game-grid").innerHTML = ""
        init();
    }
//-- ADD BONUS ----------------------------------------------------------------------------

    function addBonus(bonus){
        tiles.forEach((e)=>{
            e.dataset["timer"] = Number(e.dataset["timer"]) + bonus;
        });
    }

//-- RENDER ----------------------------------------------------------------------------

    function render(){
        
        let count = tiles.reduce((acc,curr)=>{
            
            let expireTime = Number(curr.dataset["timer"]);
            let timeRemaining = expireTime - Date.now()
            let setTime = curr.dataset["time"];
            let col = "0F0";
            let tile = curr.querySelector(".tile");

            if(timeRemaining>0){
                let x = timeRemaining/setTime;

                x = x > 1 ? 1 : x;

                col = `hsl(${(140*(x/1.5))}, 100%, 50%)`;
                curr.dataset["remaining"] = timeRemaining;
                tile.style = `background: linear-gradient(to bottom,  #FFF ${100-(x)*100}%,  ${col} 1%,  ${col} 100%);  `;
                curr.dataset["x"] = x;
                acc.push(curr);
            }else{
                if(!curr.classList.contains("hide")){
                    curr.classList.add("hide");
                    removeLetter(curr);
                }
            }
            return acc;
        }, []);

        setTimeout(() => {
            if(!reset){
                if(count.length >0){
                    requestAnimationFrame(render);
                }else{
                    alert(reset, count);
                    gameOver();
                }
            }else{
                reset = false;
                init();
            }
        }, 1000 / fps);
    }

//--- REMOVE LETTER ---------------------------------------------------------------------------
    
    function removeLetter(el){
        el.classList.remove("tile-selected");
        selectedLettersTemp = selectedLetters.reduce((acc, curr)=>{
            if(el.id != curr.target.id) acc=[...acc, curr]
            return acc
        }, []);

        selectedLetters = selectedLettersTemp;
        errorMsg = "";
    }

//-- DISPLAY BOMB ----------------------------------------------------------------------------

    function displayBonus(e){
        document.querySelector("#bomb-container").classList.remove("hide");
        
        if(e=="💣"){
            document.querySelector("#bomb-container").innerHTML = e;

            setTimeout(() => {
                document.querySelector("#bomb-container").innerHTML = "💥";
                populateTiles();
            }, 200); 

        }else if(e=="⏰"){
            document.querySelector("#bomb-container").innerHTML = e;
            document.querySelector("#bomb-container").classList.add("shake");

            addBonus(1000);
        }

        setTimeout(() => {
            document.querySelector("#bomb-container").classList.add("hide");
            document.querySelector("#bomb-container").classList.add("shake");
        }, 500); 
    }

//-- ADD LETTER ----------------------------------------------------------------------------
    
    function addLetter(el){
        let icon = el.target.dataset.letter;

        if(icon === "💣" || icon === "⏰"){
            displayBonus(icon);

        }else if(!el.target.classList.contains("tile-selected")){
            el.target.classList.add("tile-selected");
            selectedLetters.push(el);
        }else{
            removeLetter(el.target);  
        }
        errorMsg = "";
        updateState();
    }
//-- UPDATE STATE----------------------------------------------------------------------------

    function updateState(){
        let wordTemp = "";
        selectedLetters.forEach(e=>{
            wordTemp+=e.target.dataset["letter"];
        })

        document.querySelector("#words-used").innerHTML = wordsGuessed.reduce((acc,curr)=>acc+=`<li>${curr.word} | ${curr.score}</li>`,"")
        document.querySelector("#word").innerHTML= wordTemp;
        document.querySelector("#score").innerHTML= score;
        document.querySelector("#hi-score").innerHTML= highScore;
        document.querySelector("#lvl").innerHTML= currLVL;
        document.querySelector("#lvl2").innerHTML= currLVL;
        document.querySelector("#score2").innerHTML= score;
        document.querySelector("#hi-score2").innerHTML= highScore;
        document.querySelector("#error").innerHTML = errorMsg;

        checkUpcoming();
    }

//-- UPCOMING LETTERS ----------------------------------------------------------------------------

    function checkUpcoming(){
        upComingLetters = [...upComingLetters].map((e,i)=>{  
            let posX = (i * 4) + .5
            e.el.setAttribute("style", `left: ${posX}em`)
            return e
        })        
    }

    function addUpcoming(i){
        let letterObj =  JSON.parse(JSON.stringify(letters[Math.floor(Math.random()*letters.length)]))

        letterObj.id = `letter${letterObj.letter}${Math.floor(Math.random()*100000 * i)}`;
        
        letterObj.el =  document.createElement("li");
        letterObj.el.setAttribute("id",  letterObj.id)
        letterObj.el.classList.add("upcomingLetter")
        letterObj.el.innerText = letterObj.letter;
        letterObj.el.setAttribute("data-num", i);

        upComingLetters.push(letterObj);

        document.querySelector("#upcoming").appendChild(letterObj.el);

        letterObj.el.addEventListener("click", (e)=>{
            //remove/replace upcoming - game mechanic
            document.querySelector("#upcoming").removeChild(e.target);
            
            upComingLetters = upComingLetters.reduce((acc,next)=>{    
                return letterObj.id != next.id ? [...acc, next] : acc;
            }, []);
            addUpcoming(i);
            updateState();
        })
    }

//-- CLEAR LETTERS ----------------------------------------------------------------------------

    function clearLetters(){
        selectedLetters.forEach((e)=> e.target.classList.remove("tile-selected"), []);
        selectedLetters = [];
        errorMsg = "";
        updateState();
    }

//-- CHECK WORD ----------------------------------------------------------------------------

    function checkWord(){
        let wordTemp = selectedLetters.reduce((arr,curr)=> arr+=curr.target.dataset["letter"],"").toLowerCase();
        let currScore = 0;

        if(words.includes(wordTemp)){
            selectedLetters.forEach((e,i)=>{
                let letterTemp = upComingLetters.shift();

                currScore += Number(e.target.dataset["score"]);

                addBonus(currScore * (bonusMultiplier / ( 1 + (currLVL * bonusDegradationRate))))
                addUpcoming(i);
                populateTile(e.target,letterTemp);

                document.querySelector("#upcoming").removeChild(letterTemp.el)
                e.target.classList.remove("tile-selected"); 
            })

            score += currScore * (selectedLetters.length);
            currLVL = Math.ceil(score / 100 );
            
            if(score > highScore){
                localStorage.setItem("highScore", score);
                highScore = score;
            }
            
            createPointTile(wordTemp, currScore);
            wordsGuessed.push({"word":wordTemp, "score" : currScore});
            selectedLetters = [];
        }else{
            if(wordTemp.length > 3){
                errorMsg = " (invalid word)"
            }else{
                errorMsg = " (too short)"
            }
        }
        
        updateState();
    }

//-- CREATE TILE ----------------------------------------------------------------------------
    
    function createTile(){
        let el = document.createElement("div");
        let tile = document.createElement("div");
        let letter = document.createElement("div");
        let score = document.createElement("sup");
        
        el.classList.add('tile-container');
        tile.classList.add('tile');
        letter.classList.add('letter');
        score.classList.add('score');

        el.appendChild(tile);
        tile.appendChild(letter);
        tile.appendChild(score);

        return el;
    }

//-- POPULATE TILE ----------------------------------------------------------------------------
    
    function populateTile(el, o){
        let lvlModifier = currLVL * 1.1;

        let timer = Date.now()+((Math.random()*(randomtimer / lvlModifier))+ (minTimer / lvlModifier) + (o.val*2))*1000;

        el.setAttribute('data-letter', o.letter);
        el.setAttribute('data-score', o.val);
        el.setAttribute('data-timer', timer);
        el.setAttribute('data-remaining', timer - Date.now());
        el.setAttribute('data-time', timer - Date.now());
        el.setAttribute('id', o.letter+"-"+Math.round(Math.random()*100000));
        el.querySelector(".letter").innerHTML = o.letter;
        el.querySelector(".score").innerHTML = o.val;
    }

//-- WORD POINT TILE ----------------------------------------------------------------------------

    function createPointTile(word, score){
        let xPos = Math.random() * (Math.round(window.screen.width/1.2));
        let yPos = window.screen.height * .8;
        let el = document.createElement("div");
        let opacity = 3;

        el.classList.add('word-score');
        el.style = `top: ${yPos}px; left: ${xPos}px; opacity: ${opacity};`;

        lifeCycle();
        
        function lifeCycle(){
            yPos -= 5;
            opacity-=.04;
            
            el.innerHTML = `${word} +${score}`;
            //el.style = `topX: ${yPos}px; left: ${xPos}px; `;
            document.querySelector("#word-score-container").appendChild(el);
            //el.classList.add("show");
            if(yPos < window.screen.height/.7){
                el.style = `top: ${yPos}px; left: ${xPos}px; opacity: ${opacity};`;
            }

            if(yPos < window.screen.height/2){
                el.style = `top: ${yPos}px; left: ${xPos}px; opacity: ${opacity};`;
            }

            if(yPos < window.screen.height/4){
                document.querySelector("#word-score-container").removeChild(el);
            }else{
                setTimeout(() => {
                    requestAnimationFrame(lifeCycle);
                }, 1000 / fps); 
            }
        }
    }
})();