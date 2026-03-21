// ── Spotify OAuth (PKCE – no backend needed) ────────────────────────────────
const SPOTIFY_CLIENT_ID    = 'b2d9b07cd77b442daee520d54bb82f1e'
const SPOTIFY_REDIRECT_URI = window.location.href.split('?')[0].split('#')[0]
const SPOTIFY_SCOPES       = 'user-top-read user-read-recently-played'

function _pkceVerifier() {
    const arr = new Uint8Array(32)
    crypto.getRandomValues(arr)
    return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
async function _pkceChallenge(v) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))
    return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

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
                                <p class="mb-0 hero-subtitle">Erkunde deine Hördaten — via Streaming History Import oder live über Spotify.</p>
                            </div>
                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                <button v-if="allTracks.length" class="btn btn-sm btn-outline-light" @click="reset">
                                    <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                                </button>
                                <button v-if="allTracks.length && activeTab === 'tracks'" class="btn btn-sm btn-light text-dark" @click="exportCSV">
                                    <i class="bi bi-download me-1"></i>Export CSV
                                </button>
                            </div>
                        </div>
                    </section>

                    <!-- Import options: shown when no data loaded and not connected -->
                    <div v-if="!allTracks.length && !liveConnected && !loading" class="row g-3 mb-4">
                        <div class="col-12 col-md-6">
                            <div class="spotify-dropzone card border-0 h-100"
                                :class="{ 'spotify-dropzone--over': dragOver }"
                                @dragover.prevent="dragOver = true"
                                @dragleave="dragOver = false"
                                @drop.prevent="onDrop"
                                @click="$refs.fileInput.click()">
                                <div class="card-body text-center py-5">
                                    <i class="bi bi-file-earmark-code spotify-dropzone-icon mb-3"></i>
                                    <p class="fw-semibold mb-1">Streaming History Import</p>
                                    <p class="text-body-secondary small mb-1">Drop <code>Streaming_History_Audio_*.json</code> hier — mehrere Dateien möglich</p>
                                    <p class="text-body-secondary small mb-3">Noch keinen Export? <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener" style="color:#1DB954;" @click.stop>Export bei Spotify anfordern</a></p>
                                    <button class="btn btn-sm btn-outline-secondary" type="button" @click.stop="$refs.fileInput.click()">
                                        <i class="bi bi-folder2-open me-1"></i>Dateien auswählen
                                    </button>
                                    <p class="text-body-secondary mt-3 mb-0" style="font-size:0.7rem;">
                                        <i class="bi bi-shield-lock me-1"></i>Deine Daten werden nur lokal im Browser verarbeitet und nicht gespeichert oder übertragen.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="card border-0 h-100" style="background:rgba(29,185,84,0.06);border:1px solid rgba(29,185,84,0.2)!important;cursor:pointer;" @click="spotifyLogin">
                                <div class="card-body text-center py-5">
                                    <div class="mb-3" style="font-size:3rem;color:#1DB954;"><i class="bi bi-spotify"></i></div>
                                    <p class="fw-semibold mb-1">Mit Spotify verbinden</p>
                                    <p class="text-body-secondary small mb-3">Live-Daten der letzten 30 Tage — Top Artists, Tracks &amp; Genres</p>
                                    <button class="btn btn-sm fw-semibold" style="background:#1DB954;color:#000;" type="button" @click.stop="spotifyLogin">
                                        <i class="bi bi-spotify me-1"></i>Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Spotify connected: user badge + logout -->
                    <div v-if="liveConnected && !loading" class="d-flex align-items-center justify-content-between mb-4 px-1">
                        <span class="d-flex align-items-center gap-2">
                            <span class="badge py-2 px-3" style="background:rgba(29,185,84,0.12);border:1px solid rgba(29,185,84,0.3);color:#1DB954;">
                                <i class="bi bi-spotify me-1"></i>{{ liveUser ? liveUser.display_name : 'Connected' }}
                            </span>
                            <span class="text-body-secondary small">verbunden</span>
                        </span>
                        <button class="btn btn-sm btn-outline-secondary" @click="spotifyDisconnect">
                            <i class="bi bi-box-arrow-right me-1"></i>Logout
                        </button>
                    </div>

                    <!-- Small history import bar when Spotify is connected but no history loaded -->
                    <div v-if="!allTracks.length && liveConnected && !loading"
                        class="spotify-dropzone card border-0 mb-4"
                        :class="{ 'spotify-dropzone--over': dragOver }"
                        style="opacity:0.7;"
                        @dragover.prevent="dragOver = true"
                        @dragleave="dragOver = false"
                        @drop.prevent="onDrop"
                        @click="$refs.fileInput.click()">
                        <div class="card-body py-3 d-flex align-items-center justify-content-center gap-3">
                            <i class="bi bi-file-earmark-code text-body-secondary"></i>
                            <span class="text-body-secondary small">Streaming History JSON droppen oder <u style="cursor:pointer">auswählen</u> für zusätzliche Allzeit-Stats</span>
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

                    <!-- ══════════════ LIVE SPOTIFY SECTION ══════════════ -->
                    <div v-if="liveConnected" class="mb-4">

                        <!-- Loading spinner -->
                        <div v-if="liveLoading" class="card border-0 shadow-sm mb-4">
                            <div class="card-body text-center py-4">
                                <div class="spinner-border spinner-border-sm me-2" style="color:#1DB954;"></div>
                                <span class="small text-body-secondary">{{ liveLoadingMsg }}</span>
                            </div>
                        </div>

                        <!-- Live content -->
                        <div v-if="!liveLoading && liveData.topArtists.length">

                            <!-- Live tab nav -->
                            <ul class="nav nav-tabs mb-4" style="border-bottom-color: var(--bs-border-color);">
                                <li class="nav-item">
                                    <button class="nav-link" :class="{ active: liveActiveTab === 'overview' }" @click="liveActiveTab = 'overview'">
                                        <i class="bi bi-grid me-1"></i>Live Übersicht
                                        <span class="badge ms-1 text-spotify" style="background:rgba(29,185,84,0.15);font-size:0.65rem;">30 Tage</span>
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link" :class="{ active: liveActiveTab === 'karten' }" @click="switchToLiveKarten">
                                        <i class="bi bi-image me-1"></i>Monatliche Karten
                                    </button>
                                </li>
                            </ul>

                            <!-- ── Live Übersicht ── -->
                            <div v-if="liveActiveTab === 'overview'">

                                <!-- Summary row -->
                                <div class="row g-3 mb-4">
                                    <div class="col-6 col-md-3">
                                        <div class="card border-0 shadow-sm text-center h-100">
                                            <div class="card-body py-3">
                                                <div class="fw-bold text-spotify mb-0" style="font-size:1.1rem;word-break:break-word;">{{ liveData.topArtists[0] ? liveData.topArtists[0].name : '—' }}</div>
                                                <div class="small text-body-secondary mt-1">#1 Artist</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="card border-0 shadow-sm text-center h-100">
                                            <div class="card-body py-3">
                                                <div class="fw-bold text-spotify mb-0" style="font-size:1.1rem;word-break:break-word;">{{ liveData.topTracks[0] ? liveData.topTracks[0].name : '—' }}</div>
                                                <div class="small text-body-secondary mt-1">#1 Track</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="card border-0 shadow-sm text-center h-100">
                                            <div class="card-body py-3">
                                                <div class="fw-bold text-spotify mb-0" style="font-size:1.1rem;">{{ liveData.topGenres[0] ? liveData.topGenres[0].name : '—' }}</div>
                                                <div class="small text-body-secondary mt-1">Top Genre</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div class="card border-0 shadow-sm text-center h-100">
                                            <div class="card-body py-3">
                                                <div class="fw-bold text-spotify mb-0" style="font-size:1.1rem;">{{ liveData.topGenres.length }}</div>
                                                <div class="small text-body-secondary mt-1">Genres entdeckt</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Artists + Tracks -->
                                <div class="row g-3 mb-3">
                                    <div class="col-12 col-lg-6">
                                        <div class="card border-0 shadow-sm h-100">
                                            <div class="card-body">
                                                <h6 class="fw-semibold mb-3"><i class="bi bi-person-badge me-2 text-spotify"></i>Top Artists · Letzte 30 Tage</h6>
                                                <div v-for="(a, i) in liveData.topArtists.slice(0, 5)" :key="a.id" class="mb-3">
                                                    <div class="d-flex align-items-center gap-2 mb-1">
                                                        <span class="fw-bold text-spotify" style="min-width:1.6rem;">{{ i + 1 }}</span>
                                                        <div class="flex-fill">
                                                            <div class="small fw-semibold">{{ a.name }}</div>
                                                            <div class="text-body-secondary" style="font-size:0.7rem;">{{ (a.genres || []).slice(0, 2).join(' · ') || '—' }}</div>
                                                        </div>
                                                        <span class="badge bg-body-tertiary text-body-secondary border">{{ a.popularity }}</span>
                                                    </div>
                                                    <div class="progress" style="height:4px;">
                                                        <div class="progress-bar spotify-progress-bar" :style="{ width: a.popularity + '%' }"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 col-lg-6">
                                        <div class="card border-0 shadow-sm h-100">
                                            <div class="card-body">
                                                <h6 class="fw-semibold mb-3"><i class="bi bi-music-note-list me-2 text-spotify"></i>Top Tracks · Letzte 30 Tage</h6>
                                                <div v-for="(t, i) in liveData.topTracks.slice(0, 5)" :key="t.id" class="mb-3">
                                                    <div class="d-flex align-items-center gap-2 mb-1">
                                                        <span class="fw-bold text-spotify" style="min-width:1.6rem;">{{ i + 1 }}</span>
                                                        <div class="flex-fill">
                                                            <div class="small fw-semibold">{{ t.name }}</div>
                                                            <div class="text-body-secondary" style="font-size:0.7rem;">{{ t.artists[0] ? t.artists[0].name : '—' }}</div>
                                                        </div>
                                                        <span class="badge bg-body-tertiary text-body-secondary border">{{ t.popularity }}</span>
                                                    </div>
                                                    <div class="progress" style="height:4px;">
                                                        <div class="progress-bar spotify-progress-bar" :style="{ width: t.popularity + '%' }"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Genres -->
                                <div class="row g-3 mb-3">
                                    <div class="col-12">
                                        <div class="card border-0 shadow-sm h-100">
                                            <div class="card-body">
                                                <h6 class="fw-semibold mb-3"><i class="bi bi-tags me-2 text-spotify"></i>Your Sound · Top Genres</h6>
                                                <div v-for="g in liveData.topGenres.slice(0, 6)" :key="g.name" class="mb-2">
                                                    <div class="d-flex justify-content-between mb-1">
                                                        <span class="small">{{ g.name }}</span>
                                                        <span class="small text-body-secondary">{{ g.count }} Artists</span>
                                                    </div>
                                                    <div class="progress" style="height:5px;">
                                                        <div class="progress-bar spotify-progress-bar" :style="{ width: (liveData.topGenres[0] ? g.count / liveData.topGenres[0].count * 100 : 0) + '%' }"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div><!-- end live overview -->

                            <!-- ── Monatliche Karten ── -->
                            <div v-if="liveActiveTab === 'karten'">
                                <p class="text-body-secondary small mb-4">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Monatliche Karten basierend auf deinen Spotify-Daten der letzten 30 Tage — als 1080×1080 PNG exportierbar.
                                </p>
                                <div class="row g-3">
                                    <div class="col-12 col-sm-6 col-xl-4" v-for="card in liveExportCards" :key="card.id">
                                        <div class="card border-0 shadow-sm overflow-hidden">
                                            <canvas :ref="'canvas-' + card.id" style="width:100%; display:block; border-radius: 8px 8px 0 0;"></canvas>
                                            <div class="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                                                <span class="small fw-semibold">{{ card.title }}</span>
                                                <button class="btn btn-sm btn-outline-secondary py-0 px-2" @click="downloadLiveCard(card.id)">
                                                    <i class="bi bi-download me-1"></i>PNG
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div><!-- end karten -->

                        </div><!-- end live content -->
                    </div><!-- end live section -->

                    <hr v-if="liveConnected && allTracks.length" class="my-4 opacity-25">

                    <!-- Tabs (only after data loaded) -->
                    <div v-if="allTracks.length">

                        <!-- Tab nav -->
                        <ul class="nav nav-tabs mb-4" style="border-bottom-color: var(--bs-border-color);">
                            <li class="nav-item">
                                <button class="nav-link" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
                                    <i class="bi bi-grid me-1"></i>Übersicht
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" :class="{ active: activeTab === 'tracks' }" @click="activeTab = 'tracks'">
                                    <i class="bi bi-music-note-list me-1"></i>Tracks
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" :class="{ active: activeTab === 'artists' }" @click="activeTab = 'artists'">
                                    <i class="bi bi-person-badge me-1"></i>Artists
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" :class="{ active: activeTab === 'albums' }" @click="activeTab = 'albums'">
                                    <i class="bi bi-vinyl me-1"></i>Alben
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" :class="{ active: activeTab === 'insights' }" @click="activeTab = 'insights'">
                                    <i class="bi bi-bar-chart me-1"></i>Insights
                                </button>
                            </li>
                            <li class="nav-item">
                                <button class="nav-link" :class="{ active: activeTab === 'export' }" @click="switchToExport">
                                    <i class="bi bi-image me-1"></i>Karten
                                </button>
                            </li>
                        </ul>

                        <!-- ═══════════════ ÜBERSICHT TAB ═══════════════ -->
                        <div v-if="activeTab === 'overview'">

                            <!-- Summary stat cards -->
                            <div class="row g-3 mb-4">
                                <div class="col-6 col-md-4 col-lg" v-for="s in summaryStats" :key="s.label">
                                    <div class="card border-0 shadow-sm text-center h-100">
                                        <div class="card-body py-3">
                                            <div class="h4 fw-bold text-spotify mb-0">{{ s.value }}</div>
                                            <div class="small text-body-secondary mt-1">{{ s.label }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Two-column: Platform + Weekday -->
                            <div class="row g-3 mb-3">
                                <!-- Platform breakdown -->
                                <div class="col-12 col-lg-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-body">
                                            <h6 class="fw-semibold mb-3"><i class="bi bi-devices me-2 text-spotify"></i>Plattformen</h6>
                                            <div v-for="p in platforms" :key="p.name" class="mb-2">
                                                <div class="d-flex justify-content-between mb-1">
                                                    <span class="small">{{ p.name }}</span>
                                                    <span class="small text-body-secondary">{{ p.streams.toLocaleString() }} streams · {{ fmtMins(p.ms) }}</span>
                                                </div>
                                                <div class="progress" style="height:5px;">
                                                    <div class="progress-bar spotify-progress-bar" :style="{ width: (p.streams / platforms[0].streams * 100) + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Day of week -->
                                <div class="col-12 col-lg-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-body">
                                            <h6 class="fw-semibold mb-3"><i class="bi bi-calendar-week me-2 text-spotify"></i>Aktivität nach Wochentag</h6>
                                            <div v-for="d in weekdayData" :key="d.day" class="mb-2">
                                                <div class="d-flex justify-content-between mb-1">
                                                    <span class="small">{{ d.day }}</span>
                                                    <span class="small text-body-secondary">{{ d.streams.toLocaleString() }}</span>
                                                </div>
                                                <div class="progress" style="height:5px;">
                                                    <div class="progress-bar spotify-progress-bar" :style="{ width: (d.streams / weekdayMax * 100) + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Hour of day heatmap -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body">
                                    <h6 class="fw-semibold mb-3"><i class="bi bi-clock me-2 text-spotify"></i>Aktivität nach Uhrzeit</h6>
                                    <div class="d-flex align-items-end gap-1" style="height: 80px;">
                                        <div v-for="h in hourlyData" :key="h.hour"
                                            class="flex-fill position-relative"
                                            style="cursor:default;"
                                            :title="h.hour + ':00 — ' + h.streams.toLocaleString() + ' streams'">
                                            <div class="rounded-top"
                                                :style="{
                                                    height: Math.max(4, Math.round(h.streams / hourlyMax * 72)) + 'px',
                                                    background: h.streams === hourlyMax ? '#1db954' : 'rgba(29,185,84,0.4)'
                                                }"></div>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-between mt-1">
                                        <span class="text-body-secondary" style="font-size:0.7rem;">0:00</span>
                                        <span class="text-body-secondary" style="font-size:0.7rem;">6:00</span>
                                        <span class="text-body-secondary" style="font-size:0.7rem;">12:00</span>
                                        <span class="text-body-secondary" style="font-size:0.7rem;">18:00</span>
                                        <span class="text-body-secondary" style="font-size:0.7rem;">23:00</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Monthly timeline -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body">
                                    <h6 class="fw-semibold mb-3"><i class="bi bi-graph-up me-2 text-spotify"></i>Streams pro Monat</h6>
                                    <div class="d-flex align-items-end gap-px overflow-x-auto pb-2" style="height: 100px; gap: 2px;">
                                        <div v-for="m in monthlyData" :key="m.month"
                                            class="flex-shrink-0 position-relative"
                                            style="min-width: 8px; cursor:default;"
                                            :title="m.month + ' — ' + m.streams.toLocaleString() + ' streams'">
                                            <div class="rounded-top"
                                                :style="{
                                                    height: Math.max(2, Math.round(m.streams / monthlyMax * 88)) + 'px',
                                                    background: 'rgba(29,185,84,0.55)'
                                                }"></div>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-between mt-1" v-if="monthlyData.length">
                                        <span class="text-body-secondary" style="font-size:0.7rem;">{{ monthlyData[0].month }}</span>
                                        <span class="text-body-secondary" style="font-size:0.7rem;">{{ monthlyData[monthlyData.length - 1].month }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ═══════════════ TRACKS TAB ═══════════════ -->
                        <div v-if="activeTab === 'tracks'">
                            <!-- Toolbar -->
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body py-2 px-3">
                                    <div class="d-flex flex-wrap gap-2 align-items-center">
                                        <div class="input-group input-group-sm" style="max-width: 280px;">
                                            <span class="input-group-text border-0 bg-body-tertiary">
                                                <i class="bi bi-search text-body-secondary"></i>
                                            </span>
                                            <input type="search" class="form-control border-0 bg-body-tertiary"
                                                placeholder="Track oder Artist suchen…"
                                                v-model="searchQuery"
                                                @input="trackPage = 1">
                                        </div>
                                        <select class="form-select form-select-sm border-0 bg-body-tertiary" style="width: auto;"
                                            v-model="sortCol" @change="onTrackSortChange">
                                            <option value="streams">Streams ↓</option>
                                            <option value="ms">Gesamtzeit</option>
                                            <option value="first">Zuerst gehört</option>
                                            <option value="last">Zuletzt gehört</option>
                                            <option value="name">Track A–Z</option>
                                            <option value="artist">Artist A–Z</option>
                                        </select>
                                        <span class="small text-body-secondary ms-auto">
                                            {{ filteredTracks.length.toLocaleString() }} tracks
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <nav v-if="trackTotalPages > 1" aria-label="Track pagination top" class="mb-3">
                                <ul class="pagination pagination-sm justify-content-center flex-wrap mb-0">
                                    <li class="page-item" :class="{ disabled: trackPage === 1 }">
                                        <button class="page-link" @click="trackPage--">‹</button>
                                    </li>
                                    <li v-for="p in trackPaginationPages" :key="'tt-' + p"
                                        class="page-item" :class="{ active: p === trackPage, disabled: p === '…' }">
                                        <button class="page-link" @click="p !== '…' && (trackPage = p)">{{ p }}</button>
                                    </li>
                                    <li class="page-item" :class="{ disabled: trackPage === trackTotalPages }">
                                        <button class="page-link" @click="trackPage++">›</button>
                                    </li>
                                </ul>
                            </nav>

                            <div class="card border-0 shadow-sm mb-3 overflow-hidden">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0 spotify-stats-table">
                                        <thead>
                                            <tr>
                                                <th class="ps-3 text-body-secondary fw-normal small" style="width:40px">#</th>
                                                <th class="text-body-secondary fw-normal small spotify-stats-sortable"
                                                    :class="{ 'text-success': sortCol === 'name' }"
                                                    @click="setSort('name')">
                                                    Track <i v-if="sortCol === 'name'" :class="sortAsc ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'" class="bi ms-1"></i>
                                                </th>
                                                <th class="text-body-secondary fw-normal small spotify-stats-sortable"
                                                    :class="{ 'text-success': sortCol === 'streams' }"
                                                    @click="setSort('streams')">
                                                    Streams <i v-if="sortCol === 'streams'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                                </th>
                                                <th class="text-body-secondary fw-normal small spotify-stats-sortable"
                                                    :class="{ 'text-success': sortCol === 'ms' }"
                                                    @click="setSort('ms')">
                                                    Zeit <i v-if="sortCol === 'ms'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                                </th>
                                                <th class="text-body-secondary fw-normal small d-none d-md-table-cell spotify-stats-sortable"
                                                    :class="{ 'text-success': sortCol === 'first' }"
                                                    @click="setSort('first')">
                                                    Zuerst gehört <i v-if="sortCol === 'first'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                                </th>
                                                <th class="text-body-secondary fw-normal small d-none d-md-table-cell spotify-stats-sortable"
                                                    :class="{ 'text-success': sortCol === 'last' }"
                                                    @click="setSort('last')">
                                                    Zuletzt gehört <i v-if="sortCol === 'last'" :class="sortAsc ? 'bi-sort-up' : 'bi-sort-down'" class="bi ms-1"></i>
                                                </th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="!filteredTracks.length">
                                                <td colspan="7" class="text-center text-body-secondary py-5">Keine Tracks gefunden.</td>
                                            </tr>
                                            <tr v-for="(track, i) in paginatedTracks" :key="track.uri + '-' + i">
                                                <td class="ps-3 text-body-tertiary small align-middle">{{ (trackPage - 1) * pageSize + i + 1 }}</td>
                                                <td class="align-middle" style="min-width:180px;">
                                                    <div class="fw-semibold small text-truncate" style="max-width:260px;">{{ track.name }}</div>
                                                    <div class="text-body-secondary" style="font-size:0.75rem;">{{ track.artist }}</div>
                                                </td>
                                                <td class="align-middle" style="min-width:120px;">
                                                    <div class="d-flex align-items-center gap-2">
                                                        <div class="spotify-mini-bar flex-shrink-0"
                                                            :style="{ width: Math.max(2, Math.round((track.streams / trackMaxStreams) * 80)) + 'px' }"></div>
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

                            <nav v-if="trackTotalPages > 1" aria-label="Track pagination">
                                <ul class="pagination pagination-sm justify-content-center flex-wrap">
                                    <li class="page-item" :class="{ disabled: trackPage === 1 }">
                                        <button class="page-link" @click="trackPage--">‹</button>
                                    </li>
                                    <li v-for="p in trackPaginationPages" :key="'tb-' + p"
                                        class="page-item" :class="{ active: p === trackPage, disabled: p === '…' }">
                                        <button class="page-link" @click="p !== '…' && (trackPage = p)">{{ p }}</button>
                                    </li>
                                    <li class="page-item" :class="{ disabled: trackPage === trackTotalPages }">
                                        <button class="page-link" @click="trackPage++">›</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        <!-- ═══════════════ ARTISTS TAB ═══════════════ -->
                        <div v-if="activeTab === 'artists'">
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body py-2 px-3">
                                    <div class="d-flex flex-wrap gap-2 align-items-center">
                                        <div class="input-group input-group-sm" style="max-width: 280px;">
                                            <span class="input-group-text border-0 bg-body-tertiary">
                                                <i class="bi bi-search text-body-secondary"></i>
                                            </span>
                                            <input type="search" class="form-control border-0 bg-body-tertiary"
                                                placeholder="Artist suchen…"
                                                v-model="artistSearch"
                                                @input="artistPage = 1">
                                        </div>
                                        <select class="form-select form-select-sm border-0 bg-body-tertiary" style="width: auto;"
                                            v-model="artistSortCol" @change="artistPage = 1">
                                            <option value="streams">Streams ↓</option>
                                            <option value="ms">Gesamtzeit</option>
                                            <option value="tracks">Unique Tracks</option>
                                            <option value="name">Name A–Z</option>
                                        </select>
                                        <span class="small text-body-secondary ms-auto">
                                            {{ filteredArtists.length.toLocaleString() }} artists
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="card border-0 shadow-sm overflow-hidden">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th class="ps-3 text-body-secondary fw-normal small" style="width:40px">#</th>
                                                <th class="text-body-secondary fw-normal small">Artist</th>
                                                <th class="text-body-secondary fw-normal small">Streams</th>
                                                <th class="text-body-secondary fw-normal small">Gesamtzeit</th>
                                                <th class="text-body-secondary fw-normal small d-none d-md-table-cell">Unique Tracks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="!filteredArtists.length">
                                                <td colspan="5" class="text-center text-body-secondary py-5">Kein Artist gefunden.</td>
                                            </tr>
                                            <tr v-for="(a, i) in paginatedArtists" :key="a.name">
                                                <td class="ps-3 text-body-tertiary small align-middle">{{ (artistPage - 1) * pageSize + i + 1 }}</td>
                                                <td class="align-middle fw-semibold small">{{ a.name }}</td>
                                                <td class="align-middle" style="min-width:120px;">
                                                    <div class="d-flex align-items-center gap-2">
                                                        <div class="spotify-mini-bar flex-shrink-0"
                                                            :style="{ width: Math.max(2, Math.round((a.streams / artistMaxStreams) * 80)) + 'px' }"></div>
                                                        <span class="small fw-semibold">{{ a.streams.toLocaleString() }}</span>
                                                    </div>
                                                </td>
                                                <td class="align-middle text-body-secondary small">{{ fmtTime(a.ms) }}</td>
                                                <td class="align-middle text-body-secondary small d-none d-md-table-cell">{{ a.tracks.toLocaleString() }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <nav v-if="artistTotalPages > 1" class="mt-3">
                                <ul class="pagination pagination-sm justify-content-center flex-wrap">
                                    <li class="page-item" :class="{ disabled: artistPage === 1 }">
                                        <button class="page-link" @click="artistPage--">‹</button>
                                    </li>
                                    <li v-for="p in artistPaginationPages" :key="'a-' + p"
                                        class="page-item" :class="{ active: p === artistPage, disabled: p === '…' }">
                                        <button class="page-link" @click="p !== '…' && (artistPage = p)">{{ p }}</button>
                                    </li>
                                    <li class="page-item" :class="{ disabled: artistPage === artistTotalPages }">
                                        <button class="page-link" @click="artistPage++">›</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        <!-- ═══════════════ ALBEN TAB ═══════════════ -->
                        <div v-if="activeTab === 'albums'">
                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body py-2 px-3">
                                    <div class="d-flex flex-wrap gap-2 align-items-center">
                                        <div class="input-group input-group-sm" style="max-width: 280px;">
                                            <span class="input-group-text border-0 bg-body-tertiary">
                                                <i class="bi bi-search text-body-secondary"></i>
                                            </span>
                                            <input type="search" class="form-control border-0 bg-body-tertiary"
                                                placeholder="Album oder Artist suchen…"
                                                v-model="albumSearch"
                                                @input="albumPage = 1">
                                        </div>
                                        <select class="form-select form-select-sm border-0 bg-body-tertiary" style="width: auto;"
                                            v-model="albumSortCol" @change="albumPage = 1">
                                            <option value="streams">Streams ↓</option>
                                            <option value="ms">Gesamtzeit</option>
                                            <option value="tracks">Unique Tracks</option>
                                            <option value="name">Album A–Z</option>
                                        </select>
                                        <span class="small text-body-secondary ms-auto">
                                            {{ filteredAlbums.length.toLocaleString() }} alben
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="card border-0 shadow-sm overflow-hidden">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th class="ps-3 text-body-secondary fw-normal small" style="width:40px">#</th>
                                                <th class="text-body-secondary fw-normal small">Album</th>
                                                <th class="text-body-secondary fw-normal small">Streams</th>
                                                <th class="text-body-secondary fw-normal small">Gesamtzeit</th>
                                                <th class="text-body-secondary fw-normal small d-none d-md-table-cell">Tracks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="!filteredAlbums.length">
                                                <td colspan="5" class="text-center text-body-secondary py-5">Kein Album gefunden.</td>
                                            </tr>
                                            <tr v-for="(alb, i) in paginatedAlbums" :key="alb.key">
                                                <td class="ps-3 text-body-tertiary small align-middle">{{ (albumPage - 1) * pageSize + i + 1 }}</td>
                                                <td class="align-middle" style="min-width:180px;">
                                                    <div class="fw-semibold small text-truncate" style="max-width:260px;">{{ alb.name }}</div>
                                                    <div class="text-body-secondary" style="font-size:0.75rem;">{{ alb.artist }}</div>
                                                </td>
                                                <td class="align-middle" style="min-width:120px;">
                                                    <div class="d-flex align-items-center gap-2">
                                                        <div class="spotify-mini-bar flex-shrink-0"
                                                            :style="{ width: Math.max(2, Math.round((alb.streams / albumMaxStreams) * 80)) + 'px' }"></div>
                                                        <span class="small fw-semibold">{{ alb.streams.toLocaleString() }}</span>
                                                    </div>
                                                </td>
                                                <td class="align-middle text-body-secondary small">{{ fmtTime(alb.ms) }}</td>
                                                <td class="align-middle text-body-secondary small d-none d-md-table-cell">{{ alb.tracks.toLocaleString() }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <nav v-if="albumTotalPages > 1" class="mt-3">
                                <ul class="pagination pagination-sm justify-content-center flex-wrap">
                                    <li class="page-item" :class="{ disabled: albumPage === 1 }">
                                        <button class="page-link" @click="albumPage--">‹</button>
                                    </li>
                                    <li v-for="p in albumPaginationPages" :key="'alb-' + p"
                                        class="page-item" :class="{ active: p === albumPage, disabled: p === '…' }">
                                        <button class="page-link" @click="p !== '…' && (albumPage = p)">{{ p }}</button>
                                    </li>
                                    <li class="page-item" :class="{ disabled: albumPage === albumTotalPages }">
                                        <button class="page-link" @click="albumPage++">›</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        <!-- ═══════════════ INSIGHTS TAB ═══════════════ -->
                        <div v-if="activeTab === 'insights'">

                            <!-- Behaviour stats row -->
                            <div class="row g-3 mb-3">
                                <div class="col-6 col-md-3" v-for="s in insightStats" :key="s.label">
                                    <div class="card border-0 shadow-sm text-center h-100">
                                        <div class="card-body py-3">
                                            <i :class="s.icon" class="fs-3 mb-1" :style="{ color: s.color || 'var(--bs-success)' }"></i>
                                            <div class="h5 fw-bold mb-0 mt-1">{{ s.value }}</div>
                                            <div class="small text-body-secondary mt-1">{{ s.label }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Music vs Podcast + Countries -->
                            <div class="row g-3 mb-3">
                                <div class="col-12 col-lg-5">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-body">
                                            <h6 class="fw-semibold mb-3"><i class="bi bi-pie-chart me-2 text-spotify"></i>Musik vs. Podcasts</h6>
                                            <div class="d-flex gap-3 mb-3">
                                                <div class="text-center flex-fill">
                                                    <div class="h4 fw-bold text-spotify">{{ contentSplit.musicPct }}%</div>
                                                    <div class="small text-body-secondary">Musik</div>
                                                    <div class="small text-body-secondary">{{ contentSplit.music.toLocaleString() }} streams</div>
                                                </div>
                                                <div class="text-center flex-fill">
                                                    <div class="h4 fw-bold" style="color: #b49df5;">{{ contentSplit.podcastPct }}%</div>
                                                    <div class="small text-body-secondary">Podcasts</div>
                                                    <div class="small text-body-secondary">{{ contentSplit.podcast.toLocaleString() }} streams</div>
                                                </div>
                                            </div>
                                            <div class="progress" style="height: 8px; border-radius: 4px;">
                                                <div class="progress-bar spotify-progress-bar" :style="{ width: contentSplit.musicPct + '%' }"></div>
                                                <div class="progress-bar" style="background: #b49df5;" :style="{ width: contentSplit.podcastPct + '%' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 col-lg-7">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-body">
                                            <h6 class="fw-semibold mb-3"><i class="bi bi-globe me-2 text-spotify"></i>Top Länder</h6>
                                            <div v-for="c in topCountries" :key="c.code" class="mb-2">
                                                <div class="d-flex justify-content-between mb-1">
                                                    <span class="small">{{ c.code }}</span>
                                                    <span class="small text-body-secondary">{{ c.streams.toLocaleString() }} streams</span>
                                                </div>
                                                <div class="progress" style="height:5px;">
                                                    <div class="progress-bar spotify-progress-bar" :style="{ width: (c.streams / topCountries[0].streams * 100) + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Skip reasons -->
                            <div class="row g-3 mb-3">
                                <div class="col-12 col-lg-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-body">
                                            <h6 class="fw-semibold mb-3"><i class="bi bi-skip-forward me-2 text-spotify"></i>Warum Tracks geendet haben</h6>
                                            <div v-for="r in reasonEndData" :key="r.reason" class="mb-2">
                                                <div class="d-flex justify-content-between mb-1">
                                                    <span class="small">{{ r.reason }}</span>
                                                    <span class="small text-body-secondary">{{ r.pct }}%</span>
                                                </div>
                                                <div class="progress" style="height:5px;">
                                                    <div class="progress-bar spotify-progress-bar" :style="{ width: r.pct + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 col-lg-6">
                                    <div class="card border-0 shadow-sm h-100">
                                        <div class="card-body">
                                            <h6 class="fw-semibold mb-3"><i class="bi bi-skip-backward me-2 text-spotify"></i>Warum Tracks gestartet haben</h6>
                                            <div v-for="r in reasonStartData" :key="r.reason" class="mb-2">
                                                <div class="d-flex justify-content-between mb-1">
                                                    <span class="small">{{ r.reason }}</span>
                                                    <span class="small text-body-secondary">{{ r.pct }}%</span>
                                                </div>
                                                <div class="progress" style="height:5px;">
                                                    <div class="progress-bar spotify-progress-bar" :style="{ width: r.pct + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- ═══════════════ KARTEN / EXPORT TAB ═══════════════ -->
                        <div v-if="activeTab === 'export'">
                            <p class="text-body-secondary small mb-4">
                                <i class="bi bi-info-circle me-1"></i>
                                Jede Karte wird als 1080×1080 PNG exportiert — perfekt für Instagram & Co.
                            </p>
                            <div class="row g-3">
                                <div class="col-12 col-sm-6 col-xl-4" v-for="card in exportCards" :key="card.id">
                                    <div class="card border-0 shadow-sm overflow-hidden">
                                        <canvas :ref="'canvas-' + card.id" style="width:100%; display:block; border-radius: 8px 8px 0 0;"></canvas>
                                        <div class="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                                            <span class="small fw-semibold">{{ card.title }}</span>
                                            <button class="btn btn-sm btn-outline-secondary py-0 px-2" @click="downloadCard(card.id)">
                                                <i class="bi bi-download me-1"></i>PNG
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div><!-- end tabs -->

                </div>
            </div>
        </div>
    `,
    data() {
        return {
            // Aggregated data
            allTracks: [],
            allArtists: [],
            allAlbums: [],
            platforms: [],
            hourlyData: [],
            weekdayData: [],
            monthlyData: [],
            insightStats: [],
            contentSplit: { music: 0, podcast: 0, musicPct: 0, podcastPct: 0 },
            topCountries: [],
            reasonEndData: [],
            reasonStartData: [],
            summaryStats: [],
            loadedFiles: [],

            // Export cards config
            exportCards: [
                { id: 'summary',   title: 'Zusammenfassung' },
                { id: 'tracks',    title: 'Top 5 Tracks' },
                { id: 'artists',   title: 'Top 5 Artists' },
                { id: 'hour',      title: 'Aktivste Uhrzeit' },
                { id: 'weekday',   title: 'Aktivster Wochentag' },
                { id: 'platforms', title: 'Plattformen' },
            ],

            // ── Spotify Live ──
            liveConnected: false,
            liveUser: null,
            liveLoading: false,
            liveLoadingMsg: '',
            liveActiveTab: 'overview',
            liveData: {
                topArtists: [], topTracks: [], recentPlays: [],
                topGenres: []
            },
            spotifyToken: '',
            liveExportCards: [
                { id: 'live-artist',  title: 'Artist of the Month' },
                { id: 'live-artists', title: 'Top 5 Artists' },
                { id: 'live-tracks',  title: 'Top 5 Tracks' },
                { id: 'live-genres',  title: 'Your Sound' },
            ],

            // UI state
            activeTab: 'overview',
            searchQuery: '',
            artistSearch: '',
            albumSearch: '',
            sortCol: 'streams',
            sortAsc: false,
            artistSortCol: 'streams',
            albumSortCol: 'streams',
            trackPage: 1,
            artistPage: 1,
            albumPage: 1,
            pageSize: 50,
            loading: false,
            progress: 0,
            progressLabel: '',
            dragOver: false
        }
    },
    computed: {
        // ── TRACKS ──
        filteredTracks() {
            const q = this.searchQuery.trim().toLowerCase()
            let tracks = q
                ? this.allTracks.filter(t => t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
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
            const start = (this.trackPage - 1) * this.pageSize
            return this.filteredTracks.slice(start, start + this.pageSize)
        },
        trackTotalPages() { return Math.ceil(this.filteredTracks.length / this.pageSize) },
        trackMaxStreams() { return this.filteredTracks.length ? Math.max(...this.filteredTracks.map(t => t.streams)) : 1 },
        trackPaginationPages() { return this.buildPages(this.trackTotalPages, this.trackPage) },

        // ── ARTISTS ──
        filteredArtists() {
            const q = this.artistSearch.trim().toLowerCase()
            let artists = q
                ? this.allArtists.filter(a => a.name.toLowerCase().includes(q))
                : [...this.allArtists]
            const col = this.artistSortCol
            artists.sort((a, b) => {
                let va, vb
                if (col === 'streams') { va = a.streams; vb = b.streams; return vb - va }
                if (col === 'ms') { va = a.ms; vb = b.ms; return vb - va }
                if (col === 'tracks') { va = a.tracks; vb = b.tracks; return vb - va }
                if (col === 'name') return a.name.localeCompare(b.name)
                return 0
            })
            return artists
        },
        paginatedArtists() {
            const start = (this.artistPage - 1) * this.pageSize
            return this.filteredArtists.slice(start, start + this.pageSize)
        },
        artistTotalPages() { return Math.ceil(this.filteredArtists.length / this.pageSize) },
        artistMaxStreams() { return this.allArtists.length ? Math.max(...this.allArtists.map(a => a.streams)) : 1 },
        artistPaginationPages() { return this.buildPages(this.artistTotalPages, this.artistPage) },

        // ── ALBUMS ──
        filteredAlbums() {
            const q = this.albumSearch.trim().toLowerCase()
            let albums = q
                ? this.allAlbums.filter(a => a.name.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
                : [...this.allAlbums]
            const col = this.albumSortCol
            albums.sort((a, b) => {
                if (col === 'streams') return b.streams - a.streams
                if (col === 'ms') return b.ms - a.ms
                if (col === 'tracks') return b.tracks - a.tracks
                if (col === 'name') return a.name.localeCompare(b.name)
                return 0
            })
            return albums
        },
        paginatedAlbums() {
            const start = (this.albumPage - 1) * this.pageSize
            return this.filteredAlbums.slice(start, start + this.pageSize)
        },
        albumTotalPages() { return Math.ceil(this.filteredAlbums.length / this.pageSize) },
        albumMaxStreams() { return this.allAlbums.length ? Math.max(...this.allAlbums.map(a => a.streams)) : 1 },
        albumPaginationPages() { return this.buildPages(this.albumTotalPages, this.albumPage) },

        // ── CHARTS ──
        weekdayMax() { return this.weekdayData.length ? Math.max(...this.weekdayData.map(d => d.streams)) : 1 },
        hourlyMax() { return this.hourlyData.length ? Math.max(...this.hourlyData.map(h => h.streams)) : 1 },
        monthlyMax() { return this.monthlyData.length ? Math.max(...this.monthlyData.map(m => m.streams)) : 1 },

    },
    watch: {
        searchQuery() { this.trackPage = 1 },
        artistSearch() { this.artistPage = 1 },
        albumSearch() { this.albumPage = 1 }
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
                this.progress = 5 + Math.round((i / files.length) * 45)
                this.progressLabel = `Reading ${files[i].name}…`
                await this.tick()
                try {
                    const text = await this.readFile(files[i])
                    const arr = JSON.parse(text)
                    if (Array.isArray(arr)) {
                        raw.push(...arr)
                        this.loadedFiles.push({ name: files[i].name, rows: arr.length })
                    }
                } catch { /* skip unparseable */ }
            }

            this.progress = 55; this.progressLabel = 'Aggregating tracks…'; await this.tick()
            this.allTracks = this.aggregateTracks(raw)

            this.progress = 65; this.progressLabel = 'Computing artists & albums…'; await this.tick()
            const { artists, albums } = this.aggregateArtistsAlbums(raw)
            this.allArtists = artists
            this.allAlbums = albums

            this.progress = 75; this.progressLabel = 'Computing charts…'; await this.tick()
            this.platforms    = this.computePlatforms(raw)
            this.hourlyData   = this.computeHourly(raw)
            this.weekdayData  = this.computeWeekday(raw)
            this.monthlyData  = this.computeMonthly(raw)
            this.contentSplit = this.computeContentSplit(raw)
            this.topCountries = this.computeCountries(raw)
            this.reasonEndData   = this.computeReasons(raw, 'reason_end')
            this.reasonStartData = this.computeReasons(raw, 'reason_start')

            this.progress = 90; this.progressLabel = 'Building stats…'; await this.tick()
            this.summaryStats = this.buildSummaryStats(raw, this.allTracks)
            this.insightStats = this.buildInsightStats(raw)

            this.progress = 100; this.progressLabel = 'Done!'
            await this.tick()
            this.loading = false
            this.activeTab = 'overview'
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

        // ── Aggregation ──
        aggregateTracks(entries) {
            const map = new Map()
            for (const e of entries) {
                const uri    = e.spotify_track_uri
                const name   = e.master_metadata_track_name
                const artist = e.master_metadata_album_artist_name
                if (!uri || !name || !artist) continue
                if (!uri.startsWith('spotify:track:')) continue
                if (!e.ts) continue
                const ts = new Date(e.ts)
                if (isNaN(ts)) continue
                const ms  = e.ms_played || 0
                const key = (artist + '|||' + name).toLowerCase()
                if (!map.has(key)) map.set(key, { uri, name, artist, streams: 0, ms: 0, first: ts, last: ts })
                const t = map.get(key)
                t.streams++
                t.ms += ms
                if (ts < t.first) t.first = ts
                if (ts > t.last) { t.last = ts; t.uri = uri }
            }
            return Array.from(map.values()).sort((a, b) => b.streams - a.streams)
        },

        aggregateArtistsAlbums(entries) {
            const aMap = new Map()
            const albMap = new Map()

            for (const e of entries) {
                const name   = e.master_metadata_track_name
                const artist = e.master_metadata_album_artist_name
                const album  = e.master_metadata_album_album_name
                if (!name || !artist) continue
                const ms = e.ms_played || 0

                // Artists
                const ak = artist.toLowerCase()
                if (!aMap.has(ak)) aMap.set(ak, { name: artist, streams: 0, ms: 0, trackSet: new Set() })
                const a = aMap.get(ak)
                a.streams++
                a.ms += ms
                a.trackSet.add(name.toLowerCase())

                // Albums
                if (album) {
                    const albKey = (artist + '|||' + album).toLowerCase()
                    if (!albMap.has(albKey)) albMap.set(albKey, { key: albKey, name: album, artist, streams: 0, ms: 0, trackSet: new Set() })
                    const alb = albMap.get(albKey)
                    alb.streams++
                    alb.ms += ms
                    alb.trackSet.add(name.toLowerCase())
                }
            }

            const artists = Array.from(aMap.values()).map(a => ({ ...a, tracks: a.trackSet.size }))
                .sort((a, b) => b.streams - a.streams)
            const albums = Array.from(albMap.values()).map(a => ({ ...a, tracks: a.trackSet.size }))
                .sort((a, b) => b.streams - a.streams)

            return { artists, albums }
        },

        computePlatforms(entries) {
            const map = new Map()
            for (const e of entries) {
                const p = e.platform || 'Unknown'
                const ms = e.ms_played || 0
                if (!map.has(p)) map.set(p, { name: p, streams: 0, ms: 0 })
                const r = map.get(p)
                r.streams++
                r.ms += ms
            }
            return Array.from(map.values()).sort((a, b) => b.streams - a.streams).slice(0, 8)
        },

        computeHourly(entries) {
            const counts = new Array(24).fill(0)
            for (const e of entries) {
                if (!e.ts) continue
                const d = new Date(e.ts)
                if (isNaN(d)) continue
                counts[d.getHours()]++
            }
            return counts.map((streams, hour) => ({ hour, streams }))
        },

        computeWeekday(entries) {
            const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
            const counts = new Array(7).fill(0)
            for (const e of entries) {
                if (!e.ts) continue
                const d = new Date(e.ts)
                if (isNaN(d)) continue
                counts[d.getDay()]++
            }
            // Rotate: Mo–So
            return [1,2,3,4,5,6,0].map(i => ({ day: days[i], streams: counts[i] }))
        },

        computeMonthly(entries) {
            const map = new Map()
            for (const e of entries) {
                if (!e.ts) continue
                const d = new Date(e.ts)
                if (isNaN(d)) continue
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                map.set(key, (map.get(key) || 0) + 1)
            }
            return Array.from(map.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([month, streams]) => ({ month, streams }))
        },

        computeContentSplit(entries) {
            let music = 0, podcast = 0
            for (const e of entries) {
                if (e.episode_name || e.spotify_episode_uri) podcast++
                else if (e.master_metadata_track_name) music++
            }
            const total = music + podcast || 1
            return {
                music, podcast,
                musicPct: Math.round(music / total * 100),
                podcastPct: Math.round(podcast / total * 100)
            }
        },

        computeCountries(entries) {
            const map = new Map()
            for (const e of entries) {
                const c = e.conn_country || 'Unknown'
                map.set(c, (map.get(c) || 0) + 1)
            }
            return Array.from(map.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([code, streams]) => ({ code, streams }))
        },

        computeReasons(entries, field) {
            const map = new Map()
            for (const e of entries) {
                const r = e[field] || 'unknown'
                map.set(r, (map.get(r) || 0) + 1)
            }
            const total = entries.length || 1
            return Array.from(map.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([reason, count]) => ({
                    reason: this.fmtReason(reason),
                    count,
                    pct: Math.round(count / total * 100)
                }))
        },

        fmtReason(r) {
            const map = {
                trackdone: 'Track fertig',
                fwdbtn: 'Skip vorwärts',
                backbtn: 'Skip zurück',
                endplay: 'Wiedergabe beendet',
                logout: 'Ausgeloggt',
                clickrow: 'Direktklick',
                playbtn: 'Play-Button',
                remote: 'Remote-Steuerung',
                appload: 'App geladen',
                trackerror: 'Track-Fehler',
                unknown: 'Unbekannt',
                skipprev: 'Skip zurück',
                popup: 'Popup',
                uriopen: 'URI-Öffnung'
            }
            return map[r] || r
        },

        buildSummaryStats(raw, tracks) {
            const artists = new Set(tracks.map(t => t.artist.toLowerCase())).size
            const totalMs = raw.filter(e => e.master_metadata_track_name).reduce((s, e) => s + (e.ms_played || 0), 0)
            const dates   = raw.filter(e => e.ts).map(e => new Date(e.ts)).filter(d => !isNaN(d))
            const minY    = dates.length ? new Date(Math.min(...dates)).getFullYear() : '?'
            const maxY    = dates.length ? new Date(Math.max(...dates)).getFullYear() : '?'
            const span    = minY === maxY ? String(minY) : `${minY}–${maxY}`
            const minutes = Math.round(totalMs / 60000)
            return [
                { label: 'Total plays',    value: raw.length.toLocaleString() },
                { label: 'Unique tracks',  value: tracks.length.toLocaleString() },
                { label: 'Unique artists', value: artists.toLocaleString() },
                { label: 'Minuten',        value: minutes.toLocaleString() },
                { label: 'Stunden',        value: Math.round(minutes / 60).toLocaleString() },
                { label: 'Zeitraum',       value: span }
            ]
        },

        buildInsightStats(entries) {
            let skipped = 0, shuffle = 0, offline = 0, incognito = 0
            const total = entries.length || 1
            for (const e of entries) {
                if (e.skipped === true || e.reason_end === 'fwdbtn') skipped++
                if (e.shuffle === true) shuffle++
                if (e.offline === true) offline++
                if (e.incognito_mode === true) incognito++
            }
            // Most active day
            const dayMap = new Map()
            for (const e of entries) {
                if (!e.ts) continue
                const d = new Date(e.ts)
                if (isNaN(d)) continue
                const key = d.toISOString().slice(0, 10)
                dayMap.set(key, (dayMap.get(key) || 0) + 1)
            }
            let bestDay = '—', bestDayCount = 0
            for (const [day, count] of dayMap.entries()) {
                if (count > bestDayCount) { bestDayCount = count; bestDay = day }
            }

            return [
                { label: 'Skip-Rate',       value: Math.round(skipped / total * 100) + '%', icon: 'bi bi-skip-forward-fill', color: '#f59e0b' },
                { label: 'Shuffle-Rate',    value: Math.round(shuffle / total * 100) + '%', icon: 'bi bi-shuffle', color: 'var(--bs-success)' },
                { label: 'Offline-Rate',    value: Math.round(offline / total * 100) + '%', icon: 'bi bi-wifi-off', color: '#6b7280' },
                { label: 'Inkognito-Rate',  value: Math.round(incognito / total * 100) + '%', icon: 'bi bi-eye-slash-fill', color: '#9ca3af' },
                { label: 'Aktivster Tag',   value: bestDay, icon: 'bi bi-fire', color: '#ef4444' },
                { label: 'Plays an dem Tag',value: bestDayCount.toLocaleString(), icon: 'bi bi-lightning-fill', color: '#f59e0b' }
            ]
        },

        // ── Export cards ──
        switchToExport() {
            this.activeTab = 'export'
            this.$nextTick(() => this.renderAllCards())
        },

        renderAllCards() {
            for (const card of this.exportCards) this.renderCard(card.id)
        },

        renderCard(id) {
            const refKey = 'canvas-' + id
            const canvasArr = this.$refs[refKey]
            const canvas = Array.isArray(canvasArr) ? canvasArr[0] : canvasArr
            if (!canvas) return
            const S = 1080
            canvas.width = S
            canvas.height = S
            const ctx = canvas.getContext('2d')

            // ── shared helpers ──
            const GREEN  = '#1DB954'
            const BG     = '#0d0d0d'
            const CARD   = '#181818'
            const WHITE  = '#FFFFFF'
            const MUTED  = '#A0A0A0'
            const FONT   = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

            const bg = ctx.createLinearGradient(0, 0, 0, S)
            bg.addColorStop(0, '#111111')
            bg.addColorStop(1, '#0a0a0a')
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, S, S)

            // decorative green circle top-right
            ctx.save()
            const grad = ctx.createRadialGradient(S, 0, 0, S, 0, S * 0.55)
            grad.addColorStop(0, 'rgba(29,185,84,0.18)')
            grad.addColorStop(1, 'rgba(29,185,84,0)')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, S, S)
            ctx.restore()

            // bottom-left subtle circle
            ctx.save()
            const grad2 = ctx.createRadialGradient(0, S, 0, 0, S, S * 0.4)
            grad2.addColorStop(0, 'rgba(29,185,84,0.08)')
            grad2.addColorStop(1, 'rgba(29,185,84,0)')
            ctx.fillStyle = grad2
            ctx.fillRect(0, 0, S, S)
            ctx.restore()

            const PAD = 72
            const drawText = (text, x, y, size, color, align = 'left', weight = 'normal') => {
                ctx.font = `${weight} ${size}px ${FONT}`
                ctx.fillStyle = color
                ctx.textAlign = align
                ctx.fillText(text, x, y)
            }
            const truncate = (str, max) => str.length > max ? str.slice(0, max - 1) + '…' : str
            const fmtNum = n => Number(n).toLocaleString('de-DE')

            // ── footer branding ──
            const drawFooter = () => {
                // green dot + wordmark
                ctx.beginPath()
                ctx.arc(PAD, S - 54, 10, 0, Math.PI * 2)
                ctx.fillStyle = GREEN
                ctx.fill()
                drawText('nico-ruge.de/#SpotifyStats', PAD + 20, S - 46, 28, MUTED, 'left', '500')
            }

            // ── green accent bar at top ──
            const drawTopBar = () => {
                ctx.fillStyle = GREEN
                ctx.fillRect(PAD, 60, 80, 6)
            }

            if (id === 'summary') {
                drawTopBar()
                drawText('Dein Jahr', PAD, 130, 48, MUTED, 'left', '500')
                const span = this.summaryStats.find(s => s.label === 'Zeitraum')?.value || ''
                drawText(span, PAD, 210, 100, WHITE, 'left', '700')

                // 4 big stats
                const items = [
                    { label: 'Streams gesamt', value: this.summaryStats.find(s => s.label === 'Total plays')?.value || '—' },
                    { label: 'Stunden gehört', value: this.summaryStats.find(s => s.label === 'Stunden')?.value || '—' },
                    { label: 'Unique Tracks', value: this.summaryStats.find(s => s.label === 'Unique tracks')?.value || '—' },
                    { label: 'Unique Artists', value: this.summaryStats.find(s => s.label === 'Unique artists')?.value || '—' },
                ]
                const cardW = (S - PAD * 2 - 24) / 2
                const cardH = 220
                items.forEach((item, i) => {
                    const col = i % 2, row = Math.floor(i / 2)
                    const x = PAD + col * (cardW + 24)
                    const y = 290 + row * (cardH + 24)
                    ctx.fillStyle = CARD
                    ctx.beginPath()
                    ctx.roundRect(x, y, cardW, cardH, 16)
                    ctx.fill()
                    drawText(item.value, x + 28, y + 90, 64, GREEN, 'left', '700')
                    drawText(item.label, x + 28, y + 145, 28, MUTED, 'left', '400')
                })
                drawFooter()
            }

            else if (id === 'tracks') {
                drawTopBar()
                drawText('Top 5 Tracks', PAD, 140, 62, WHITE, 'left', '700')
                const top5 = [...this.allTracks].sort((a, b) => b.streams - a.streams).slice(0, 5)
                const maxS = top5[0]?.streams || 1
                top5.forEach((t, i) => {
                    const y = 220 + i * 152
                    // row bg
                    ctx.fillStyle = i === 0 ? 'rgba(29,185,84,0.12)' : CARD
                    ctx.beginPath()
                    ctx.roundRect(PAD, y, S - PAD * 2, 130, 14)
                    ctx.fill()
                    // rank number
                    drawText(`${i + 1}`, PAD + 28, y + 80, 52, i === 0 ? GREEN : MUTED, 'left', '700')
                    // track name + artist
                    drawText(truncate(t.name, 32), PAD + 100, y + 62, 34, WHITE, 'left', '600')
                    drawText(truncate(t.artist, 40), PAD + 100, y + 100, 26, MUTED, 'left', '400')
                    // streams right
                    drawText(fmtNum(t.streams) + ' ×', S - PAD - 20, y + 80, 30, i === 0 ? GREEN : MUTED, 'right', '600')
                    // mini bar
                    const barW = (S - PAD * 2 - 120) * (t.streams / maxS)
                    ctx.fillStyle = i === 0 ? GREEN : '#333'
                    ctx.beginPath()
                    ctx.roundRect(PAD + 100, y + 114, barW, 5, 3)
                    ctx.fill()
                })
                drawFooter()
            }

            else if (id === 'artists') {
                drawTopBar()
                drawText('Top 5 Artists', PAD, 140, 62, WHITE, 'left', '700')
                const top5 = [...this.allArtists].sort((a, b) => b.streams - a.streams).slice(0, 5)
                const maxS = top5[0]?.streams || 1
                top5.forEach((a, i) => {
                    const y = 220 + i * 152
                    ctx.fillStyle = i === 0 ? 'rgba(29,185,84,0.12)' : CARD
                    ctx.beginPath()
                    ctx.roundRect(PAD, y, S - PAD * 2, 130, 14)
                    ctx.fill()
                    drawText(`${i + 1}`, PAD + 28, y + 76, 52, i === 0 ? GREEN : MUTED, 'left', '700')
                    drawText(truncate(a.name, 26), PAD + 100, y + 62, 38, WHITE, 'left', '600')
                    drawText(fmtNum(a.streams) + ' Streams', PAD + 100, y + 96, 24, i === 0 ? GREEN : MUTED, 'left', '400')
                    const barW = (S - PAD * 2 - 120) * (a.streams / maxS)
                    ctx.fillStyle = i === 0 ? GREEN : '#3a3a3a'
                    ctx.beginPath()
                    ctx.roundRect(PAD + 100, y + 108, barW, 6, 3)
                    ctx.fill()
                })
                drawFooter()
            }

            else if (id === 'hour') {
                drawTopBar()
                const peakH = this.hourlyData.reduce((p, h) => h.streams > p.streams ? h : p, { hour: 0, streams: 0 })
                drawText('Du hörst am meisten um', PAD, 130, 36, MUTED, 'left', '400')
                drawText(`${peakH.hour}:00 Uhr`, PAD, 210, 90, GREEN, 'left', '700')

                // bar chart
                const chartX = PAD, chartY = 290, chartW = S - PAD * 2, chartH = 520
                const maxS = Math.max(...this.hourlyData.map(h => h.streams)) || 1
                const barW = (chartW - 23 * 6) / 24
                this.hourlyData.forEach((h, i) => {
                    const bH = Math.max(4, (h.streams / maxS) * chartH)
                    const x = chartX + i * (barW + 6)
                    const y = chartY + chartH - bH
                    ctx.fillStyle = h.hour === peakH.hour ? GREEN : (h.streams > maxS * 0.7 ? 'rgba(29,185,84,0.55)' : 'rgba(29,185,84,0.22)')
                    ctx.beginPath()
                    ctx.roundRect(x, y, barW, bH, [4, 4, 0, 0])
                    ctx.fill()
                    // hour labels every 6h
                    if (h.hour % 6 === 0) drawText(`${h.hour}:00`, x + barW / 2, chartY + chartH + 44, 24, MUTED, 'center')
                })
                // baseline
                ctx.strokeStyle = '#333'
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(chartX, chartY + chartH + 4)
                ctx.lineTo(chartX + chartW, chartY + chartH + 4)
                ctx.stroke()
                drawFooter()
            }

            else if (id === 'weekday') {
                drawTopBar()
                const peakD = this.weekdayData.reduce((p, d) => d.streams > p.streams ? d : p, { day: '—', streams: 0 })
                drawText('Dein aktivster Tag', PAD, 130, 36, MUTED, 'left', '400')
                drawText(peakD.day, PAD, 215, 88, GREEN, 'left', '700')

                const chartX = PAD, chartY = 280, chartW = S - PAD * 2, chartH = 540
                const maxS = Math.max(...this.weekdayData.map(d => d.streams)) || 1
                const barW = (chartW - 6 * 20) / 7
                this.weekdayData.forEach((d, i) => {
                    const bH = Math.max(4, (d.streams / maxS) * chartH)
                    const x = chartX + i * (barW + 20)
                    const y = chartY + chartH - bH
                    const isPeak = d.day === peakD.day
                    ctx.fillStyle = ispeak => iseak ? GREEN : (d.streams > maxS * 0.8 ? 'rgba(29,185,84,0.5)' : 'rgba(29,185,84,0.22)')
                    ctx.fillStyle = isPeak ? GREEN : (d.streams > maxS * 0.8 ? 'rgba(29,185,84,0.5)' : 'rgba(29,185,84,0.22)')
                    ctx.beginPath()
                    ctx.roundRect(x, y, barW, bH, [6, 6, 0, 0])
                    ctx.fill()
                    // day label (Mo, Di etc.)
                    const short = d.day.slice(0, 2)
                    drawText(short, x + barW / 2, chartY + chartH + 48, 28, isPeak ? GREEN : MUTED, 'center', isPeak ? '700' : '400')
                    drawText(fmtNum(d.streams), x + barW / 2, y - 12, 20, MUTED, 'center')
                })
                ctx.strokeStyle = '#333'
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(chartX, chartY + chartH + 4)
                ctx.lineTo(chartX + chartW, chartY + chartH + 4)
                ctx.stroke()
                drawFooter()
            }

            else if (id === 'platforms') {
                drawTopBar()
                drawText('Deine Plattformen', PAD, 140, 62, WHITE, 'left', '700')
                const top6 = this.platforms.slice(0, 6)
                const maxS = top6[0]?.streams || 1
                const rowH = 118, startY = 220
                top6.forEach((p, i) => {
                    const y = startY + i * rowH
                    const barMaxW = S - PAD * 2 - 320
                    const barW = Math.max(8, (p.streams / maxS) * barMaxW)
                    const isTop = i === 0
                    drawText(truncate(p.name, 22), PAD, y + 36, 30, isTop ? WHITE : MUTED, 'left', isTop ? '600' : '400')
                    ctx.fillStyle = isTop ? GREEN : 'rgba(29,185,84,0.35)'
                    ctx.beginPath()
                    ctx.roundRect(PAD, y + 52, barW, 12, 6)
                    ctx.fill()
                    drawText(fmtNum(p.streams) + ' ×', S - PAD, y + 62, 28, isTop ? GREEN : MUTED, 'right', '600')
                })
                drawFooter()
            }
        },

        downloadCard(id) {
            const refKey = 'canvas-' + id
            const canvasArr = this.$refs[refKey]
            const canvas = Array.isArray(canvasArr) ? canvasArr[0] : canvasArr
            if (!canvas) return
            const a = document.createElement('a')
            a.download = `spotify-stats-${id}.png`
            a.href = canvas.toDataURL('image/png')
            a.click()
        },

        // ── UI helpers ──
        setSort(col) {
            if (this.sortCol === col) this.sortAsc = !this.sortAsc
            else { this.sortCol = col; this.sortAsc = ['name', 'artist', 'first'].includes(col) }
            this.trackPage = 1
        },
        onTrackSortChange() {
            this.sortAsc = ['name', 'artist', 'first'].includes(this.sortCol)
            this.trackPage = 1
        },

        buildPages(total, cur) {
            if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
            const pages = [1]
            if (cur > 3) pages.push('…')
            for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
            if (cur < total - 2) pages.push('…')
            pages.push(total)
            return pages
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
            this.allArtists = []
            this.allAlbums = []
            this.platforms = []
            this.hourlyData = []
            this.weekdayData = []
            this.monthlyData = []
            this.insightStats = []
            this.contentSplit = { music: 0, podcast: 0, musicPct: 0, podcastPct: 0 }
            this.topCountries = []
            this.reasonEndData = []
            this.reasonStartData = []
            this.summaryStats = []
            this.loadedFiles = []
            this.searchQuery = ''
            this.artistSearch = ''
            this.albumSearch = ''
            this.sortCol = 'streams'
            this.sortAsc = false
            this.artistSortCol = 'streams'
            this.albumSortCol = 'streams'
            this.trackPage = 1
            this.artistPage = 1
            this.albumPage = 1
            this.activeTab = 'overview'
        },

        fmtDate(d) {
            if (!d) return '—'
            return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        fmtTime(ms) {
            const mins = Math.round(ms / 60000)
            if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
            return `${mins}m`
        },
        fmtMins(ms) {
            const mins = Math.round(ms / 60000)
            if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
            return `${mins}m`
        },

        // ── Spotify OAuth ────────────────────────────────────────────────────
        async spotifyLogin() {
            if (!SPOTIFY_CLIENT_ID) {
                alert('Spotify Client ID not configured yet.')
                return
            }
            const verifier   = _pkceVerifier()
            const challenge  = await _pkceChallenge(verifier)
            const state      = Math.random().toString(36).slice(2)
            localStorage.setItem('spotify_pkce_verifier', verifier)
            localStorage.setItem('spotify_pkce_state', state)
            const params = new URLSearchParams({
                client_id: SPOTIFY_CLIENT_ID, response_type: 'code',
                redirect_uri: SPOTIFY_REDIRECT_URI, scope: SPOTIFY_SCOPES,
                code_challenge_method: 'S256', code_challenge: challenge, state
            })
            window.location.href = 'https://accounts.spotify.com/authorize?' + params
        },

        async handleSpotifyCallback(code, state) {
            const savedState = localStorage.getItem('spotify_pkce_state')
            const verifier   = localStorage.getItem('spotify_pkce_verifier')
            if (!verifier || state !== savedState) return
            localStorage.removeItem('spotify_pkce_verifier')
            localStorage.removeItem('spotify_pkce_state')
            try {
                const res = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code', code,
                        redirect_uri: SPOTIFY_REDIRECT_URI,
                        client_id: SPOTIFY_CLIENT_ID, code_verifier: verifier
                    })
                })
                const data = await res.json()
                if (data.access_token) {
                    this.spotifyToken = data.access_token
                    const expiry = Date.now() + (data.expires_in || 3600) * 1000
                    localStorage.setItem('spotify_access_token', data.access_token)
                    localStorage.setItem('spotify_token_expiry', String(expiry))
                    if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)
                    this.liveConnected = true
                    history.replaceState(null, '', window.location.href.split('?')[0] + '#SpotifyStats')
                    await this.loadSpotifyData()
                }
            } catch (err) { console.error('Token exchange failed:', err) }
        },

        spotifyDisconnect() {
            this.liveConnected = false
            this.spotifyToken  = ''
            this.liveUser      = null
            this.liveData      = { topArtists: [], topTracks: [], recentPlays: [], topGenres: [] }
            localStorage.removeItem('spotify_access_token')
            localStorage.removeItem('spotify_token_expiry')
            localStorage.removeItem('spotify_refresh_token')
        },

        async refreshSpotifyToken() {
            const rt = localStorage.getItem('spotify_refresh_token')
            if (!rt || !SPOTIFY_CLIENT_ID) return false
            try {
                const res = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt, client_id: SPOTIFY_CLIENT_ID })
                })
                const data = await res.json()
                if (data.access_token) {
                    this.spotifyToken = data.access_token
                    const expiry = Date.now() + (data.expires_in || 3600) * 1000
                    localStorage.setItem('spotify_access_token', data.access_token)
                    localStorage.setItem('spotify_token_expiry', String(expiry))
                    if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)
                    return true
                }
            } catch { /* silent */ }
            return false
        },

        async fetchSpotify(endpoint) {
            // Auto-refresh if token is expired or about to expire (< 5 min)
            const expiry = parseInt(localStorage.getItem('spotify_token_expiry') || '0')
            if (Date.now() > expiry - 5 * 60 * 1000) {
                const ok = await this.refreshSpotifyToken()
                if (!ok) { this.spotifyDisconnect(); throw Object.assign(new Error('Token expired'), { status: 401 }) }
            }
            const res = await fetch('https://api.spotify.com/v1' + endpoint, {
                headers: { Authorization: 'Bearer ' + this.spotifyToken }
            })
            if (!res.ok) { const e = new Error('Spotify ' + res.status); e.status = res.status; throw e }
            return res.json()
        },

        async loadSpotifyData() {
            this.liveLoading = true
            this.liveLoadingMsg = 'Lade Top Artists & Tracks…'
            try {
                const [artistsRes, tracksRes, recentRes, userRes] = await Promise.all([
                    this.fetchSpotify('/me/top/artists?time_range=short_term&limit=50'),
                    this.fetchSpotify('/me/top/tracks?time_range=short_term&limit=50'),
                    this.fetchSpotify('/me/player/recently-played?limit=50'),
                    this.fetchSpotify('/me')
                ])
                this.liveData.topArtists  = artistsRes.items  || []
                this.liveData.topTracks   = tracksRes.items   || []
                this.liveData.recentPlays = (recentRes.items  || []).map(i => ({ ...i.track, played_at: i.played_at }))
                this.liveUser             = userRes
                this.liveData.topGenres   = this.computeTopGenres(this.liveData.topArtists)

            } catch (err) {
                console.error('Spotify data error:', err)
                if (err.status === 401) this.spotifyDisconnect()
            } finally { this.liveLoading = false }
        },

        computeTopGenres(artists) {
            const map = new Map()
            for (const a of artists) for (const g of (a.genres || [])) map.set(g, (map.get(g) || 0) + 1)
            return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
        },

        switchToLiveKarten() {
            this.liveActiveTab = 'karten'
            this.$nextTick(() => { for (const c of this.liveExportCards) this.renderLiveCard(c.id) })
        },

        downloadLiveCard(id) {
            const arr = this.$refs['canvas-' + id]
            const canvas = Array.isArray(arr) ? arr[0] : arr
            if (!canvas) return
            const a = document.createElement('a')
            a.download = `spotify-live-${id}.png`
            a.href = canvas.toDataURL('image/png')
            a.click()
        },

        renderLiveCard(id) {
            const arr = this.$refs['canvas-' + id]
            const canvas = Array.isArray(arr) ? arr[0] : arr
            if (!canvas) return
            const S = 1080
            canvas.width = S; canvas.height = S
            const ctx = canvas.getContext('2d')

            const GREEN = '#1DB954', BG = '#0d0d0d', CARD = '#181818', WHITE = '#FFFFFF', MUTED = '#A0A0A0'
            const FONT  = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            const PAD   = 72

            const bg = ctx.createLinearGradient(0, 0, 0, S)
            bg.addColorStop(0, '#111111'); bg.addColorStop(1, '#0a0a0a')
            ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S)

            const gr1 = ctx.createRadialGradient(S, 0, 0, S, 0, S * 0.55)
            gr1.addColorStop(0, 'rgba(29,185,84,0.18)'); gr1.addColorStop(1, 'rgba(29,185,84,0)')
            ctx.fillStyle = gr1; ctx.fillRect(0, 0, S, S)
            const gr2 = ctx.createRadialGradient(0, S, 0, 0, S, S * 0.4)
            gr2.addColorStop(0, 'rgba(29,185,84,0.08)'); gr2.addColorStop(1, 'rgba(29,185,84,0)')
            ctx.fillStyle = gr2; ctx.fillRect(0, 0, S, S)

            const drawText = (text, x, y, size, color, align = 'left', weight = 'normal') => {
                ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y)
            }
            const truncate = (str, max) => str && str.length > max ? str.slice(0, max - 1) + '…' : (str || '—')
            const drawTopBar = () => { ctx.fillStyle = GREEN; ctx.fillRect(PAD, 60, 80, 6) }
            const drawFooter = () => {
                ctx.beginPath(); ctx.arc(PAD, S - 54, 10, 0, Math.PI * 2)
                ctx.fillStyle = GREEN; ctx.fill()
                drawText('nico-ruge.de/#SpotifyStats', PAD + 20, S - 46, 28, MUTED, 'left', '500')
            }

            if (id === 'live-artist') {
                const artist = this.liveData.topArtists[0]
                if (!artist) return
                drawTopBar()
                drawText('Artist of the Month', PAD, 130, 40, MUTED, 'left', '500')
                drawText('Letzte 30 Tage', PAD, 178, 28, 'rgba(29,185,84,0.7)', 'left', '400')
                drawText(truncate(artist.name, 18), PAD, 310, 96, WHITE, 'left', '700')
                const genres = (artist.genres || []).slice(0, 3)
                genres.forEach((g, i) => {
                    const gx = PAD + i * 300
                    ctx.fillStyle = 'rgba(29,185,84,0.15)'; ctx.beginPath()
                    ctx.roundRect(gx, 350, 274, 52, 26); ctx.fill()
                    drawText(g, gx + 137, 383, 22, GREEN, 'center', '500')
                })
                // Big number circle
                ctx.beginPath(); ctx.arc(S - PAD - 140, 440, 140, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(29,185,84,0.08)'; ctx.fill()
                drawText('#1', S - PAD - 140, 470, 100, GREEN, 'center', '700')
                drawText('Popularity', PAD, 600, 28, MUTED, 'left', '400')
                const popW = (S - PAD * 2) * (artist.popularity / 100)
                ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.roundRect(PAD, 618, S - PAD * 2, 20, 10); ctx.fill()
                ctx.fillStyle = GREEN; ctx.beginPath(); ctx.roundRect(PAD, 618, popW, 20, 10); ctx.fill()
                drawText(artist.popularity + ' / 100', S - PAD, 610, 26, MUTED, 'right', '400')
                drawFooter()
            }

            else if (id === 'live-artists') {
                drawTopBar()
                drawText('Top 5 Artists', PAD, 140, 62, WHITE, 'left', '700')
                drawText('Letzte 30 Tage', S - PAD, 140, 28, MUTED, 'right', '400')
                this.liveData.topArtists.slice(0, 5).forEach((a, i) => {
                    const y = 220 + i * 152
                    ctx.fillStyle = i === 0 ? 'rgba(29,185,84,0.12)' : CARD
                    ctx.beginPath(); ctx.roundRect(PAD, y, S - PAD * 2, 130, 14); ctx.fill()
                    drawText(`${i + 1}`, PAD + 28, y + 76, 52, i === 0 ? GREEN : MUTED, 'left', '700')
                    drawText(truncate(a.name, 26), PAD + 100, y + 62, 38, WHITE, 'left', '600')
                    const genreLabel = (a.genres || []).slice(0, 2).join(' · ') || '—'
                    drawText(truncate(genreLabel, 42), PAD + 100, y + 96, 22, i === 0 ? GREEN : MUTED, 'left', '400')
                    const barW = (S - PAD * 2 - 120) * (a.popularity / 100)
                    ctx.fillStyle = i === 0 ? GREEN : '#3a3a3a'
                    ctx.beginPath(); ctx.roundRect(PAD + 100, y + 110, barW, 6, 3); ctx.fill()
                })
                drawFooter()
            }

            else if (id === 'live-tracks') {
                drawTopBar()
                drawText('Top 5 Tracks', PAD, 140, 62, WHITE, 'left', '700')
                drawText('Letzte 30 Tage', S - PAD, 140, 28, MUTED, 'right', '400')
                this.liveData.topTracks.slice(0, 5).forEach((t, i) => {
                    const y = 220 + i * 152
                    ctx.fillStyle = i === 0 ? 'rgba(29,185,84,0.12)' : CARD
                    ctx.beginPath(); ctx.roundRect(PAD, y, S - PAD * 2, 130, 14); ctx.fill()
                    drawText(`${i + 1}`, PAD + 28, y + 76, 52, i === 0 ? GREEN : MUTED, 'left', '700')
                    drawText(truncate(t.name, 26), PAD + 100, y + 62, 38, WHITE, 'left', '600')
                    const artistName = t.artists && t.artists[0] ? t.artists[0].name : '—'
                    drawText(truncate(artistName, 32), PAD + 100, y + 96, 22, i === 0 ? GREEN : MUTED, 'left', '400')
                    const barW = (S - PAD * 2 - 120) * (t.popularity / 100)
                    ctx.fillStyle = i === 0 ? GREEN : '#3a3a3a'
                    ctx.beginPath(); ctx.roundRect(PAD + 100, y + 110, barW, 6, 3); ctx.fill()
                })
                drawFooter()
            }

            else if (id === 'live-genres') {
                drawTopBar()
                drawText('Your Sound', PAD, 140, 72, WHITE, 'left', '700')
                drawText('Letzte 30 Tage', S - PAD, 140, 28, MUTED, 'right', '400')
                const genres = this.liveData.topGenres.slice(0, 6)
                const maxC = genres[0] ? genres[0].count : 1
                genres.forEach((g, i) => {
                    const y = 220 + i * 132
                    const alpha = 0.12 + 0.55 * (g.count / maxC)
                    const barW = Math.max(120, (S - PAD * 2) * (g.count / maxC))
                    ctx.fillStyle = `rgba(29,185,84,${alpha.toFixed(2)})`
                    ctx.beginPath(); ctx.roundRect(PAD, y, barW, 104, 12); ctx.fill()
                    drawText(truncate(g.name, 28), PAD + 24, y + 64, 32, i === 0 ? WHITE : 'rgba(255,255,255,0.85)', 'left', i === 0 ? '700' : '500')
                    drawText(g.count + ' artists', S - PAD - 20, y + 64, 24, 'rgba(255,255,255,0.55)', 'right', '400')
                })
                drawFooter()
            }

        }
    },

    async mounted() {
        const params = new URLSearchParams(window.location.search)
        if (params.has('code') && params.has('state')) {
            await this.handleSpotifyCallback(params.get('code'), params.get('state'))
            return
        }
        const token  = localStorage.getItem('spotify_access_token')
        const expiry = localStorage.getItem('spotify_token_expiry')
        if (token && expiry && Date.now() < parseInt(expiry)) {
            this.spotifyToken  = token
            this.liveConnected = true
            await this.loadSpotifyData()
        }
    }
};
