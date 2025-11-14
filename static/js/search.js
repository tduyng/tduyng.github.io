let searchIndex = null
let searchData = []
let isSearchReady = false

// Initialize FlexSearch when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const searchModal = document.getElementById('search-modal')
    const searchToggle = document.getElementById('search-toggle')
    const searchClose = document.getElementById('search-close')
    const searchInput = document.getElementById('search-input')
    const searchResults = document.getElementById('search-results')

    if (!searchModal || !searchToggle || !searchClose || !searchInput || !searchResults) {
        console.warn('Search elements not found')
        return
    }

    // Load FlexSearch library
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/flexsearch@0.7.43/dist/flexsearch.bundle.min.js'
    script.onload = initializeSearch
    script.onerror = () => {
        console.error('Failed to load FlexSearch library')
        showError('Search library failed to load')
    }
    document.head.appendChild(script)

    async function initializeSearch() {
        try {
            // Fetch search index
            const response = await fetch('/search-index.json')
            if (!response.ok) {
                throw new Error('Search index not found')
            }

            searchData = await response.json()

            // Create FlexSearch index
            searchIndex = new FlexSearch.Document({
                document: {
                    id: 'id',
                    index: ['title', 'description', 'content', 'tags'],
                    store: ['title', 'description', 'url', 'date', 'tags'],
                },
                tokenize: 'forward',
                context: true,
                resolution: 9,
            })

            // Index all documents
            searchData.forEach((doc) => {
                searchIndex.add(doc)
            })

            isSearchReady = true
            console.log(`✅ Search ready with ${searchData.length} entries`)
        } catch (error) {
            console.error('Failed to initialize search:', error)
            showError('Search index not available. Try rebuilding the site.')
        }
    }

    function showError(message) {
        searchResults.innerHTML = `
            <div class="search-message error">
                <p>${message}</p>
            </div>
        `
    }

    function showNoResults(query) {
        searchResults.innerHTML = `
            <div class="search-message">
                <p>No results found for "<strong>${escapeHtml(query)}</strong>"</p>
                <p class="hint">Try different keywords or check spelling</p>
            </div>
        `
    }

    function showInitial() {
        searchResults.innerHTML = `
            <div class="search-message">
                <p>Start typing to search...</p>
                <p class="hint">Search across ${searchData.length} posts and notes</p>
            </div>
        `
    }

    function escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    function highlightMatch(text, query) {
        if (!text || !query) return text
        const regex = new RegExp(`(${query.split(' ').join('|')})`, 'gi')
        return text.replace(regex, '<mark>$1</mark>')
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        } catch {
            return dateStr
        }
    }

    function performSearch(query) {
        if (!isSearchReady) {
            showError('Search is still loading...')
            return
        }

        if (!query || query.trim().length < 2) {
            showInitial()
            return
        }

        const results = searchIndex.search(query, { limit: 20, enrich: true })

        // Flatten results (FlexSearch returns results per field)
        const allResults = new Map()
        results.forEach((fieldResult) => {
            fieldResult.result.forEach((item) => {
                if (!allResults.has(item.id)) {
                    allResults.set(item.id, item.doc)
                }
            })
        })

        const uniqueResults = Array.from(allResults.values())

        if (uniqueResults.length === 0) {
            showNoResults(query)
            return
        }

        // Render results
        const resultHTML = uniqueResults
            .map((result, index) => {
                const tags = Array.isArray(result.tags)
                    ? result.tags.map((tag) => `<span class="search-tag">#${tag}</span>`).join('')
                    : ''

                return `
                <a href="${result.url}" class="search-result" data-index="${index}">
                    <div class="result-header">
                        <h3 class="result-title">${highlightMatch(result.title, query)}</h3>
                        ${result.date ? `<span class="result-date">${formatDate(result.date)}</span>` : ''}
                    </div>
                    ${result.description ? `<p class="result-description">${highlightMatch(result.description, query)}</p>` : ''}
                    ${tags ? `<div class="result-tags">${tags}</div>` : ''}
                </a>
            `
            })
            .join('')

        searchResults.innerHTML = `
            <div class="search-count">${uniqueResults.length} result${uniqueResults.length === 1 ? '' : 's'}</div>
            ${resultHTML}
        `
    }

    // Debounce search input
    let searchTimeout
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value)
        }, 200)
    })

    // Open search modal
    function openSearch() {
        searchModal.showModal()
        document.body.style.overflow = 'hidden'
        searchInput.value = ''
        showInitial()
        setTimeout(() => searchInput.focus(), 100)
    }

    // Close search modal
    function closeSearch() {
        searchModal.close()
        document.body.style.overflow = ''
        searchInput.value = ''
    }

    // Event listeners
    searchToggle.addEventListener('click', openSearch)
    searchClose.addEventListener('click', closeSearch)

    // Close on backdrop click
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearch()
        }
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd+K or Ctrl+K to open search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            openSearch()
        }

        // Escape to close
        if (e.key === 'Escape' && searchModal.open) {
            closeSearch()
        }

        // Navigate results with arrow keys
        if (searchModal.open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            const results = searchResults.querySelectorAll('.search-result')
            const active = searchResults.querySelector('.search-result.active')
            let nextIndex = 0

            if (active) {
                const currentIndex = parseInt(active.dataset.index)
                active.classList.remove('active')

                if (e.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % results.length
                } else {
                    nextIndex = currentIndex === 0 ? results.length - 1 : currentIndex - 1
                }
            }

            if (results[nextIndex]) {
                results[nextIndex].classList.add('active')
                results[nextIndex].scrollIntoView({ block: 'nearest' })
            }
        }

        // Enter to open selected result
        if (searchModal.open && e.key === 'Enter') {
            const active = searchResults.querySelector('.search-result.active')
            if (active) {
                window.location.href = active.href
            }
        }
    })
})
