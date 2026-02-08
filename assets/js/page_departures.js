	const DeparturesView = {
	    template: `
	        <div class="container-fluid">
	            <div class="row justify-content-center">
	                <div class="col-12 col-md-10 col-lg-8 col-xl-6 departures-panel">
	                    <h1 class="h3 mb-4">Departures</h1>
	                    
	                    <div class="mb-4">
	                        <label for="station-search" class="form-label visually-hidden">Search Station</label>
		                        <div class="position-relative">
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

                            <!-- Autocomplete Suggestions -->
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
                        </div>
                    </div>

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
		                        <div class="table-responsive">
		                            <table class="table table-hover mb-0 align-middle departures-table">
		                                <colgroup>
		                                    <col style="width: var(--departures-col-line, 150px);">
		                                    <col>
		                                    <col style="width: var(--departures-col-platform, 110px);">
		                                    <col style="width: var(--departures-col-time, 130px);">
		                                </colgroup>
		                                <thead class="table-light">
		                                    <tr>
		                                        <th scope="col">Line</th>
		                                        <th scope="col">Destination</th>
		                                        <th scope="col">Platform</th>
	                                        <th scope="col" class="text-end">Time</th>
	                                    </tr>
	                                </thead>
	                                <tbody>
	                                    <tr v-if="station && departures.length === 0">
	                                        <td colspan="4" class="text-center py-4 text-secondary">
	                                            No departures found in the next 60 minutes.
	                                        </td>
	                                    </tr>
	                                    <tr v-for="dep in (station ? departures : sampleDepartures)" :key="dep.tripId + dep.line.name">
	                                        <td>
	                                            <div class="departure-line-cell">
	                                                <img v-if="getLineIconSrc(dep.line)" :src="getLineIconSrc(dep.line)" alt="" class="departure-line-icon" loading="lazy" :title="dep.line.name || dep.line.product || 'Line'">
	                                                <span v-else class="departure-line-icon-fallback" :title="dep.line.name || dep.line.product || 'Line'">{{ getLineFallbackLabel(dep.line) }}</span>
		                                                <span class="departure-line-text fw-bold">{{ getLineNumberText(dep.line) }}</span>
		                                            </div>
		                                        </td>
		                                        <td class="fw-medium departures-destination">
		                                            <div class="departures-destination-text">
		                                                <span class="departures-destination-inner">{{ dep.direction }}</span>
		                                            </div>
		                                        </td>
		                                        <td>{{ dep.platform || dep.plannedPlatform || '-' }}</td>
		                                        <td class="text-end">
		                                            <div class="d-flex flex-column align-items-end">
		                                                <span class="fw-bold">{{ getDisplayTime(dep) }}</span>
	                                                <small v-if="getDelay(dep) > 0" class="text-danger fw-bold">
	                                                    +{{ getDelay(dep) }} min
	                                                </small>
	                                                <small v-else-if="getDelay(dep) < 0" class="text-success">
                                                    {{ getDelay(dep) }} min
                                                </small>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
		            autocompleteLoading: false,
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
	                }
	            ],
	            loading: false,
	            error: null,
		            debounceTimeout: null
		        };
		    },
		    mounted() {
		        this.initDestinationMarqueeObserver();
		        this.$nextTick(() => this.updateDestinationMarquee());
		    },
		    beforeUnmount() {
		        if (this.destinationResizeObserver) this.destinationResizeObserver.disconnect();
		        this.destinationResizeObserver = null;
		        if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
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
	                if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
	                this.suggestions = [];
	                return;
	            }

	            try {
	                const cached = this.stationSearchCache.get(q);
	                if (cached) {
	                    this.suggestions = cached;
	                    return;
	                }

	                this.autocompleteLoading = true;
	                const seq = ++this.stationSearchSeq;
	                if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
	                const controller = new AbortController();
	                this.stationSearchAbortController = controller;
	                const timeout = setTimeout(() => controller.abort(), 8000);

	                const response = await fetch(`https://v6.db.transport.rest/locations?query=${encodeURIComponent(q)}&results=5&stops=true&addresses=false&poi=false`, { signal: controller.signal });
	                if (!response.ok) throw new Error('Failed to fetch stations');
	                const json = await response.json();
	                clearTimeout(timeout);
	                if (seq !== this.stationSearchSeq) return;
	                if (((this.query || '').toString().trim()) !== q) return;
	                this.stationSearchCache.set(q, json);
	                this.suggestions = json;
	            } catch (err) {
	                if (err && err.name === 'AbortError') return;
	                console.error(err);
	                this.suggestions = [];
	            } finally {
	                this.autocompleteLoading = false;
	            }
	        },
	        selectStation(station) {
	            this.station = station;
	            this.query = station.name;
	            this.suggestions = [];
            this.getDepartures(station.id);
        },
		        clearSearch() {
		            if (this.stationSearchAbortController) this.stationSearchAbortController.abort();
		            this.query = '';
		            this.suggestions = [];
		            this.station = null;
		            this.departures = [];
		            this.error = null;
		            this.$nextTick(() => this.updateDestinationMarquee());
		        },
	        async getDepartures(stationId) {
	            this.loading = true;
	            this.error = null;
	            try {
                const response = await fetch(`https://v6.db.transport.rest/stops/${stationId}/departures?results=10&duration=60`);
	                if (!response.ok) throw new Error('Failed to load departures');
	                const data = await response.json();
	                this.departures = data.departures || data;
	                this.$nextTick(() => this.updateDestinationMarquee());
	            } catch (err) {
	                this.error = 'Could not load departures. Please try again.';
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
	        getLineModeKey(line) {
	            const name = (line?.name || '').toString().trim().toUpperCase();
	            const product = (line?.product || '').toString().trim().toLowerCase();

	            if (name.startsWith('ICE')) return 'ice';
	            if (name.startsWith('IC')) return 'ic';
	            if (/^EN\b/.test(name)) return 'en';
	            if (/^RJ\b/.test(name)) return 'rj';
	            if (name.startsWith('FLX') || name.startsWith('FLIXTRAIN')) return 'flx';
	            if (/^(RE|RB)\b/.test(name)) return 'rerb';
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
	            if (mode === 'flx') return 'assets/icons/FLX.svg';
	            if (mode === 'rerb') return 'assets/icons/RE_RB.svg';
	            if (mode === 'sbahn') return 'assets/icons/SBahn.svg';
	            if (mode === 'subway') return 'assets/icons/Subway.svg';
	            if (mode === 'bus') return 'assets/icons/bus.svg';
	            if (mode === 'tram') return 'assets/icons/Tram.svg';
	            return null;
	        },
	        getLineNumberText(line) {
	            if (!line) return '?';
	            if (line.fahrtNr) return (line.fahrtNr || '').toString().trim() || '?';

	            const mode = this.getLineModeKey(line);
	            const raw = (line.name || '').toString().trim();
	            if (!raw) return '?';

	            if (mode === 'ice') return raw.replace(/^ICE\s*/i, '').trim() || raw;
	            if (mode === 'ic') return raw.replace(/^IC\s*/i, '').trim() || raw;
	            if (mode === 'en') return raw.replace(/^EN\s*/i, '').trim() || raw;
	            if (mode === 'rj') return raw.replace(/^RJ\s*/i, '').trim() || raw;
	            if (mode === 'flx') return raw.replace(/^(FLX|FLIXTRAIN)\s*/i, '').trim() || raw;
	            if (mode === 'rerb') return raw.replace(/^(RE|RB)\s*/i, '').trim() || raw;
	            return raw;
	        },
	        getLineFallbackLabel(line) {
	            const name = (line?.name || '').toString().trim().toUpperCase();
	            const mode = this.getLineModeKey(line);
	            if (mode === 'ice') return 'ICE';
	            if (mode === 'ic') return 'IC';
	            if (mode === 'en') return 'EN';
	            if (mode === 'rj') return 'RJ';
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
