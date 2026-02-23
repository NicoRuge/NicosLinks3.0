const QrView = {
    methods: {
        async copyToClipboard(value) {
            try {
                await navigator.clipboard.writeText(value);
            } catch (_) {
                // No-op fallback for browsers that block clipboard access.
            }
        }
    },
    template: `
        <div class="container-fluid qr-page py-4 py-md-5">
            <div class="row justify-content-center">
                <div class="col-12 col-md-10 col-lg-7 col-xl-6">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 qr-hero-card">
                        <p class="qr-kicker mb-2">Contact</p>
                        <h1 class="hero-title mb-2">Nico Ruge</h1>
                        <p class="hero-subtitle mb-4">Photographer & Data Analyst based in Germany.</p>

                        <div class="vstack gap-2">
                            <a class="btn btn-light text-dark d-flex align-items-center justify-content-between qr-contact-btn" href="mailto:mail@nico-ruge.de">
                                <span><i class="bi bi-envelope-fill me-2"></i>mail@nico-ruge.de</span>
                                <i class="bi bi-arrow-right"></i>
                            </a>
                            <a class="btn btn-outline-light d-flex align-items-center justify-content-between qr-contact-btn" href="https://www.linkedin.com/in/nico-ruge/" target="_blank" rel="noopener noreferrer">
                                <span><i class="bi bi-linkedin me-2"></i>LinkedIn</span>
                                <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                            <a class="btn btn-outline-light d-flex align-items-center justify-content-between qr-contact-btn" href="https://bsky.app/profile/nico-ruge.de" target="_blank" rel="noopener noreferrer">
                                <span><i class="bi bi-cloud me-2"></i>Bluesky</span>
                                <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                            <a class="btn btn-outline-light d-flex align-items-center justify-content-between qr-contact-btn" href="https://nico-ruge.de" target="_blank" rel="noopener noreferrer">
                                <span><i class="bi bi-globe2 me-2"></i>nico-ruge.de</span>
                                <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                        </div>

                        <div class="d-flex justify-content-center mt-4">
                            <button class="btn btn-sm btn-outline-light" type="button" @click="copyToClipboard('https://nico-ruge.de/#qr')">
                                <i class="bi bi-copy me-1"></i>Copy QR Link
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `
};
