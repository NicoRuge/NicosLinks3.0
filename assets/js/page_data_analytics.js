const DataAnalyticsView = {
    template: `
        <div class="container-fluid py-4 data-analytics-page">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <div>
                            <h1 class="hero-title mb-2">Data Analytics</h1>
                            <p class="mb-0 hero-subtitle">A place for data visualisations and personal statistics projects.</p>
                        </div>
                    </section>

                    <!-- X / Twitter Chart -->
                    <div class="analytics-chart-card rounded-4 p-3 p-lg-4">
                        <div class="mb-3">
                            <h2 class="h5 fw-semibold mb-1">X / Twitter Stats</h2>
                            <p class="text-body-secondary small mb-0">My personal Twitter stats from March&nbsp;'23 to June&nbsp;'24. After that, Elmo Musk disabled the ability to export these statistics.</p>
                        </div>
                        <hr class="my-3">
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <template v-for="view in views" :key="view.id">
                                <input
                                    class="btn-check"
                                    type="radio"
                                    name="analytics-view"
                                    :id="'av-' + view.id"
                                    :value="view.id"
                                    v-model="currentView"
                                    @change="onViewChange(view.id)"
                                    autocomplete="off"
                                >
                                <label class="btn btn-sm btn-outline-secondary" :for="'av-' + view.id">
                                    <i :class="'bi ' + view.icon + ' me-1'"></i>{{ view.label }}
                                </label>
                            </template>
                        </div>
                        <div ref="chartWrapper" class="analytics-chart-wrapper">
                            <canvas ref="chartCanvas"></canvas>
                        </div>
                    </div>

                    <!-- Spotify Listening Minutes Chart -->
                    <div class="analytics-chart-card rounded-4 p-3 p-lg-4 mt-4">
                        <div class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" class="flex-shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                <h2 class="h5 fw-semibold mb-0">Spotify Listening Minutes</h2>
                            </div>
                            <p class="text-body-secondary small mb-0 mt-1">My Spotify listening minutes by month.</p>
                        </div>
                        <hr class="my-3">
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <template v-for="view in spotifyViews" :key="view.id">
                                <input
                                    class="btn-check"
                                    type="radio"
                                    name="spotify-view"
                                    :id="'sv-' + view.id"
                                    :value="view.id"
                                    v-model="spotifyCurrentView"
                                    @change="onSpotifyViewChange(view.id)"
                                    autocomplete="off"
                                >
                                <label class="btn btn-sm btn-outline-secondary" :for="'sv-' + view.id">
                                    <i :class="'bi ' + view.icon + ' me-1'"></i>{{ view.label }}
                                </label>
                            </template>
                        </div>
                        <div ref="spotifyChartWrapper" class="analytics-chart-wrapper">
                            <div v-if="spotifyLoading" class="d-flex align-items-center justify-content-center h-100 text-body-secondary">
                                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                Loading…
                            </div>
                            <div v-else-if="!spotifyHasData" class="d-flex flex-column align-items-center justify-content-center h-100 text-body-secondary gap-2">
                                <i class="bi bi-music-note-list fs-2 opacity-50"></i>
                                <span class="small">No Spotify data available yet.</span>
                            </div>
                            <canvas v-else ref="spotifyChartCanvas"></canvas>
                        </div>
                    </div>

                    <!-- Spotify Platform Chart -->
                    <div class="analytics-chart-card rounded-4 p-3 p-lg-4 mt-4">
                        <div class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" class="flex-shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                <h2 class="h5 fw-semibold mb-0">Streams by Platform</h2>
                            </div>
                            <p class="text-body-secondary small mb-0 mt-1">Where I listened to Spotify – streams counted per platform / device.</p>
                        </div>
                        <hr class="my-3">
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <template v-for="view in platformViews" :key="view.id">
                                <input
                                    class="btn-check"
                                    type="radio"
                                    name="platform-view"
                                    :id="'pv-' + view.id"
                                    :value="view.id"
                                    v-model="platformCurrentView"
                                    @change="onPlatformViewChange(view.id)"
                                    autocomplete="off"
                                >
                                <label class="btn btn-sm btn-outline-secondary" :for="'pv-' + view.id">
                                    <i :class="'bi ' + view.icon + ' me-1'"></i>{{ view.label }}
                                </label>
                            </template>
                        </div>
                        <div ref="platformChartWrapper" class="analytics-chart-wrapper analytics-chart-wrapper--tall">
                            <div v-if="platformLoading" class="d-flex align-items-center justify-content-center h-100 text-body-secondary">
                                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                Loading…
                            </div>
                            <div v-else-if="!platformHasData" class="d-flex flex-column align-items-center justify-content-center h-100 text-body-secondary gap-2">
                                <i class="bi bi-laptop fs-2 opacity-50"></i>
                                <span class="small">No platform data available.</span>
                            </div>
                            <canvas v-else ref="platformChartCanvas"></canvas>
                        </div>
                    </div>

                    <!-- Spotify Reason End Chart -->
                    <div class="analytics-chart-card rounded-4 p-3 p-lg-4 mt-4">
                        <div class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" class="flex-shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                <h2 class="h5 fw-semibold mb-0">Streams by Skip Reason</h2>
                            </div>
                            <p class="text-body-secondary small mb-0 mt-1">How my streams ended – why did a track stop playing?</p>
                        </div>
                        <hr class="my-3">
                        <div ref="reasonChartWrapper" class="analytics-chart-wrapper">
                            <div v-if="reasonLoading" class="d-flex align-items-center justify-content-center h-100 text-body-secondary">
                                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                Loading…
                            </div>
                            <div v-else-if="!reasonHasData" class="d-flex flex-column align-items-center justify-content-center h-100 text-body-secondary gap-2">
                                <i class="bi bi-skip-end fs-2 opacity-50"></i>
                                <span class="small">No reason_end data available.</span>
                            </div>
                            <canvas v-else ref="reasonChartCanvas"></canvas>
                        </div>
                    </div>

                    <!-- Listening Patterns (Clock) -->
                    <div class="analytics-chart-card rounded-4 p-3 p-lg-4 mt-4">
                        <div class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" class="flex-shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                <h2 class="h5 fw-semibold mb-0">Listening Patterns</h2>
                            </div>
                            <p class="text-body-secondary small mb-0 mt-1">When do I listen? By hour of day and day of week (UTC+1).</p>
                        </div>
                        <hr class="my-3">
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <template v-for="view in clockViews" :key="view.id">
                                <input class="btn-check" type="radio" name="clock-view" :id="'cv-' + view.id" :value="view.id" v-model="clockCurrentView" @change="onClockViewChange(view.id)" autocomplete="off">
                                <label class="btn btn-sm btn-outline-secondary" :for="'cv-' + view.id">
                                    <i :class="'bi ' + view.icon + ' me-1'"></i>{{ view.label }}
                                </label>
                            </template>
                        </div>
                        <div ref="clockChartWrapper" class="analytics-chart-wrapper">
                            <div v-if="clockLoading" class="d-flex align-items-center justify-content-center h-100 text-body-secondary">
                                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                Loading…
                            </div>
                            <div v-else-if="!clockHasData" class="d-flex flex-column align-items-center justify-content-center h-100 text-body-secondary gap-2">
                                <i class="bi bi-clock fs-2 opacity-50"></i>
                                <span class="small">No listening pattern data available.</span>
                            </div>
                            <canvas v-else ref="clockChartCanvas"></canvas>
                        </div>
                    </div>

                    <!-- Top Artists & Tracks -->
                    <div class="analytics-chart-card rounded-4 p-3 p-lg-4 mt-4">
                        <div class="mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" class="flex-shrink-0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                <h2 class="h5 fw-semibold mb-0">Top Artists & Tracks</h2>
                            </div>
                            <p class="text-body-secondary small mb-0 mt-1">My most-played artists and tracks (≥ 30 s plays, Top 25).</p>
                        </div>
                        <hr class="my-3">
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <template v-for="view in topViews" :key="view.id">
                                <input class="btn-check" type="radio" name="top-view" :id="'tv-' + view.id" :value="view.id" v-model="topCurrentView" @change="onTopViewChange(view.id)" autocomplete="off">
                                <label class="btn btn-sm btn-outline-secondary" :for="'tv-' + view.id">
                                    <i :class="'bi ' + view.icon + ' me-1'"></i>{{ view.label }}
                                </label>
                            </template>
                        </div>
                        <div ref="topChartWrapper" class="analytics-chart-wrapper analytics-chart-wrapper--tall">
                            <div v-if="topLoading" class="d-flex align-items-center justify-content-center h-100 text-body-secondary">
                                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                Loading…
                            </div>
                            <div v-else-if="!topHasData" class="d-flex flex-column align-items-center justify-content-center h-100 text-body-secondary gap-2">
                                <i class="bi bi-music-note-list fs-2 opacity-50"></i>
                                <span class="small">No artist/track data available.</span>
                            </div>
                            <canvas v-else ref="topChartCanvas"></canvas>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `,

    data() {
        return {
            // Twitter chart
            chart: null,
            currentView: 'reach',
            _mo: null,

            views: [
                { id: 'reach',        label: 'Reach',        icon: 'bi-broadcast'      },
                { id: 'engagement',   label: 'Engagement',   icon: 'bi-heart'           },
                { id: 'interactions', label: 'Interactions', icon: 'bi-cursor-fill'     },
                { id: 'averages',     label: 'Averages',     icon: 'bi-graph-up-arrow'  }
            ],

            d: {
                months:          ["Mar '23","Apr '23","May '23","Jun '23","Jul '23","Aug '23","Sep '23","Oct '23","Nov '23","Dec '23","Jan '24","Feb '24","Mar '24","Apr '24","May '24","Jun '24"],
                impressions:     [663052,728521,1045361,1041354,983605,1797349,1078505,715481,960892,1023669,1184957,852920,1220712,1216816,1249971,1248623],
                tweets:          [528,815,1082,934,1036,942,643,655,530,639,538,645,806,668,830,null],
                likes:           [8415,9635,13065,13787,11709,19006,10547,9628,7422,10553,11210,10128,14997,14522,15844,15877],
                replies:         [938,1338,2017,1859,1738,2154,1324,952,1312,1255,1131,1097,1378,1707,1593,1629],
                retweets:        [83,121,152,335,112,598,105,65,139,149,139,77,168,228,139,120],
                mediaEngagement: [9091,9536,13920,17393,18601,23696,16053,15840,12993,17090,20581,9135,13024,20360,19724,26984],
                profileClicks:   [4189,4640,5234,5154,8114,14174,9321,10138,5262,6709,13332,9316,15022,9673,11762,11499],
                detailExpands:   [5789,5640,8314,9064,7118,15199,7404,6364,5842,7517,8361,9009,9634,10358,10045,null],
                urlClicks:       [448,696,604,1129,663,2006,896,900,931,1531,1005,1341,787,794,1630,null],
                hashtagClicks:   [13,18,92,408,45,190,199,165,17,17,36,68,103,514,221,null],
                avgLikesDay:     [271.5,321.2,421.5,459.6,390.3,633.5,351.6,310.6,247.4,340.4,361.6,337.6,483.8,484.1,511.1,null],
                avgTweetsDay:    [17,27.2,34.9,31.1,33.4,30.4,21.4,21.1,17.7,20.6,17.4,21.5,26,22.3,27.7,null],
                avgLikesTweet:   [15.9,11.8,12.1,14.8,11.3,20.2,16.4,14.7,14,16.5,20.8,15.7,18.6,21.7,19.1,null],
                engagementRate:  [4.37,4.34,4.15,4.72,4.89,4.29,4.25,6.16,3.53,4.38,4.71,4.71,4.52,4.78,4.88,4.49]
            },

            // Spotify chart
            spotifyChart: null,
            spotifyCurrentView: 'all',
            spotifyRawData: null,
            spotifyLoading: true,

            // Platform chart
            platformChart: null,
            platformCurrentView: 'top10',
            platformRawData: null,
            platformLoading: true,

            // Reason End chart
            reasonChart: null,
            reasonRawData: null,
            reasonLoading: true,

            // Listening Clock chart
            clockChart: null,
            clockCurrentView: 'hour-streams',
            clockRawData: null,
            clockLoading: true,

            // Top Artists & Tracks chart
            topChart: null,
            topCurrentView: 'artists-streams',
            topRawData: null,
            topLoading: true,
        };
    },

    computed: {
        spotifyYears() {
            if (!this.spotifyRawData || !this.spotifyRawData.Year) return [];
            return Object.keys(this.spotifyRawData.Year).sort();
        },
        spotifyHasData() {
            return this.spotifyYears.length > 0;
        },
        spotifyViews() {
            const YEAR_ICONS = ['bi-calendar3', 'bi-calendar2', 'bi-calendar', 'bi-calendar4', 'bi-calendar-week'];
            return [
                { id: 'all', label: 'All Time', icon: 'bi-calendar-range' },
                ...this.spotifyYears.map((y, i) => ({
                    id: y,
                    label: y,
                    icon: YEAR_ICONS[i % YEAR_ICONS.length]
                }))
            ];
        },

        platformHasData() {
            return this.platformRawData && Object.keys(this.platformRawData.platforms || {}).length > 0;
        },
        platformViews() {
            return [
                { id: 'top10', label: 'Top 10', icon: 'bi-bar-chart-steps' },
                { id: 'top25', label: 'Top 25', icon: 'bi-bar-chart'       },
            ];
        },


        reasonHasData() {
            return this.reasonRawData && Object.keys(this.reasonRawData.reason_end || {}).length > 0;
        },

        clockHasData() {
            return this.clockRawData && (this.clockRawData.by_hour || []).length > 0;
        },
        clockViews() {
            return [
                { id: 'hour-streams', label: 'Hour / Streams', icon: 'bi-clock'              },
                { id: 'hour-minutes', label: 'Hour / Minutes', icon: 'bi-clock-fill'         },
                { id: 'week-streams', label: 'Weekday / Streams', icon: 'bi-calendar-week'   },
                { id: 'week-minutes', label: 'Weekday / Minutes', icon: 'bi-calendar-check'  },
            ];
        },

        topHasData() {
            return this.topRawData && (this.topRawData.artists_by_streams || []).length > 0;
        },
        topViews() {
            return [
                { id: 'artists-streams', label: 'Artists / Streams', icon: 'bi-person-fill'      },
                { id: 'artists-minutes', label: 'Artists / Minutes', icon: 'bi-person'            },
                { id: 'tracks-streams',  label: 'Tracks / Streams',  icon: 'bi-music-note'        },
                { id: 'tracks-minutes',  label: 'Tracks / Minutes',  icon: 'bi-music-note-list'   },
            ];
        },
    },

    mounted() {
        this.$nextTick(() => this.buildChart(this.currentView));

        // Fetch Spotify monthly data
        fetch('assets/data/spotify_stats.json')
            .then(r => r.json())
            .then(data => {
                this.spotifyRawData = data;
                this.spotifyLoading = false;
                if (this.spotifyHasData) {
                    this.$nextTick(() => this.buildSpotifyChart(this.spotifyCurrentView));
                }
            })
            .catch(() => {
                this.spotifyRawData = { title: 'Spotify Streaming Minutes', Year: {} };
                this.spotifyLoading = false;
            });

        // Fetch platform data
        fetch('assets/data/spotify_platform_stats.json')
            .then(r => r.json())
            .then(data => {
                this.platformRawData = data;
                this.platformLoading = false;
                if (this.platformHasData) {
                    this.$nextTick(() => this.buildPlatformChart(this.platformCurrentView));
                }
            })
            .catch(() => {
                this.platformRawData = { platforms: {} };
                this.platformLoading = false;
            });

        // Fetch reason_end data
        fetch('assets/data/spotify_reason_end_stats.json')
            .then(r => r.json())
            .then(data => {
                this.reasonRawData = data;
                this.reasonLoading = false;
                if (this.reasonHasData) {
                    this.$nextTick(() => this.buildReasonChart());
                }
            })
            .catch(() => {
                this.reasonRawData = { reason_end: {} };
                this.reasonLoading = false;
            });

        // Fetch listening clock data
        fetch('assets/data/spotify_listening_clock.json')
            .then(r => r.json())
            .then(data => {
                this.clockRawData = data;
                this.clockLoading = false;
                if (this.clockHasData) {
                    this.$nextTick(() => this.buildClockChart(this.clockCurrentView));
                }
            })
            .catch(() => {
                this.clockRawData = { by_hour: [], by_weekday: [] };
                this.clockLoading = false;
            });

        // Fetch top artists & tracks data
        fetch('assets/data/spotify_top_artists_tracks.json')
            .then(r => r.json())
            .then(data => {
                this.topRawData = data;
                this.topLoading = false;
                if (this.topHasData) {
                    this.$nextTick(() => this.buildTopChart(this.topCurrentView));
                }
            })
            .catch(() => {
                this.topRawData = { artists_by_streams: [] };
                this.topLoading = false;
            });

        this._mo = new MutationObserver(() => {
            if (this.chart)         this.buildChart(this.currentView);
            if (this.spotifyChart)  this.buildSpotifyChart(this.spotifyCurrentView);
            if (this.platformChart) this.buildPlatformChart(this.platformCurrentView);
            if (this.reasonChart)   this.buildReasonChart();
            if (this.clockChart)    this.buildClockChart(this.clockCurrentView);
            if (this.topChart)      this.buildTopChart(this.topCurrentView);
        });
        this._mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-bs-theme']
        });

        // Chrome scrolls the overflow:hidden .content-scroll-shell when a radio button
        // inside it is focused, moving the actual scroll container out of view.
        // Reset it immediately whenever the browser scrolls it.
        const shell = document.querySelector('.content-scroll-shell');
        if (shell) {
            this._shellScrollFix = () => { if (shell.scrollTop !== 0) shell.scrollTop = 0; };
            shell.addEventListener('scroll', this._shellScrollFix, { passive: false });
        }
    },

    beforeUnmount() {
        if (this.chart)         { this.chart.destroy();         this.chart = null; }
        if (this.spotifyChart)  { this.spotifyChart.destroy();  this.spotifyChart = null; }
        if (this.platformChart) { this.platformChart.destroy(); this.platformChart = null; }
        if (this.reasonChart)   { this.reasonChart.destroy();   this.reasonChart = null; }
        if (this.clockChart)    { this.clockChart.destroy();    this.clockChart = null; }
        if (this.topChart)      { this.topChart.destroy();      this.topChart = null; }
        if (this._mo) this._mo.disconnect();
        const shell = document.querySelector('.content-scroll-shell');
        if (shell && this._shellScrollFix) shell.removeEventListener('scroll', this._shellScrollFix);
    },

    methods: {
        isDark() {
            return document.documentElement.getAttribute('data-bs-theme') === 'dark';
        },

        palette() {
            return {
                blue:   'rgba(59,130,246,',
                purple: 'rgba(149,97,255,',
                green:  'rgba(16,185,129,',
                orange: 'rgba(251,146,60,',
                red:    'rgba(248,87,104,',
                teal:   'rgba(34,211,199,',
            };
        },

        grad(colorKey, a1 = '0.32', a2 = '0.02') {
            const c = this.palette()[colorKey];
            const canvas = this.$refs.chartCanvas;
            if (!canvas) return c + '0.2)';
            const ctx = canvas.getContext('2d');
            const h = canvas.offsetHeight || 360;
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, c + a1 + ')');
            g.addColorStop(1, c + a2 + ')');
            return g;
        },

        gradSpotify(colorKey, a1 = '0.32', a2 = '0.02') {
            const c = this.palette()[colorKey];
            const canvas = this.$refs.spotifyChartCanvas;
            if (!canvas) return c + '0.2)';
            const ctx = canvas.getContext('2d');
            const h = canvas.offsetHeight || 360;
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, c + a1 + ')');
            g.addColorStop(1, c + a2 + ')');
            return g;
        },

        style() {
            const dark = this.isDark();
            return {
                grid:         dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                text:         dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.48)',
                tooltipBg:    dark ? '#1a1d2e' : '#ffffff',
                tooltipBorder:dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                tooltipColor: dark ? '#e2e8f0' : '#1a202c',
            };
        },

        lds(label, data, colorKey, { fill = true, yAxisID = 'y', suffix = '' } = {}) {
            const c = this.palette()[colorKey];
            return {
                type: 'line',
                label,
                data,
                yAxisID,
                borderColor: c + '1)',
                pointBackgroundColor: c + '1)',
                pointBorderColor: 'transparent',
                pointRadius: 3.5,
                pointHoverRadius: 6,
                borderWidth: 2.5,
                tension: 0.42,
                fill: fill ? 'origin' : false,
                backgroundColor: fill ? this.grad(colorKey) : 'transparent',
                spanGaps: false,
                _suffix: suffix
            };
        },

        ldsSpotify(label, data, colorKey, { fill = true, yAxisID = 'y', suffix = '' } = {}) {
            const c = this.palette()[colorKey];
            return {
                type: 'line',
                label,
                data,
                yAxisID,
                borderColor: c + '1)',
                pointBackgroundColor: c + '1)',
                pointBorderColor: 'transparent',
                pointRadius: 3.5,
                pointHoverRadius: 6,
                borderWidth: 2.5,
                tension: 0.42,
                fill: fill ? 'origin' : false,
                backgroundColor: fill ? this.gradSpotify(colorKey) : 'transparent',
                spanGaps: false,
                _suffix: suffix
            };
        },

        bds(label, data, colorKey, { yAxisID = 'y', suffix = '' } = {}) {
            const c = this.palette()[colorKey];
            return {
                type: 'bar',
                label,
                data,
                yAxisID,
                backgroundColor: c + '0.55)',
                hoverBackgroundColor: c + '0.8)',
                borderRadius: 5,
                spanGaps: false,
                _suffix: suffix
            };
        },

        scale({ pos = 'left', title = '', grid = true, fmt = null } = {}) {
            const s = this.style();
            return {
                position: pos,
                grid: { color: grid ? s.grid : 'transparent', drawBorder: false },
                border: { display: false },
                ticks: {
                    color: s.text,
                    maxTicksLimit: 7,
                    padding: 6,
                    ...(fmt ? { callback: fmt } : {})
                },
                title: {
                    display: !!title,
                    text: title,
                    color: s.text,
                    font: { size: 11 }
                }
            };
        },

        getViewConfig(viewId) {
            const d = this.d;
            const kFmt = v => v == null ? '' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : v;
            const decFmt = v => v == null ? '' : typeof v === 'number' ? v.toFixed(1) : v;

            const configs = {
                reach: {
                    datasets: [
                        this.lds('Impressions', d.impressions, 'blue',   { fill: true,  yAxisID: 'y' }),
                        this.bds('Tweets',      d.tweets,      'orange', { yAxisID: 'y2' })
                    ],
                    scales: {
                        x:  this.scale(),
                        y:  this.scale({ pos: 'left',  title: 'Impressions', fmt: kFmt }),
                        y2: this.scale({ pos: 'right', title: 'Tweets', grid: false })
                    }
                },

                engagement: {
                    datasets: [
                        this.lds('Likes',            d.likes,           'red',    { fill: true,  yAxisID: 'y' }),
                        this.lds('Media Engagement', d.mediaEngagement, 'purple', { fill: false, yAxisID: 'y' }),
                        this.bds('Replies',          d.replies,         'orange', { yAxisID: 'y2' }),
                        this.bds('Retweets',         d.retweets,        'teal',   { yAxisID: 'y2' })
                    ],
                    scales: {
                        x:  this.scale(),
                        y:  this.scale({ pos: 'left',  title: 'Likes & Media Eng.', fmt: kFmt }),
                        y2: this.scale({ pos: 'right', title: 'Replies & Retweets', grid: false })
                    }
                },

                interactions: {
                    datasets: [
                        this.bds('Profile Clicks', d.profileClicks, 'blue',  { yAxisID: 'y' }),
                        this.bds('Detail Expands', d.detailExpands, 'teal',  { yAxisID: 'y' }),
                        this.lds('URL Clicks',     d.urlClicks,     'green', { fill: false, yAxisID: 'y2' }),
                        this.lds('Hashtag Clicks', d.hashtagClicks, 'orange',{ fill: false, yAxisID: 'y2' })
                    ],
                    scales: {
                        x:  this.scale(),
                        y:  this.scale({ pos: 'left',  title: 'Clicks & Expands', fmt: kFmt }),
                        y2: this.scale({ pos: 'right', title: 'URL & Hashtag Clicks', grid: false })
                    }
                },

                averages: {
                    datasets: [
                        this.lds('Avg Likes / Day',   d.avgLikesDay,    'red',    { fill: true,  yAxisID: 'y' }),
                        this.bds('Avg Tweets / Day',  d.avgTweetsDay,   'blue',   { yAxisID: 'y2' }),
                        this.lds('Avg Likes / Tweet', d.avgLikesTweet,  'green',  { fill: false, yAxisID: 'y2' }),
                        this.lds('Engagement Rate',   d.engagementRate, 'orange', { fill: false, yAxisID: 'y2', suffix: '%' })
                    ],
                    scales: {
                        x:  this.scale(),
                        y:  this.scale({ pos: 'left',  title: 'Avg Likes / Day', fmt: decFmt }),
                        y2: this.scale({ pos: 'right', title: 'Tweets · Likes/Tweet · Rate %', grid: false })
                    }
                }
            };

            return configs[viewId] || configs.reach;
        },

        getSpotifyViewConfig(viewId) {
            const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            // Pairs: [bar color for minutes, line color for streams]
            const YEAR_COLOR_PAIRS = [
                ['green',  'blue'],
                ['blue',   'purple'],
                ['purple', 'orange'],
                ['orange', 'teal'],
                ['teal',   'red'],
                ['red',    'green'],
            ];
            const kFmt  = v => v == null ? '' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v);

            const yearData = this.spotifyRawData?.Year || {};
            const years    = Object.keys(yearData).sort();

            if (viewId === 'all') {
                const labels       = [];
                const minutesData  = [];
                const streamsData  = [];
                years.forEach(year => {
                    MONTHS_SHORT.forEach((short, i) => {
                        const monthObj = yearData[year]?.[MONTHS_FULL[i]];
                        labels.push(`${short} '${year.slice(2)}`);
                        minutesData.push(monthObj?.minutes ?? null);
                        streamsData.push(monthObj?.streams ?? null);
                    });
                });
                return {
                    labels,
                    datasets: [
                        this.ldsSpotify('Minutes', minutesData, 'green', { fill: true,  yAxisID: 'y',  suffix: ' min' }),
                        this.bds(       'Streams', streamsData, 'blue',  { yAxisID: 'y2', suffix: '' })
                    ],
                    scales: {
                        x:  this.scale(),
                        y:  this.scale({ pos: 'left',  title: 'Listening Minutes', fmt: kFmt }),
                        y2: this.scale({ pos: 'right', title: 'Streams', grid: false, fmt: kFmt })
                    }
                };
            }

            // Per-year view
            const colorPairIdx = years.indexOf(viewId) % YEAR_COLOR_PAIRS.length;
            const [minColor, strColor] = YEAR_COLOR_PAIRS[colorPairIdx];
            const minutesData = MONTHS_FULL.map(m => yearData[viewId]?.[m]?.minutes ?? null);
            const streamsData = MONTHS_FULL.map(m => yearData[viewId]?.[m]?.streams ?? null);

            return {
                labels: MONTHS_SHORT,
                datasets: [
                    this.bds(        'Minutes', minutesData, minColor, { yAxisID: 'y',  suffix: ' min' }),
                    this.ldsSpotify( 'Streams', streamsData, strColor, { fill: false, yAxisID: 'y2', suffix: '' })
                ],
                scales: {
                    x:  this.scale(),
                    y:  this.scale({ pos: 'left',  title: 'Listening Minutes', fmt: kFmt }),
                    y2: this.scale({ pos: 'right', title: 'Streams', grid: false, fmt: kFmt })
                }
            };
        },

        getPlatformViewConfig(viewId) {
            const platforms = this.platformRawData?.platforms || {};
            const entries   = Object.entries(platforms); // already sorted by count desc
            const limit     = viewId === 'top25' ? 25 : 10;
            const slice     = entries.slice(0, limit);

            const s    = this.style();
            const c    = this.palette().green;
            const kFmt = v => v == null ? '' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v);

            const labels     = slice.map(([k]) => k.length > 35 ? k.slice(0, 33) + '…' : k);
            const fullLabels = slice.map(([k]) => k);
            const data       = slice.map(([, v]) => v);

            return {
                labels,
                fullLabels,
                datasets: [{
                    label: 'Streams',
                    data,
                    backgroundColor: c + '0.6)',
                    hoverBackgroundColor: c + '0.85)',
                    borderRadius: 4,
                }],
                scales: {
                    x: {
                        position: 'bottom',
                        grid: { color: s.grid, drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6, callback: kFmt }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'transparent', drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6 }
                    }
                }
            };
        },

        getReasonViewConfig() {
            const reasons = this.reasonRawData?.reason_end || {};
            const LABEL_MAP = {
                'trackdone':                    'Track Done',
                'endplay':                      'End Play',
                'fwdbtn':                       'Skip →',
                'logout':                       'Logout',
                'remote':                       'Remote',
                'backbtn':                      '← Back',
                'unexpected-exit-while-paused': 'Exit (Paused)',
                'unexpected-exit':              'Unexpected Exit',
                'unknown':                      'Unknown',
                'trackerror':                   'Track Error',
                'switched-to-audio':            '→ Audio',
                'switched-to-video':            '→ Video',
                'null':                         'No Reason',
            };
            const COLORS = [
                'rgba(16,185,129,',   // green
                'rgba(59,130,246,',   // blue
                'rgba(251,146,60,',   // orange
                'rgba(248,87,104,',   // red
                'rgba(149,97,255,',   // purple
                'rgba(34,211,199,',   // teal
                'rgba(16,185,129,',
                'rgba(59,130,246,',
                'rgba(251,146,60,',
                'rgba(248,87,104,',
                'rgba(149,97,255,',
                'rgba(34,211,199,',
            ];

            const s       = this.style();
            const entries = Object.entries(reasons);
            const labels  = entries.map(([k]) => LABEL_MAP[k] || k);
            const data    = entries.map(([, v]) => v);
            const bgColors    = entries.map((_, i) => COLORS[i % COLORS.length] + '0.6)');
            const hoverColors = entries.map((_, i) => COLORS[i % COLORS.length] + '0.85)');
            const kFmt = v => v == null ? '' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v);

            return {
                labels,
                datasets: [{
                    label: 'Streams',
                    data,
                    backgroundColor: bgColors,
                    hoverBackgroundColor: hoverColors,
                    borderRadius: 5,
                }],
                scales: {
                    x: {
                        grid: { color: 'transparent', drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6 }
                    },
                    y: {
                        grid: { color: s.grid, drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6, maxTicksLimit: 6, callback: kFmt }
                    }
                }
            };
        },

        buildChart(viewId) {
            if (typeof Chart === 'undefined') {
                setTimeout(() => this.buildChart(viewId), 200);
                return;
            }

            if (this.chart) { this.chart.destroy(); this.chart = null; }

            const canvas = this.$refs.chartCanvas;
            if (!canvas) return;

            const s = this.style();
            const cfg = this.getViewConfig(viewId);

            this.chart = new Chart(canvas, {
                type: 'bar',
                data: { labels: this.d.months, datasets: cfg.datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'start',
                            labels: {
                                color: s.text,
                                padding: 18,
                                boxWidth: 12,
                                boxHeight: 12,
                                borderRadius: 3,
                                useBorderRadius: true,
                                font: { size: 12, weight: '500' }
                            }
                        },
                        tooltip: {
                            backgroundColor: s.tooltipBg,
                            titleColor: s.tooltipColor,
                            bodyColor: s.tooltipColor,
                            borderColor: s.tooltipBorder,
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                label: (ctx) => {
                                    if (ctx.raw == null) return null;
                                    const suf = ctx.dataset._suffix || '';
                                    const raw = ctx.raw;
                                    const fmt = typeof raw === 'number' && raw % 1 !== 0
                                        ? raw.toLocaleString(undefined, { maximumFractionDigits: 1 })
                                        : raw.toLocaleString();
                                    return `  ${ctx.dataset.label}: ${fmt}${suf}`;
                                }
                            }
                        }
                    },
                    scales: cfg.scales
                }
            });
        },

        buildSpotifyChart(viewId) {
            if (typeof Chart === 'undefined') {
                setTimeout(() => this.buildSpotifyChart(viewId), 200);
                return;
            }

            if (this.spotifyChart) { this.spotifyChart.destroy(); this.spotifyChart = null; }

            const canvas = this.$refs.spotifyChartCanvas;
            if (!canvas) return;

            const s   = this.style();
            const cfg = this.getSpotifyViewConfig(viewId);

            this.spotifyChart = new Chart(canvas, {
                type: 'bar',
                data: { labels: cfg.labels, datasets: cfg.datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'start',
                            labels: {
                                color: s.text,
                                padding: 18,
                                boxWidth: 12,
                                boxHeight: 12,
                                borderRadius: 3,
                                useBorderRadius: true,
                                font: { size: 12, weight: '500' }
                            }
                        },
                        tooltip: {
                            backgroundColor: s.tooltipBg,
                            titleColor: s.tooltipColor,
                            bodyColor: s.tooltipColor,
                            borderColor: s.tooltipBorder,
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                label: (ctx) => {
                                    if (ctx.raw == null) return null;
                                    const suf = ctx.dataset._suffix || '';
                                    return `  ${ctx.dataset.label}: ${ctx.raw.toLocaleString()}${suf}`;
                                }
                            }
                        }
                    },
                    scales: cfg.scales
                }
            });
        },

        buildPlatformChart(viewId) {
            if (typeof Chart === 'undefined') {
                setTimeout(() => this.buildPlatformChart(viewId), 200);
                return;
            }

            if (this.platformChart) { this.platformChart.destroy(); this.platformChart = null; }

            const canvas = this.$refs.platformChartCanvas;
            if (!canvas) return;

            const s   = this.style();
            const cfg = this.getPlatformViewConfig(viewId);

            this.platformChart = new Chart(canvas, {
                type: 'bar',
                data: { labels: cfg.labels, datasets: cfg.datasets },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: s.tooltipBg,
                            titleColor: s.tooltipColor,
                            bodyColor: s.tooltipColor,
                            borderColor: s.tooltipBorder,
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                title: (items) => cfg.fullLabels[items[0].dataIndex],
                                label: (ctx) => `  Streams: ${ctx.raw.toLocaleString()}`
                            }
                        }
                    },
                    scales: cfg.scales
                }
            });
        },

        buildReasonChart() {
            if (typeof Chart === 'undefined') {
                setTimeout(() => this.buildReasonChart(), 200);
                return;
            }

            if (this.reasonChart) { this.reasonChart.destroy(); this.reasonChart = null; }

            const canvas = this.$refs.reasonChartCanvas;
            if (!canvas) return;

            const s   = this.style();
            const cfg = this.getReasonViewConfig();

            this.reasonChart = new Chart(canvas, {
                type: 'bar',
                data: { labels: cfg.labels, datasets: cfg.datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: s.tooltipBg,
                            titleColor: s.tooltipColor,
                            bodyColor: s.tooltipColor,
                            borderColor: s.tooltipBorder,
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                label: (ctx) => `  Streams: ${ctx.raw.toLocaleString()}`
                            }
                        }
                    },
                    scales: cfg.scales
                }
            });
        },

        async onViewChange(viewId) {
            const token = (this._twitterToken = (this._twitterToken || 0) + 1);
            const wrapper = this.$refs.chartWrapper;
            if (wrapper) {
                wrapper.classList.add('analytics-chart-fade-out');
                await new Promise(r => setTimeout(r, 170));
            }
            if (token !== this._twitterToken) return;
            this.buildChart(viewId);
            await this.$nextTick();
            if (token === this._twitterToken && wrapper) {
                wrapper.classList.remove('analytics-chart-fade-out');
            }
        },

        async onSpotifyViewChange(viewId) {
            const token = (this._spotifyToken = (this._spotifyToken || 0) + 1);
            const wrapper = this.$refs.spotifyChartWrapper;
            if (wrapper) {
                wrapper.classList.add('analytics-chart-fade-out');
                await new Promise(r => setTimeout(r, 170));
            }
            if (token !== this._spotifyToken) return;
            this.buildSpotifyChart(viewId);
            await this.$nextTick();
            if (token === this._spotifyToken && wrapper) {
                wrapper.classList.remove('analytics-chart-fade-out');
            }
        },

        async onPlatformViewChange(viewId) {
            const token = (this._platformToken = (this._platformToken || 0) + 1);
            const wrapper = this.$refs.platformChartWrapper;
            if (wrapper) {
                wrapper.classList.add('analytics-chart-fade-out');
                await new Promise(r => setTimeout(r, 170));
            }
            if (token !== this._platformToken) return;
            this.buildPlatformChart(viewId);
            await this.$nextTick();
            if (token === this._platformToken && wrapper) {
                wrapper.classList.remove('analytics-chart-fade-out');
            }
        },

        // ── Listening Clock ──────────────────────────────────────────

        getClockViewConfig(viewId) {
            const s      = this.style();
            const kFmt   = v => v == null ? '' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v);
            const isHour = viewId.startsWith('hour');
            const isMin  = viewId.endsWith('minutes');
            const arr    = isHour ? (this.clockRawData?.by_hour || []) : (this.clockRawData?.by_weekday || []);
            const labels = arr.map(e => e.label);
            const data   = arr.map(e => isMin ? e.minutes : e.streams);
            const metric = isMin ? 'Minutes' : 'Streams';
            const c      = this.palette()[isHour ? 'purple' : 'teal'];

            return {
                labels,
                datasets: [{
                    label: metric,
                    data,
                    backgroundColor: c + '0.6)',
                    hoverBackgroundColor: c + '0.85)',
                    borderRadius: 5,
                    _suffix: isMin ? ' min' : '',
                }],
                scales: {
                    x: {
                        grid: { color: 'transparent', drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6 }
                    },
                    y: {
                        grid: { color: s.grid, drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6, maxTicksLimit: 6, callback: kFmt }
                    }
                }
            };
        },

        buildClockChart(viewId) {
            if (typeof Chart === 'undefined') { setTimeout(() => this.buildClockChart(viewId), 200); return; }
            if (this.clockChart) { this.clockChart.destroy(); this.clockChart = null; }
            const canvas = this.$refs.clockChartCanvas;
            if (!canvas) return;
            const s   = this.style();
            const cfg = this.getClockViewConfig(viewId);
            this.clockChart = new Chart(canvas, {
                type: 'bar',
                data: { labels: cfg.labels, datasets: cfg.datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: s.tooltipBg,
                            titleColor: s.tooltipColor,
                            bodyColor: s.tooltipColor,
                            borderColor: s.tooltipBorder,
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                label: (ctx) => {
                                    const suf = ctx.dataset._suffix || '';
                                    return `  ${ctx.dataset.label}: ${ctx.raw.toLocaleString()}${suf}`;
                                }
                            }
                        }
                    },
                    scales: cfg.scales
                }
            });
        },

        async onClockViewChange(viewId) {
            const token = (this._clockToken = (this._clockToken || 0) + 1);
            const wrapper = this.$refs.clockChartWrapper;
            if (wrapper) {
                wrapper.classList.add('analytics-chart-fade-out');
                await new Promise(r => setTimeout(r, 170));
            }
            if (token !== this._clockToken) return;
            this.buildClockChart(viewId);
            await this.$nextTick();
            if (token === this._clockToken && wrapper) wrapper.classList.remove('analytics-chart-fade-out');
        },

        // ── Top Artists & Tracks ─────────────────────────────────────

        getTopViewConfig(viewId) {
            const s    = this.style();
            const kFmt = v => v == null ? '' : v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v);
            const TOP  = 25;

            const isArtist = viewId.startsWith('artists');
            const isMin    = viewId.endsWith('minutes');
            const key      = isArtist
                ? (isMin ? 'artists_by_minutes' : 'artists_by_streams')
                : (isMin ? 'tracks_by_minutes'  : 'tracks_by_streams');

            const raw    = (this.topRawData?.[key] || []).slice(0, TOP);
            const labels = raw.map(e => {
                const n = isArtist ? e.name : `${e.name} – ${e.artist}`;
                return n.length > 40 ? n.slice(0, 38) + '…' : n;
            });
            const fullLabels = raw.map(e =>
                isArtist ? e.name : `${e.name} — ${e.artist}`
            );
            const data   = raw.map(e => isMin ? e.minutes : e.streams);
            const metric = isMin ? 'Minutes' : 'Streams';
            const c      = this.palette()[isArtist ? 'blue' : 'orange'];

            return {
                labels,
                fullLabels,
                datasets: [{
                    label: metric,
                    data,
                    backgroundColor: c + '0.6)',
                    hoverBackgroundColor: c + '0.85)',
                    borderRadius: 4,
                }],
                scales: {
                    x: {
                        position: 'bottom',
                        grid: { color: s.grid, drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6, callback: kFmt }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'transparent', drawBorder: false },
                        border: { display: false },
                        ticks: { color: s.text, padding: 6 }
                    }
                }
            };
        },

        buildTopChart(viewId) {
            if (typeof Chart === 'undefined') { setTimeout(() => this.buildTopChart(viewId), 200); return; }
            if (this.topChart) { this.topChart.destroy(); this.topChart = null; }
            const canvas = this.$refs.topChartCanvas;
            if (!canvas) return;
            const s   = this.style();
            const cfg = this.getTopViewConfig(viewId);
            this.topChart = new Chart(canvas, {
                type: 'bar',
                data: { labels: cfg.labels, datasets: cfg.datasets },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: s.tooltipBg,
                            titleColor: s.tooltipColor,
                            bodyColor: s.tooltipColor,
                            borderColor: s.tooltipBorder,
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                title: (items) => cfg.fullLabels[items[0].dataIndex],
                                label: (ctx) => `  ${ctx.dataset.label}: ${ctx.raw.toLocaleString()}`
                            }
                        }
                    },
                    scales: cfg.scales
                }
            });
        },

        async onTopViewChange(viewId) {
            const token = (this._topToken = (this._topToken || 0) + 1);
            const wrapper = this.$refs.topChartWrapper;
            if (wrapper) {
                wrapper.classList.add('analytics-chart-fade-out');
                await new Promise(r => setTimeout(r, 170));
            }
            if (token !== this._topToken) return;
            this.buildTopChart(viewId);
            await this.$nextTick();
            if (token === this._topToken && wrapper) wrapper.classList.remove('analytics-chart-fade-out');
        }
    }
};
