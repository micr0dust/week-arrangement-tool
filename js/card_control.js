/* Need to be defined in the main script
    function newBtnDisable(bool);
    function cardChangeCallback();
*/
function removeCard(element) {
    element.remove();
    cardChangeCallback();
    if(document.getElementById('save') === null)
        newBtnDisable(false);
}

function card_error(timeSlot, msg) {
    timeSlot.classList.add('border-danger');
    const error = timeSlot.querySelector('#error');
    error.textContent = msg;
    error.classList.remove('d-none');
}

function moveUp(card) {
    const prevCard = card.previousElementSibling;
    if (prevCard && prevCard.tagName.toLowerCase() == 'div') card.parentNode.insertBefore(card, prevCard);
    cardChangeCallback();
}

function moveDown(card) {
    const nextCard = card.nextElementSibling;
    if (nextCard && nextCard.tagName.toLowerCase() == 'div') card.parentNode.insertBefore(nextCard, card);
    cardChangeCallback();
}