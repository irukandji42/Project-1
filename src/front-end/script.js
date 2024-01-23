function fetchRepositoryData(owner, name, path = '') {
    const url = `https://api.github.com/repos/${owner}/${name}/contents/${path}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                displayFolderStructure(data, owner, name, path);
            } else {
                displayFileContent(data, path);
            }
        })
        .catch(error => {
            console.error('Fetching error:', error);
        });
}

function displayFolderStructure(data, owner, name, path = '') {
    const folderStructure = document.getElementById('folderStructure');
    folderStructure.innerHTML = '';

    // Add 'Go Back' option if not in the root directory
    if (path) {
        const goBack = document.createElement('div');
        goBack.textContent = 'Go Back';
        goBack.className = 'go-back';
        goBack.onclick = () => fetchRepositoryData(owner, name, path.split('/').slice(0, -1).join('/'));
        folderStructure.appendChild(goBack);
    }

    // Display the files and directories
    data.forEach(item => {
        const elem = document.createElement('div');
        elem.textContent = item.name;
        elem.className = item.type; // 'file' or 'folder'
        elem.onclick = () => {
            const newPath = path ? `${path}/${item.name}` : item.name;
            if (item.type === 'dir') {
                fetchRepositoryData(owner, name, newPath); // Fetch directory content
            } else {
                fetchRepositoryData(owner, name, item.path); // Fetch file content
            }
        };
        folderStructure.appendChild(elem);
    });
}

function displayFileContent(data, path) {
    const codeContent = document.getElementById('codeContent');
    const fileInfo = document.getElementById('fileInfo');
    codeContent.innerHTML = '';

    // Set file info
    const fileName = path.split('/').pop();
    fileInfo.textContent = `File: ${fileName}`;

    if (fileName.toLowerCase().endsWith('.db')) {
        codeContent.innerHTML = `<pre style="color: red;">[Database file (.db) content not displayed]</pre>`;
    } else {
        let formattedContent = decodeBase64(data.content);
        formattedContent = formattedContent.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        codeContent.innerHTML = `<pre>${formattedContent}</pre>`;
    }
}

function decodeBase64(encodedStr) {
    try {
        return atob(encodedStr);
    } catch (error) {
        console.error('Error decoding Base64 string:', error);
        return '';
    }
}

function showSummary() {
    const summarySection = document.getElementById('summarySection');
    if (summarySection) {
        summarySection.style.display = 'block'; // Ensure it's visible
    }
}

function hideSummary() {
    const summarySection = document.getElementById('summarySection');
    if (summarySection) {
        summarySection.style.display = 'none'; // Hide it
    }
}

document.getElementById('submit-review').addEventListener('click', function() {
    const summarySection = document.getElementById('summarySection');
    if (summarySection) {
        summarySection.textContent = 'Placeholder Text';
        showSummary(); // Make sure to show the summary section
    }
});

document.getElementById('copyCodeBtn').addEventListener('click', function() {
    const codeContent = document.getElementById('codeContent').textContent;
    navigator.clipboard.writeText(codeContent).then(() => {
        alert('Code copied to clipboard!');
    });
});

document.getElementById('fetchRepo').addEventListener('click', function() {
    const repoInput = document.getElementById('repoInput').value.trim();
    const [owner, name] = repoInput.split('/');

    if (owner && name) {
        fetchRepositoryData(owner, name);
    } else {
        alert('Please enter the repository in the format "owner/repo".');
    }
});