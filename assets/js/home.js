const HomeView = {
    template: `
        <!-- Hero Section -->
        <div class="container-fluid px-4 py-5">
            <div class="row align-items-center g-3 py-5 text-center text-lg-start">
                <div class="col-lg-2">
                    <img src="assets/images/profile.jpg" class="d-block mx-auto img-fluid rounded-4 shadow-lg"
                        alt="Hero Image" style="max-height: 300px; object-fit: cover;"
                        onerror="this.src='https://via.placeholder.com/600x400/dee2e6/6c757d?text=Your+Image+Here'">
                </div>
                <div class="col-lg-8">
                    <h1 class="display-4 fw-bold lh-1 mb-3">Hi, I'm Nico</h1>
                    <p class="lead text-secondary">
                        Hobby Photographer & Data Analyst based in Germany.
                        Welcome to my page where you can find my work,
                        projects, and other stuff I'm interested in.
                    </p>
                    <div class="d-grid gap-2 d-md-flex justify-content-center justify-content-lg-start mt-4">
                        <a href="https://pics.nico-ruge.de" class="btn btn-primary btn-lg px-4" target="_blank"
                            rel="noopener noreferrer" onclick="parent.location.hash='photography'">
                            My Photography Portfolio
                        </a>
                        <a href="https://unsplash.com/@nico_ruge" class="btn btn-outline-secondary btn-lg px-4" target="_blank"
                            rel="noopener noreferrer" onclick="parent.location.hash='github'">
                            My Images on Unsplash.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-fluid px-4">
            <hr class="my-5 border-secondary-subtle">
            <div class="row row-cols-1 row-cols-lg-2 g-4 pb-5 justify-content-center justify-content-lg-start">
                <div class="col" style="max-width: fit-content;">
                    <div id="spotify-widget" class="h-100"></div>
                </div>
                <div class="col" style="max-width: fit-content;">
                    <div id="discord-widget" class="h-100"></div>
                </div>
            </div>
        </div>
    `
};
