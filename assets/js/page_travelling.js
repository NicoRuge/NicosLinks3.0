const TravellingView = {
    template: `
        <div class="map-container-wrapper">
            <div ref="mapContainer" id="map"></div>
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
    `,
    data() {
        return {
            map: null,
            mapStyles: null,
            sightMarkers: [],
            mapTooltip: null,
            spider: null
        };
    },
    mounted() {
        this.initMap();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.handleThemeChange);
    },
    beforeUnmount() {
        if (this.mapTooltip && this.mapTooltip.parentNode) {
            this.mapTooltip.parentNode.removeChild(this.mapTooltip);
        }
        if (this.spider) {
            this.spider.cleanup();
            this.spider = null;
        }
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.handleThemeChange);
    },
    methods: {
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
        initMap() {
            if (typeof mapboxgl === 'undefined' || !this.$refs.mapContainer) {
                setTimeout(() => this.initMap(), 200);
                return;
            }
            mapboxgl.accessToken = "pk.eyJ1Ijoibmljb3J1Z2UiLCJhIjoiY21nODVoZ2R2MDNqOTJqczg3c3F4cmZ3MiJ9.1fgkuGwAxjLf26gtzgOm0w";
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

            const buildSpiderifier = () => {
                const svgNS = 'http://www.w3.org/2000/svg';
                const svg = document.createElementNS(svgNS, 'svg');
                svg.classList.add('spider-lines');
                this.$refs.mapContainer.appendChild(svg);

                const state = {
                    active: false,
                    centerLngLat: null,
                    markers: [],
                    offsets: new Map(),
                    lineEls: new Map(),
                    raf: null
                };

                const contains = (markerObj) => state.active && state.markers.includes(markerObj);

                const clearLines = () => {
                    state.lineEls.forEach(el => el.remove());
                    state.lineEls.clear();
                };

                const scheduleRedraw = () => {
                    if (!state.active) return;
                    if (state.raf) cancelAnimationFrame(state.raf);
                    state.raf = requestAnimationFrame(redraw);
                };

                const redraw = () => {
                    state.raf = null;
                    if (!state.active) return;
                    if (!state.centerLngLat) return;
                    const svgRect = this.$refs.mapContainer.getBoundingClientRect();
                    svg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`);
                    svg.setAttribute('width', `${svgRect.width}`);
                    svg.setAttribute('height', `${svgRect.height}`);

                    state.markers.forEach(m => {
                        const lngLat = m.marker.getLngLat();
                        const origin = map.project(lngLat);
                        const offset = state.offsets.get(m) || { x: 0, y: 0 };
                        const x1 = origin.x;
                        const y1 = origin.y;
                        const x2 = origin.x + offset.x;
                        const y2 = origin.y + offset.y;

                        let line = state.lineEls.get(m);
                        if (!line) {
                            line = document.createElementNS(svgNS, 'line');
                            svg.appendChild(line);
                            state.lineEls.set(m, line);
                        }
                        line.setAttribute('x1', `${x1}`);
                        line.setAttribute('y1', `${y1}`);
                        line.setAttribute('x2', `${x2}`);
                        line.setAttribute('y2', `${y2}`);
                    });
                };

                const unspiderfy = () => {
                    if (!state.active) return;
                    state.markers.forEach(m => m.marker.setOffset([0, 0]));
                    state.markers = [];
                    state.offsets.clear();
                    clearLines();
                    state.active = false;
                    state.centerLngLat = null;
                };

                const getNearbyGroup = (anchorMarkerObj, radiusPx = 42) => {
                    const anchorPoint = map.project(anchorMarkerObj.marker.getLngLat());
                    const candidates = this.sightMarkers.filter(m => m.element && m.element.style.display !== 'none');
                    return candidates.filter(m => {
                        const p = map.project(m.marker.getLngLat());
                        const dx = p.x - anchorPoint.x;
                        const dy = p.y - anchorPoint.y;
                        return Math.hypot(dx, dy) <= radiusPx;
                    });
                };

                const spiderfy = (anchorMarkerObj) => {
                    const group = getNearbyGroup(anchorMarkerObj);
                    if (group.length <= 1) {
                        unspiderfy();
                        return { didSpiderfy: false, group };
                    }

                    state.active = true;
                    state.centerLngLat = anchorMarkerObj.marker.getLngLat();
                    state.markers = group;
                    state.offsets.clear();
                    clearLines();

                    const n = group.length;
                    const offsets = [];
                    if (n <= 8) {
                        const radius = 34 + n * 3;
                        for (let i = 0; i < n; i++) {
                            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                            offsets.push({ x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) });
                        }
                    } else {
                        // simple spiral for many markers
                        for (let i = 0; i < n; i++) {
                            const angle = i * 0.7;
                            const radius = 28 + i * 6;
                            offsets.push({ x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) });
                        }
                    }

                    group.forEach((m, idx) => {
                        const off = offsets[idx];
                        state.offsets.set(m, off);
                        m.marker.setOffset([off.x, off.y]);
                    });

                    scheduleRedraw();
                    return { didSpiderfy: true, group };
                };

                const onMapClick = () => unspiderfy();
                map.on('click', onMapClick);
                map.on('move', scheduleRedraw);
                map.on('zoom', scheduleRedraw);
                map.on('resize', scheduleRedraw);

                return {
                    spiderfy,
                    unspiderfy,
                    isActive: () => state.active,
                    contains,
                    cleanup: () => {
                        unspiderfy();
                        map.off('click', onMapClick);
                        map.off('move', scheduleRedraw);
                        map.off('zoom', scheduleRedraw);
                        map.off('resize', scheduleRedraw);
                        if (state.raf) cancelAnimationFrame(state.raf);
                        svg.remove();
                    }
                };
            };
            this.spider = buildSpiderifier();

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
                        if (this.spider) {
                            if (this.spider.isActive() && this.spider.contains(mObj)) {
                                // Already spiderfied: allow opening the popup.
                            } else {
                            const { didSpiderfy } = this.spider.spiderfy(mObj);
                            if (didSpiderfy) return;
                            }
                        }
                        new mapboxgl.Popup({ offset: 25, className: 'translucent-popup' }).setLngLat(marker.getLngLat()).setHTML(`<strong>${f.properties.name}</strong><br>${f.properties.when || ""}`).addTo(map);
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
