const TripSampleView = {
    template: `
        <div class="container-fluid py-4 trips-page">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
                        <p class="hero-kicker mb-2">Trips</p>
                        <h1 class="hero-title mb-2">Interactive Travel Timeline</h1>
                        <p class="hero-subtitle mb-2">
                            Explore your journeys stop by stop with a structured timeline, detailed trip notes, and image carousels for every location.
                        </p>
                        <p class="hero-subtitle mb-0">
                            Note: Images are currently in <code>.jpg</code> format, so file sizes may be larger.
                        </p>
                    </section>

                    <div v-if="isLoading" class="alert alert-secondary" role="status">
                        Loading trip timeline...
                    </div>

                    <div v-else-if="loadError" class="alert alert-danger" role="alert">
                        {{ loadError }}
                    </div>

                    <div v-else-if="!tripOptions.length" class="alert alert-warning" role="alert">
                        No trips found in the sample timeline JSON.
                    </div>

                    <div v-else class="vstack gap-4">
                        <div class="row g-4">
                            <div class="col-12 col-lg-6">
                                <div class="card border-0 shadow-sm h-100">
                                    <div class="card-body p-4">
                                        <div class="row g-3 align-items-end">
                                            <div class="col-12 col-xl-8">
                                                <label for="trip-select" class="form-label mb-2 fw-semibold trips-card-title">Select Trip</label>
                                                <select id="trip-select" class="form-select" v-model="activeTripIndex" @change="onTripChange">
                                                    <option value="">Choose Trip</option>
                                                    <option v-for="(trip, index) in tripOptions" :key="trip.id || index" :value="index">
                                                        {{ trip.name }} ({{ trip.dateRange }})
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-12 col-xl-4 text-xl-end">
                                                <span class="badge text-bg-secondary fs-6">{{ stopCounterLabel }}</span>
                                            </div>
                                        </div>

                                        <div class="mt-3">
                                            <h2 class="h4 mb-2">{{ activeTrip.name }}</h2>
                                            <p class="text-secondary mb-0">{{ activeTrip.summary }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-lg-6">
                                <div class="card border-0 shadow-sm h-100">
                                    <div class="card-body p-4">
                                        <template v-if="hasSelectedTrip">
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <div class="form-label mb-0 fw-semibold trips-card-title">Timeline</div>
                                                <small class="text-secondary">{{ activeTrip.dateRange }}</small>
                                            </div>

                                            <div class="progress timeline-progress mb-3" role="progressbar" aria-label="Timeline progress" aria-valuemin="0" :aria-valuemax="Math.max(activeStops.length - 1, 1)" :aria-valuenow="activeStopIndex">
                                                <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
                                            </div>

                                            <div ref="timelineScroll" class="trip-timeline-scroll">
                                                <div class="list-group trip-timeline-list">
                                                    <button
                                                        v-for="(stop, index) in activeStops"
                                                        :key="stop.id || index"
                                                        :ref="(el) => setTimelineItemRef(el, index)"
                                                        type="button"
                                                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                                                        :class="{ active: index === activeStopIndex }"
                                                        @click="setStop(index)"
                                                    >
                                                        <span class="me-3">
                                                            <span class="badge rounded-pill text-bg-dark me-2">{{ index + 1 }}</span>
                                                            <span class="fw-semibold">{{ stop.name }}</span>
                                                        </span>
                                                        <small>{{ formatDate(stop.date) }}</small>
                                                    </button>
                                                </div>
                                            </div>
                                        </template>
                                        <div v-else class="small text-secondary">
                                            Choose a trip to unlock timeline stops.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="hasSelectedTrip && activeStop" class="card border-0 shadow-sm">
                            <div class="card-body p-4">
                                <div class="d-flex flex-wrap gap-2 mb-3">
                                    <span class="badge text-bg-primary">{{ formatDate(activeStop.date) }}</span>
                                    <span class="badge text-bg-light">{{ activeStop.location }}</span>
                                    <span class="badge text-bg-light">{{ activeStop.transport }}</span>
                                </div>

                                <h4 class="h5">{{ activeStop.name }}</h4>
                                <p class="text-secondary mb-3">{{ activeStop.description }}</p>

                                <div
                                    v-if="activeStop.images && activeStop.images.length"
                                    :key="activeCarouselId"
                                    :id="activeCarouselId"
                                    class="carousel slide trip-stop-carousel rounded-4 overflow-hidden border"
                                    data-bs-touch="true"
                                    data-bs-ride="false"
                                >
                                    <div v-if="activeStop.images.length > 1" class="carousel-indicators">
                                        <button
                                            v-for="(image, imageIndex) in activeStop.images"
                                            :key="activeCarouselId + '-indicator-' + imageIndex"
                                            type="button"
                                            :data-bs-target="'#' + activeCarouselId"
                                            :data-bs-slide-to="imageIndex"
                                            :class="{ active: imageIndex === 0 }"
                                            :aria-current="imageIndex === 0 ? 'true' : null"
                                            :aria-label="'Slide ' + (imageIndex + 1)"
                                        ></button>
                                    </div>

                                    <div class="carousel-inner">
                                        <div
                                            v-for="(image, imageIndex) in activeStop.images"
                                            :key="activeCarouselId + '-image-' + imageIndex"
                                            class="carousel-item"
                                            :class="{ active: imageIndex === 0 }"
                                        >
                                            <img
                                                :src="image.src"
                                                class="d-block w-100 trip-stop-image"
                                                :alt="image.alt || activeStop.name"
                                                :data-caption="image.caption || ''"
                                                @click="handleTripImageClick"
                                            >
                                            <div v-if="image.caption" class="carousel-caption d-none d-md-block">
                                                <p class="mb-0">{{ image.caption }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button v-if="activeStop.images.length > 1" class="carousel-control-prev" type="button" :data-bs-target="'#' + activeCarouselId" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Previous</span>
                                    </button>
                                    <button v-if="activeStop.images.length > 1" class="carousel-control-next" type="button" :data-bs-target="'#' + activeCarouselId" data-bs-slide="next">
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Next</span>
                                    </button>
                                </div>

                                <div class="d-flex justify-content-between mt-4">
                                    <button class="btn btn-outline-secondary" type="button" @click="prevStop" :disabled="activeStopIndex <= 0">
                                        <i class="bi bi-arrow-left me-1"></i>
                                        Previous Stop
                                    </button>
                                    <button class="btn btn-outline-secondary" type="button" @click="nextStop" :disabled="activeStopIndex >= activeStops.length - 1">
                                        Next Stop
                                        <i class="bi bi-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade" id="tripLightboxModal" tabindex="-1" aria-hidden="true" ref="tripLightboxModal">
                            <div class="modal-dialog modal-dialog-centered modal-xl">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">{{ tripLightboxTitle }}</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body p-0 bg-body-tertiary">
                                        <img v-if="tripLightboxImage" :src="tripLightboxImage" :alt="tripLightboxTitle" class="d-block w-100 photo-lightbox-img">
                                    </div>
                                    <div v-if="tripLightboxCaption" class="modal-footer justify-content-start">
                                        <span class="text-secondary">{{ tripLightboxCaption }}</span>
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
            isLoading: true,
            loadError: '',
            tripOptions: [],
            activeTripIndex: '',
            activeStopIndex: 0,
            timelineItemRefs: {},
            tripLightboxImage: '',
            tripLightboxTitle: 'Image',
            tripLightboxCaption: '',
            _tripLightboxModalInstance: null
        };
    },
    computed: {
        hasSelectedTrip() {
            return this.activeTripIndex !== '' && this.tripOptions[this.activeTripIndex] !== undefined;
        },
        activeTrip() {
            return this.tripOptions[this.activeTripIndex] || { name: '', dateRange: '', summary: '', stops: [] };
        },
        activeStops() {
            return Array.isArray(this.activeTrip.stops) ? this.activeTrip.stops : [];
        },
        activeStop() {
            return this.activeStops[this.activeStopIndex] || null;
        },
        progressPercent() {
            if (this.activeStops.length <= 1) return 100;
            return (this.activeStopIndex / (this.activeStops.length - 1)) * 100;
        },
        stopCounterLabel() {
            if (!this.hasSelectedTrip || !this.activeStops.length) return '0 / 0 stops';
            return `${this.activeStopIndex + 1} / ${this.activeStops.length} stops`;
        },
        activeCarouselId() {
            const stopId = this.activeStop?.id || `stop-${this.activeStopIndex}`;
            return `trip-stop-carousel-${stopId}`;
        }
    },
    async mounted() {
        window.addEventListener('resize', this.handleTimelineResize);
        await this.loadTrips();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleTimelineResize);
        if (this._tripLightboxModalInstance) {
            this._tripLightboxModalInstance.hide();
        }
    },
    methods: {
        buildAssetUrl(path) {
            return new URL(path, window.location.href).toString();
        },
        async fetchJson(path) {
            const response = await fetch(this.buildAssetUrl(path), {
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} for ${path}`);
            }
            return response.json();
        },
        async loadTrips() {
            this.isLoading = true;
            this.loadError = '';
            try {
                const indexJson = await this.fetchJson('assets/trips/trip-index.json');
                const tripRefs = Array.isArray(indexJson?.trips) ? indexJson.trips : [];
                const tripFiles = tripRefs
                    .map((entry) => entry?.file)
                    .filter((value) => typeof value === 'string' && value.trim().length > 0);

                const tripJsons = await Promise.all(
                    tripFiles.map((file) => this.fetchJson(`assets/trips/${file}`))
                );

                const trips = tripJsons.filter((trip) => trip && typeof trip === 'object');
                this.tripOptions = trips;
                this.activeTripIndex = '';
                this.activeStopIndex = 0;
                this.timelineItemRefs = {};
                this.$nextTick(() => this.updateTimelineViewportHeight());
            } catch (error) {
                const protocolHint = window.location.protocol === 'file:'
                    ? ' Open this project through a local web server (not via file://) so JSON fetch works.'
                    : '';
                this.loadError = `Could not load trip timeline JSON (${error?.message || 'unknown error'}).${protocolHint}`;
            } finally {
                this.isLoading = false;
            }
        },
        setStop(index) {
            if (!this.hasSelectedTrip) return;
            const next = Number(index);
            if (!Number.isFinite(next)) return;
            const maxIndex = Math.max(this.activeStops.length - 1, 0);
            this.activeStopIndex = Math.min(Math.max(next, 0), maxIndex);
            this.$nextTick(() => {
                this.updateTimelineViewportHeight();
                this.scrollActiveStopToTop();
            });
        },
        setTimelineItemRef(el, index) {
            if (!this.hasSelectedTrip) return;
            if (el) {
                this.timelineItemRefs[index] = el;
            } else {
                delete this.timelineItemRefs[index];
            }
        },
        onTripChange() {
            if (!this.hasSelectedTrip) {
                this.activeStopIndex = 0;
                this.timelineItemRefs = {};
                this.$nextTick(() => this.updateTimelineViewportHeight());
                return;
            }
            this.timelineItemRefs = {};
            this.activeStopIndex = 0;
            this.$nextTick(() => {
                this.updateTimelineViewportHeight();
                this.scrollActiveStopToTop();
            });
        },
        scrollActiveStopToTop() {
            if (!this.hasSelectedTrip) return;
            const container = this.$refs.timelineScroll;
            const activeItem = this.timelineItemRefs[this.activeStopIndex];
            if (!container || !activeItem) return;
            container.scrollTop = activeItem.offsetTop;
        },
        updateTimelineViewportHeight() {
            const container = this.$refs.timelineScroll;
            const firstItem = this.timelineItemRefs[0];
            const thirdItem = this.timelineItemRefs[2];
            if (!container) return;
            if (!firstItem || !thirdItem) {
                container.style.maxHeight = '';
                return;
            }
            const visibleHeight = (thirdItem.offsetTop + thirdItem.offsetHeight) - firstItem.offsetTop;
            if (visibleHeight > 0) {
                container.style.maxHeight = `${Math.ceil(visibleHeight)}px`;
            }
        },
        handleTimelineResize() {
            this.$nextTick(() => this.updateTimelineViewportHeight());
        },
        handleTripImageClick(event) {
            const img = event?.target?.closest?.('img.trip-stop-image');
            if (!img) return;

            this.tripLightboxImage = img.getAttribute('src') || '';
            this.tripLightboxTitle = img.getAttribute('alt') || 'Image';
            this.tripLightboxCaption = img.getAttribute('data-caption') || '';

            this.$nextTick(() => {
                const modalEl = this.$refs.tripLightboxModal;
                if (!modalEl || !window.bootstrap) return;
                this._tripLightboxModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
                this._tripLightboxModalInstance.show();
            });
        },
        prevStop() {
            this.setStop(this.activeStopIndex - 1);
        },
        nextStop() {
            this.setStop(this.activeStopIndex + 1);
        },
        formatDate(value) {
            if (!value) return 'Unknown date';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return value;
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
};
