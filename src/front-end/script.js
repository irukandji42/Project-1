// === Initialization ===
let lastSubmittedContent = '';

// === Utility Functions ===

function decodeBase64(encodedStr) {
    try {
        return atob(encodedStr);
    } catch (error) {
        console.error('Error decoding Base64 string:', error);
        return '';
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10); // Slight delay to ensure the class change triggers the animation

    // Wait for the fade-in to finish, then start fade-out after a delay
    setTimeout(() => {
        toast.classList.remove('show'); // Begin fade-out
        // Listen for the end of the fade-out transition
        toast.addEventListener('transitionend', function() {
            document.body.removeChild(toast); // Remove the toast once fade-out completes
        }, { once: true }); // Ensure the listener is removed after it fires
    }, 3000 + 500); // Show duration + fade-in duration to ensure full visibility before fade-out
}

// === DOM Manipulation Functions ===

function fetchRepositoryData(owner, name, path = '') {
    const url = `https://api.github.com/repos/${owner}/${name}/contents/${path}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                // If response is not ok, assume the repo might not exist or there's a typo
                showToast(`Repository not found or there was a typo. Please try again. Status: ${response.status}`);
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
            // Optionally, display a more generic error message in the toast for any type of fetch error
            // showToast('An error occurred while fetching repository data. Please try again.');
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

function displayFileContent(data, path) {
    const codeContent = document.getElementById('codeContent');
    codeContent.innerHTML = ''; // Reset code content

    const fileName = path.split('/').pop();
    fileInfo.textContent = `File: ${fileName}`;

    if (fileName.toLowerCase().endsWith('.db')) {
        codeContent.innerHTML = `<pre style="color: red;">[Database file (.db) content not displayed]</pre>`;
    } else {
        let formattedContent = decodeBase64(data.content);
        formattedContent = formattedContent.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Split content into lines for numbering
        const lines = formattedContent.split('\n');
        lines.forEach((line, index) => {
            const lineContainer = document.createElement('div');
            lineContainer.innerHTML = `<span class="line-number">${index + 1}</span> ${line}`;
            codeContent.appendChild(lineContainer);
        });
    }
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

// === Event Listeners ===

document.getElementById('fetchRepo').addEventListener('click', function() {
    const repoInput = document.getElementById('repoInput').value.trim();
    const [owner, name] = repoInput.split('/');
    const button = this; // Reference to the button
    const cooldownPeriod = 3000; // Cooldown period in milliseconds (e.g., 3 seconds)

    // Disable the button to prevent repeated clicks
    button.disabled = true;
    setTimeout(() => {
        button.disabled = false; // Re-enable the button after the cooldown period
    }, cooldownPeriod);

    if (owner && name) {
        fetchRepositoryData(owner, name);
    } else {
        // If input validation fails, show an error (consider replacing alert with showToast if available)
        alert('Please enter the repository in the format "owner/repo".');
        // Optionally, immediately re-enable the button if the input is invalid, since no fetch operation will occur
        button.disabled = false; // Comment this line if you want to keep the button disabled during cooldown even for invalid input
    }
});

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
    const codeLines = document.querySelectorAll('#codeContent > div'); // Assuming each line of code is wrapped in a div
    let codeToCopy = '';
    codeLines.forEach(line => {
        // Assuming the actual code (excluding line number) is wrapped in a separate span or similar container
        const codeSpan = line.querySelector('span:not(.line-number)');
        if (codeSpan) {
            codeToCopy += codeSpan.textContent + '\n'; // Aggregate the code, excluding line numbers
        } else {
            // Fallback in case there's no span around the code content
            codeToCopy += line.textContent.substring(line.querySelector('.line-number').textContent.length).trim() + '\n';
        }
    });

    // Copy the aggregated code to clipboard
    navigator.clipboard.writeText(codeToCopy).then(() => {
        console.log('Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy code:', err);
    });
});

// Optional: Consider creating a function to initialize event listeners if the setup grows more complex.