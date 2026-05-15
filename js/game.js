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

//now that card is found, add to deck
    if(response.status==200){ //404 is the response for error

        //some cards are two sided, api returns both sides on the same card. Need an if for that scenario
        if (newCard.name.includes("//")){
            //for now, both sides of the card are treated like seperate cards and added to the battlefield together.
            //This is improper, so it may be replaced by adding a card property 
            deck.push(new Card(newCard.card_faces[0].name, newCard.card_faces[0].type_line, newCard.card_faces[0].image_uris.small, newCard.card_faces[0].oracle_text));
            deck.push(new Card(newCard.card_faces[1].name, newCard.card_faces[1].type_line, newCard.card_faces[1].image_uris.small, newCard.card_faces[1].oracle_text));
            console.log(deck);
            //add both sides to battlefield
            CardToBattlefield(deck[deck.length-2]);
            CardToBattlefield(deck[deck.length-1]);
        }
        else{
            //put card in deck
            //blocking non permanents at this step and sending an alert instead should be easy.
            //can add an if statement to alert that it's the wrong kind of card 
            deck.push(new Card(newCard.name, newCard.type_line, newCard.image_uris.small, newCard.oracle_text) );
            
            //testing line, delete when done
            console.log(deck);
            
            //add card to battlefield
            CardToBattlefield(deck[deck.length-1]);
            //this function calls a function that checks for triggers. Perhaps check for triggers 1st, and then add card if one is found?
        }


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

function makeTrigger(type, text, card){

    //modal triggers use newlines, breaking a rule otherwise generally followed. To show what the trigger does and not just the trigger itself, addiiontional code is need
    if(text.includes("choose")){
        
        //cards like Soldier Military Program are 100% modal.
        //cards like Silent Hallcreeper have text that is not part of the modal trigger
        //I have made the assumption (backed by some research) that modal triggers are the last part of cards
        //some concern that this may catch some non-modal cards with the word choose in the text
        //in testing, non modal cards caught have still displayed properly

        //index is intented to cut out anything in front of the modal trigger
        let index = card.text.indexOf(text);
        text = card.text.substring(index);
        
    }

    let newTrigger = new Trigger(card.name, type, text);
    let p = document.createElement("p");
    p.innerHTML = newTrigger.cardName +  " - " + newTrigger.text;
    document.getElementById(type).appendChild(p);
    //if element is still hidden, make it visible
    if (document.getElementById(type).style.display != "block"){
        document.getElementById(type).style.display = "block";
        }
}

function CheckForTriggers(card){
    //if the card uses its name it'll not include anything after a comma
    let shortName = card.name.split(",")[0];

    //break the text into an array seperated by newlines, and check each newline for a trigger
    //flavor/lore text does not come in with other information, safe to ignore as it does not make it to the variable
    //would capitlization be an issue? If so, lowercase all before split
    let arrayText = card.text.split("\n");
    
    //unique cards that break rules of card text or are too difficult to parse have been called out here
    if(card.name == "Roaming Throne"){
        makeTrigger("anytime", arrayText[1] + " " + arrayText[3], card);
    }

    //loop checks every block in arrayText
    for (let i=0; i<arrayText.length; i++){
        tags = ["null"];
        console.log(arrayText[i]);

        //need to add - enchantments that buff lands. Ex- Utopia Sprawl
        //Caged Sun may need to be caught as well, or go with exceptions

        //discard triggers! Monument of Endurance is an example

        //large if statement series looks at the text of the card for certain phrases, when those phrases are found it will create a new trigger object and add it to the DOM
        if (arrayText[i].includes("upkeep")&& arrayText[i].includes("At the begin") ){//upkeep 
            makeTrigger("upkeep", arrayText[i], card);
        } 
        if (arrayText[i].includes("Whenever you draw a card")|| arrayText[i].includes("Whenever an opponent draws a card") || arrayText[i].includes("draw step")){//draw step and draw cards
            //includes both draw step and when cards are drawn
            makeTrigger("draw", arrayText[i], card);
        }
        if (arrayText[i].includes("precombat main phase") || arrayText[i].includes("first main phase")){
            //research if this is broad enough
            makeTrigger("main1", arrayText[i], card);
        }
        if (arrayText[i].includes("cast") && arrayText[i].includes("spell") && arrayText[i].includes("Whenever you") || arrayText[i].includes("Whenever an opponent") || arrayText[i].includes("Whenever a player casts")){
                
            //research if this is both broad and narrow enough
            //previous implementation was catching lots of extras, but now may be too narrow.
            //examples were question for melee, like from Tifa, Martial Artist
            //hexproof, shroud improvise discription gets caught by current implentation
            makeTrigger("spell", arrayText[i], card);
        }
        if(arrayText[i].includes("Whenever a land you control enters") || arrayText[i].includes("Landfall")){
            makeTrigger("landfall", arrayText[i], card);
        }
        if(arrayText[i].includes("enters the battlefield") || arrayText[i].includes("When") && arrayText[i].includes("enters") || arrayText[i].includes("Whenever") && arrayText[i].includes("enter") || arrayText[i].includes("When") && arrayText[i].includes("enter") || arrayText[i].includes("other") && arrayText[i].includes("enter") ){
            //reseach if this is both broad and narrow enough
            //concern is enter and enters with the when/whenever
            
            //landfall is an etb we already checked for because it deserved it's own div. landfall is filtered out with following if/else
            if(arrayText[i].includes("Landfall")|| arrayText[i].includes("Whenever a land you control enters")){}
            else{
                makeTrigger("etb", arrayText[i], card);
            }
        }
        if(arrayText[i].includes("crime")){
            makeTrigger("crime", arrayText[i], card);
        }
        if(arrayText[i].includes("Whenever you gain life")){
            makeTrigger("lifegain", arrayText[i], card);
        }
        if(arrayText[i].includes("At the beginning of combat")){
            makeTrigger("combat", arrayText[i], card);
            //should attack and/or block triggers have their own div tags?
            //they are currently put into combat, but code checks sepereately, mostly for readability
        }
        if(arrayText[i].includes("Whenever") && arrayText[i].includes("attack")){
            makeTrigger("combat", arrayText[i], card);
        }
        if(arrayText[i].includes("Whenever") && arrayText[i].includes("block")){
            makeTrigger("combat", arrayText[i], card);
        }
        if(arrayText[i].includes("combat damage") && arrayText[i].includes("combat damage to a player") == false){
            //Living Lore is an example card
            makeTrigger("dmg", arrayText[i], card);
        }
        if(arrayText[i].includes("combat damage to a player") || arrayText[i].includes("combat damage to an opponent")){
            //used to be a depenedency on order when this was a large if else statement, now just slightly out of order when compared to divs
            //the next trigger would also catch this the first branch of this OR statement, so had to add a NOT to when function changed to a series of if statements
            makeTrigger("pdmg", arrayText[i], card);
        }
        if(arrayText[i].includes("creature") && arrayText[i].includes("dies")|| arrayText[i].includes(shortName + " dies")){
            //needs broadening, for things that trigger whenever they leave battlefield, like earthbend
            makeTrigger("death", arrayText[i], card);
        }
        if(arrayText[i].includes("second main phase") || arrayText[i].includes("postcombat phase")){
            makeTrigger("main2", arrayText[i], card);
        }if(arrayText[i].includes("end step")){
            makeTrigger("end", arrayText[i], card);
        }
        //need a catch all for unique/misc triggers here
        //thinking a final if statement just looking for When or Whenever
        //if done, add a variable making sure the card wasn't already added.
        //OR have the makeTrigger check to make sure it's unqiue. 
    }
}

function CardToBattlefield(card){

    //make the DOM element
    const img = document.createElement("img");
    img.setAttribute("src", card.picURL);
    //do I need to add eventlistener here for drag n drop or can I do it globally elsewhere?

    //figure out which Div it is going to.
    let which = 3; //which is the index to find which div we are adding our A element to, default to misc 
    let temp = card.type.toLowerCase(); 
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
    CheckForTriggers(card);
}
    document.addEventListener("DOMContentLoaded", function () {
    CardInput = document.getElementById("CardInput");
    CardInput.addEventListener("keyup", HandleCardInput);
    document.getElementById("SearchButton").addEventListener("click", search);
})



console.log("return");
