document.getElementById('fetchRepo').addEventListener('click', function() {
    const repoInput = document.getElementById('repoInput').value.trim();
    const [owner, name] = repoInput.split('/');

    if (owner && name) {
        fetchRepositoryData(owner, name);
    } else {
        alert('Please enter the repository in the format "owner/repo".');
    }
});

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
                displayFileContent(data);  // Make sure this is correctly fetching file content
            }
        })
        .catch(error => {
            console.error('Fetching error:', error);
        });
}

function displayFolderStructure(data, owner, name, path = '') {
    const folderStructure = document.getElementById('folderStructure');
    folderStructure.innerHTML = '';

    // Add 'Go Back' option if not in root
    if (path) {
        const goBack = document.createElement('div');
        goBack.textContent = 'Go Back';
        goBack.style.cursor = 'pointer';
        goBack.style.color = 'blue';
        const parentPath = path.split('/').slice(0, -1).join('/');
        goBack.onclick = () => fetchRepositoryData(owner, name, parentPath);
        folderStructure.appendChild(goBack);
    }

    data.forEach(item => {
        const elem = document.createElement('div');
        elem.textContent = item.name;
        elem.style.cursor = 'pointer';
        elem.onclick = () => {
            const newPath = path ? `${path}/${item.name}` : item.name;
            fetchRepositoryData(owner, name, newPath);
        };
        folderStructure.appendChild(elem);
    });
}

function displayFileContent(data) {
    const codeContent = document.getElementById('codeContent');
    codeContent.innerHTML = '';  // Clear existing content

    const fileName = data.name.toLowerCase();

    if (fileName.endsWith('.db')) {
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