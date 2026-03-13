const ExternalProjectsView = {
    template: `
        <div class="container-fluid py-4 external-projects-page">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <div>
                            <h1 class="hero-title mb-2">External Projects</h1>
                            <p class="mb-0 hero-subtitle">Projects and tools I've built, hosted elsewhere on the web.</p>
                        </div>
                    </section>

                    <div class="row g-3">
                        <div v-for="project in projects" :key="project.id" class="col-12 col-md-6 col-xl-4">
                            <a :href="project.url" target="_blank" rel="noopener noreferrer"
                                class="ext-project-card card border-0 shadow-sm h-100 text-decoration-none">
                                <div class="card-body d-flex flex-column gap-3 p-4">
                                    <div class="d-flex align-items-start gap-3">
                                        <div class="ext-project-icon-wrap flex-shrink-0" :style="{ background: project.color }">
                                            <i :class="'bi ' + project.icon + ' ext-project-icon'"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <h2 class="h6 fw-bold mb-1 text-body">{{ project.name }}</h2>
                                            <span class="ext-project-host small text-body-secondary">{{ project.host }}</span>
                                        </div>
                                        <i class="bi bi-box-arrow-up-right ms-auto ext-project-arrow text-body-tertiary"></i>
                                    </div>

                                    <p class="mb-0 small text-body-secondary ext-project-desc">{{ project.description }}</p>

                                    <div v-if="project.tags && project.tags.length" class="d-flex flex-wrap gap-1 mt-auto">
                                        <span v-for="tag in project.tags" :key="tag" class="badge rounded-pill ext-project-tag">
                                            {{ tag }}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            projects: [
                {
                    id: 'fwatch',
                    name: 'fWatch',
                    host: 'fWatch.nico-ruge.de',
                    url: 'https://fWatch.nico-ruge.de',
                    description: 'Real-time display of the European power grid frequency. Monitor how well electricity supply and demand are balanced across the grid.',
                    icon: 'bi-activity',
                    color: 'rgba(16, 185, 129, 0.15)',
                    tags: ['Energy', 'Real-time', 'Grid']
                }
            ]
        }
    }
};
