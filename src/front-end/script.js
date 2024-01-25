let lastSubmittedContent = '';

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

    // Generate breadcrumbs
    const breadcrumbs = generateBreadcrumbs(owner, name, path);
    folderStructure.appendChild(breadcrumbs);

    const folders = [];
    const files = [];

    // Separate items into folders and files
    data.forEach(item => {
        if (item.type === 'dir') {
            folders.push(item);
        } else {
            files.push(item);
        }
    });

    // Render folders
    folders.forEach(folder => {
        const elem = createFolderOrFileElement(folder, path, owner, name);
        folderStructure.appendChild(elem);
    });

    // Render files with indentation
    files.forEach(file => {
        const elem = createFolderOrFileElement(file, path, owner, name);
        elem.style.paddingLeft = '20px'; // Add indentation for files
        folderStructure.appendChild(elem);
    });
}

function createFolderOrFileElement(item, path, owner, name) {
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
    return elem;
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

function generateBreadcrumbs(owner, name, path) {
    const breadcrumbContainer = document.createElement('div');
    breadcrumbContainer.className = 'breadcrumbs';

    // Function to handle breadcrumb click
    const onBreadcrumbClick = (targetPath) => () => fetchRepositoryData(owner, name, targetPath);

    // Add the Root/ breadcrumb
    breadcrumbContainer.appendChild(createBreadcrumb('Root', '', onBreadcrumbClick('')));
    breadcrumbContainer.appendChild(createSeparator());

    if (path) {
        // Split the path and filter out empty parts
        const pathParts = path.split('/').filter(Boolean);
        let cumulativePath = '';

        pathParts.forEach((part, index) => {
            if (index > 0) {
                breadcrumbContainer.appendChild(createSeparator());
            }

            cumulativePath += `${index > 0 ? '/' : ''}${part}`;
            breadcrumbContainer.appendChild(createBreadcrumb(part, cumulativePath, onBreadcrumbClick(cumulativePath)));
        });
    }

    return breadcrumbContainer;
}

function createBreadcrumb(text, path, onClick) {
    const crumb = document.createElement('span');
    crumb.className = 'breadcrumb';
    crumb.textContent = text;
    if (onClick) {
        crumb.onclick = onClick;
        crumb.style.cursor = 'pointer';
    } else {
        crumb.style.textDecoration = 'none'; // or any other style for the current directory
    }
    return crumb;
}

function createSeparator() {
    const separator = document.createElement('span');
    separator.className = 'breadcrumb-separator';
    separator.textContent = '\\';
    return separator;
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

function hideSummaryIfNeeded() {
    const summarySection = document.getElementById('summarySection');
    const summaryContent = document.getElementById('summaryContent');

    if (summaryContent.textContent.trim() === '') {
        summarySection.style.display = 'none';
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
 
document.getElementById('submit-review').addEventListener('click', function() {
    const codeContent = document.getElementById('codeContent').textContent;
    const summaryContent = document.getElementById('summaryContent');

    // Check if code content is empty or the same as the last submitted content
    if (!codeContent.trim() || codeContent === lastSubmittedContent) {
        console.log('No new content to submit for review.');
        return; // Exit the function early
    }

    // Update last submitted content
    lastSubmittedContent = codeContent;

    if (summaryContent) {
        summaryContent.textContent = 'Placeholder Text'; // This will only change the text content of the summary content div
        showSummary(); // Make sure to show the summary section
    }
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

document.getElementById('clearCode').addEventListener('click', function() {
    // Clear the Code Content section
    const codeContent = document.getElementById('codeContent');
    codeContent.innerHTML = '';

    // Clear the fileInfo field
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.textContent = '';

    // Clear the Summary section and hide it if empty
    const summaryContent = document.getElementById('summaryContent');
    summaryContent.innerHTML = '';

    hideSummaryIfNeeded();

    // Reset the lastSubmittedContent to allow resubmitting the same content
    lastSubmittedContent = '';
});


document.getElementById('resetPage').addEventListener('click', function() {
    // Reset the repository input field
    const repoInput = document.getElementById('repoInput');
    repoInput.value = '';

    // Clear the folder structure display
    const folderStructure = document.getElementById('folderStructure');
    folderStructure.innerHTML = '';

    // Clear the file content viewer
    const codeContent = document.getElementById('codeContent');
    codeContent.innerHTML = '';

    // Clear the fileInfo field
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.textContent = '';

    // Clear and hide the Summary section
    const summaryContent = document.getElementById('summaryContent');
    summaryContent.innerHTML = '';
    hideSummaryIfNeeded();
});

document.getElementById('copyCodeBtn').addEventListener('click', function() {
    const codeContent = document.getElementById('codeContent');
    if (codeContent.innerText) {
        copyToClipboard(codeContent.innerText);
    }
});