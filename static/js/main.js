function enableSidebar() {
    const triggers = document.querySelectorAll('#sidebar-trigger');
    const sidebar = document.querySelector('#sidebar');
    const mask = document.querySelector('#mask');
    
    if (!triggers.length || !sidebar || !mask) return;
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
            document.body.classList.toggle('sidebar-active');
        });
    });
    
    mask.addEventListener('click', () => {
        sidebar.classList.remove('show');
        document.body.classList.remove('sidebar-active');
        document.body.classList.remove('search-active');
    });
}

function enableSearch() {
    const input = document.querySelector('#search-input');
    const wrapper = document.querySelector('#search-wrapper');
    
    if (!input || !wrapper) return;
    
    function openSearch() {
        document.body.classList.add('search-active');
        input.focus();
    }

    function closeSearch() {
        document.body.classList.remove('search-active');
        input.blur();
    }

    input.addEventListener('focus', openSearch);
    
    // Add keyboard shortcut cmd+k or ctrl+k
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const key = isMac ? e.metaKey : e.ctrlKey;
        
        if (key && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        
        if (e.key === 'Escape') {
            closeSearch();
        }
    });
}

function enableTocScrollspy() {
    const tocLinks = document.querySelectorAll('.toc-wrapper nav a');
    const headers = Array.from(document.querySelectorAll('.prose h2, .prose h3'));
    
    if (!tocLinks.length || !headers.length) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                tocLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);
    
    headers.forEach(header => observer.observe(header));
}

function enableBackToTop() {
    const btn = document.querySelector('#back-to-top');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function addCopyBtns() {
    const codeBlocks = document.querySelectorAll('.prose pre:not(.mermaid)');
    codeBlocks.forEach(block => {
        if (block.querySelector('.code-copy-btn')) return;
        
        const button = document.createElement('button');
        button.className = 'code-copy-btn';
        button.type = 'button';
        button.innerText = 'Copy';
        
        button.addEventListener('click', () => {
            const code = block.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => button.innerText = 'Copy', 2000);
            });
        });
        
        block.appendChild(button);
    });
}

function enableImgLightense() {
    if (window.Lightense) {
        Lightense('.prose img:not(.no-lightense)');
    }
}

function enableReaction() {
    const reactionDiv = document.querySelector('.reaction');
    if (!reactionDiv) return;

    const endpoint = reactionDiv.dataset.endpoint;
    // Extract slug: last non-empty path segment, e.g. /blog/rise-of-terminal/ → rise-of-terminal
    const slug = window.location.pathname.replace(/\/$/, '').split('/').pop();
    if (!slug) return;

    async function getReactions() {
        try {
            const res = await fetch(`${endpoint}/?slug=${slug}`);
            if (!res.ok) return;
            const data = await res.json();
            renderReactions(data);
        } catch (e) { console.error('Failed to fetch reactions', e); }
    }

    async function toggleReaction(emoji, currentlyReacted) {
        try {
            await fetch(`${endpoint}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, target: emoji, reacted: !currentlyReacted }),
            });
            await getReactions();
        } catch (e) { console.error('Failed to toggle reaction', e); }
    }

    function renderReactions(data) {
        reactionDiv.innerHTML = '';
        Object.entries(data).forEach(([emoji, [count, reacted]]) => {
            const btn = document.createElement('button');
            btn.className = 'reaction-btn' + (reacted ? ' active' : '');
            btn.innerHTML = `<span class="reaction-icon">${emoji}</span> <span class="reaction-count">${count}</span>`;
            btn.onclick = () => toggleReaction(emoji, reacted);
            reactionDiv.appendChild(btn);
        });
    }

    getReactions();
}

function enableOutdateAlert() {
    const alert = document.getElementById('outdate_alert');
    if (!alert) return;

    const publishDate = document.querySelector('time[datetime]').getAttribute('datetime');
    if (!publishDate) return;

    const daysLimit = parseInt(alert.dataset.days) || 365;
    const diffTime = Math.abs(new Date() - new Date(publishDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > daysLimit) {
        const beforeText = alert.dataset.alertTextBefore || 'This article was last updated';
        const afterText = alert.dataset.alertTextAfter || 'ago and may be out of date.';
        alert.querySelector('.content').innerText = `${beforeText} ${diffDays} days ${afterText}`;
        alert.classList.remove('hidden');
    }
}

//--------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    enableSidebar();
    enableSearch();
    enableTocScrollspy();
    enableBackToTop();
    
    if (document.querySelector('.prose')) {
        addCopyBtns();
        enableImgLightense();
        enableReaction();
        enableOutdateAlert();
    }
});
