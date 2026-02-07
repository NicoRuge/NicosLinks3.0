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
            mapTooltip: null
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
                    const icon = document.createElement('div'); icon.className = 'sight-icon';
                    icon.innerText = { "Monument": "⭐", "Airport": "✈️", "Station": "🚆" }[f.properties.type] || "📍";
                    wrapper.appendChild(icon);
                    const marker = new mapboxgl.Marker({ element: wrapper }).setLngLat(f.geometry.coordinates).addTo(map);
                    const mObj = { marker, element: wrapper, iconElement: icon, type: f.properties.type };
                    this.sightMarkers.push(mObj);
                    icon.addEventListener('mouseenter', (e) => {
                        this.mapTooltip.innerText = f.properties.name || "Unknown";
                        this.mapTooltip.classList.add('visible');
                        const rect = icon.getBoundingClientRect();
                        this.mapTooltip.style.left = `${rect.left + rect.width / 2}px`;
                        this.mapTooltip.style.top = `${rect.top}px`;
                    });
                    icon.addEventListener('mouseleave', () => this.mapTooltip.classList.remove('visible'));
                    icon.addEventListener('click', (e) => {
                        e.stopPropagation();
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
