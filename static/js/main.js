function enablePrerender() {
    const prerender = (a) => {
        if (!a.classList.contains('instant')) return
        const script = document.createElement('script')
        script.type = 'speculationrules'
        script.textContent = JSON.stringify({ prerender: [{ source: 'list', urls: [a.href] }] })
        document.body.append(script)
        a.classList.remove('instant')
    }
    const prefetch = (a) => {
        if (!a.classList.contains('instant')) return
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = a.href
        document.head.append(link)
        a.classList.remove('instant')
    }
    const support = HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')
    const handle = support ? prerender : prefetch
    document.querySelectorAll('a.instant').forEach((a) => {
        if (a.href.endsWith(window.location.pathname)) return
        let timer
        a.addEventListener('mouseenter', () => {
            timer = setTimeout(() => handle(a), 50)
        })
        a.addEventListener('mouseleave', () => clearTimeout(timer))
        a.addEventListener('touchstart', () => handle(a), { passive: true })
    })
}

function enableNavFold() {
    const nav = document.querySelector('header nav')
    if (!nav) return
    const toggler = nav.querySelector('#toggler')
    if (!toggler) return
    const foldItems = nav.querySelectorAll('.fold')
    toggler.addEventListener('click', () => {
        if (
            window.innerWidth < 768 &&
            [...foldItems].every((item) => !item.classList.contains('shown'))
        )
            return
        foldItems.forEach((item) => item.classList.toggle('shown'))
    })
}

function enableRssMask() {
    const rssBtn = document.querySelector('#rss-btn')
    const mask = document.querySelector('#rss-mask')
    const copyBtn = document.querySelector('#rss-mask button')
    if (!rssBtn || !mask) return
    rssBtn.addEventListener('click', (e) => {
        e.preventDefault()
        mask.showModal()
    })
    const close = (e) => {
        if (e.target == mask) mask.close()
    }
    mask.addEventListener('click', close)
    const copy = () => {
        navigator.clipboard.writeText(copyBtn.dataset.link).then(() => {
            copyBtn.innerHTML = copyBtn.dataset.checkIcon
            copyBtn.classList.add('copied')
            copyBtn.removeEventListener('click', copy)
            setTimeout(() => {
                mask.close()
                copyBtn.innerHTML = copyBtn.dataset.copyIcon
                copyBtn.classList.remove('copied')
                copyBtn.addEventListener('click', copy)
            }, 400)
        })
    }
    copyBtn.addEventListener('click', copy)
}

function enableOutdateAlert() {
    const alert = document.querySelector('#outdate_alert')
    if (!alert) return
    const publish = document.querySelector('#publish')
    const updated = document.querySelector('#updated')
    const updateDate = new Date(updated ? updated.textContent : publish.textContent)
    const intervalDays = Math.floor((Date.now() - updateDate.getTime()) / (24 * 60 * 60 * 1000))
    const alertDays = parseInt(alert.dataset.days)
    if (intervalDays >= alertDays) {
        const msg = alert.dataset.alertTextBefore + intervalDays + alert.dataset.alertTextAfter
        alert.querySelector('.content').textContent = msg
        alert.classList.remove('hidden')
    }
}

function enableTocToggle() {
    const tocToggle = document.querySelector('#toc-toggle')
    if (!tocToggle) return
    const header = document.querySelector('header')
    const blurred = header.classList.contains('blur')
    const aside = document.querySelector('aside')
    const anchors = aside.querySelectorAll('a')
    const toggle = () => {
        tocToggle.classList.toggle('active')
        aside.classList.toggle('shown')
        if (blurred) header.classList.toggle('blur')
    }
    tocToggle.addEventListener('click', toggle)
    anchors.forEach((header) => header.addEventListener('click', toggle))
}

