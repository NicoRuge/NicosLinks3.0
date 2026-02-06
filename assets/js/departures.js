const DeparturesView = {
    template: `
        <div class="container-fluid">
            <div class="row justify-content-center">
                <div class="col-lg-8">
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
                    <div v-if="station && !loading" class="card shadow-sm border-0">
                        <div class="card-header bg-body-tertiary border-0 py-3">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-train-front text-primary me-2 lead"></i>
                                <h2 class="h5 mb-0">Departures from {{ station.name }}</h2>
                                <button class="btn btn-sm btn-outline-primary ms-auto" @click="refreshDepartures" title="Refresh">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover mb-0 align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th scope="col">Line</th>
                                        <th scope="col">Destination</th>
                                        <th scope="col">Platform</th>
                                        <th scope="col" class="text-end">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="departures.length === 0">
                                        <td colspan="4" class="text-center py-4 text-secondary">
                                            No departures found in the next 60 minutes.
                                        </td>
                                    </tr>
                                    <tr v-for="dep in departures" :key="dep.tripId + dep.line.name">
                                        <td>
                                            <span class="badge rounded-pill fw-bold" :class="getLineClass(dep.line)">
                                                {{ dep.line.name || '?' }}
                                            </span>
                                        </td>
                                        <td class="fw-medium">{{ dep.direction }}</td>
                                        <td>{{ dep.platform || dep.plannedPlatform || '-' }}</td>
                                        <td class="text-end">
                                            <div class="d-flex flex-column align-items-end">
                                                <span class="fw-bold">{{ formatTime(dep.when || dep.plannedWhen) }}</span>
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
            loading: false,
            error: null,
            debounceTimeout: null
        };
    },
    methods: {
        onInput() {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.searchStations();
            }, 300);
        },
        async searchStations() {
            if (!this.query || this.query.length < 2) {
                this.suggestions = [];
                return;
            }

            try {
                const response = await fetch(`https://v6.db.transport.rest/locations?query=${encodeURIComponent(this.query)}&results=5&stops=true&addresses=false&poi=false`);
                if (!response.ok) throw new Error('Failed to fetch stations');
                this.suggestions = await response.json();
            } catch (err) {
                console.error(err);
                // Fail silently for autocomplete
            }
        },
        selectStation(station) {
            this.station = station;
            this.query = station.name;
            this.suggestions = [];
            this.getDepartures(station.id);
        },
        clearSearch() {
            this.query = '';
            this.suggestions = [];
            this.station = null;
            this.departures = [];
            this.error = null;
        },
        async getDepartures(stationId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(`https://v6.db.transport.rest/stops/${stationId}/departures?results=10&duration=60`);
                if (!response.ok) throw new Error('Failed to load departures');
                const data = await response.json();
                this.departures = data.departures || data;
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
        formatTime(isoString) {
            if (!isoString) return '';
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        getDelay(dep) {
            // delay is in seconds
            return dep.delay ? Math.floor(dep.delay / 60) : 0;
        },
        getLineClass(line) {
            // Returns Bootstrap 5 Badge classes
            if (line.product === 'subway' || line.product === 'subway-train') return 'text-bg-primary';
            if (line.product === 'suburban' || line.product === 's-bahn') return 'text-bg-success';
            if (line.product === 'tram') return 'text-bg-danger';
            if (line.product === 'bus') return 'text-bg-info text-white';
            if (line.product === 'regional' || line.product === 'express' || line.product === 'nationalExpress' || line.product === 'national') return 'text-bg-dark';
            return 'text-bg-secondary';
        }
    }
};
