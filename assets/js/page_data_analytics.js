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
                </div>
            </div>
        </div>
    `,

    data() {
        return {
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
            }
        };
    },

    mounted() {
        this.$nextTick(() => this.buildChart(this.currentView));

        this._mo = new MutationObserver(() => {
            if (this.chart) this.buildChart(this.currentView);
        });
        this._mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-bs-theme']
        });
    },

    beforeUnmount() {
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        if (this._mo) this._mo.disconnect();
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
                    animation: {
                        duration: 650,
                        easing: 'easeInOutQuart'
                    },
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

        async onViewChange(viewId) {
            const wrapper = this.$refs.chartWrapper;
            if (wrapper) {
                wrapper.classList.add('analytics-chart-fade-out');
                await new Promise(r => setTimeout(r, 170));
            }
            this.buildChart(viewId);
            await this.$nextTick();
            if (wrapper) {
                wrapper.classList.remove('analytics-chart-fade-out');
            }
        }
    }
};
