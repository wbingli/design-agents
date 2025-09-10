document.addEventListener('DOMContentLoaded', function() {
    const companySelect = document.getElementById('company-select');
    const topicSelect = document.getElementById('topic-select');
    const pdfContainer = document.getElementById('pdf-container');
    const pdfViewer = document.getElementById('pdf-viewer');

    async function fetchJSON(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
    }

    async function loadCompanies() {
        try {
            const data = await fetchJSON('http://localhost:3001/api/companies');
            companySelect.innerHTML = '<option value="" disabled selected>Choose a company</option>';
            data.companies.forEach((c) => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                companySelect.appendChild(opt);
            });
            companySelect.disabled = false;
        } catch (e) {
            console.error('Failed to load companies', e);
            const el = document.getElementById('load-error');
            if (el) el.style.display = 'block';
        }
    }

    async function loadTopics(company) {
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="" disabled selected>Choose a topic</option>';
        try {
            const data = await fetchJSON(`http://localhost:3001/api/companies/${encodeURIComponent(company)}/topics`);
            data.topics.forEach((t) => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                topicSelect.appendChild(opt);
            });
            topicSelect.disabled = false;
        } catch (e) {
            console.error('Failed to load topics', e);
        }
    }

    function showPDF(company, topic) {
        const url = `http://localhost:3001/api/companies/${encodeURIComponent(company)}/topics/${encodeURIComponent(topic)}/pdf`;
        pdfViewer.src = url;
        pdfContainer.classList.remove('hidden');
    }

    companySelect?.addEventListener('change', () => {
        const company = companySelect.value;
        if (!company) return;
        loadTopics(company);
        pdfContainer.classList.add('hidden');
        pdfViewer.removeAttribute('src');
    });

    topicSelect?.addEventListener('change', () => {
        const company = companySelect.value;
        const topic = topicSelect.value;
        if (company && topic) {
            showPDF(company, topic);
        }
    });

    if (companySelect && topicSelect && pdfViewer) {
        loadCompanies();
    }
});


