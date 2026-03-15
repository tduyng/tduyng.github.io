let searchIndex = null
let searchData = []
let isSearchReady = false

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input')
    const searchResults = document.getElementById('search-results')

    if (!searchInput || !searchResults) {
        return
    }

    // Load FlexSearch library
    const script = document.createElement('script')
    script.src = '/js/flexsearch.bundle.min.js'
    script.onload = initializeSearch
    document.head.appendChild(script)

    async function initializeSearch() {
        try {
            const response = await fetch('/search-index.json')
            searchData = await response.json()
            
            // Gozzi search index format: {"id": "...", "title": "...", "description": "...", "content": "...", "tags": [...], "url": "...", "date": "..."}
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
            console.log('Search index initialized with', searchData.length, 'documents')
        } catch (error) {
            console.error('Failed to initialize search:', error)
        }
    }

    function performSearch(query) {
        if (!isSearchReady || !query || query.trim().length < 2) {
            searchResults.innerHTML = ''
            searchResults.style.display = 'none'
            return
        }

        const results = searchIndex.search(query, { limit: 20, enrich: true })
        const allResults = new Map()
        
        results.forEach((fieldResult) => {
            fieldResult.result.forEach((item) => {
                if (!allResults.has(item.id)) allResults.set(item.id, item.doc)
            })
        })

        const uniqueResults = Array.from(allResults.values())
        if (uniqueResults.length === 0) {
            searchResults.innerHTML = '<div class="search-result"><div class="result-title">No results found</div></div>'
        } else {
            searchResults.innerHTML = uniqueResults
                .map(result => `
                <a href="${result.url}" class="search-result">
                    <div class="result-title">${result.title}</div>
                    <div class="result-date">${result.date || ''}</div>
                </a>
            `).join('')
        }
        searchResults.style.display = 'block'
    }

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value)
    })
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none'
        }
    })
})
