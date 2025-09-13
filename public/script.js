document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const companySelect = document.getElementById('company-select');
    const topicSelect = document.getElementById('topic-select');
    const pdfContainer = document.getElementById('pdf-container');
    const pdfViewer = document.getElementById('pdf-viewer');
    const welcome = document.getElementById('welcome');
    const selectedCompany = document.getElementById('selected-company');
    const selectedTopic = document.getElementById('selected-topic');
    const viewPdfBtn = document.getElementById('view-pdf-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const clearBtn = document.getElementById('clear-btn');

    // API Helper Functions
    async function fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // Load Companies from API
    async function loadCompanies() {
        try {
            const data = await fetchJSON('/api/companies');
            
            // Clear existing options except the first one
            companySelect.innerHTML = '<option value="" disabled selected>Please select company...</option>';
            
            // Add companies from API
            data.companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company;
                option.textContent = company;
                companySelect.appendChild(option);
            });
            
            companySelect.disabled = false;
            
            // Auto-select first company if available
            if (data.companies.length > 0) {
                companySelect.value = data.companies[0];
                const event = new Event('change', { bubbles: true });
                companySelect.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error('Failed to load companies:', error);
            showError('Failed to load companies. Please check if the backend is running.');
        }
    }

    // Load Topics for Selected Company
    async function loadTopics(company) {
        if (!company) return;
        
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="" disabled selected>Please select company first...</option>';
        
        try {
            const data = await fetchJSON(`/api/companies/${encodeURIComponent(company)}/topics`);
            
            // Clear and populate topic options
            topicSelect.innerHTML = '<option value="" disabled selected>Please select topic...</option>';
            
            data.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
            
            topicSelect.disabled = false;
            
            // Auto-select first topic if available
            if (data.topics.length > 0) {
                topicSelect.value = data.topics[0];
                const event = new Event('change', { bubbles: true });
                topicSelect.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error('Failed to load topics:', error);
            topicSelect.innerHTML = '<option value="" disabled selected>Failed to load topics</option>';
        }
    }

    // Update Selected Information Display
    function updateSelectedInfo(company, topic) {
        if (selectedCompany) {
            selectedCompany.textContent = company || 'Not selected';
        }
        if (selectedTopic) {
            selectedTopic.textContent = topic || 'Not selected';
        }
        
        const hasSelection = company && topic;
        if (viewPdfBtn) {
            viewPdfBtn.disabled = !hasSelection;
        }
        if (downloadPdfBtn) {
            downloadPdfBtn.disabled = !hasSelection;
        }
    }

    // Show PDF in Viewer
    function showPDF(company, topic) {
        if (!company || !topic) return;
        
        const url = `/api/companies/${encodeURIComponent(company)}/topics/${encodeURIComponent(topic)}/pdf`;
        pdfViewer.src = url;
        pdfContainer.classList.remove('hidden');
        if (welcome) {
            welcome.classList.add('hidden');
        }
        updateSelectedInfo(company, topic);
    }

    // Clear All Selections
    function clearSelection() {
        companySelect.value = '';
        topicSelect.value = '';
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="" disabled selected>Please select company first...</option>';
        
        pdfContainer.classList.add('hidden');
        pdfViewer.removeAttribute('src');
        
        if (welcome) {
            welcome.classList.remove('hidden');
        }
        
        updateSelectedInfo('', '');
    }

    // Show Error Message
    function showError(message) {
        // You can implement a toast notification or error display here
        console.error('Error:', message);
        alert(message); // Simple alert for now
    }

    // Event Listeners
    companySelect?.addEventListener('change', function() {
        const company = this.value;
        if (!company) {
            updateSelectedInfo('', '');
            return;
        }
        
        loadTopics(company);
        updateSelectedInfo(company, '');
        
        // Hide PDF and show welcome message
        pdfContainer.classList.add('hidden');
        pdfViewer.removeAttribute('src');
        if (welcome) {
            welcome.classList.remove('hidden');
        }
    });

    topicSelect?.addEventListener('change', function() {
        const company = companySelect.value;
        const topic = this.value;
        
        updateSelectedInfo(company, topic);
        
        if (company && topic) {
            showPDF(company, topic);
        } else {
            pdfContainer.classList.add('hidden');
            pdfViewer.removeAttribute('src');
            if (welcome) {
                welcome.classList.remove('hidden');
            }
        }
    });

    clearBtn?.addEventListener('click', clearSelection);

    viewPdfBtn?.addEventListener('click', function() {
        const company = companySelect.value;
        const topic = topicSelect.value;
        if (company && topic) {
            showPDF(company, topic);
        }
    });

    downloadPdfBtn?.addEventListener('click', function() {
        const company = companySelect.value;
        const topic = topicSelect.value;
        if (company && topic) {
            const url = `/api/companies/${encodeURIComponent(company)}/topics/${encodeURIComponent(topic)}/pdf`;
            const link = document.createElement('a');
            link.href = url;
            link.download = `${company}-${topic}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    // Initialize the application
    if (companySelect && topicSelect && pdfViewer) {
        loadCompanies();
    }
});