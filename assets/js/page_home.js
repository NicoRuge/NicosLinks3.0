const HomeView = {
    template: `
        <div class="container-fluid py-4 home-page">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4 home-hero">
                        <div class="row g-4 align-items-center">
                            <div class="col-12 col-lg-3">
                                <img
                                    src="assets/images/profile.jpg"
                                    class="d-block mx-auto mx-lg-0 img-fluid rounded-4 shadow-lg profile-image home-hero-profile"
                                    alt="Profile image of Nico"
                                    onerror="this.src='https://via.placeholder.com/600x400/dee2e6/6c757d?text=Your+Image+Here'"
                                >
                            </div>
                            <div class="col-12 col-lg-9 text-center text-lg-start">
                                <h1 class="hero-title mb-3">Hi, I'm Nico</h1>
                                <p class="mb-0 hero-subtitle">
                                    Hobby Photographer & Data Analyst based in Germany.
                                    Welcome to my page where you can find my work,
                                    projects, and other stuff I'm interested in.
                                </p>
                                <div class="d-grid gap-2 d-sm-flex justify-content-sm-center justify-content-lg-start mt-4">
                                    <a href="#photography" class="btn btn-primary btn-lg px-4">
                                        Portfolio
                                    </a>
                                    <a href="https://unsplash.com/@nico_ruge" class="btn btn-outline-light btn-lg px-4" target="_blank"
                                        rel="noopener noreferrer">
                                        My Images on Unsplash.com
                                    </a>
                                </div>
                                <div class="social-icons-row justify-content-center justify-content-lg-start">
                                    <a href="https://bsky.app/profile/nico-ruge.de" class="social-icon-link" target="_blank" rel="noopener noreferrer" title="Bluesky">
                                        <div class="social-icon-box shadow">
                                            <img src="assets/icons/bluesky.svg" alt="Bluesky" class="social-icon-img">
                                        </div>
                                    </a>
                                    <a href="https://www.linkedin.com/in/nico-ruge/" class="social-icon-link" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                        <div class="social-icon-box shadow">
                                            <img src="assets/icons/linkedin.svg" alt="LinkedIn" class="social-icon-img">
                                        </div>
                                    </a>
                                    <a href="mailto:mail@nico-ruge.de" class="social-icon-link" title="Mail">
                                        <div class="social-icon-box shadow">
                                            <img src="assets/icons/mail.svg" alt="Mail" class="social-icon-img">
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `
};
