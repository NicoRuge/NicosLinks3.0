const HomeView = {
    template: `
        <div class="home-page">
            <div class="home-masonry-bg" aria-hidden="true">
                <div class="home-masonry-grid">
                    <div
                        v-for="(column, columnIndex) in backgroundColumns"
                        :key="'bg-col-' + columnIndex"
                        class="home-masonry-col"
                        :class="{ 'is-reverse': columnIndex % 2 === 1 }"
                        :style="{ '--masonry-duration': (64 + (columnIndex * 10)) + 's' }"
                    >
                        <div class="home-masonry-track">
                            <div
                                v-for="(tile, tileIndex) in column"
                                :key="'bg-tile-' + columnIndex + '-' + tileIndex + '-' + tile.internalId"
                                class="home-masonry-tile"
                                :class="'is-shape-' + ((tileIndex % 5) + 1)"
                            >
                                <img
                                    :src="getUnsplashBackgroundUrl(tile.internalId)"
                                    :alt="'Unsplash background image ' + (tileIndex + 1)"
                                    loading="lazy"
                                    decoding="async"
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div class="home-masonry-veil"></div>
            </div>

            <div class="container-fluid py-4 home-content-layer">
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
        </div>
    `,
    data() {
        return {
            backgroundInternalIds: [
                '1709192525551-2147fccfaf12',
                '1768213021718-9f738eabb363',
                '1752312304247-b920759fc551',
                '1723816254296-6b8bf36e1cc9',
                '1708753662011-7db4eed9d054',
                '1768160308364-2ecc0d70f364',
                '1680681590567-ff13632428e7',
                '1672430455100-c4d2b27612a3',
                '1652546129961-bba64fc0920f',
                '1768165085210-6832ccd35ff0',
                '1672855415934-d9bb7f4d8b19',
                '1704662370387-b9328e6a7089',
                '1752312303988-f2663ed2dbfa',
                '1752312304011-5c34edeb20cb',
                '1653211072239-aa054221e1ec'
            ]
        }
    },
    computed: {
        backgroundColumns() {
            const columnCount = 4
            const columns = Array.from({ length: columnCount }, () => [])

            this.backgroundInternalIds.forEach((internalId, index) => {
                columns[index % columnCount].push({ internalId })
            })

            return columns.map((column) => column.concat(column))
        }
    },
    methods: {
        getUnsplashBackgroundUrl(internalId) {
            if (!internalId) return ''
            return `https://images.unsplash.com/photo-${internalId}?q=80&w=1080&auto=format&fit=crop`
        }
    }
};
