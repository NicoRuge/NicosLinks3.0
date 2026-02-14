const BlogView = {
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 col-xl-10" style="max-width: 1100px;">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <button v-if="selectedPost" class="btn btn-sm btn-outline-secondary" type="button" @click="closePost">
                            <i class="bi bi-arrow-left me-1"></i>
                            Back
                        </button>

                        <h1 class="h3 mb-0 me-auto">{{ selectedPost ? (blogTitle || 'Blog') : 'Blog' }}</h1>

                        <a class="btn btn-sm btn-outline-secondary" :href="publicBlogUrl" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-box-arrow-up-right me-1"></i>
                            Open on Tumblr
                        </a>

                        <button class="btn btn-sm btn-outline-primary" type="button" @click="refresh" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                            <i v-else class="bi bi-arrow-clockwise me-1"></i>
                            Refresh
                        </button>
                    </div>

                    <div v-if="!selectedPost" class="card shadow-sm border-0 mb-3">
                        <div class="card-body">
                            <div class="d-flex flex-wrap align-items-center gap-2">
                                <div class="text-secondary small">
                                    <span class="fw-semibold text-body">{{ blogTitle || 'lnx-photo' }}</span>
                                    <span v-if="totalPosts !== null"> · {{ totalPosts }} posts</span>
                                </div>

                                <div class="ms-auto d-flex align-items-center gap-2">
                                    <button class="btn btn-sm btn-outline-secondary" type="button" @click="prevPage" :disabled="loading || start === 0">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                    <span class="small text-secondary">{{ pageLabel }}</span>
                                    <button class="btn btn-sm btn-outline-secondary" type="button" @click="nextPage" :disabled="loading || !hasNext">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                    </div>

                    <!-- Detail view -->
                    <div v-if="selectedPost && !loading" class="card shadow-sm border-0 overflow-hidden">
                        <template v-if="selectedPost.images && selectedPost.images.length">
                            <div v-if="selectedPost.images.length > 1" :id="selectedPost.carouselId" class="carousel slide">
                                <div class="carousel-indicators">
                                    <button
                                        v-for="(img, idx) in selectedPost.images"
                                        :key="selectedPost.id + '-dind-' + idx"
                                        type="button"
                                        :data-bs-target="'#' + selectedPost.carouselId"
                                        :data-bs-slide-to="idx"
                                        :class="{ active: idx === 0 }"
                                        :aria-current="idx === 0 ? 'true' : null"
                                        :aria-label="'Slide ' + (idx + 1)"
                                    ></button>
                                </div>
                                <div class="carousel-inner">
                                    <div
                                        v-for="(img, idx) in selectedPost.images"
                                        :key="selectedPost.id + '-dimg-' + idx"
                                        class="carousel-item"
                                        :class="{ active: idx === 0 }"
                                    >
                                        <img
                                            :src="img"
                                            class="d-block w-100 blog-card-img blog-detail-img blog-clickable-media"
                                            :alt="selectedPost.title || 'Tumblr post image'"
                                            loading="lazy"
                                            referrerpolicy="no-referrer"
                                            @click="openLightbox(selectedPost.images, idx, selectedPost.title || 'Image')"
                                        >
                                    </div>
                                </div>
                                <button class="carousel-control-prev" type="button" :data-bs-target="'#' + selectedPost.carouselId" data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" :data-bs-target="'#' + selectedPost.carouselId" data-bs-slide="next">
                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>
                            </div>

                            <img
                                v-else
                                :src="selectedPost.images[0]"
                                class="card-img-top blog-card-img blog-detail-img blog-clickable-media"
                                :alt="selectedPost.title || 'Tumblr post image'"
                                loading="lazy"
                                referrerpolicy="no-referrer"
                                @click="openLightbox(selectedPost.images, 0, selectedPost.title || 'Image')"
                            >
                        </template>

                        <div class="card-body">
                            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                                <span class="badge text-bg-secondary-subtle text-secondary-emphasis text-uppercase">{{ selectedPost.typeLabel }}</span>
                                    <span class="small blog-meta">{{ selectedPost.dateLabel }}</span>
                                    <span v-if="selectedPost.noteCount !== null" class="badge blog-tag ms-auto">
                                        <i class="bi bi-heart me-1"></i>
                                        {{ selectedPost.noteCount }} notes
                                    </span>
                            </div>

                            <h2 v-if="selectedPost.title" class="h5 mb-3">{{ selectedPost.title }}</h2>

                            <div v-if="selectedPost.contentHtml" class="tumblr-embed-content" v-html="selectedPost.contentHtml"></div>
                            <div v-else class="blog-meta">No content.</div>

                            <div v-if="selectedPost.tags && selectedPost.tags.length" class="d-flex flex-wrap gap-1 mt-4">
                                <span v-for="t in selectedPost.tags" :key="selectedPost.id + '-dt-' + t" class="badge rounded-pill blog-tag">
                                    #{{ t }}
                                </span>
                            </div>
                        </div>

                        <div class="card-footer bg-body-tertiary border-0 d-flex flex-wrap gap-2">
                            <button class="btn btn-outline-secondary" type="button" @click="closePost">
                                <i class="bi bi-arrow-left me-1"></i>
                                Back to list
                            </button>
                            <button class="btn btn-outline-secondary" type="button" @click="copyLink(selectedPost.url)">
                                <i class="bi bi-link-45deg me-1"></i>
                                Copy Tumblr link
                            </button>
                            <a class="btn btn-primary ms-auto" :href="selectedPost.url" target="_blank" rel="noopener noreferrer">
                                Open on Tumblr
                                <i class="bi bi-box-arrow-up-right ms-1"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Lightbox modal -->
                    <div class="modal fade" id="tumblrImageModal" tabindex="-1" aria-hidden="true" ref="imageModal">
                        <div class="modal-dialog modal-dialog-centered modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">{{ lightboxTitle }}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body p-0">
                                    <div v-if="lightboxImages.length" id="tumblrLightboxCarousel" class="carousel slide" data-bs-interval="false">
                                        <div class="carousel-indicators">
                                            <button
                                                v-for="(img, idx) in lightboxImages"
                                                :key="'lb-ind-' + idx"
                                                type="button"
                                                data-bs-target="#tumblrLightboxCarousel"
                                                :data-bs-slide-to="idx"
                                                :class="{ active: idx === 0 }"
                                                :aria-current="idx === 0 ? 'true' : null"
                                                :aria-label="'Slide ' + (idx + 1)"
                                            ></button>
                                        </div>
                                        <div class="carousel-inner bg-body-tertiary">
                                            <div
                                                v-for="(img, idx) in lightboxImages"
                                                :key="'lb-img-' + idx"
                                                class="carousel-item"
                                                :class="{ active: idx === 0 }"
                                            >
                                                <img :src="img" class="d-block w-100 blog-lightbox-img" alt="" loading="lazy" referrerpolicy="no-referrer">
                                            </div>
                                        </div>
                                        <button class="carousel-control-prev" type="button" data-bs-target="#tumblrLightboxCarousel" data-bs-slide="prev">
                                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span class="visually-hidden">Previous</span>
                                        </button>
                                        <button class="carousel-control-next" type="button" data-bs-target="#tumblrLightboxCarousel" data-bs-slide="next">
                                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span class="visually-hidden">Next</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <a v-if="lightboxImages[lightboxIndex]" class="btn btn-outline-secondary" :href="lightboxImages[lightboxIndex]" target="_blank" rel="noopener noreferrer">
                                        Open image
                                        <i class="bi bi-box-arrow-up-right ms-1"></i>
                                    </a>
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="loading" class="row g-3">
                        <div v-for="n in pageSize" :key="'sk-' + n" class="col-12 col-md-6 col-xl-4">
                            <div class="card shadow-sm border-0 h-100 overflow-hidden">
                                <div class="skeleton-box" style="height: 180px;"></div>
                                <div class="card-body">
                                    <div class="skeleton-box mb-2" style="height: 14px; width: 60%;"></div>
                                    <div class="skeleton-box mb-2" style="height: 12px; width: 90%;"></div>
                                    <div class="skeleton-box" style="height: 12px; width: 75%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="!selectedPost" class="row g-3">
                        <div v-for="post in posts" :key="post.id" class="col-12 col-md-6 col-xl-4">
                            <div class="card shadow-sm border-0 h-100 overflow-hidden blog-card">
                                <template v-if="post.images && post.images.length">
                                    <div v-if="post.images.length > 1" :id="post.carouselId" class="carousel slide">
                                        <div class="carousel-indicators">
                                            <button
                                                v-for="(img, idx) in post.images"
                                                :key="post.id + '-ind-' + idx"
                                                type="button"
                                                :data-bs-target="'#' + post.carouselId"
                                                :data-bs-slide-to="idx"
                                                :class="{ active: idx === 0 }"
                                                :aria-current="idx === 0 ? 'true' : null"
                                                :aria-label="'Slide ' + (idx + 1)"
                                            ></button>
                                        </div>
                                        <div class="carousel-inner">
                                            <div
                                                v-for="(img, idx) in post.images"
                                                :key="post.id + '-img-' + idx"
                                                class="carousel-item"
                                                :class="{ active: idx === 0 }"
                                            >
                                                <img :src="img" class="d-block w-100 blog-card-img" :alt="post.title || 'Tumblr post image'" loading="lazy" referrerpolicy="no-referrer">
                                            </div>
                                        </div>
                                        <button class="carousel-control-prev" type="button" :data-bs-target="'#' + post.carouselId" data-bs-slide="prev">
                                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span class="visually-hidden">Previous</span>
                                        </button>
                                        <button class="carousel-control-next" type="button" :data-bs-target="'#' + post.carouselId" data-bs-slide="next">
                                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span class="visually-hidden">Next</span>
                                        </button>
                                    </div>

                                    <img v-else :src="post.images[0]" class="card-img-top blog-card-img" :alt="post.title || 'Tumblr post image'" loading="lazy" referrerpolicy="no-referrer">
                                </template>

                                <div class="card-body d-flex flex-column">
                                    <div class="d-flex align-items-start gap-2 mb-2">
                                        <span class="badge text-bg-secondary-subtle text-secondary-emphasis text-uppercase">{{ post.typeLabel }}</span>
                                        <span class="small blog-meta ms-auto">{{ post.dateLabel }}</span>
                                    </div>

                                    <h2 v-if="post.title" class="h6 mb-2">{{ post.title }}</h2>
                                    <p v-if="post.excerpt" class="blog-excerpt mb-3 blog-card-excerpt">{{ post.excerpt }}</p>

                                    <div v-if="post.tags && post.tags.length" class="d-flex flex-wrap gap-1 mb-3">
                                        <span v-for="t in post.tags.slice(0, 6)" :key="post.id + '-' + t" class="badge rounded-pill blog-tag">
                                            #{{ t }}
                                        </span>
                                    </div>

                                    <div class="mt-auto d-flex gap-2">
                                        <button class="btn btn-sm btn-primary" type="button" @click="openPost(post)">
                                            Read
                                            <i class="bi bi-arrow-right-short ms-1"></i>
                                        </button>
                                        <button v-if="post.url && post.url.length" class="btn btn-sm btn-outline-secondary ms-auto" type="button" @click="copyLink(post.url)">
                                            <i class="bi bi-link-45deg me-1"></i>
                                            Copy link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="!posts.length" class="col-12">
                            <div class="card border-0 bg-body-tertiary">
                                <div class="card-body text-center text-secondary py-5">
                                    No posts found.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            loading: true,
            error: null,
            posts: [],
            selectedPost: null,
            lightboxImages: [],
            lightboxIndex: 0,
            lightboxTitle: 'Image',
            _lightboxModalInstance: null,
            _lightboxCarouselInstance: null,
            _lightboxSlideHandler: null,
            blogTitle: null,
            totalPosts: null,
            start: 0,
            pageSize: 12,
            _activeLoadId: 0,
            _scriptEl: null
        }
    },
    computed: {
        blogHostname() {
            // Public Tumblr blog hostname for JSON "read" API (legacy JSONP-style).
            // Your dashboard URL is https://www.tumblr.com/blog/lnx-photo; the public blog is typically https://lnx-photo.tumblr.com
            return 'lnx-photo.tumblr.com'
        },
        publicBlogUrl() {
            return `https://${this.blogHostname}/`
        },
        hasNext() {
            if (this.totalPosts === null) return true
            return this.start + this.pageSize < this.totalPosts
        },
        pageLabel() {
            const pageNumber = Math.floor(this.start / this.pageSize) + 1
            const totalPages = this.totalPosts !== null ? Math.max(1, Math.ceil(this.totalPosts / this.pageSize)) : null
            return totalPages ? `Page ${pageNumber} / ${totalPages}` : `Page ${pageNumber}`
        }
    },
    methods: {
        normalizeUrl(url) {
            if (!url || typeof url !== 'string') return null
            const trimmed = url.trim()
            if (!trimmed) return null
            if (trimmed.startsWith('//')) return `https:${trimmed}`
            if (trimmed.startsWith('http://')) return `https://${trimmed.slice('http://'.length)}`
            return trimmed
        },
        stripHtml(html) {
            if (!html) return ''
            const div = document.createElement('div')
            div.innerHTML = html
            return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim()
        },
        extractImageUrlsFromHtml(html) {
            if (!html) return []
            const div = document.createElement('div')
            div.innerHTML = html

            const urls = []
            const imgs = div.querySelectorAll('img')
            for (const img of imgs) {
                const raw =
                    img.getAttribute('src') ||
                    img.getAttribute('data-src') ||
                    img.getAttribute('data-orig-src') ||
                    null
                let candidate = raw
                if (!candidate) {
                    const srcset = img.getAttribute('srcset')
                    if (srcset) candidate = srcset.split(',')[0]?.trim()?.split(' ')[0] || null
                }
                const normalized = this.normalizeUrl(candidate)
                if (normalized) urls.push(normalized)
            }

            return urls
        },
        sanitizeHtml(html, opts = {}) {
            if (!html) return ''
            const { removeImages = false } = opts
            const div = document.createElement('div')
            div.innerHTML = html

            const forbidden = div.querySelectorAll('script, style')
            for (const el of forbidden) el.remove()

            if (removeImages) {
                const imgs = div.querySelectorAll('img')
                for (const img of imgs) img.remove()
            }

            const all = div.querySelectorAll('*')
            for (const el of all) {
                for (const attr of [...el.attributes]) {
                    const name = attr.name.toLowerCase()
                    const value = attr.value || ''
                    if (name.startsWith('on')) el.removeAttribute(attr.name)
                    if ((name === 'href' || name === 'src') && value.trim().toLowerCase().startsWith('javascript:')) {
                        el.removeAttribute(attr.name)
                    }
                }
                if (el.tagName.toLowerCase() === 'a') {
                    el.setAttribute('target', '_blank')
                    el.setAttribute('rel', 'noopener noreferrer')
                }
                if (!removeImages && el.tagName.toLowerCase() === 'img') {
                    el.setAttribute('referrerpolicy', 'no-referrer')
                    el.classList.add('img-fluid')
                }
            }

            return div.innerHTML
        },
        formatDate(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            if (Number.isNaN(date.getTime())) return dateStr
            return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(date)
        },
        pickFirstImageUrl(rawPost) {
            if (!rawPost) return null
            // Common fields across Tumblr legacy read API
            const preferredKeys = [
                'photo-url-1280',
                'photo-url-500',
                'photo-url-400',
                'photo-url-250',
                'photo-url-100'
            ]
            for (const key of preferredKeys) {
                if (rawPost[key]) return this.normalizeUrl(rawPost[key])
            }
            if (Array.isArray(rawPost.photos) && rawPost.photos.length) {
                const first = rawPost.photos[0]
                for (const key of preferredKeys) {
                    if (first[key]) return this.normalizeUrl(first[key])
                }
            }
            return null
        },
        pickAllImageUrls(rawPost) {
            if (!rawPost) return []

            const preferredKeys = [
                'photo-url-1280',
                'photo-url-500',
                'photo-url-400',
                'photo-url-250',
                'photo-url-100'
            ]

            const urls = []

            if (Array.isArray(rawPost.photos) && rawPost.photos.length) {
                for (const photo of rawPost.photos) {
                    for (const key of preferredKeys) {
                        if (photo?.[key]) {
                            urls.push(this.normalizeUrl(photo[key]))
                            break
                        }
                    }
                }
            } else {
                const single = this.pickFirstImageUrl(rawPost)
                if (single) urls.push(single)
            }

            // Some Tumblr posts are "regular" with inline <img> tags in the body/caption.
            const htmlSources = [
                rawPost['regular-body'],
                rawPost['photo-caption'],
                rawPost['link-description'],
                rawPost['video-caption'],
                rawPost['conversation-text']
            ]
            for (const html of htmlSources) {
                urls.push(...this.extractImageUrlsFromHtml(html))
            }

            // Dedupe
            return [...new Set(urls)].filter(Boolean)
        },
        getTypeLabel(type) {
            const t = (type || '').toLowerCase()
            if (t === 'regular') return 'Text'
            if (t === 'photo') return 'Photo'
            if (t === 'link') return 'Link'
            if (t === 'quote') return 'Quote'
            if (t === 'conversation') return 'Chat'
            if (t === 'video') return 'Video'
            if (!t) return 'Post'
            return t.charAt(0).toUpperCase() + t.slice(1)
        },
        toViewModel(rawPost) {
            const type = rawPost?.type || 'post'
            const title =
                rawPost['regular-title'] ||
                rawPost['link-text'] ||
                rawPost['conversation-title'] ||
                null

            const excerptSource =
                rawPost['regular-body'] ||
                rawPost['photo-caption'] ||
                rawPost['link-description'] ||
                rawPost['quote-text'] ||
                rawPost['conversation-text'] ||
                rawPost['video-caption'] ||
                ''

            const plainExcerpt = this.stripHtml(excerptSource)
            const excerpt = plainExcerpt.length > 220 ? `${plainExcerpt.slice(0, 220)}…` : plainExcerpt

            const tags = Array.isArray(rawPost.tags)
                ? rawPost.tags
                : (typeof rawPost.tags === 'string' ? rawPost.tags.split(',').map(t => t.trim()).filter(Boolean) : [])

            const noteCountRaw = rawPost['note-count'] ?? rawPost.note_count ?? rawPost.noteCount ?? null
            const noteCountParsed = (typeof noteCountRaw === 'string' || typeof noteCountRaw === 'number') ? Number(noteCountRaw) : NaN
            const normalizedNoteCount = Number.isFinite(noteCountParsed) ? noteCountParsed : null

            const contentSource =
                rawPost['regular-body'] ||
                rawPost['photo-caption'] ||
                rawPost['link-description'] ||
                rawPost['quote-text'] ||
                rawPost['conversation-text'] ||
                rawPost['video-caption'] ||
                ''

            return {
                id: rawPost.id || rawPost['id'] || rawPost['unix-timestamp'] || Math.random().toString(36).slice(2),
                type,
                typeLabel: this.getTypeLabel(type),
                title: title ? this.stripHtml(title) : null,
                excerpt: excerpt || null,
                contentHtml: this.sanitizeHtml(contentSource, { removeImages: true }),
                dateLabel: this.formatDate(rawPost.date),
                url: rawPost.url || rawPost['url-with-slug'] || rawPost['post-url'] || this.publicBlogUrl,
                images: this.pickAllImageUrls(rawPost),
                carouselId: `tumblr-carousel-${rawPost.id || rawPost['unix-timestamp'] || Math.random().toString(36).slice(2)}`,
                tags,
                noteCount: normalizedNoteCount
            }
        },
        removeActiveScript() {
            if (this._scriptEl && this._scriptEl.parentNode) {
                this._scriptEl.parentNode.removeChild(this._scriptEl)
            }
            this._scriptEl = null
        },
        fetchTumblrJson({ start, num }) {
            this.removeActiveScript()
            const loadId = ++this._activeLoadId

            return new Promise((resolve, reject) => {
                // Tumblr legacy endpoint returns a JS payload assigning `tumblr_api_read`.
                // Example: var tumblr_api_read = {...};
                delete window.tumblr_api_read

                const script = document.createElement('script')
                script.async = true
                script.id = `tumblr-api-read-${Date.now()}`
                script.src = `https://${this.blogHostname}/api/read/json?start=${encodeURIComponent(start)}&num=${encodeURIComponent(num)}&cacheBust=${Date.now()}`
                script.onload = () => {
                    if (loadId !== this._activeLoadId) return
                    const payload = window.tumblr_api_read
                    if (!payload || !payload.posts) {
                        reject(new Error('Unexpected Tumblr response.'))
                        return
                    }
                    resolve(payload)
                }
                script.onerror = () => {
                    if (loadId !== this._activeLoadId) return
                    reject(new Error('Failed to load Tumblr feed.'))
                }

                this._scriptEl = script
                document.head.appendChild(script)
            })
        },
        async loadPage(newStart) {
            this.loading = true
            this.error = null
            this.selectedPost = null
            const start = Math.max(0, newStart || 0)
            this.start = start

            try {
                const payload = await this.fetchTumblrJson({ start, num: this.pageSize })

                this.blogTitle = payload?.tumblelog?.title || payload?.tumblelog?.name || this.blogTitle
                const postsTotal = payload?.posts_total ?? payload?.postsTotal ?? payload?.['posts-total']
                this.totalPosts = Number.isFinite(postsTotal) ? postsTotal : this.totalPosts
                this.posts = Array.isArray(payload.posts) ? payload.posts.map(p => this.toViewModel(p)) : []
            } catch (e) {
                this.error = e?.message || 'Failed to load posts.'
                this.posts = []
            } finally {
                this.loading = false
            }
        },
        refresh() {
            this.loadPage(this.start)
        },
        nextPage() {
            if (!this.hasNext) return
            this.loadPage(this.start + this.pageSize)
        },
        prevPage() {
            this.loadPage(Math.max(0, this.start - this.pageSize))
        },
        async copyLink(url) {
            try {
                await navigator.clipboard.writeText(url)
            } catch {
                // Clipboard can fail on some browsers/contexts; fall back to a prompt
                window.prompt('Copy this link:', url)
            }
        },
        openPost(post) {
            this.selectedPost = post
            try {
                document.getElementById('content-container')?.scrollTo?.({ top: 0, behavior: 'smooth' })
            } catch {
                // ignore
            }
        },
        closePost() {
            this.selectedPost = null
        },
        openLightbox(images, idx, title) {
            this.lightboxImages = Array.isArray(images) ? images : []
            this.lightboxIndex = Number.isFinite(idx) ? idx : 0
            this.lightboxTitle = title || 'Image'

            this.$nextTick(() => {
                const modalEl = this.$refs.imageModal
                if (!modalEl || !window.bootstrap) return

                this._lightboxModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl)
                this._lightboxModalInstance.show()

                const carouselEl = modalEl.querySelector('#tumblrLightboxCarousel')
                if (carouselEl) {
                    this._lightboxCarouselInstance = window.bootstrap.Carousel.getOrCreateInstance(carouselEl, { interval: false })
                    this._lightboxCarouselInstance.to(this.lightboxIndex)
                    if (!this._lightboxSlideHandler) {
                        this._lightboxSlideHandler = (ev) => {
                            this.lightboxIndex = ev?.to ?? this.lightboxIndex
                        }
                        carouselEl.addEventListener('slid.bs.carousel', this._lightboxSlideHandler, { passive: true })
                    }
                }
            })
        }
    },
    mounted() {
        this.loadPage(0)
    },
    beforeUnmount() {
        this._activeLoadId++
        this.removeActiveScript()
        const modalEl = this.$refs.imageModal
        if (modalEl && this._lightboxSlideHandler) {
            const carouselEl = modalEl.querySelector('#tumblrLightboxCarousel')
            if (carouselEl) carouselEl.removeEventListener('slid.bs.carousel', this._lightboxSlideHandler)
        }
    }
};
