const HomeView = {
    data() {
        return {
            weather: null,
            weatherLoading: false,
            weatherError: null,
            locationCity: null,
            weatherDenied: false,
            showPrivacyModal: false,
        };
    },
    methods: {
        openPrivacyModal() {
            this.showPrivacyModal = true;
        },
        cancelModal() {
            this.showPrivacyModal = false;
        },
        confirmAndFetch() {
            this.showPrivacyModal = false;
            this.fetchWeather();
        },
        fetchWeather() {
            if (!navigator.geolocation) {
                this.weatherError = 'noGeo';
                return;
            }
            this.weatherLoading = true;
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // All API calls go directly from the browser to public APIs.
                        // Coordinates are never forwarded to any own server.
                        const [weatherRes, geoRes] = await Promise.all([
                            fetch(
                                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
                                `&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m` +
                                `&wind_speed_unit=kmh&timezone=auto`
                            ),
                            fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            ),
                        ]);
                        const weatherData = await weatherRes.json();
                        const geoData = await geoRes.json();

                        this.weather = weatherData.current;
                        const addr = geoData.address || {};
                        this.locationCity =
                            addr.city || addr.town || addr.village || addr.county || null;
                    } catch {
                        this.weatherError = 'fetchFailed';
                    } finally {
                        this.weatherLoading = false;
                    }
                },
                () => {
                    this.weatherDenied = true;
                    this.weatherLoading = false;
                },
                { timeout: 8000 }
            );
        },
        getWeatherInfo(code) {
            const map = {
                0:  { label: 'Clear Sky',          icon: 'bi-sun' },
                1:  { label: 'Mainly Clear',        icon: 'bi-sun' },
                2:  { label: 'Partly Cloudy',       icon: 'bi-cloud-sun' },
                3:  { label: 'Overcast',            icon: 'bi-clouds' },
                45: { label: 'Foggy',               icon: 'bi-cloud-fog2' },
                48: { label: 'Foggy',               icon: 'bi-cloud-fog2' },
                51: { label: 'Light Drizzle',       icon: 'bi-cloud-drizzle' },
                53: { label: 'Drizzle',             icon: 'bi-cloud-drizzle' },
                55: { label: 'Heavy Drizzle',       icon: 'bi-cloud-drizzle' },
                61: { label: 'Light Rain',          icon: 'bi-cloud-rain' },
                63: { label: 'Rain',                icon: 'bi-cloud-rain' },
                65: { label: 'Heavy Rain',          icon: 'bi-cloud-rain-heavy' },
                71: { label: 'Light Snow',          icon: 'bi-cloud-snow' },
                73: { label: 'Snow',                icon: 'bi-cloud-snow' },
                75: { label: 'Heavy Snow',          icon: 'bi-cloud-snow' },
                77: { label: 'Snow Grains',         icon: 'bi-cloud-snow' },
                80: { label: 'Rain Showers',        icon: 'bi-cloud-rain' },
                81: { label: 'Rain Showers',        icon: 'bi-cloud-rain' },
                82: { label: 'Heavy Showers',       icon: 'bi-cloud-rain-heavy' },
                85: { label: 'Snow Showers',        icon: 'bi-cloud-snow' },
                86: { label: 'Heavy Snow Showers',  icon: 'bi-cloud-snow' },
                95: { label: 'Thunderstorm',        icon: 'bi-cloud-lightning-rain' },
                96: { label: 'Thunderstorm',        icon: 'bi-cloud-lightning-rain' },
                99: { label: 'Thunderstorm',        icon: 'bi-cloud-lightning-rain' },
            };
            return map[code] ?? { label: 'Unknown', icon: 'bi-cloud' };
        },
        retryWeather() {
            this.weather = null;
            this.weatherError = null;
            this.weatherDenied = false;
            this.locationCity = null;
            this.openPrivacyModal();
        },
    },
    template: `
        <div class="home-page">
            <div class="container-fluid py-4 home-content-layer">
                <div class="row justify-content-center">
                    <div class="col-12 hero-page-shell">

                        <!-- Hero Section -->
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
                                        Hobby Photographer &amp; Data Analyst based in Germany.
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

                        <!-- Weather Widget -->
                        <div class="weather-widget-wrap mb-4">

                            <!-- Idle: show button -->
                            <div v-if="!weatherLoading && !weather && !weatherError && !weatherDenied"
                                 class="weather-widget weather-widget--idle">
                                <i class="bi bi-cloud-sun weather-widget__icon"></i>
                                <span class="weather-widget__status-text">Want to see local weather?</span>
                                <button class="weather-widget__cta-btn" @click="openPrivacyModal">
                                    <i class="bi bi-geo-alt"></i> Show my weather
                                </button>
                            </div>

                            <!-- Loading -->
                            <div v-else-if="weatherLoading" class="weather-widget weather-widget--loading">
                                <i class="bi bi-cloud weather-widget__icon weather-widget__icon--pulse"></i>
                                <span class="weather-widget__status-text">Fetching local weather…</span>
                            </div>

                            <!-- Denied -->
                            <div v-else-if="weatherDenied" class="weather-widget weather-widget--muted">
                                <i class="bi bi-geo-alt-fill weather-widget__icon"></i>
                                <span class="weather-widget__status-text">Location access denied — weather unavailable.</span>
                            </div>

                            <!-- Error -->
                            <div v-else-if="weatherError" class="weather-widget weather-widget--muted">
                                <i class="bi bi-exclamation-circle weather-widget__icon"></i>
                                <span class="weather-widget__status-text">Could not load weather.</span>
                                <button class="weather-widget__retry-btn" @click="retryWeather">Retry</button>
                            </div>

                            <!-- Data -->
                            <div v-else-if="weather" class="weather-widget weather-widget--data">
                                <div class="weather-widget__main">
                                    <i :class="'bi ' + getWeatherInfo(weather.weathercode).icon + ' weather-widget__icon weather-widget__icon--large'"></i>
                                    <div class="weather-widget__temp">
                                        {{ Math.round(weather.temperature_2m) }}<span class="weather-widget__unit">°C</span>
                                    </div>
                                </div>
                                <div class="weather-widget__details">
                                    <div class="weather-widget__condition">{{ getWeatherInfo(weather.weathercode).label }}</div>
                                    <div v-if="locationCity" class="weather-widget__location">
                                        <i class="bi bi-geo-alt-fill"></i> {{ locationCity }}
                                    </div>
                                    <div class="weather-widget__meta">
                                        <span><i class="bi bi-droplet-half"></i> {{ weather.relative_humidity_2m }}%</span>
                                        <span><i class="bi bi-wind"></i> {{ Math.round(weather.windspeed_10m) }} km/h</span>
                                    </div>
                                </div>
                                <div class="weather-widget__privacy">
                                    <i class="bi bi-shield-lock-fill"></i>
                                    Your location is used locally only and never sent to any server.
                                </div>
                            </div>

                        </div>

                        <!-- Privacy Modal -->
                        <teleport to="body">
                            <transition name="ww-modal">
                                <div v-if="showPrivacyModal" class="ww-modal-backdrop" @click.self="cancelModal">
                                    <div class="ww-modal" role="dialog" aria-modal="true" aria-labelledby="ww-modal-title">
                                        <div class="ww-modal__header">
                                            <i class="bi bi-shield-lock-fill ww-modal__shield"></i>
                                            <h5 id="ww-modal-title" class="ww-modal__title">Privacy Notice</h5>
                                        </div>
                                        <div class="ww-modal__body">
                                            <p>
                                                To show local weather, your browser will ask for your <strong>current location</strong>.
                                            </p>
                                            <ul class="ww-modal__list">
                                                <li><i class="bi bi-check-circle-fill text-success"></i><span>Your coordinates are used <strong>directly in your browser</strong> to fetch weather data.</span></li>
                                                <li><i class="bi bi-check-circle-fill text-success"></i><span>Weather data is loaded from <strong>Open-Meteo</strong> and city names from <strong>OpenStreetMap</strong> — both open &amp; privacy-friendly APIs.</span></li>
                                                <li><i class="bi bi-x-circle-fill text-danger"></i><span>Your location is <strong>never sent to this website's server</strong> and never stored anywhere.</span></li>
                                            </ul>
                                        </div>
                                        <div class="ww-modal__footer">
                                            <button class="ww-modal__btn ww-modal__btn--cancel" @click="cancelModal">Cancel</button>
                                            <button class="ww-modal__btn ww-modal__btn--confirm" @click="confirmAndFetch">
                                                <i class="bi bi-geo-alt-fill"></i> Allow &amp; show weather
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </transition>
                        </teleport>

                    </div>
                </div>
            </div>
        </div>
    `,
};
