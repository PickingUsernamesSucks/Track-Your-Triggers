let CardInput;
const deck = [];

class Card{
    constructor(name, type, picURL, text){
        this.name = name; //name
        this.type = type; //interpet type_line?
        this.picURL = picURL; //response has image_uris w differernt sizes, currently using small
        this.text = text; //use oracle text?
    }
}

//search using scryfall's API
//Currently -searches and adds card to deck, calls function to add to battlefield
async function search(){
  console.log("starting search")
  const response = await fetch("https://api.scryfall.com/cards/named?fuzzy=" + CardInput.value, {
  method: "GET", 
  headers : {
      "Content-Type": "application/json"
    }  
  })
  
const newCard = await response.json();
//console.log(response);
//console.log(newCard);

//now that card is found, add to deck
if(response.status==200){ //404 is the response for error
    //put card in deck
    deck.push(new Card(newCard.name, newCard.type_line, newCard.image_uris.small, newCard.oracle_text) );
    console.log(deck);
    //need to card in battlefield
    CardToBattlefield();
} else{
    console.log("Search Failed");
    console.log(newCard.details);   
}

console.log("end of search");
}

//this function runs a search if the enter key was pressed, else nothing
//find if this can be done without checking every keypress
function HandleCardInput(Event){
    //console.log(Event.key);
    //console.log(CardInput.value);
    if (Event.key == "Enter"){
        console.log("Searching with " + CardInput.value)
        search();
    }
}

//add latest entry to deck to the battlefield
function CardToBattlefield(){

    //make the DOM element
    const img = document.createElement("img");
    img.setAttribute("src", deck[deck.length-1].picURL);
    //do I need to add eventlistener here for drag n drop or can I do it globally elsewhere?

    //figure out which Div it is going to.
    let which = 3; //which is the index to find which div we are adding our A element to, default to misc 
    let temp = deck[deck.length-1].type.toLowerCase(); 
    if (temp.includes("creature")){
        which = 0;
    }    else if (temp.includes("enchantment")){
        which = 1;
    }   else if (temp.includes("artifact")){
        which = 2;
    } 
    const options = document.getElementsByClassName("Brow");
    options[which].appendChild(img);
}

document.addEventListener("DOMContentLoaded", function () {
    CardInput = document.getElementById("CardInput");
    CardInput.addEventListener("keyup", HandleCardInput);
    document.getElementById("SearchButton").addEventListener("click", search);
})



console.log("return");
