let searchIndex = null
let searchData = []
let isSearchReady = false

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input')
    const searchResults = document.getElementById('search-results')
    const searchWrapper = document.getElementById('search-wrapper')

    if (!searchInput || !searchResults) return

    // Load FlexSearch lazily
    const script = document.createElement('script')
    script.src = '/js/flexsearch.bundle.min.js'
    script.onload = initializeSearch
    document.head.appendChild(script)

    async function initializeSearch() {
        try {
            const response = await fetch('/search-index.json')
            searchData = await response.json()

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

            searchData.forEach((doc) => searchIndex.add(doc))
            isSearchReady = true
        } catch (error) {
            console.error('Failed to initialize search:', error)
        }
    }

    // --- Keyboard navigation state ---
    let activeIndex = -1

    function getItems() {
        return Array.from(searchResults.querySelectorAll('a.search-result'))
    }

    function setActive(index) {
        const items = getItems()
        if (!items.length) return
        activeIndex = Math.max(-1, Math.min(index, items.length - 1))
        items.forEach((item, i) => {
            item.classList.toggle('active', i === activeIndex)
            if (i === activeIndex) item.scrollIntoView({ block: 'nearest' })
        })
    }

    function showResults() {
        searchResults.style.display = 'block'
    }

    function hideResults() {
        searchResults.style.display = 'none'
        activeIndex = -1
    }

    function renderResults(uniqueResults) {
        if (uniqueResults.length === 0) {
            searchResults.innerHTML = '<div class="search-result search-empty">No results found</div>'
        } else {
            searchResults.innerHTML = uniqueResults
                .map((result) => `
                    <a href="${result.url}" class="search-result">
                        <div class="result-title">${result.title}</div>
                        <div class="result-date">${result.date || ''}</div>
                    </a>
                `)
                .join('')
        }
        showResults()
    }

    function performSearch(query) {
        activeIndex = -1

        if (!isSearchReady || !query || query.trim().length < 2) {
            hideResults()
            return
        }

        const results = searchIndex.search(query, { limit: 20, enrich: true })
        const seen = new Map()
        results.forEach((fieldResult) => {
            fieldResult.result.forEach((item) => {
                if (!seen.has(item.id)) seen.set(item.id, item.doc)
            })
        })

        renderResults(Array.from(seen.values()))
    }

    // Input handler
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value)
    })

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = getItems()
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive(activeIndex + 1)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive(activeIndex <= 0 ? -1 : activeIndex - 1)
            if (activeIndex === -1) searchInput.focus()
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && items[activeIndex]) {
                window.location.href = items[activeIndex].href
            }
        } else if (e.key === 'Escape') {
            hideResults()
            searchInput.blur()
        }
    })

    // Prevent mousedown on results from blurring the input (which would hide results before click fires)
    searchResults.addEventListener('mousedown', (e) => {
        e.preventDefault()
    })

    // Cmd+K / Ctrl+K
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            searchInput.focus()
            searchInput.select()
        }
    })

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (
            searchWrapper && !searchWrapper.contains(e.target) ||
            !searchWrapper && !searchInput.contains(e.target) && !searchResults.contains(e.target)
        ) {
            hideResults()
        }
    })
})