function enableTocIndicate() {
    const toc = document.querySelector('aside nav')
    if (!toc) return
    const headers = document.querySelectorAll('h2, h3')
    const tocMap = new Map()
    headers.forEach((header) => tocMap.set(header, toc.querySelector(`a[href="#${header.id}"]`)))
    let activated = null
    const observer = new IntersectionObserver(
        (entries) =>
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = tocMap.get(entry.target)
                    if (target == activated) return
                    if (activated) activated.classList.remove('active')
                    target.classList.add('active')
                    activated = target
                }
            }),
        { rootMargin: '-9% 0px -90% 0px' }
    )
    headers.forEach((header) => observer.observe(header))
}

function enableTocTooltip() {
    const anchors = document.querySelectorAll('aside nav a')
    if (anchors.length == 0) return
    const toggleTooltip = () => {
        anchors.forEach((anchor) => {
            if (anchor.offsetWidth < anchor.scrollWidth) {
                anchor.setAttribute('title', anchor.textContent)
            } else {
                anchor.removeAttribute('title')
            }
        })
    }
    window.addEventListener('resize', toggleTooltip)
    toggleTooltip()
}

function addCopyBtns() {
    const cfg = document.querySelector('#copy-cfg')
    if (!cfg) return
    const copyIcon = cfg.dataset.copyIcon
    const checkIcon = cfg.dataset.checkIcon
    document.querySelectorAll('pre').forEach((block) => {
        if (block.classList.contains('mermaid')) return
        const wrapper = document.createElement('div')
        wrapper.className = 'codeblock'
        const btn = document.createElement('button')
        btn.className = 'copy'
        btn.ariaLabel = 'copy'
        btn.innerHTML = copyIcon
        const copy = () => {
            navigator.clipboard.writeText(block.textContent).then(() => {
                btn.innerHTML = checkIcon
                btn.classList.add('copied')
                btn.removeEventListener('click', copy)
                setTimeout(() => {
                    btn.innerHTML = copyIcon
                    btn.classList.remove('copied')
                    btn.addEventListener('click', copy)
                }, 1500)
            })
        }
        btn.addEventListener('click', copy)
        wrapper.appendChild(block.cloneNode(true))
        wrapper.appendChild(btn)
        block.replaceWith(wrapper)
    })
}

function addBackToTopBtn() {
    const backBtn = document.querySelector('#back-to-top')
    if (!backBtn) return
    const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
    const toggle = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        if (scrollTop > 200 && !backBtn.classList.contains('shown')) {
            backBtn.classList.add('shown')
            backBtn.addEventListener('click', toTop)
        } else if (scrollTop <= 200 && backBtn.classList.contains('shown')) {
            backBtn.classList.remove('shown')
            backBtn.removeEventListener('click', toTop)
        }
    }
    window.addEventListener('scroll', toggle)
    toggle()
}

function addFootnoteBacklink() {
    const backlinkIcon = document.querySelector('.prose').dataset.backlinkIcon
    const footnotes = document.querySelectorAll('.footnote-definition')
    footnotes.forEach((footnote) => {
        const backlink = document.createElement('button')
        backlink.className = 'backlink'
        backlink.ariaLabel = 'backlink'
        backlink.innerHTML = backlinkIcon
        backlink.addEventListener('click', () =>
            window.scrollTo({
                top:
                    document
                        .querySelector(`.footnote-reference a[href="#${footnote.id}"]`)
                        .getBoundingClientRect().top +
                    window.scrollY -
                    50,
            })
        )
        footnote.appendChild(backlink)
    })
}

function enableImgLightense() {
    window.addEventListener('load', () =>
        Lightense('.prose img', { background: 'rgba(43, 43, 43, 0.19)' })
    )
}

//--------------------------------------------

enablePrerender()
enableNavFold()
enableRssMask()
if (document.body.classList.contains('post')) {
    enableOutdateAlert()
    enableTocToggle()
    enableTocIndicate()
    addBackToTopBtn()
    enableTocTooltip()
}
if (document.querySelector('.prose')) {
    addCopyBtns()
    addFootnoteBacklink()
    enableImgLightense()
}
