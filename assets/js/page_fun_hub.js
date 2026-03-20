const FunHubView = {
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <div>
                            <h1 class="hero-title mb-2">Projects & Fun</h1>
                            <p class="mb-0 hero-subtitle">Side projects, experiments, and things I built for fun.</p>
                        </div>
                    </section>

                    <div class="row g-3">
                        <div v-for="item in items" :key="item.id" class="col-12 col-md-6 col-xl-4">
                            <div class="ext-project-card card border-0 shadow-sm h-100"
                                style="cursor: pointer;"
                                @click="item.external ? openExternal(item.url) : navigate(item.id)">
                                <div class="card-body d-flex flex-column gap-3 p-4">
                                    <div class="d-flex align-items-start gap-3">
                                        <div class="ext-project-icon-wrap flex-shrink-0" :style="{ background: item.color }">
                                            <i :class="'bi ' + item.icon + ' ext-project-icon'"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <h2 class="h6 fw-bold mb-1 text-body">{{ item.name }}</h2>
                                        </div>
                                        <i :class="'bi ms-auto ext-project-arrow text-body-tertiary ' + (item.external ? 'bi-box-arrow-up-right' : 'bi-arrow-right')"></i>
                                    </div>
                                    <p class="mb-0 small text-body-secondary ext-project-desc">{{ item.description }}</p>
                                    <div v-if="item.tags && item.tags.length" class="d-flex flex-wrap gap-1 mt-auto">
                                        <span v-for="tag in item.tags" :key="tag" class="badge rounded-pill ext-project-tag">{{ tag }}</span>
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
            items: [
                {
                    id: 'clicker',
                    name: 'Code Clicker',
                    description: 'Build your software empire one line at a time. An idle clicker game.',
                    icon: 'bi-joystick',
                    color: 'rgba(249, 115, 22, 0.12)',
                    tags: ['Game', 'Idle'],
                    external: false
                },
                {
                    id: 'external-projects',
                    name: 'External Projects',
                    description: 'Projects and tools I\'ve built, hosted elsewhere on the web.',
                    icon: 'bi-git',
                    color: 'rgba(16, 185, 129, 0.12)',
                    tags: ['Open Source'],
                    external: false
                }
            ]
        }
    },
    methods: {
        navigate(id) {
            window.location.hash = id
        },
        openExternal(url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }
};
