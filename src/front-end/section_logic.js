document.getElementById("submitBtn").addEventListener("click", function() {
    document.getElementById("apiKeyModal").style.display = "block";
});

document.getElementsByClassName("close")[0].addEventListener("click", function() {
    document.getElementById("apiKeyModal").style.display = "none";
});

document.getElementById("toggleVisibility").addEventListener("click", function() {
    let apiKeyInput = document.getElementById("apiKeyInput");
    if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
    } else {
        apiKeyInput.type = "password";
    }
});

document.getElementById("confirmBtn").addEventListener("click", function() {
    let apiKey = document.getElementById("apiKeyInput").value;
    
    // Use the API key for submission here.
    // Example: sendApiKeyToServer(apiKey);

    // Clear API key from input field and memory
    document.getElementById("apiKeyInput").value = "";
    apiKey = null;

    // Close modal
    document.getElementById("apiKeyModal").style.display = "none";
});

// Optional: Clear API key if modal is closed without submission
window.onclick = function(event) {
    if (event.target == document.getElementById("apiKeyModal")) {
        document.getElementById("apiKeyInput").value = "";
        document.getElementById("apiKeyModal").style.display = "none";
    }
}
