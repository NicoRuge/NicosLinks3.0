const TravellingView = {
	    template: `
		        <div class="container-fluid py-4 travelling-page">
		            <div class="row justify-content-center">
		                <div class="col-12 hero-page-shell">
		                    <section class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
		                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
		                            <div>
		                                <h1 class="hero-title mb-2">Travelling</h1>
		                                <p class="mb-0 hero-subtitle">Explore mapped rides, transport types, and sights from one interactive view.</p>
		                            </div>
		                            <button
		                                class="btn btn-sm"
		                                :class="isMapFullscreen ? 'btn-light text-dark' : 'btn-outline-light'"
		                                type="button"
		                                @click="toggleMapFullscreen"
		                            >
		                                <i class="bi" :class="isMapFullscreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'"></i>
		                                {{ isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map' }}
		                            </button>
		                        </div>
		                    </section>

		                    <div class="map-container-wrapper" ref="mapWrapper">
		            <div ref="mapContainer" id="map"></div>
		            <div ref="sightToastContainer" class="toast-container position-absolute p-2 map-toast-container pe-none">
		                <div ref="sightToast" class="toast align-items-center shadow pe-auto" role="alert" aria-live="polite" aria-atomic="true">
		                    <div class="toast-header">
		                        <strong ref="sightToastTitle" class="me-auto"></strong>
		                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
	                    </div>
	                    <div ref="sightToastBody" class="toast-body"></div>
	                </div>
	            </div>
	            <div class="map-controls">
	                <!-- Train Rides -->
	                <div class="dropdown">
	                    <button class="btn btn-light dropdown-toggle w-100 d-flex justify-content-between align-items-center shadow-sm" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
	                        Train Rides
                    </button>
                    <ul class="dropdown-menu shadow" id="group-trains">
                        <li>
                            <div class="dropdown-item">
                                <div class="form-check">
                                    <input class="form-check-input group-toggle" type="checkbox" data-group="trains" checked id="toggle-trains">
                                    <label class="form-check-label fw-bold" for="toggle-trains">Select All</label>
                                </div>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="nationalExpress" checked id="cb-ne"><label class="form-check-label d-flex align-items-center" for="cb-ne"><span class="legend-color" style="background:#ff0000"></span> National Express</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="regional" checked id="cb-re"><label class="form-check-label d-flex align-items-center" for="cb-re"><span class="legend-color" style="background:#ff8c00"></span> Regional Express</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="suburban" checked id="cb-s"><label class="form-check-label d-flex align-items-center" for="cb-s"><span class="legend-color" style="background:#ffff00"></span> Suburban</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="subway" id="cb-u"><label class="form-check-label d-flex align-items-center" for="cb-u"><span class="legend-color" style="background:#1eff00"></span> Subway</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="tram" id="cb-t"><label class="form-check-label d-flex align-items-center" for="cb-t"><span class="legend-color" style="background:#1100ff"></span> Tram</label></div></div></li>
                    </ul>
                </div>

                <!-- Other Transport -->
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle w-100 d-flex justify-content-between align-items-center shadow-sm" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        Other Transport
                    </button>
                    <ul class="dropdown-menu shadow" id="group-other">
                        <li>
                            <div class="dropdown-item">
                                <div class="form-check">
                                    <input class="form-check-input group-toggle" type="checkbox" data-group="other" checked id="toggle-other">
                                    <label class="form-check-label fw-bold" for="toggle-other">Select All</label>
                                </div>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="bus" checked id="cb-bus"><label class="form-check-label d-flex align-items-center" for="cb-bus"><span class="legend-color" style="background:#ff00fb"></span> Bus</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input filter-cb" type="checkbox" value="ferry" id="cb-ferry"><label class="form-check-label d-flex align-items-center" for="cb-ferry"><span class="legend-color" style="background:#9500ff"></span> Ferry</label></div></div></li>
                    </ul>
                </div>

                <!-- Sights -->
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle w-100 d-flex justify-content-between align-items-center shadow-sm" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        Sights
                    </button>
                    <ul class="dropdown-menu shadow" id="group-sights">
                        <li>
                            <div class="dropdown-item">
                                <div class="form-check">
                                    <input class="form-check-input group-toggle" type="checkbox" data-group="sights" checked id="toggle-sights">
                                    <label class="form-check-label fw-bold" for="toggle-sights">Select All</label>
                                </div>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input sight-filter-cb" type="checkbox" value="Monument" checked id="cb-mon"><label class="form-check-label d-flex align-items-center" for="cb-mon"><span class="legend-icon">⭐</span> Monument</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input sight-filter-cb" type="checkbox" value="Airport" checked id="cb-air"><label class="form-check-label d-flex align-items-center" for="cb-air"><span class="legend-icon">✈️</span> Airport</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input sight-filter-cb" type="checkbox" value="Station" checked id="cb-stat"><label class="form-check-label d-flex align-items-center" for="cb-stat"><span class="legend-icon">🚆</span> Station</label></div></div></li>
                        <li><div class="dropdown-item"><div class="form-check"><input class="form-check-input sight-filter-cb" type="checkbox" value="Other" checked id="cb-oth"><label class="form-check-label d-flex align-items-center" for="cb-oth"><span class="legend-icon">📍</span> Others</label></div></div></li>
	                    </ul>
	                </div>
	            </div>
	        </div>
	    </div>
	</div>
        </div>
    `,
	    data() {
	        return {
	            map: null,
	            mapStyles: null,
	            sightMarkers: [],
	            mapTooltip: null,
	            sightToastInstance: null,
	            isMapFullscreen: false,
	            mapboxAccessToken: null
	        };
	    },
	    mounted() {
	        this.initMap();
	        this.initSightToast();
	        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.handleThemeChange);
	        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
	    },
	    beforeUnmount() {
	        if (this.mapTooltip && this.mapTooltip.parentNode) {
	            this.mapTooltip.parentNode.removeChild(this.mapTooltip);
	        }
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.handleThemeChange);
	        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
	    },
	    methods: {
	        toggleMapFullscreen() {
	            const wrapper = this.$refs.mapWrapper;
	            if (!wrapper) return;

	            if (document.fullscreenElement === wrapper) {
	                if (document.exitFullscreen) document.exitFullscreen();
	                return;
	            }

	            if (wrapper.requestFullscreen) {
	                wrapper.requestFullscreen().catch(() => {});
	            }
	        },
	        handleFullscreenChange() {
	            const wrapper = this.$refs.mapWrapper;
	            this.isMapFullscreen = !!wrapper && document.fullscreenElement === wrapper;
	            if (this.map) this.map.resize();
	        },
	        initSightToast() {
	            if (!this.$refs.sightToast || typeof bootstrap === 'undefined' || !bootstrap.Toast) return;
	            this.sightToastInstance = bootstrap.Toast.getOrCreateInstance(this.$refs.sightToast, { autohide: true, delay: 4500 });
	        },
	        positionSightToast(anchorEl, { mode = 'above' } = {}) {
	            if (!anchorEl || !this.$refs.sightToastContainer || !this.$refs.sightToast) return;

	            const containerEl = this.$refs.sightToastContainer;
	            const toastEl = this.$refs.sightToast;

	            const wrapperRect = (this.$refs.mapWrapper && this.$refs.mapWrapper.getBoundingClientRect())
	                || this.$el.getBoundingClientRect();
	            const anchorRect = anchorEl.getBoundingClientRect();

	            const padding = 8;
	            const gap = 12;

	            const applyPlacement = (placement) => {
	                const isBelow = placement === 'below';
	                containerEl.classList.toggle('is-below', isBelow);
	                const left = (anchorRect.left + anchorRect.width / 2) - wrapperRect.left;
	                const top = isBelow ? (anchorRect.bottom - wrapperRect.top) : (anchorRect.top - wrapperRect.top);
	                containerEl.style.left = `${left}px`;
	                containerEl.style.top = `${top}px`;
	                return { left, top, isBelow };
	            };

	            if (mode !== 'auto') {
	                applyPlacement(mode);
	                return;
	            }

	            applyPlacement('above');

	            const toastRect = toastEl.getBoundingClientRect();
	            const canAbove = (anchorRect.top - gap - toastRect.height) >= (wrapperRect.top + padding);
	            const canBelow = (anchorRect.bottom + gap + toastRect.height) <= (wrapperRect.bottom - padding);
	            applyPlacement(!canAbove && canBelow ? 'below' : 'above');

	            const toastRect2 = toastEl.getBoundingClientRect();
	            const leftWithin = toastRect2.left - wrapperRect.left;
	            const rightWithin = toastRect2.right - wrapperRect.left;
	            const maxRight = wrapperRect.width - padding;
	            const minLeft = padding;

	            let deltaX = 0;
	            if (leftWithin < minLeft) deltaX = minLeft - leftWithin;
	            if (rightWithin > maxRight) deltaX = maxRight - rightWithin;

	            if (deltaX) {
	                const currentLeft = parseFloat(containerEl.style.left || '0');
	                containerEl.style.left = `${currentLeft + deltaX}px`;
	            }
	        },
	        showSightToast({ title, body, anchorEl }) {
	            if (!this.$refs.sightToastTitle || !this.$refs.sightToastBody) return;
	            if (!this.sightToastInstance) this.initSightToast();
	            if (!this.sightToastInstance) return;
	            this.$refs.sightToastTitle.textContent = title || '';
	            const text = (body || '').toString().trim();
	            this.$refs.sightToastBody.textContent = text;
	            this.$refs.sightToastBody.style.display = text ? '' : 'none';
	            this.positionSightToast(anchorEl, { mode: 'above' });
	            this.sightToastInstance.show();
	            requestAnimationFrame(() => this.positionSightToast(anchorEl, { mode: 'auto' }));
	        },
	        handleThemeChange() {
	            const storedTheme = localStorage.getItem('theme') || 'auto';
	            if (storedTheme === 'auto') {
	                this.applyMapTheme();
            }
        },
        applyMapTheme() {
            if (!this.map) return;
            const actualTheme = document.documentElement.getAttribute('data-bs-theme');
            this.map.setStyle(this.mapStyles[actualTheme === 'dark' ? 'dark' : 'light']);
        },
        async fetchMapboxToken() {
            if (this.mapboxAccessToken) return this.mapboxAccessToken;

            const response = await fetch('/.netlify/functions/mapbox-token', {
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) {
                let detail = '';
                try {
                    const payload = await response.json();
                    detail = payload?.error || '';
                } catch (_) {
                    detail = await response.text();
                }
                throw new Error(`Mapbox token endpoint failed: ${response.status}${detail ? ` - ${detail}` : ''}`);
            }

            const payload = await response.json();
            const token = payload && typeof payload.token === 'string' ? payload.token.trim() : '';
            if (!token) {
                throw new Error('Mapbox token payload was empty');
            }

            this.mapboxAccessToken = token;
            return token;
        },
        async initMap() {
            if (typeof mapboxgl === 'undefined' || !this.$refs.mapContainer) {
                setTimeout(() => this.initMap(), 200);
                return;
            }

            try {
                mapboxgl.accessToken = await this.fetchMapboxToken();
            } catch (error) {
                console.error('Failed to initialize map token:', error);
                return;
            }

            const actualTheme = document.documentElement.getAttribute('data-bs-theme');
            this.mapStyles = {
                dark: 'mapbox://styles/mapbox/dark-v11',
                light: 'mapbox://styles/mapbox/streets-v12'
            };
            const map = new mapboxgl.Map({
                container: this.$refs.mapContainer,
                style: this.mapStyles[actualTheme === 'dark' ? 'dark' : 'light'],
                center: [5.0, 50.0],
                zoom: 4
            });
            this.map = map;
            map.addControl(new mapboxgl.NavigationControl(), "top-left");


            let tripsData = null;
            this.mapTooltip = document.createElement('div');
            this.mapTooltip.className = 'map-tooltip';
            document.body.appendChild(this.mapTooltip);

            let hoveredSightIcon = null;
            let tooltipRaf = null;
            const positionTooltip = () => {
                tooltipRaf = null;
                if (!this.mapTooltip || !hoveredSightIcon) return;
                if (!this.mapTooltip.classList.contains('visible')) return;
                const rect = hoveredSightIcon.getBoundingClientRect();
                this.mapTooltip.style.left = `${rect.left + rect.width / 2}px`;
                this.mapTooltip.style.top = `${rect.top}px`;
            };
            const scheduleTooltipPosition = () => {
                if (tooltipRaf) cancelAnimationFrame(tooltipRaf);
                tooltipRaf = requestAnimationFrame(positionTooltip);
            };

            map.on('move', scheduleTooltipPosition);
            map.on('zoom', scheduleTooltipPosition);
            map.on('resize', scheduleTooltipPosition);
            map.on('movestart', () => this.$el.classList.add('map-moving'));
            map.on('moveend', () => this.$el.classList.remove('map-moving'));
            map.on('zoomstart', () => this.$el.classList.add('map-moving'));
            map.on('zoomend', () => this.$el.classList.remove('map-moving'));

            const updateTripFilter = () => {
                if (!map.getLayer("trips-lines")) return;
                const selected = Array.from(this.$el.querySelectorAll('.filter-cb:checked')).map(cb => cb.value);
                map.setFilter("trips-lines", selected.length ? ["in", "category", ...selected] : ["in", "category", ""]);
            };

            const updateSightsFilter = () => {
                const selected = Array.from(this.$el.querySelectorAll('.sight-filter-cb:checked')).map(cb => cb.value);
                const mainTypes = ["Monument", "Airport", "Station"];
                this.sightMarkers.forEach(m => {
                    const isVisible = selected.includes(m.type) || (selected.includes('Other') && !mainTypes.includes(m.type));
                    m.element.style.display = isVisible ? 'flex' : 'none';
                });
            };

            map.on("style.load", () => {
                if (tripsData) {
                    if (!map.getSource("trips")) map.addSource("trips", { type: "geojson", data: tripsData });
                    if (!map.getLayer("trips-lines")) {
                        map.addLayer({
                            id: "trips-lines", type: "line", source: "trips",
                            paint: {
                                "line-color": ["match", ["get", "category"], "nationalExpress", "#ff0000", "regional", "#ff8c00", "suburban", "#ffff00", "subway", "#1eff00", "tram", "#00ff11", "bus", "#ff00fb", "ferry", "#9500ff", "#333333"],
                                "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2.5, 14, 8],
                                "line-opacity": 0.95
                            }
                        });
                        updateTripFilter();
                    }
                }
            });

            const sources = [
                ["nationalExpress", "assets/geojson/nationalExpress_Simplified.geojson"],
                ["regional", "assets/geojson/regional.geojson"],
                ["suburban", "assets/geojson/suburban.geojson"],
                ["subway", "assets/geojson/subway.geojson"],
                ["tram", "assets/geojson/tram.geojson"],
                ["bus", "assets/geojson/bus-stripped.geojson"],
                ["ferry", "assets/geojson/ferry.geojson"]
            ];

            Promise.all(sources.map(async ([cat, url]) => {
                const r = await fetch(url);
                const j = await r.json();
                j.features.forEach((f, i) => f.properties = { category: cat, ...f.properties, id: `${cat}-${i}` });
                return j.features;
            })).then(all => {
                tripsData = { type: "FeatureCollection", features: all.flat() };
                if (map.getStyle() && !map.getSource("trips")) {
                    map.addSource("trips", { type: "geojson", data: tripsData });
                    map.addLayer({ id: "trips-lines", type: "line", source: "trips", paint: { "line-color": ["match", ["get", "category"], "nationalExpress", "#ff0000", "regional", "#ff8c00", "suburban", "#ffff00", "subway", "#1eff00", "tram", "#00ff11", "bus", "#ff00fb", "ferry", "#9500ff", "#333333"], "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2.5, 14, 8], "line-opacity": 0.95 } });
                    updateTripFilter();
                }
            });

	            fetch("assets/geojson/sights.geojson").then(r => r.json()).then(data => {
	                data.features.forEach(f => {
	                    const wrapper = document.createElement('div'); wrapper.className = 'sight-marker';
	                    const inner = document.createElement('div'); inner.className = 'sight-marker-inner';
	                    const icon = document.createElement('div'); icon.className = 'sight-icon';
	                    icon.innerText = { "Monument": "⭐", "Airport": "✈️", "Station": "🚆" }[f.properties.type] || "📍";
	                    inner.appendChild(icon);
	                    wrapper.appendChild(inner);
	                    const marker = new mapboxgl.Marker({ element: wrapper }).setLngLat(f.geometry.coordinates).addTo(map);
	                    const mObj = { marker, element: wrapper, iconElement: icon, type: f.properties.type };
	                    this.sightMarkers.push(mObj);
                    icon.addEventListener('mouseenter', (e) => {
                        hoveredSightIcon = icon;
                        this.mapTooltip.innerText = f.properties.name || "Unknown";
                        this.mapTooltip.classList.add('visible');
                        scheduleTooltipPosition();
                    });
                    icon.addEventListener('mouseleave', () => {
                        hoveredSightIcon = null;
                        this.mapTooltip.classList.remove('visible');
                    });
		                    icon.addEventListener('click', (e) => {
		                        e.stopPropagation();
		                        const name = f.properties.name || "Unknown";
		                        const when = (f.properties.when || "").toString().trim();
		                        this.showSightToast({ title: name, body: when, anchorEl: e.currentTarget });
		                    });
		                });
		                updateSightsFilter();
		            });

            this.$el.addEventListener('change', (e) => {
                if (e.target.classList.contains('filter-cb')) updateTripFilter();
                if (e.target.classList.contains('sight-filter-cb')) updateSightsFilter();
                if (e.target.classList.contains('group-toggle')) {
                    const groupName = e.target.dataset.group;
                    const isChecked = e.target.checked;
                    const groupContent = this.$el.querySelector('#group-' + groupName);
                    if (groupContent) {
                        groupContent.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = isChecked);
                        updateTripFilter(); updateSightsFilter();
                    }
                }
            });
        }
    }
};
