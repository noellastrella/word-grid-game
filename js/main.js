(()=>{
    let tiles = [];
    let randomtimer = 10;
    let minTimer = 20;
    let tempI = 0;

    let words = [];
    let wordsGuessed = [];
    let score=0;

    let selectedLetters = [];
    
    const tileCount = 25;
    const letters = [
        {letter: "A", val: 1},
        {letter: "B", val: 2},
        {letter: "C", val: 3},
        {letter: "D", val: 4},
        {letter: "E", val: 1},
        {letter: "F", val: 5},
        {letter: "G", val: 5},
        {letter: "H", val: 4},
        {letter: "I", val: 1},
        {letter: "J", val: 7},
        {letter: "K", val: 8},
        {letter: "L", val: 3},
        {letter: "M", val: 3},
        {letter: "N", val: 3},
        {letter: "O", val: 1},
        {letter: "P", val: 3},
        {letter: "Q", val: 7},
        {letter: "R", val: 2},
        {letter: "S", val: 2},
        {letter: "T", val: 2},
        {letter: "U", val: 1},
        {letter: "V", val: 5},
        {letter: "W", val: 5},
        {letter: "X", val: 7},
        {letter: "Y", val: 8},
        {letter: "Z", val: 10},
        {letter: "A", val: 1},
        {letter: "E", val: 1},
        {letter: "I", val: 1},
        {letter: "O", val: 1},
        {letter: "U", val: 1}
    ]

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


    function init(){
        for(let i=0; i<tileCount; i++){
            tiles.push(createTile()) 
            populateTile(tiles[i], letters[Math.floor(Math.random()*letters.length)])
            document.querySelector("#game-grid").appendChild (tiles[i]);
            tiles[i].addEventListener("click", addLetter);
            tiles
        }

        document.querySelector("#submit").addEventListener("click", checkWord)
        document.querySelector("#clear").addEventListener("click", clearLetters)

        render();
    }

    function render(){
        tempI++;

        tiles.reduce((acc,curr)=>{
            let expireTime = curr.dataset["timer"];
            let timeRemaining = expireTime - Date.now()
            let setTime = curr.dataset["time"];
            
            if(timeRemaining>0){
                curr.dataset["remaining"] = timeRemaining;
                curr.style = `background-image: linear-gradient(to bottom,  #FFF ${100-(timeRemaining/setTime)*100}%,  #0F0 1%,  #0F0 100%);  `
                curr.dataset["x"] = timeRemaining/setTime
                acc.push(curr);
            }else{
                if(!curr.classList.contains("hide")){
                    curr.classList.add("hide");
                    removeLetter(curr);
                }
            }

            return acc;
        }, [])

        window.requestAnimationFrame(render);
    }

    function removeLetter(el){
        console.log(el)
        el.classList.remove("tile-selected");
        selectedLettersTemp = selectedLetters.reduce((acc, curr)=>{
            console.log(el.id , curr.target.id, curr, el.id != curr.target.id)
            if(el.id != curr.target.id) acc=[...acc, curr]
            return acc
        }, []);

        selectedLetters = selectedLettersTemp;
    }

    function addLetter(el){
        if(!el.target.classList.contains("tile-selected")){
            el.target.classList.add("tile-selected");
            selectedLetters.push(el);
        }else{
            removeLetter(el.target);  
        }
        
        checkWord();
        updateState();
    }

    function updateState(){
        let wordTemp = "";
        selectedLetters.forEach(e=>{
            wordTemp+=e.target.dataset["letter"];
        })
        
        document.querySelector("#words-used").innerHTML = wordsGuessed.reduce((acc,curr)=>acc+=`<li>${curr.word} | ${curr.score}</li>`,"")

        document.querySelector("#word").innerHTML= wordTemp;
        document.querySelector("#score").innerHTML= score;

    }

    function clearLetters(){
        selectedLetters.forEach((e)=>{
            console.log(e.target.classList)
            e.target.classList.remove("tile-selected"); 
        }, [])

        selectedLetters = [];
        updateState();
    }

    function checkWord(){
        let wordTemp = selectedLetters.reduce((arr,curr)=>{
            console.log(curr.target.dataset)
            return arr+=curr.target.dataset["letter"];
        },"").toLowerCase();

        let currScore = 0;

        if(words.includes(wordTemp)){
            console.log("IS WORD")
            
            selectedLetters.forEach(e=>{
                populateTile(e.target,letters[Math.floor(Math.random()*letters.length)])
                e.target.classList.remove("tile-selected"); 
                currScore += Number(e.target.dataset["score"]);
            })

            score += currScore * selectedLetters.length;
            wordsGuessed.push({"word":wordTemp, "score" : currScore});
            selectedLetters = [];
        }
        
        updateState();
    
    }

    function resetState(){
        score = 0;
        selectedLetters = [];
        wordsGuessed = [];
    }

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

    function populateTile(el, o){
        let timer = Date.now()+((Math.random()*randomtimer)+ minTimer)*1000;

        el.setAttribute('data-letter', o.letter);
        el.setAttribute('data-score', o.val);
        el.setAttribute('data-timer', timer);
        el.setAttribute('data-remaining', timer - Date.now());
        el.setAttribute('data-time', timer - Date.now());

        el.setAttribute('id', o.letter+"-"+Math.round(Math.random()*100000));

        el.querySelector(".letter").innerHTML = o.letter;
        el.querySelector(".score").innerHTML = o.val;
    }

})()