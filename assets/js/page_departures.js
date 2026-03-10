const DeparturesView = {
	template: `
		        <div class="container-fluid py-4 departures-page">
		            <div class="row justify-content-center">
		                <div class="col-12 hero-page-shell departures-panel">
		                    <section class="portfolio-hero departures-hero rounded-4 p-4 p-lg-5 mb-4">
                                <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
                                    <div>
                                        <h1 class="hero-title mb-2">Departures</h1>
                                        <p class="mb-0 hero-subtitle">
                                            Search a station and filter live departures by transport mode.
                                        </p>
                                    </div>
                                </div>

		                        <label for="station-search" class="form-label visually-hidden">Search Station</label>
			                        <div class="position-relative mb-3">
		                            <div class="input-group flex-nowrap">
		                                <span class="input-group-text" id="addon-wrapping">
		                                    <i class="bi bi-search"></i>
		                                </span>
		                                <input 
		                                    type="text" 
		                                    id="station-search" 
		                                    class="form-control" 
		                                    placeholder="Search for a station..." 
		                                    aria-label="Search for a station..." 
		                                    aria-describedby="addon-wrapping"
		                                    v-model="query" 
		                                    @input="onInput"
		                                    autocomplete="off"
		                                    aria-autocomplete="list"
		                                    :aria-expanded="suggestions.length > 0"
		                                    aria-controls="search-suggestions"
		                                >
		                                <span v-if="autocompleteLoading" class="input-group-text" title="Searching…">
		                                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
		                                </span>
		                                <button v-if="query" class="btn btn-outline-secondary" type="button" @click="clearSearch" aria-label="Clear search">
		                                    <i class="bi bi-x-lg"></i>
		                                </button>
		                            </div>

                            <ul 
                                id="search-suggestions" 
                                class="list-group position-absolute w-100 shadow mt-1" 
                                style="z-index: 1000;" 
                                v-if="suggestions.length > 0"
                                role="listbox"
                            >
                                <li 
                                    v-for="station in suggestions" 
                                    :key="station.id" 
                                    class="list-group-item list-group-item-action cursor-pointer d-flex align-items-center"
                                    @click="selectStation(station)"
                                    role="option"
                                    tabindex="0"
                                    @keydown.enter="selectStation(station)"
                                >
                                    <i class="bi bi-geo-alt me-2 text-primary opacity-50"></i>
                                    <span>
                                        {{ station.name }}
                                    </span>
                                </li>
                            </ul>
                            <div
                                v-if="!autocompleteLoading && autocompleteMessage"
                                class="small mt-2 text-light"
                                role="status"
                                aria-live="polite"
                            >
                                {{ autocompleteMessage }}
                            </div>
                        </div>

                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                <span class="small text-white-50">Modes:</span>
                                <div class="d-flex flex-wrap gap-1" role="group" aria-label="Filter by mode">
                                    <template v-for="opt in modeFilterOptions" :key="opt.key">
                                        <input
                                            class="btn-check"
                                            type="checkbox"
                                            :id="'mode-filter-' + opt.key"
                                            v-model="modeFilters[opt.key]"
                                            @change="onFiltersChanged"
                                        >
                                        <label
                                            class="btn btn-sm btn-outline-light"
                                            :for="'mode-filter-' + opt.key"
                                            :title="opt.title"
                                        >
                                            {{ opt.label }}
                                        </label>
                                    </template>
                                </div>
                                <button v-if="!isAllModesEnabled" type="button" class="btn btn-sm btn-link text-white ms-auto py-0" @click="resetModeFilters">
                                    Reset
                                </button>
                            </div>
                            </section>

                    <!-- Loading State -->
                    <div v-if="loading" class="text-center p-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>

                    <!-- Error State -->
                    <div v-if="error" class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
                    </div>

	                    <!-- Departures Table -->
	                    <div v-if="!loading" class="card shadow-sm border-0">
	                        <div class="card-header bg-body-tertiary border-0 py-3">
	                            <div class="d-flex align-items-center">
	                                <i class="bi bi-train-front text-primary me-2 lead"></i>
	                                <h2 class="h5 mb-0">
	                                    <span v-if="station">Departures from {{ station.name }}</span>
	                                    <span v-else>Sample departure</span>
	                                </h2>
	                                <button v-if="station" class="btn btn-sm btn-outline-primary ms-auto" @click="refreshDepartures" title="Refresh">
	                                    <i class="bi bi-arrow-clockwise"></i>
	                                </button>
	                            </div>
	                        </div>
                            <div class="departure-list">
                                <div v-if="station && filteredDepartures.length === 0" class="text-center py-5 text-secondary">
                                    <span v-if="departures.length === 0">No departures found in the next 60 minutes.</span>
                                    <span v-else>No departures match the selected modes.</span>
                                </div>
                                
                                <div v-for="dep in filteredDepartures" :key="dep.tripId + (dep.line?.name || '')" class="departure-card">
                                    <!-- Line Icon/Name -->
                                    <div class="departure-card-line">
                                        <div class="departure-line-cell">
                                            <img v-if="getLineIconSrc(dep.line)" :src="getLineIconSrc(dep.line)" alt="" :class="['departure-line-icon', getLineIconSizeClass(dep.line)]" loading="lazy" :title="dep.line.name || dep.line.product || 'Line'">
                                            <span v-else :class="['departure-line-icon-fallback', getLineFallbackClass(dep.line)]" :title="dep.line.name || dep.line.product || 'Line'">{{ getLineFallbackLabel(dep.line) }}</span>
                                        </div>
                                    </div>

                                    <!-- Line Number -->
                                    <div class="departure-card-number fw-bold">
                                        {{ getLineNumberText(dep.line) }}
                                    </div>

                                    <!-- Destination -->
                                    <div class="departure-card-destination fw-medium">
                                        <div class="departures-destination-text">
                                            <span class="departures-destination-inner">{{ dep.direction }}</span>
                                        </div>
                                    </div>

                                    <!-- Platform -->
                                    <div class="departure-card-platform text-secondary small">
                                        <span v-if="dep.platform || dep.plannedPlatform">Pl. {{ dep.platform || dep.plannedPlatform }}</span>
                                        <span v-else>-</span>
                                    </div>

                                    <!-- Time -->
                                    <div class="departure-card-time text-end">
                                        <div class="d-flex flex-column align-items-end">
                                            <span class="fw-bold">{{ getDisplayTime(dep) }}</span>
                                            <small v-if="getDelay(dep) > 0" class="text-danger fw-bold">
                                                +{{ getDelay(dep) }} min
                                            </small>
                                            <small v-else-if="getDelay(dep) < 0" class="text-success">
                                                {{ getDelay(dep) }} min
                                            </small>
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
			query: '',
			suggestions: [],
			station: null,
			departures: [],
			modeFilterOptions: [
				{ key: 'ice', label: 'ICE', title: 'ICE trains' },
				{ key: 'ic', label: 'IC', title: 'IC/EC trains' },
				{ key: 'rerb', label: 'RE/RB', title: 'Regional trains (RE/RB)' },
				{ key: 'sbahn', label: 'S', title: 'S-Bahn' },
				{ key: 'subway', label: 'U', title: 'Subway / U-Bahn' },
				{ key: 'bus', label: 'Bus', title: 'Buses' },
				{ key: 'tram', label: 'Tram', title: 'Trams' },
				{ key: 'other', label: 'Other', title: 'Other modes' }
			],
			modeFilters: {
				ice: true,
				ic: true,
				rerb: true,
				sbahn: true,
				subway: true,
				bus: true,
				tram: true,
				other: true
			},
			autocompleteLoading: false,
			autocompleteMessage: '',
			stationSearchSeq: 0,
			stationSearchAbortController: null,
			stationSearchCache: new Map(),
			destinationResizeObserver: null,
			sampleDepartures: [
				{
					tripId: 'sample-ice-100',
					line: { name: 'ICE 100', product: 'nationalExpress' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-ic-100',
					line: { name: 'IC 100', product: 'national' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-en-100',
					line: { name: 'EN 100', product: 'national' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-rj-100',
					line: { name: 'RJ 100', product: 'national' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-fex-100',
					line: { name: 'FEX 100', product: 'regional' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-flx-100',
					line: { name: 'FLX 100', product: 'regional' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-re-100',
					line: { name: 'RE 100', product: 'regional' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-rb-100',
					line: { name: 'RB 100', product: 'regional' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-s-100',
					line: { name: 'S 100', product: 'suburban' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-u-100',
					line: { name: 'U 100', product: 'subway' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-tram-100',
					line: { name: 'Tram 100', product: 'tram' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				},
				{
					tripId: 'sample-bus-100',
					line: { name: 'Bus 100', product: 'bus' },
					direction: 'Rostock',
					platform: '99',
					delay: 99 * 60,
					_displayTime: '12:00'
				}
			],
			loading: false,
			error: null,
			debounceTimeout: null
		};
	},
	computed: {
		isAllModesEnabled() {
			return this.modeFilterOptions.every((opt) => !!this.modeFilters?.[opt.key]);
		},
		filteredDepartures() {
			const source = this.station ? (this.departures || []) : (this.sampleDepartures || []);
			return source.filter((dep) => {
				const key = this.getFilterModeKey(dep?.line);
				return this.modeFilters?.[key] !== false;
			});
		}
	},
	mounted() {
		this.initDestinationMarqueeObserver();
		this.$nextTick(() => this.updateDestinationMarquee());
	},
	beforeUnmount() {
		if (this.destinationResizeObserver) this.destinationResizeObserver.disconnect();
		this.destinationResizeObserver = null;
		if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
		clearTimeout(this.debounceTimeout);
	},
	methods: {
		initDestinationMarqueeObserver() {
			if (typeof ResizeObserver === 'undefined') return;
			if (this.destinationResizeObserver) this.destinationResizeObserver.disconnect();
			this.destinationResizeObserver = new ResizeObserver(() => this.updateDestinationMarquee());
			this.destinationResizeObserver.observe(this.$el);
		},
		updateDestinationMarquee() {
			const wrappers = this.$el?.querySelectorAll?.('.departures-destination-text');
			if (!wrappers || !wrappers.length) return;

			wrappers.forEach((wrapper) => {
				const inner = wrapper.querySelector('.departures-destination-inner');
				if (!inner) return;

				wrapper.classList.remove('is-overflowing');
				wrapper.style.removeProperty('--marquee-distance');
				wrapper.style.removeProperty('--marquee-duration');

				const wrapperWidth = wrapper.clientWidth;
				if (!wrapperWidth) return;

				const overflow = Math.ceil(inner.scrollWidth - wrapperWidth);
				if (overflow <= 4) return;

				const distance = overflow + 16;
				const duration = Math.min(14, Math.max(6, distance / 35));
				wrapper.style.setProperty('--marquee-distance', `${distance}px`);
				wrapper.style.setProperty('--marquee-duration', `${duration}s`);
				wrapper.classList.add('is-overflowing');
			});
		},
		onInput() {
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = setTimeout(() => {
				this.searchStations();
			}, 300);
		},
		async searchStations() {
			const q = (this.query || '').toString().trim();
			if (!q || q.length < 2) {
				this.autocompleteLoading = false;
				this.autocompleteMessage = '';
				if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
				this.suggestions = [];
				return;
			}

				const parseSuggestions = (payload) => {
					const raw = Array.isArray(payload)
						? payload
						: (Array.isArray(payload?.stations) ? payload.stations : []);
				if (!Array.isArray(raw)) return [];

				const unique = new Map();
				raw.forEach((item) => {
					if (!item || typeof item !== 'object') return;
					const type = (item.type || 'stop').toString().toLowerCase();
					if (type === 'poi' || type === 'address') return;
					const id = (item.id || item.station?.id || item.stop?.id || '').toString().trim();
					const name = (item.name || item.station?.name || item.stop?.name || '').toString().trim();
					if (!id || !name) return;
					if (!unique.has(id)) unique.set(id, item);
				});
				return Array.from(unique.values()).slice(0, 5);
			};

			const fetchSuggestionsWithRetry = async (query, controller, retries = 1) => {
				const fetchAndParse = async (url) => {
					const response = await fetch(url, {
						signal: controller.signal,
						cache: 'no-store'
					});
					if (!response.ok) {
						throw new Error(`Failed to fetch stations (HTTP ${response.status}).`);
					}
					const json = await response.json();
					return parseSuggestions(json);
				};

				let lastError = null;
				for (let attempt = 0; attempt <= retries; attempt += 1) {
					try {
						const strictUrl = `https://v6.db.transport.rest/locations?query=${encodeURIComponent(query)}&results=5&stops=true&addresses=false&poi=false`;
						const strictSuggestions = await fetchAndParse(strictUrl);
						if (strictSuggestions.length) return strictSuggestions;

						const broadUrl = `https://v6.db.transport.rest/locations?query=${encodeURIComponent(query)}&results=10`;
						const broadSuggestions = await fetchAndParse(broadUrl);
						if (broadSuggestions.length) return broadSuggestions.slice(0, 5);

						const stopsUrl = `https://v6.db.transport.rest/stops?query=${encodeURIComponent(query)}&results=10`;
						const stopsSuggestions = await fetchAndParse(stopsUrl);
						return stopsSuggestions.slice(0, 5);
					} catch (err) {
						lastError = err;
						if (err?.name === 'AbortError') throw err;
						if (String(err?.message || '').includes('HTTP 5') && attempt < retries) continue;
						if (attempt >= retries) throw err;
					}
				}
				throw lastError || new Error('Failed to fetch stations.');
			};

			let seq = 0;
			try {
				const cached = this.stationSearchCache.get(q);
				if (cached) {
					this.suggestions = cached;
					this.autocompleteMessage = cached.length
						? ''
						: 'No matching stations found. Try a more specific query (e.g. Berlin Hbf).';
					return;
				}

				this.autocompleteLoading = true;
				this.autocompleteMessage = '';
				seq = ++this.stationSearchSeq;
				if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
				const controller = new AbortController();
				this.stationSearchAbortController = controller;
				const timeout = setTimeout(() => controller.abort(), 14000);
				try {
					const suggestions = await fetchSuggestionsWithRetry(q, controller, 1);
					if (seq !== this.stationSearchSeq) return;
					if (((this.query || '').toString().trim()) !== q) return;
					if (suggestions.length) this.stationSearchCache.set(q, suggestions);
					this.suggestions = suggestions;
					this.autocompleteMessage = suggestions.length
						? ''
						: 'No matching stations found. Try a more specific query (e.g. Berlin Hbf).';
				} finally {
					clearTimeout(timeout);
				}
			} catch (err) {
				if (err && err.name === 'AbortError') {
					if (seq === this.stationSearchSeq) {
						this.suggestions = [];
						this.autocompleteMessage = 'Station search timed out. Please try again.';
					}
					return;
				}
				console.error(err);
				if (seq === this.stationSearchSeq) {
					this.suggestions = [];
					this.autocompleteMessage = 'Could not load station suggestions. Please try again.';
				}
			} finally {
				if (seq === this.stationSearchSeq && this.stationSearchAbortController?.signal?.aborted) {
					this.stationSearchAbortController = null;
				}
				if (seq === this.stationSearchSeq) this.autocompleteLoading = false;
			}
		},
		selectStation(station) {
			this.station = station;
			this.query = station.name;
			this.suggestions = [];
			this.autocompleteMessage = '';
			this.getDepartures(station.id);
		},
		clearSearch() {
			if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
			this.query = '';
			this.suggestions = [];
			this.autocompleteMessage = '';
			this.station = null;
			this.departures = [];
			this.error = null;
			this.$nextTick(() => this.updateDestinationMarquee());
		},
		async getDepartures(stationId) {
			this.loading = true;
			this.error = null;
			try {
				const normalizedStationId = (stationId || '').toString().trim();
				if (!normalizedStationId) throw new Error('Selected station has no valid ID.');

				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), 12000);
				let response;
				try {
					response = await fetch(`https://v6.db.transport.rest/stops/${encodeURIComponent(normalizedStationId)}/departures?results=10&duration=60`, { signal: controller.signal });
				} finally {
					clearTimeout(timeout);
				}
				if (!response.ok) {
					let details = '';
					try {
						const body = await response.json();
						details = (body?.message || body?.error || '').toString().trim();
					} catch (_) {
						try {
							details = (await response.text()).toString().trim();
						} catch (_) {
							details = '';
						}
					}
					const detailSuffix = details ? ` (${details.slice(0, 180)})` : '';
					throw new Error(`HTTP ${response.status} ${response.statusText}${detailSuffix}`);
				}
				const data = await response.json();
				if (!Array.isArray(data) && !Array.isArray(data?.departures)) {
					throw new Error('Unexpected API response format for departures.');
				}
				this.departures = data.departures || data;
				this.$nextTick(() => this.updateDestinationMarquee());
			} catch (err) {
				const reason = (err && err.name === 'AbortError')
					? 'Request timed out after 12 seconds.'
					: ((err && err.message) ? err.message : 'Unknown error.');
				this.error = `Could not load departures: ${reason}`;
				console.error(err);
			} finally {
				this.loading = false;
			}
		},
		refreshDepartures() {
			if (this.station) {
				this.getDepartures(this.station.id);
			}
		},
		getDisplayTime(dep) {
			if (dep && dep._displayTime) return dep._displayTime;
			return this.formatTime(dep?.when || dep?.plannedWhen);
		},
		formatTime(isoString) {
			if (!isoString) return '';
			return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		},
		getDelay(dep) {
			// delay is in seconds
			return dep.delay ? Math.floor(dep.delay / 60) : 0;
		},
		onFiltersChanged() {
			this.$nextTick(() => this.updateDestinationMarquee());
		},
		resetModeFilters() {
			this.modeFilterOptions.forEach((opt) => {
				this.modeFilters[opt.key] = true;
			});
			this.onFiltersChanged();
		},
		getFilterModeKey(line) {
			const mode = this.getLineModeKey(line);
			if (mode === 'ice') return 'ice';
			if (mode === 'ic') return 'ic';
			if (mode === 'rerb') return 'rerb';
			if (mode === 'sbahn') return 'sbahn';
			if (mode === 'subway') return 'subway';
			if (mode === 'bus') return 'bus';
			if (mode === 'tram') return 'tram';
			return 'other';
		},
		getLineModeKey(line) {
			const name = (line?.name || '').toString().trim().toUpperCase();
			const product = (line?.product || '').toString().trim().toLowerCase();

			if (name.startsWith('ICE')) return 'ice';
			if (name.startsWith('IC')) return 'ic';
			if (/^EN\b/.test(name)) return 'en';
			if (/^RJ\b/.test(name)) return 'rj';
			if (/^FEX\b/.test(name)) return 'fex';
			if (name.startsWith('FLX') || name.startsWith('FLIXTRAIN')) return 'flx';
			if (/^(RE|RB)\s*\d*/.test(name)) return 'rerb';
			if (product === 'suburban' || product === 's-bahn') return 'sbahn';
			if (product === 'subway' || product === 'subway-train') return 'subway';
			if (product === 'bus') return 'bus';
			if (product === 'tram') return 'tram';
			return 'default';
		},
		getLineIconSrc(line) {
			const mode = this.getLineModeKey(line);
			if (mode === 'ice') return 'assets/icons/InterCityExpress.svg';
			if (mode === 'ic') return 'assets/icons/InterCity.svg';
			if (mode === 'en') return 'assets/icons/EN.svg';
			if (mode === 'rj') return 'assets/icons/Railjet.svg';
			if (mode === 'fex') return null;
			if (mode === 'flx') return 'assets/icons/FLX.svg';
			if (mode === 'rerb') return 'assets/icons/RE_RB.svg';
			if (mode === 'sbahn') return 'assets/icons/SBahn.svg';
			if (mode === 'subway') return 'assets/icons/Subway.svg';
			if (mode === 'bus') return 'assets/icons/bus.svg';
			if (mode === 'tram') return 'assets/icons/Tram.svg';
			return null;
		},
		getLineIconSizeClass(line) {
			const mode = this.getLineModeKey(line);
			if (mode === 'flx') return 'departure-line-icon--small';
			if (mode === 'rj' || mode === 'rerb' || mode === 'en') return 'departure-line-icon--scaled';
			return 'departure-line-icon--up';
		},
		getLineFallbackClass(line) {
			const mode = this.getLineModeKey(line);
			if (mode === 'fex') return 'departure-line-icon-fallback--fex';
			return 'departure-line-icon-fallback--default';
		},
		getLineNumberText(line) {
			if (!line) return '?';
			const raw = [
				line.public,
				line.label,
				line.name,
				line.line,
				line.number
			]
				.filter((value) => typeof value === 'string' || typeof value === 'number')
				.map((value) => value.toString().trim())
				.find((value) => value.length > 0);

			const mode = this.getLineModeKey(line);
			if (!raw) return '?';

			if (mode === 'ice') return raw.replace(/^ICE\s*/i, '').trim() || raw;
			if (mode === 'ic') return raw.replace(/^IC\s*/i, '').trim() || raw;
			if (mode === 'en') return raw.replace(/^EN\s*/i, '').trim() || raw;
			if (mode === 'rj') return raw.replace(/^RJ\s*/i, '').trim() || raw;
			if (mode === 'fex') return raw.replace(/^FEX\s*/i, '').trim() || raw;
			if (mode === 'flx') return raw.replace(/^(FLX|FLIXTRAIN)\s*/i, '').trim() || raw;
			if (mode === 'rerb') return raw;
			if (mode === 'bus') return raw.replace(/^BUS\s*/i, '').trim() || raw;
			if (mode === 'tram') return raw.replace(/^TRAM\s*/i, '').trim() || raw;
			return raw;
		},
		getLineFallbackLabel(line) {
			const name = (line?.name || '').toString().trim().toUpperCase();
			const mode = this.getLineModeKey(line);
			if (mode === 'ice') return 'ICE';
			if (mode === 'ic') return 'IC';
			if (mode === 'en') return 'EN';
			if (mode === 'rj') return 'RJ';
			if (mode === 'fex') return 'FEX';
			if (mode === 'flx') return 'FLX';
			if (mode === 'rerb') return name.startsWith('RB') ? 'RB' : 'RE';
			if (mode === 'sbahn') return 'S';
			if (mode === 'subway') return 'U';
			if (mode === 'bus') return 'Bus';
			if (mode === 'tram') return 'Tram';
			return (line?.name || '?').toString().trim().slice(0, 4) || '?';
		}
	}
};
