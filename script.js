const MAX_CHAR_LIMIT = 2000;
const MAX_WORD_LENGTH = 45;
const profanity = ['badword1', 'badword2', 'badword3', 'badword4']; 

function checkCharacterLimit(text) {
    return text.length <= MAX_CHAR_LIMIT;
}

function checkConsecutiveNonWordCharacters(text) {
    return !/[^\w\s]{2,}/.test(text);
}

function checkProfanity(text) {
    return !profanity.some(word => text.includes(word));
}

function checkWordLength(text) {
    const words = text.split(/\s+/).filter(Boolean);
    return words.every(word => word.length <= MAX_WORD_LENGTH);
}

function checkAlphabeticCharacters(text) {
    if (text.length >= 3) {
        for (let i = 2; i < text.length; i++) {
            if (text[i] === text[i - 1] && text[i] === text[i - 2] && /[A-Za-z]/.test(text[i])) {
                if (text[i].toUpperCase() === text[i] && text[i - 1].toUpperCase() === text[i - 1] && text[i - 2].toUpperCase() === text[i - 2]) {
                    continue;
                }
                return false;
            }
        }
    }
    return true;
}

function getViolationMessages(text) {
    let messages = [
        validateCharacterLimit(text),
        validateNonWordCharacters(text),
        validateProfanity(text),
        validateWordLength(text),
        validateAlphabeticCharacters(text)
    ].filter(message => message !== "");

    if (messages.length === 0) {
        StateManager.resetAlertFlag();
    }

    return messages;
}

const StateManager = (function() {
    let state = {
        alertShown: false
    };

    return {
        isAlertShown: () => state.alertShown,
        showAlert: () => {
            state.alertShown = true;
            setTimeout(() => { state.alertShown = false; }, 2000);
        },
        resetAlertFlag: () => {
            state.alertShown = false;
        }
    };
})();

function showToast(message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
    return container;
}

function handleInput(event) {
    const textEntered = event.type === 'paste' ? (event.clipboardData || window.clipboardData).getData('text') : document.getElementById('ideaInput').value;
    const violationMessages = getViolationMessages(textEntered);

    if (violationMessages.length > 0 && !StateManager.isAlertShown()) {
        showToast(violationMessages.join("\n"));
        StateManager.showAlert();
    }

    updateWordCounter(textEntered);
}

function updateWordCounter() {
    const textEntered = document.getElementById('ideaInput').value;
    const words = textEntered.split(/\s+/).filter(Boolean);
    const wordCounterElement = document.getElementById('wordCounter');
    wordCounterElement.innerText = `${words.length}/200 Words`;
    wordCounterElement.style.color = words.length >= 200 ? 'red' : 'black';
}

function initializeWordCount() {
    document.getElementById('wordCounter').innerText = '0/200 Words';
}

// Validation Functions
function validateCharacterLimit(text) {
    return !checkCharacterLimit(text) ? "The text exceeds the 2000 character limit." : "";
}

function validateNonWordCharacters(text) {
    return !checkConsecutiveNonWordCharacters(text) ? "The text contains consecutive special characters." : "";
}

function validateProfanity(text) {
    return !checkProfanity(text) ? "Profanity detected. Please remove the inappropriate language." : "";
}

function validateWordLength(text) {
    return !checkWordLength(text) ? "One or more words exceed the maximum length of 45 characters." : "";
}

function validateAlphabeticCharacters(text) {
    return !checkAlphabeticCharacters(text) ? "Consecutive alphabetic characters detected." : "";
}

// Event Listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ideaInput').addEventListener('input', handleInput);
    initializeWordCount();
});

