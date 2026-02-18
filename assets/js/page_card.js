const CardView = {
    data() {
        return {
            copiedField: ''
        };
    },
    methods: {
        async copyToClipboard(value, field) {
            try {
                await navigator.clipboard.writeText(value);
                this.copiedField = field;
                setTimeout(() => {
                    if (this.copiedField === field) this.copiedField = '';
                }, 1800);
            } catch (_) {
                this.copiedField = '';
            }
        }
    },
    template: `
        <div class="container-fluid py-4 card-page">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <h1 class="hero-title mb-2">Business Card</h1>
                        <p class="hero-subtitle mb-0">A compact way to save contact details and connect quickly.</p>
                    </section>

                    <article class="business-card card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="business-card-ribbon"></div>
                        <div class="card-body p-4 p-lg-5">
                            <div class="row g-4 align-items-center">
                                <div class="col-12 col-md-4 col-lg-3 text-center text-md-start">
                                    <img
                                        src="assets/images/profile.jpg"
                                        alt="Nico Ruge"
                                        class="img-fluid rounded-4 shadow business-card-avatar"
                                    >
                                </div>
                                <div class="col-12 col-md-8 col-lg-9">
                                    <h2 class="h2 mb-1">Nico Ruge</h2>
                                    <p class="mb-2 text-secondary">Hobby Photographer · Data Analyst</p>
                                    <p class="mb-3 business-card-location">
                                        <i class="bi bi-geo-alt-fill me-2"></i>Germany
                                    </p>

                                    <div class="d-flex flex-wrap gap-2 mb-4">
                                        <button class="btn btn-sm btn-outline-secondary" type="button" @click="copyToClipboard('mail@nico-ruge.de', 'email')">
                                            <i class="bi bi-copy me-1"></i>
                                            {{ copiedField === 'email' ? 'Copied Email' : 'Copy Email' }}
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary" type="button" @click="copyToClipboard('https://nico-ruge.de/#card', 'url')">
                                            <i class="bi bi-copy me-1"></i>
                                            {{ copiedField === 'url' ? 'Copied URL' : 'Copy Card URL' }}
                                        </button>
                                    </div>

                                    <div class="d-flex flex-wrap gap-2">
                                        <a href="mailto:mail@nico-ruge.de" class="btn btn-primary">
                                            <i class="bi bi-envelope-fill me-1"></i>Email
                                        </a>
                                        <a href="https://www.linkedin.com/in/nico-ruge/" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary">
                                            <i class="bi bi-linkedin me-1"></i>LinkedIn
                                        </a>
                                        <a href="https://bsky.app/profile/nico-ruge.de" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary">
                                            <i class="bi bi-cloud me-1"></i>Bluesky
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    `
};
