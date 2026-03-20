const SpotifyStatsView = {
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">

                    <!-- Hero -->
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                            <div>
                                <h1 class="hero-title mb-2">Spotify Stats</h1>
                                <p class="mb-0 hero-subtitle">Upload your Extended Streaming History JSON files to explore your listening data.</p>
                            </div>
                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                <button v-if="allTracks.length" class="btn btn-sm btn-outline-light" @click="reset">
                                    <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                </button>
                                <button v-if="filteredTracks.length" class="btn btn-sm btn-light text-dark" @click="exportCSV">
                                    <i class="bi bi-download me-1"></i>Export CSV
                                </button>
                            </div>
                        </div>
                    </section>

                    <!-- Drop zone (shown until data loaded, or after reset) -->
                    <div v-if="!allTracks.length"
                        class="spotify-dropzone card border-0 mb-4"
                        :class="{ 'spotify-dropzone--over': dragOver }"
                        @dragover.prevent="dragOver = true"
                        @dragleave="dragOver = false"
                        @drop.prevent="onDrop"
                        @click="$refs.fileInput.click()">
                        <div class="card-body text-center py-5">
                            <i class="bi bi-cloud-upload spotify-dropzone-icon mb-3"></i>
                            <p class="fw-semibold mb-1">Drop <code>Streaming_History_Audio_*.json</code> files here</p>
                            <p class="text-body-secondary small mb-3">or click to browse — multiple files supported</p>
                            <button class="btn btn-sm btn-primary" type="button" @click.stop="$refs.fileInput.click()">
                                <i class="bi bi-folder2-open me-1"></i>Browse files
                            </button>
                        </div>
                    </div>
                    <input ref="fileInput" type="file" accept=".json" multiple style="display:none" @change="onFileInput">

                    <!-- Loading progress -->
                    <div v-if="loading" class="card border-0 shadow-sm mb-4">
                        <div class="card-body">
                            <p class="small text-body-secondary mb-2">{{ progressLabel }}</p>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated spotify-progress-bar"
                                    :style="{ width: progress + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- File chips -->
                    <div v-if="loadedFiles.length" class="d-flex flex-wrap gap-2 mb-4">
                        <span v-for="f in loadedFiles" :key="f.name" class="badge rounded-pill bg-body-secondary text-body-secondary border">
                            <i class="bi bi-file-earmark-code me-1"></i>{{ f.name }}
                            <span class="text-spotify ms-1">{{ f.rows.toLocaleString() }} rows</span>
                        </span>
                    </div>

                    <!-- Summary stats -->
                    <div v-if="allTracks.length" class="row g-3 mb-4">
                        <div class="col-6 col-md-4 col-lg" v-for="s in summaryStats" :key="s.label">
                            <div class="card border-0 shadow-sm text-center h-100">
                                <div class="card-body py-3">
                                    <div class="h4 fw-bold text-spotify mb-0">{{ s.value }}</div>
                                    <div class="small text-body-secondary mt-1">{{ s.label }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Toolbar -->
                    <div v-if="allTracks.length" class="card border-0 shadow-sm mb-3">
                        <div class="card-body py-2 px-3">
                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                <div class="input-group input-group-sm" style="max-width: 280px;">
                                    <span class="input-group-text border-0 bg-body-tertiary">
                                        <i class="bi bi-search text-body-secondary"></i>
                                    </span>
                                    <input type="search" class="form-control border-0 bg-body-tertiary"
                                        placeholder="Search track or artist…"
                                        v-model="searchQuery"
                                        @input="page = 1">
                                </div>
                                <select class="form-select form-select-sm border-0 bg-body-tertiary" style="width: auto;"
                                    v-model="sortCol" @change="onSortChange">
                                    <option value="streams">Streams ↓</option>
                                    <option value="ms">Total time</option>
                                    <option value="first">First heard</option>
                                    <option value="last">Last heard</option>
                                    <option value="name">Track A–Z</option>
                                    <option value="artist">Artist A–Z</option>
                                </select>
                                <span class="small text-body-secondary ms-auto">
                                    {{ filteredTracks.length.toLocaleString() }} tracks
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Pagination top -->
                    <nav v-if="totalPages > 1" aria-label="Track pagination top" class="mb-3">
                        <ul class="pagination pagination-sm justify-content-center flex-wrap mb-0">
                            <li class="page-item" :class="{ disabled: page === 1 }">
                                <button class="page-link" @click="page--">‹</button>
                            </li>
                            <li v-for="p in paginationPages" :key="'top-' + p"
                                class="page-item" :class="{ active: p === page, disabled: p === '…' }">
                                <button class="page-link" @click="p !== '…' && (page = p)">{{ p }}</button>
                            </li>
                            <li class="page-item" :class="{ disabled: page === totalPages }">
                                <button class="page-link" @click="page++">›</button>
                            </li>
                        </ul>
                    </nav>

                    <!-- Table -->
                    <div v-if="allTracks.length" class="card border-0 shadow-sm mb-3 overflow-hidden">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0 spotify-stats-table">
                                <thead>
                                    <tr>
                                        <th class="ps-3 text-body-secondary fw-normal small" style="width: 40px">#</th>
                                        <th class="text-body-secondary fw-normal small spotify-stats-sortable"
                                            :class="{ 'text-success': sortCol === 'name' }"
                                            @click="setSort('name')">
                                            Track
                                            <i v-if="sortCol === 'name'" :class="sortAsc ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'" class="bi ms-1"></i>
                                        </th>
                                        <th class="text-body-secondary fw-normal small spotify-stats-sortable"
                                            :class="{ 'text-success': sortCol === 'streams' }"
                                            @click="setSort('streams')">
                                            Streams
                                            <i v-if="sortCol === 'streams'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                        </th>
                                        <th class="text-body-secondary fw-normal small spotify-stats-sortable"
                                            :class="{ 'text-success': sortCol === 'ms' }"
                                            @click="setSort('ms')">
                                            Time
                                            <i v-if="sortCol === 'ms'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                        </th>
                                        <th class="text-body-secondary fw-normal small d-none d-md-table-cell spotify-stats-sortable"
                                            :class="{ 'text-success': sortCol === 'first' }"
                                            @click="setSort('first')">
                                            First heard
                                            <i v-if="sortCol === 'first'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                        </th>
                                        <th class="text-body-secondary fw-normal small d-none d-md-table-cell spotify-stats-sortable"
                                            :class="{ 'text-success': sortCol === 'last' }"
                                            @click="setSort('last')">
                                            Last heard
                                            <i v-if="sortCol === 'last'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                        </th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="!filteredTracks.length">
                                        <td colspan="7" class="text-center text-body-secondary py-5">
                                            No tracks found.
                                        </td>
                                    </tr>
                                    <tr v-for="(track, i) in paginatedTracks" :key="track.uri + '-' + i">
                                        <td class="ps-3 text-body-tertiary small align-middle">{{ (page - 1) * pageSize + i + 1 }}</td>
                                        <td class="align-middle" style="min-width: 180px;">
                                            <div class="fw-semibold small text-truncate" style="max-width: 260px;">{{ track.name }}</div>
                                            <div class="text-body-secondary" style="font-size: 0.75rem;">{{ track.artist }}</div>
                                        </td>
                                        <td class="align-middle" style="min-width: 120px;">
                                            <div class="d-flex align-items-center gap-2">
                                                <div class="spotify-mini-bar flex-shrink-0"
                                                    :style="{ width: Math.max(2, Math.round((track.streams / maxStreams) * 80)) + 'px' }"></div>
                                                <span class="small fw-semibold">{{ track.streams.toLocaleString() }}</span>
                                            </div>
                                        </td>
                                        <td class="align-middle text-body-secondary small">{{ fmtTime(track.ms) }}</td>
                                        <td class="align-middle text-body-secondary small d-none d-md-table-cell">{{ fmtDate(track.first) }}</td>
                                        <td class="align-middle text-body-secondary small d-none d-md-table-cell">{{ fmtDate(track.last) }}</td>
                                        <td class="align-middle pe-3">
                                            <a :href="'https://open.spotify.com/track/' + track.uri.replace('spotify:track:', '')"
                                                target="_blank" rel="noopener noreferrer"
                                                class="btn btn-sm btn-outline-secondary py-0 px-2 spotify-open-btn"
                                                @click.stop>
                                                <i class="bi bi-spotify text-success"></i>
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Pagination -->
                    <nav v-if="totalPages > 1" aria-label="Track pagination">
                        <ul class="pagination pagination-sm justify-content-center flex-wrap">
                            <li class="page-item" :class="{ disabled: page === 1 }">
                                <button class="page-link" @click="page--">‹</button>
                            </li>
                            <li v-for="p in paginationPages" :key="p"
                                class="page-item" :class="{ active: p === page, disabled: p === '…' }">
                                <button class="page-link" @click="p !== '…' && (page = p)">{{ p }}</button>
                            </li>
                            <li class="page-item" :class="{ disabled: page === totalPages }">
                                <button class="page-link" @click="page++">›</button>
                            </li>
                        </ul>
                    </nav>

                </div>
            </div>
        </div>
    `,
    data() {
        return {
            allTracks: [],
            loadedFiles: [],
            summaryStats: [],
            searchQuery: '',
            sortCol: 'streams',
            sortAsc: false,
            page: 1,
            pageSize: 50,
            loading: false,
            progress: 0,
            progressLabel: '',
            dragOver: false
        }
    },
    computed: {
        filteredTracks() {
            const q = this.searchQuery.trim().toLowerCase()
            let tracks = q
                ? this.allTracks.filter(t =>
                    t.name.toLowerCase().includes(q) ||
                    t.artist.toLowerCase().includes(q))
                : [...this.allTracks]

            const asc = this.sortAsc
            const col = this.sortCol
            tracks.sort((a, b) => {
                let va, vb
                if (col === 'streams') { va = a.streams; vb = b.streams }
                else if (col === 'ms') { va = a.ms; vb = b.ms }
                else if (col === 'first') { va = a.first; vb = b.first }
                else if (col === 'last') { va = a.last; vb = b.last }
                else if (col === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase() }
                else if (col === 'artist') { va = a.artist.toLowerCase(); vb = b.artist.toLowerCase() }
                if (va < vb) return asc ? -1 : 1
                if (va > vb) return asc ? 1 : -1
                return 0
            })
            return tracks
        },
        paginatedTracks() {
            const start = (this.page - 1) * this.pageSize
            return this.filteredTracks.slice(start, start + this.pageSize)
        },
        totalPages() {
            return Math.ceil(this.filteredTracks.length / this.pageSize)
        },
        maxStreams() {
            return this.filteredTracks.length ? Math.max(...this.filteredTracks.map(t => t.streams)) : 1
        },
        paginationPages() {
            const total = this.totalPages
            const cur = this.page
            const pages = []
            if (total <= 7) {
                for (let i = 1; i <= total; i++) pages.push(i)
                return pages
            }
            pages.push(1)
            if (cur > 3) pages.push('…')
            for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
            if (cur < total - 2) pages.push('…')
            pages.push(total)
            return pages
        }
    },
    watch: {
        searchQuery() { this.page = 1 }
    },
    methods: {
        onDrop(e) {
            this.dragOver = false
            const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.json'))
            if (files.length) this.processFiles(files)
        },
        onFileInput(e) {
            const files = Array.from(e.target.files).filter(f => f.name.endsWith('.json'))
            if (files.length) this.processFiles(files)
            e.target.value = ''
        },
        async processFiles(files) {
            this.loading = true
            this.progress = 5
            this.progressLabel = `Loading ${files.length} file(s)…`
            this.loadedFiles = []
            this.allTracks = []

            const raw = []
            for (let i = 0; i < files.length; i++) {
                this.progress = 5 + Math.round((i / files.length) * 50)
                this.progressLabel = `Reading ${files[i].name}…`
                await this.tick()
                try {
                    const text = await this.readFile(files[i])
                    const arr = JSON.parse(text)
                    if (Array.isArray(arr)) {
                        raw.push(...arr)
                        this.loadedFiles.push({ name: files[i].name, rows: arr.length })
                    }
                } catch {
                    // skip unparseable files
                }
            }

            this.progress = 70
            this.progressLabel = 'Aggregating tracks…'
            await this.tick()
            this.allTracks = this.aggregate(raw)
            this.summaryStats = this.buildStats(raw, this.allTracks)

            this.progress = 100
            this.progressLabel = 'Done!'
            await this.tick()
            this.loading = false
            this.page = 1
        },
        readFile(f) {
            return new Promise((res, rej) => {
                const r = new FileReader()
                r.onload = e => res(e.target.result)
                r.onerror = rej
                r.readAsText(f)
            })
        },
        tick() { return new Promise(r => setTimeout(r, 0)) },
        aggregate(entries) {
            const map = new Map()
            for (const e of entries) {
                const uri = e.spotify_track_uri
                const name = e.master_metadata_track_name
                const artist = e.master_metadata_album_artist_name
                if (!uri || !name || !artist) continue
                if (!uri.startsWith('spotify:track:')) continue
                if (!e.ts) continue
                const ts = new Date(e.ts)
                if (isNaN(ts)) continue
                const ms = e.ms_played || 0
                const key = (artist + '|||' + name).toLowerCase()
                if (!map.has(key)) {
                    map.set(key, { uri, name, artist, streams: 0, ms: 0, first: ts, last: ts })
                }
                const t = map.get(key)
                t.streams++
                t.ms += ms
                if (ts < t.first) t.first = ts
                if (ts > t.last) { t.last = ts; t.uri = uri }
            }
            return Array.from(map.values())
        },
        buildStats(raw, tracks) {
            const artists = new Set(tracks.map(t => t.artist.toLowerCase())).size
            const totalMs = tracks.reduce((s, t) => s + t.ms, 0)
            const dates = raw.filter(e => e.ts).map(e => new Date(e.ts)).filter(d => !isNaN(d))
            const minY = dates.length ? new Date(Math.min(...dates)).getFullYear() : '?'
            const maxY = dates.length ? new Date(Math.max(...dates)).getFullYear() : '?'
            const span = minY === maxY ? String(minY) : `${minY}–${maxY}`
            return [
                { label: 'Total plays', value: raw.length.toLocaleString() },
                { label: 'Unique tracks', value: tracks.length.toLocaleString() },
                { label: 'Unique artists', value: artists.toLocaleString() },
                { label: 'Hours listened', value: Math.round(totalMs / 3_600_000).toLocaleString() },
                { label: 'History span', value: span }
            ]
        },
        setSort(col) {
            if (this.sortCol === col) {
                this.sortAsc = !this.sortAsc
            } else {
                this.sortCol = col
                this.sortAsc = ['name', 'artist', 'first'].includes(col)
            }
            this.page = 1
        },
        onSortChange() {
            this.sortAsc = ['name', 'artist', 'first'].includes(this.sortCol)
            this.page = 1
        },
        exportCSV() {
            if (!this.filteredTracks.length) return
            const rows = [['Rank', 'Track', 'Artist', 'Streams', 'Total Minutes', 'First Heard', 'Last Heard', 'Spotify URI']]
            this.filteredTracks.forEach((t, i) => rows.push([
                i + 1,
                `"${t.name.replace(/"/g, '""')}"`,
                `"${t.artist.replace(/"/g, '""')}"`,
                t.streams,
                Math.round(t.ms / 60000),
                this.fmtDate(t.first),
                this.fmtDate(t.last),
                t.uri
            ]))
            const csv = rows.map(r => r.join(',')).join('\n')
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
            a.download = 'spotify-stats.csv'
            a.click()
        },
        reset() {
            this.allTracks = []
            this.loadedFiles = []
            this.summaryStats = []
            this.searchQuery = ''
            this.sortCol = 'streams'
            this.sortAsc = false
            this.page = 1
        },
        fmtDate(d) {
            if (!d) return '—'
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        fmtTime(ms) {
            const mins = Math.round(ms / 60000)
            if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
            return `${mins}m`
        }
    }
};
