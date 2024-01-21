document.getElementById('fetchRepo').addEventListener('click', function() {
    const repoOwner = document.getElementById('repoOwner').value.trim();
    const repoName = document.getElementById('repoName').value.trim();

    if (repoOwner && repoName) {
        fetchRepositoryData(repoOwner, repoName);
    } else {
        alert('Please enter both repository owner and name.');
    }
});

function fetchRepositoryData(owner, name) {
    // Placeholder for GitHub API call
    console.log(`Fetching data for ${owner}/${name}`);
    // TODO: Implement GitHub API call
    // TODO: Process and display the fetched data
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
