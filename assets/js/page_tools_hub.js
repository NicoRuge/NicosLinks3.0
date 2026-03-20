const ToolsHubView = {
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <div>
                            <h1 class="hero-title mb-2">Tools</h1>
                            <p class="mb-0 hero-subtitle">A collection of small tools and data visualisations.</p>
                        </div>
                    </section>

                    <div class="row g-3">
                        <div v-for="tool in tools" :key="tool.id" class="col-12 col-md-6 col-xl-4">
                            <div class="ext-project-card card border-0 shadow-sm h-100" @click="navigate(tool.id)" style="cursor: pointer;">
                                <div class="card-body d-flex flex-column gap-3 p-4">
                                    <div class="d-flex align-items-start gap-3">
                                        <div class="ext-project-icon-wrap flex-shrink-0" :style="{ background: tool.color }">
                                            <i :class="'bi ' + tool.icon + ' ext-project-icon'"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <h2 class="h6 fw-bold mb-1 text-body">{{ tool.name }}</h2>
                                        </div>
                                        <i class="bi bi-arrow-right ms-auto ext-project-arrow text-body-tertiary"></i>
                                    </div>
                                    <p class="mb-0 small text-body-secondary ext-project-desc">{{ tool.description }}</p>
                                    <div v-if="tool.tags && tool.tags.length" class="d-flex flex-wrap gap-1 mt-auto">
                                        <span v-for="tag in tool.tags" :key="tag" class="badge rounded-pill ext-project-tag">{{ tag }}</span>
                                    </div>
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
            tools: [
                {
                    id: 'x-thread-viewer',
                    name: 'X Thread Viewer',
                    description: 'Render X (formerly Twitter) threads in a clean, readable format.',
                    icon: 'bi-chat-quote',
                    color: 'rgba(29, 155, 240, 0.12)',
                    tags: ['X / Twitter']
                },
                {
                    id: 'tweet-viewer',
                    name: 'Post Viewer',
                    description: 'Turn any X or Bluesky post into a shareable image card.',
                    icon: 'bi-card-image',
                    color: 'rgba(29, 155, 240, 0.12)',
                    tags: ['X / Twitter', 'Bluesky']
                },
                {
                    id: 'data-analytics',
                    name: 'Data Analytics',
                    description: 'Personal data visualisations and statistics projects.',
                    icon: 'bi-bar-chart-line',
                    color: 'rgba(99, 102, 241, 0.12)',
                    tags: ['Charts', 'Stats']
                },
                {
                    id: 'spotify-stats',
                    name: 'Spotify Stats',
                    description: 'Explore your Spotify listening history and top tracks.',
                    icon: 'bi-music-note-list',
                    color: 'rgba(30, 215, 96, 0.12)',
                    tags: ['Spotify', 'Music']
                }
            ]
        }
    },
    methods: {
        navigate(id) {
            window.location.hash = id
        }
    }
};
