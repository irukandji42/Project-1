document.getElementById('fetchRepo').addEventListener('click', function() {
    const repoInput = document.getElementById('repoInput').value.trim();
    const [owner, name] = repoInput.split('/');

    if (owner && name) {
        fetchRepositoryData(owner, name);
    } else {
        alert('Please enter the repository in the format "owner/repo".');
    }
});

function fetchRepositoryData(owner, name) {
    const url = `https://api.github.com/repos/${owner}/${name}/contents/`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayRepositoryData(data);
        })
        .catch(error => {
            console.error('Fetching error:', error);
        });
}

// TODO: Additional functions for data processing and display

function fetchRepositoryData(owner, name) {
    const url = `https://api.github.com/repos/${owner}/${name}/contents/`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayRepositoryData(data);
        })
        .catch(error => {
            console.error('Fetching error:', error);
        });
}

function displayRepositoryData(data) {
    const folderStructure = document.getElementById('folderStructure');
    const codeContent = document.getElementById('codeContent');

    // Clear previous content
    folderStructure.innerHTML = '';
    codeContent.innerHTML = '';

    // Process and display the data
    // This is a simplified example. You'll need to expand it based on your data structure and display requirements
    data.forEach(item => {
        if (item.type === 'file') {
            folderStructure.innerHTML += `<div>${item.name}</div>`;
        }
    });
}

function decodeBase64(encodedStr) {
    return atob(encodedStr);
}
