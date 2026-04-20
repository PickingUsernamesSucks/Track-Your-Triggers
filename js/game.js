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

class Trigger{
    constructor(name, when, text){
        this.cardName = name;
        this.when = when;
        this.text = text;
        this.done = false;
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
        //blocking non permanents at this step and sending an alert instead should be easy.
        //check type for instant/sorcery
        //add an if statement to alert that it's the wrong kind of card
        deck.push(new Card(newCard.name, newCard.type_line, newCard.image_uris.small, newCard.oracle_text) );
        console.log(deck);
        //add card to battlefield
        CardToBattlefield();
        //this function calls a function that checks for triggers. Perhaps check for triggers 1st, and then add card if one is found?
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

function CheckForTriggers(){
    //if the card uses its name it'll not include anything after a comma
    let shortName = deck[deck.length-1].name.split(",")[0];

    //break the text into an array seperated by newlines, and check each newline for a trigger
    //flavor text does not come in with other information, safe to ignore as it does not make it to the variable
    //would capitlization be an issue? If so, lowercase all before split
    let arrayText = deck[deck.length-1].text.split("\n");
    
    //loop checks every block in arrayText
    for (let i=0; i<arrayText.length; i++){
        console.log(arrayText[i]);

        //large if statement looks at the text of the card for certain phrases, when those phrases are found it will create a new trigger object and add it to the DOM
        //MISSING - when a creature is dealt dmg. Should that go under combat or dmg? or even anytime?
        if (arrayText[i].includes("upkeep")){//upkeep 
            let newTrigger = new Trigger(deck[deck.length-1].name, "upkeep", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("upkeep").appendChild(p);
        } else if(arrayText[i].includes("Whenever you draw a card")|| arrayText[i].includes("Whenever an opponent draws a card") || arrayText[i].includes("draw step")){//draw step and draw cards
            //includes both draw step and when cards are drawn
            let newTrigger = new Trigger(deck[deck.length-1].name, "draw", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("draw").appendChild(p);
        } else if (arrayText[i].includes("precombat main phase") || arrayText[i].includes("first main phase")){
            //research if this is broad enough
            let newTrigger = new Trigger(deck[deck.length-1].name, "main1", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("main1").appendChild(p);
        }else if (arrayText[i].includes("cast" && "spell")){
            //research if this is both broad and narrow enough
            //needs narrowing, buster sword is a pdmg trigger that casts a spell as a benifit
            //solution currently unknown. Perhaps check this trigger last?
            //or, check for "Whenever you cast a spell" and "Whenever an opponent casts a spell", but this may be too narrow
            //issue with above - Elena, Turk Recruit has "whenever you cast a historic spell"
            //current implementation does catch ward- which may qualify as a triggered ability. do we want to keep that caught?
            //similar question for melee, like from Tifa, Martial Artist
            //hexproof, shroud improvise discription gets caught by current implentation
            let newTrigger = new Trigger(deck[deck.length-1].name, "spell", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("spell").appendChild(p);
        }else if(arrayText[i].includes("Whenever a land you control enters") || arrayText[i].includes("Landfall")){
            let newTrigger = new Trigger(deck[deck.length-1].name, "landfall", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("landfall").appendChild(p);
        }else if(arrayText[i].includes("enters the battlefield") || arrayText[i].includes("When") && arrayText[i].includes("enters") ){
            //reseach if this is both broad and narrow enough
            let newTrigger = new Trigger(deck[deck.length-1].name, "etb", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("etb").appendChild(p);
        }else if(arrayText[i].includes("crime")){
            let newTrigger = new Trigger(deck[deck.length-1].name, "crime", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("crime").appendChild(p);
        }else if(arrayText[i].includes("At the beginning of combat")){
            //should attack and/or block triggers have their own div tags?
            //they are currently put into combat, but code checks sepereately, mostly for readability
            let newTrigger = new Trigger(deck[deck.length-1].name, "combat", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("combat").appendChild(p);
        }else if(arrayText[i].includes("Whenever") && arrayText[i].includes("attack")){
            let newTrigger = new Trigger(deck[deck.length-1].name, "combat", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("combat").appendChild(p);
        }else if(arrayText[i].includes("Whenever") && arrayText[i].includes("block")){
            let newTrigger = new Trigger(deck[deck.length-1].name, "combat", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("combat").appendChild(p);
        }else if(arrayText[i].includes("combat damage to a player") || arrayText[i].includes("combat damage to an opponent")){
            //order matters here, so breaking the order of the divs to make the if statements simpler
            let newTrigger = new Trigger(deck[deck.length-1].name, "pdmg", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("pdmg").appendChild(p);
        }else if(arrayText[i].includes("combat damage")){
            //order matters here, so breaking the order of the divs to make the if statements simpler
            let newTrigger = new Trigger(deck[deck.length-1].name, "dmg", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("dmg").appendChild(p);
        }else if(arrayText[i].includes("creature dies") || arrayText[i].includes(shortName + " dies")){
            //needs broadening, for things that trigger whenever they leave battlefield, like earthbend
            let newTrigger = new Trigger(deck[deck.length-1].name, "death", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("death").appendChild(p);
        }else if(arrayText[i].includes("second main phase") || arrayText[i].includes("postcombat phase")){
            let newTrigger = new Trigger(deck[deck.length-1].name, "main2", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("main2").appendChild(p);
        }else if(arrayText[i].includes("end step")){
            let newTrigger = new Trigger(deck[deck.length-1].name, "end", arrayText[i]);
            let p = document.createElement("p");
            p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
            document.getElementById("end").appendChild(p);
        }else{

        }
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

    //now that the card is on the battlefield, check to see if it has any triggers
    CheckForTriggers();
}

document.addEventListener("DOMContentLoaded", function () {
    CardInput = document.getElementById("CardInput");
    CardInput.addEventListener("keyup", HandleCardInput);
    document.getElementById("SearchButton").addEventListener("click", search);
})



console.log("return");
