const ClickerView = {
    template: `
    <div class="clicker-page container-fluid px-3 px-lg-4 py-4">

        <!-- Focus-mode toggle (desktop only, always visible) -->
        <button
            class="clicker-focus-btn d-none d-lg-flex"
            @click="toggleFocusMode"
            :title="focusMode ? 'Show sidebar & header' : 'Focus mode: hide sidebar & header'"
        >
            <i class="bi" :class="focusMode ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset-reverse'"></i>
        </button>

        <!-- Hero -->
        <section v-show="!focusMode" class="portfolio-hero rounded-4 p-4 p-lg-5 mb-4">
            <div class="row align-items-center">
                <div class="col-12 col-lg-9">
                    <h1 class="hero-title mb-2">Code Clicker</h1>
                    <p class="hero-subtitle mb-0">Build your software empire one line at a time. Click to write code, hire developers, and unlock powerful upgrades!</p>
                </div>
                <div class="col-12 col-lg-3 text-lg-end mt-3 mt-lg-0">
                    <button class="btn btn-sm btn-outline-danger" @click="resetGame">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                    </button>
                </div>
            </div>
        </section>

        <!-- Game layout -->
        <div class="row g-4">

            <!-- Left column: stats + click button + milestones -->
            <div class="col-12 col-lg-4">

                <!-- LOC counter card -->
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4">
                        <div class="text-center mb-3">
                            <div class="clicker-loc-display">{{ formatLoc(loc) }}</div>
                            <div class="clicker-loc-label">lines of code</div>
                        </div>
                        <div class="clicker-stats-grid">
                            <div class="clicker-stat-item">
                                <i class="bi bi-clock me-1 text-body-secondary"></i>
                                <span class="clicker-stat-value">{{ formatNum(locPerSecond) }}</span>
                                <span class="clicker-stat-unit">LOC/sec</span>
                            </div>
                            <div class="clicker-stat-item">
                                <i class="bi bi-cursor me-1 text-body-secondary"></i>
                                <span class="clicker-stat-value">{{ formatNum(locPerClick) }}</span>
                                <span class="clicker-stat-unit">LOC/click</span>
                            </div>
                            <div class="clicker-stat-item clicker-stat-full">
                                <i class="bi bi-graph-up me-1 text-body-secondary"></i>
                                <span class="clicker-stat-value">{{ formatNum(totalLoc) }}</span>
                                <span class="clicker-stat-unit">total written</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Click button card -->
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4 text-center">
                        <div class="clicker-btn-outer position-relative d-inline-flex align-items-center justify-content-center">
                            <button class="clicker-btn" @click="handleClick">
                                <i class="bi bi-code-slash clicker-btn-icon"></i>
                            </button>
                            <div class="float-texts-layer" aria-hidden="true">
                                <div
                                    v-for="f in floatingTexts"
                                    :key="f.id"
                                    class="float-text"
                                    :style="{ '--fx': f.x + 'px' }"
                                >{{ f.text }}</div>
                            </div>
                        </div>
                        <div class="mt-3 small text-body-secondary">Click to write code!</div>
                    </div>
                </div>

                <!-- Milestones card -->
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <h6 class="fw-semibold mb-3">
                            <i class="bi bi-trophy-fill text-warning me-2"></i>Milestones
                        </h6>
                        <div class="milestones-list">
                            <div
                                v-for="m in milestones"
                                :key="m.id"
                                class="clicker-milestone d-flex align-items-center gap-2 py-2"
                            >
                                <i class="bi flex-shrink-0"
                                    :class="m.achieved ? 'bi-check-circle-fill text-success' : 'bi-circle text-body-secondary'"
                                ></i>
                                <div class="flex-grow-1 min-w-0">
                                    <div class="small fw-semibold" :class="{ 'text-body-secondary': !m.achieved }">
                                        {{ m.name }}
                                    </div>
                                    <div class="clicker-tiny text-body-secondary">
                                        {{ m.achieved ? m.desc : formatNum(m.req) + ' LOC total' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right column: upgrades + buildings -->
            <div class="col-12 col-lg-8">

                <!-- Available Upgrades -->
                <div v-if="availableUpgrades.length > 0" class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4">
                        <h5 class="fw-semibold mb-3">
                            <i class="bi bi-stars me-2 text-warning"></i>Available Upgrades
                        </h5>
                        <div class="row g-2">
                            <div v-for="u in availableUpgrades" :key="u.id" class="col-12 col-sm-6 col-xl-4">
                                <button
                                    class="clicker-upgrade-card w-100 text-start"
                                    :class="canAfford(u.cost) ? 'upgrade-can-buy' : 'upgrade-cant-buy'"
                                    @click="buyUpgrade(u)"
                                    :disabled="!canAfford(u.cost)"
                                >
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="clicker-upg-icon">
                                            <i class="bi" :class="u.icon"></i>
                                        </div>
                                        <div class="flex-grow-1 min-w-0">
                                            <div class="fw-semibold clicker-tiny2 text-truncate">{{ u.name }}</div>
                                            <div class="clicker-tiny text-body-secondary">{{ u.desc }}</div>
                                            <div class="clicker-tiny fw-bold mt-1" :class="canAfford(u.cost) ? 'text-success' : 'text-danger'">
                                                {{ formatNum(u.cost) }} LOC
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Buildings list -->
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <h5 class="fw-semibold mb-3">
                            <i class="bi bi-building me-2"></i>Hire &amp; Build
                        </h5>
                        <div class="clicker-buildings">
                            <div
                                v-for="b in buildings"
                                :key="b.id"
                                class="clicker-building-row d-flex align-items-center gap-3 p-3 rounded-3 mb-2"
                                :class="{
                                    'building-can-buy': canAfford(buildingCost(b)),
                                    'building-owned': b.count > 0
                                }"
                            >
                                <div class="clicker-bld-icon">
                                    <i class="bi" :class="b.icon"></i>
                                </div>
                                <div class="flex-grow-1 min-w-0">
                                    <div class="d-flex align-items-center justify-content-between gap-2">
                                        <div class="fw-semibold small text-truncate">{{ b.name }}</div>
                                        <span
                                            class="badge rounded-pill clicker-count-badge flex-shrink-0"
                                            :class="b.count > 0 ? 'bg-primary' : 'bg-secondary'"
                                        >{{ b.count }}</span>
                                    </div>
                                    <div class="clicker-tiny text-body-secondary">{{ b.desc }}</div>
                                    <div class="d-flex align-items-center justify-content-between mt-1 gap-2">
                                        <div class="clicker-tiny text-body-secondary">
                                            {{ formatNum(b.baseLps * b.mult) }} LOC/s each
                                            <span v-if="b.count > 0" class="ms-1 opacity-60">
                                                &rarr; {{ formatNum(b.baseLps * b.mult * b.count) }}/s total
                                            </span>
                                        </div>
                                        <button
                                            class="btn btn-sm clicker-buy-btn flex-shrink-0"
                                            :class="canAfford(buildingCost(b)) ? 'btn-primary' : 'btn-outline-secondary'"
                                            @click="buyBuilding(b)"
                                            :disabled="!canAfford(buildingCost(b))"
                                        >
                                            <i class="bi bi-plus-lg me-1"></i>{{ formatNum(buildingCost(b)) }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Purchased upgrades -->
                        <div v-if="boughtUpgrades.length > 0" class="mt-4 pt-3 border-top">
                            <div class="clicker-tiny text-body-secondary fw-semibold mb-2 text-uppercase" style="letter-spacing:0.07em;">
                                <i class="bi bi-check2-all me-1"></i>Purchased Upgrades
                            </div>
                            <div class="d-flex flex-wrap gap-2">
                                <span
                                    v-for="u in boughtUpgrades"
                                    :key="u.id"
                                    class="badge bg-success-subtle text-success border border-success-subtle rounded-pill"
                                    style="font-size:0.72rem;"
                                >
                                    <i class="bi me-1" :class="u.icon"></i>{{ u.name }}
                                </span>
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
            focusMode: false,
            loc: 0,
            totalLoc: 0,
            locPerClick: 1,
            floatingTexts: [],
            floatId: 0,
            tickCount: 0,
            gameLoopRef: null,

            buildings: [
                {
                    id: 'junior', name: 'Junior Dev', icon: 'bi-person-fill',
                    desc: 'A fresh grad writing their first Hello World',
                    baseCost: 15, baseLps: 0.1, count: 0, mult: 1
                },
                {
                    id: 'coffee', name: 'Coffee Machine', icon: 'bi-cup-hot-fill',
                    desc: 'Fuels your developers around the clock',
                    baseCost: 100, baseLps: 0.5, count: 0, mult: 1
                },
                {
                    id: 'senior', name: 'Senior Dev', icon: 'bi-person-badge-fill',
                    desc: 'Writes clean code (sometimes)',
                    baseCost: 500, baseLps: 3, count: 0, mult: 1
                },
                {
                    id: 'ide', name: 'IDE Plugin', icon: 'bi-plug-fill',
                    desc: 'Autocomplete everything, even the bugs',
                    baseCost: 2000, baseLps: 10, count: 0, mult: 1
                },
                {
                    id: 'review', name: 'Review Bot', icon: 'bi-robot',
                    desc: 'Reviews pull requests at machine speed',
                    baseCost: 10000, baseLps: 40, count: 0, mult: 1
                },
                {
                    id: 'ai', name: 'AI Assistant', icon: 'bi-cpu-fill',
                    desc: '10x developer, 100x the budget',
                    baseCost: 50000, baseLps: 150, count: 0, mult: 1
                },
                {
                    id: 'server', name: 'Server Farm', icon: 'bi-hdd-rack-fill',
                    desc: 'Distributed parallel code generation',
                    baseCost: 250000, baseLps: 500, count: 0, mult: 1
                },
                {
                    id: 'offshore', name: 'Offshore Team', icon: 'bi-globe',
                    desc: '24/7 coding across all timezones',
                    baseCost: 1000000, baseLps: 1500, count: 0, mult: 1
                },
                {
                    id: 'quantum', name: 'Quantum Compiler', icon: 'bi-lightning-fill',
                    desc: 'Writes code in superposition states',
                    baseCost: 5000000, baseLps: 5000, count: 0, mult: 1
                },
                {
                    id: 'time', name: 'Time Traveler', icon: 'bi-clock-history',
                    desc: 'Commits code pulled from the future',
                    baseCost: 25000000, baseLps: 15000, count: 0, mult: 1
                },
                {
                    id: 'singularity', name: 'The Singularity', icon: 'bi-infinity',
                    desc: 'Code writes itself. You are merely a witness.',
                    baseCost: 150000000, baseLps: 60000, count: 0, mult: 1
                },
            ],

            upgrades: [
                // ── Click upgrades ──────────────────────────────────────────────
                {
                    id: 'keyboard1', name: 'Better Keyboard', cost: 100,
                    icon: 'bi-keyboard-fill', type: 'click', mult: 2, bought: false,
                    desc: 'Double your typing speed',
                    unlockType: 'totalLoc', unlockVal: 50
                },
                {
                    id: 'keyboard2', name: 'Mechanical Keyboard', cost: 500,
                    icon: 'bi-keyboard-fill', type: 'click', mult: 2, bought: false,
                    desc: 'Clicky satisfaction → 2× click',
                    unlockType: 'totalLoc', unlockVal: 200
                },
                {
                    id: 'keyboard3', name: 'Custom Keycaps', cost: 2500,
                    icon: 'bi-keyboard-fill', type: 'click', mult: 2, bought: false,
                    desc: 'Pure RGB energy → 2× click',
                    unlockType: 'totalLoc', unlockVal: 1000
                },
                {
                    id: 'darkmode', name: 'Enable Dark Mode', cost: 5000,
                    icon: 'bi-moon-fill', type: 'click', mult: 1.5, bought: false,
                    desc: 'The true dev experience → 1.5× click',
                    unlockType: 'totalLoc', unlockVal: 2500
                },
                {
                    id: 'chair', name: 'Ergonomic Chair', cost: 12500,
                    icon: 'bi-person-raised-hand', type: 'click', mult: 2, bought: false,
                    desc: 'Back support unlocks peak performance → 2× click',
                    unlockType: 'totalLoc', unlockVal: 7500
                },
                {
                    id: 'standing_desk', name: 'Standing Desk', cost: 62500,
                    icon: 'bi-columns-gap', type: 'click', mult: 2, bought: false,
                    desc: 'Stand and deliver → 2× click',
                    unlockType: 'totalLoc', unlockVal: 35000
                },
                {
                    id: 'ultra_monitor', name: 'Ultrawide Monitor', cost: 200000,
                    icon: 'bi-display-fill', type: 'click', mult: 2, bought: false,
                    desc: 'More screen = more code → 2× click',
                    unlockType: 'totalLoc', unlockVal: 120000
                },
                {
                    id: 'bci', name: 'Brain-Computer Interface', cost: 800000,
                    icon: 'bi-broadcast', type: 'click', mult: 3, bought: false,
                    desc: 'Thought-to-code → 3× click',
                    unlockType: 'totalLoc', unlockVal: 500000
                },

                // ── Junior Dev upgrades ─────────────────────────────────────────
                {
                    id: 'jun1', name: 'Code Bootcamp', cost: 200,
                    icon: 'bi-person-fill', type: 'building', target: 'junior', mult: 2, bought: false,
                    desc: 'Junior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'junior', count: 1 }
                },
                {
                    id: 'jun2', name: 'Mentorship Program', cost: 2500,
                    icon: 'bi-person-fill', type: 'building', target: 'junior', mult: 2, bought: false,
                    desc: 'Junior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'junior', count: 5 }
                },
                {
                    id: 'jun3', name: 'Stack Overflow Pro', cost: 25000,
                    icon: 'bi-person-fill', type: 'building', target: 'junior', mult: 2, bought: false,
                    desc: 'Junior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'junior', count: 10 }
                },
                {
                    id: 'jun4', name: 'Pair Programming', cost: 250000,
                    icon: 'bi-person-fill', type: 'building', target: 'junior', mult: 2, bought: false,
                    desc: 'Junior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'junior', count: 25 }
                },
                {
                    id: 'jun5', name: 'Self-Teaching AI', cost: 5000000,
                    icon: 'bi-person-fill', type: 'building', target: 'junior', mult: 2, bought: false,
                    desc: 'Junior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'junior', count: 50 }
                },

                // ── Coffee Machine upgrades ─────────────────────────────────────
                {
                    id: 'cof1', name: 'Espresso Machine', cost: 1500,
                    icon: 'bi-cup-hot-fill', type: 'building', target: 'coffee', mult: 2, bought: false,
                    desc: 'Coffee Machines twice as strong',
                    unlockType: 'building', unlockVal: { id: 'coffee', count: 1 }
                },
                {
                    id: 'cof2', name: 'Cold Brew Setup', cost: 20000,
                    icon: 'bi-cup-hot-fill', type: 'building', target: 'coffee', mult: 2, bought: false,
                    desc: 'Coffee Machines twice as strong',
                    unlockType: 'building', unlockVal: { id: 'coffee', count: 5 }
                },
                {
                    id: 'cof3', name: 'IV Caffeine Drip', cost: 250000,
                    icon: 'bi-cup-hot-fill', type: 'building', target: 'coffee', mult: 2, bought: false,
                    desc: 'Coffee Machines twice as strong',
                    unlockType: 'building', unlockVal: { id: 'coffee', count: 10 }
                },
                {
                    id: 'cof4', name: 'Liquid Caffeine Nanobots', cost: 3000000,
                    icon: 'bi-cup-hot-fill', type: 'building', target: 'coffee', mult: 2, bought: false,
                    desc: 'Coffee Machines twice as strong',
                    unlockType: 'building', unlockVal: { id: 'coffee', count: 25 }
                },

                // ── Senior Dev upgrades ─────────────────────────────────────────
                {
                    id: 'sen1', name: 'Clean Code Book', cost: 10000,
                    icon: 'bi-person-badge-fill', type: 'building', target: 'senior', mult: 2, bought: false,
                    desc: 'Senior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'senior', count: 1 }
                },
                {
                    id: 'sen2', name: 'Architecture Diagrams', cost: 100000,
                    icon: 'bi-person-badge-fill', type: 'building', target: 'senior', mult: 2, bought: false,
                    desc: 'Senior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'senior', count: 5 }
                },
                {
                    id: 'sen3', name: 'Tech Lead Promotion', cost: 1000000,
                    icon: 'bi-person-badge-fill', type: 'building', target: 'senior', mult: 2, bought: false,
                    desc: 'Senior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'senior', count: 10 }
                },
                {
                    id: 'sen4', name: 'Principal Engineer Status', cost: 20000000,
                    icon: 'bi-person-badge-fill', type: 'building', target: 'senior', mult: 2, bought: false,
                    desc: 'Senior Devs twice as productive',
                    unlockType: 'building', unlockVal: { id: 'senior', count: 25 }
                },

                // ── IDE Plugin upgrades ─────────────────────────────────────────
                {
                    id: 'ide1', name: 'Copilot Integration', cost: 40000,
                    icon: 'bi-plug-fill', type: 'building', target: 'ide', mult: 2, bought: false,
                    desc: 'IDE Plugins twice as fast',
                    unlockType: 'building', unlockVal: { id: 'ide', count: 1 }
                },
                {
                    id: 'ide2', name: 'IntelliSense++', cost: 450000,
                    icon: 'bi-plug-fill', type: 'building', target: 'ide', mult: 2, bought: false,
                    desc: 'IDE Plugins twice as fast',
                    unlockType: 'building', unlockVal: { id: 'ide', count: 5 }
                },
                {
                    id: 'ide3', name: 'Full Code Generation', cost: 5000000,
                    icon: 'bi-plug-fill', type: 'building', target: 'ide', mult: 2, bought: false,
                    desc: 'IDE Plugins twice as fast',
                    unlockType: 'building', unlockVal: { id: 'ide', count: 10 }
                },
                {
                    id: 'ide4', name: 'Zero-Bug Compiler', cost: 75000000,
                    icon: 'bi-plug-fill', type: 'building', target: 'ide', mult: 2, bought: false,
                    desc: 'IDE Plugins twice as fast',
                    unlockType: 'building', unlockVal: { id: 'ide', count: 25 }
                },

                // ── Review Bot upgrades ─────────────────────────────────────────
                {
                    id: 'rev1', name: 'ML Linter', cost: 200000,
                    icon: 'bi-robot', type: 'building', target: 'review', mult: 2, bought: false,
                    desc: 'Review Bots twice as thorough',
                    unlockType: 'building', unlockVal: { id: 'review', count: 1 }
                },
                {
                    id: 'rev2', name: 'Security Scanner', cost: 2500000,
                    icon: 'bi-robot', type: 'building', target: 'review', mult: 2, bought: false,
                    desc: 'Review Bots twice as thorough',
                    unlockType: 'building', unlockVal: { id: 'review', count: 5 }
                },
                {
                    id: 'rev3', name: '100% Test Coverage', cost: 30000000,
                    icon: 'bi-robot', type: 'building', target: 'review', mult: 2, bought: false,
                    desc: 'Review Bots twice as thorough',
                    unlockType: 'building', unlockVal: { id: 'review', count: 10 }
                },

                // ── AI Assistant upgrades ───────────────────────────────────────
                {
                    id: 'ai1', name: 'Larger Context Window', cost: 1000000,
                    icon: 'bi-cpu-fill', type: 'building', target: 'ai', mult: 2, bought: false,
                    desc: 'AI Assistants twice as capable',
                    unlockType: 'building', unlockVal: { id: 'ai', count: 1 }
                },
                {
                    id: 'ai2', name: 'Fine-tuned Model', cost: 12000000,
                    icon: 'bi-cpu-fill', type: 'building', target: 'ai', mult: 2, bought: false,
                    desc: 'AI Assistants twice as capable',
                    unlockType: 'building', unlockVal: { id: 'ai', count: 5 }
                },
                {
                    id: 'ai3', name: 'AGI Preview Access', cost: 150000000,
                    icon: 'bi-cpu-fill', type: 'building', target: 'ai', mult: 3, bought: false,
                    desc: 'AI Assistants 3× as capable',
                    unlockType: 'building', unlockVal: { id: 'ai', count: 10 }
                },

                // ── Server Farm upgrades ────────────────────────────────────────
                {
                    id: 'srv1', name: 'NVMe SSDs', cost: 5000000,
                    icon: 'bi-hdd-rack-fill', type: 'building', target: 'server', mult: 2, bought: false,
                    desc: 'Server Farms twice as fast',
                    unlockType: 'building', unlockVal: { id: 'server', count: 1 }
                },
                {
                    id: 'srv2', name: 'Fiber Backbone', cost: 60000000,
                    icon: 'bi-hdd-rack-fill', type: 'building', target: 'server', mult: 2, bought: false,
                    desc: 'Server Farms twice as fast',
                    unlockType: 'building', unlockVal: { id: 'server', count: 5 }
                },
                {
                    id: 'srv3', name: 'Liquid Nitrogen Cooling', cost: 600000000,
                    icon: 'bi-hdd-rack-fill', type: 'building', target: 'server', mult: 2, bought: false,
                    desc: 'Server Farms twice as fast',
                    unlockType: 'building', unlockVal: { id: 'server', count: 10 }
                },

                // ── Offshore Team upgrades ──────────────────────────────────────
                {
                    id: 'off1', name: 'Global Talent Network', cost: 20000000,
                    icon: 'bi-globe', type: 'building', target: 'offshore', mult: 2, bought: false,
                    desc: 'Offshore Teams twice as productive',
                    unlockType: 'building', unlockVal: { id: 'offshore', count: 1 }
                },
                {
                    id: 'off2', name: 'Async Communication', cost: 250000000,
                    icon: 'bi-globe', type: 'building', target: 'offshore', mult: 2, bought: false,
                    desc: 'Offshore Teams twice as productive',
                    unlockType: 'building', unlockVal: { id: 'offshore', count: 5 }
                },

                // ── Quantum Compiler upgrades ───────────────────────────────────
                {
                    id: 'qua1', name: 'Qubit Stabilizers', cost: 100000000,
                    icon: 'bi-lightning-fill', type: 'building', target: 'quantum', mult: 2, bought: false,
                    desc: 'Quantum Compilers twice as powerful',
                    unlockType: 'building', unlockVal: { id: 'quantum', count: 1 }
                },
                {
                    id: 'qua2', name: 'Error Correction Codes', cost: 1500000000,
                    icon: 'bi-lightning-fill', type: 'building', target: 'quantum', mult: 2, bought: false,
                    desc: 'Quantum Compilers twice as powerful',
                    unlockType: 'building', unlockVal: { id: 'quantum', count: 5 }
                },

                // ── Global upgrades ─────────────────────────────────────────────
                {
                    id: 'opensource', name: 'Open Source Everything', cost: 500000,
                    icon: 'bi-github', type: 'global', mult: 2, bought: false,
                    desc: 'All buildings 2× more productive',
                    unlockType: 'totalLoc', unlockVal: 300000
                },
                {
                    id: 'agile', name: 'Go Agile', cost: 2500000,
                    icon: 'bi-arrow-repeat', type: 'global', mult: 1.5, bought: false,
                    desc: 'All buildings 1.5× more productive',
                    unlockType: 'totalLoc', unlockVal: 1500000
                },
                {
                    id: 'ci_cd', name: 'CI/CD Pipeline', cost: 10000000,
                    icon: 'bi-gear-fill', type: 'global', mult: 2, bought: false,
                    desc: 'All buildings 2× more productive',
                    unlockType: 'totalLoc', unlockVal: 8000000
                },
                {
                    id: 'microservices', name: 'Microservices Arch.', cost: 50000000,
                    icon: 'bi-diagram-3-fill', type: 'global', mult: 3, bought: false,
                    desc: 'All buildings 3× more productive',
                    unlockType: 'totalLoc', unlockVal: 30000000
                },
                {
                    id: 'kubernetes', name: 'Kubernetes Cluster', cost: 250000000,
                    icon: 'bi-cloud-fill', type: 'global', mult: 2, bought: false,
                    desc: 'All buildings 2× more productive',
                    unlockType: 'totalLoc', unlockVal: 150000000
                },
                {
                    id: 'blockchain', name: 'Put it on Blockchain', cost: 1000000000,
                    icon: 'bi-link-45deg', type: 'global', mult: 2, bought: false,
                    desc: 'All buildings 2× more productive (somehow)',
                    unlockType: 'totalLoc', unlockVal: 600000000
                },
            ],

            milestones: [
                { id: 'm0', name: 'Hello World', desc: 'You wrote your first line of code', req: 1, achieved: false },
                { id: 'm1', name: 'Intern', desc: 'Making yourself useful', req: 100, achieved: false },
                { id: 'm2', name: 'Junior Developer', desc: 'Stack Overflow copy-paster', req: 1000, achieved: false },
                { id: 'm3', name: 'Git Initiate', desc: 'git commit -m "fix"', req: 10000, achieved: false },
                { id: 'm4', name: 'Open Source Contributor', desc: 'One PR merged!', req: 100000, achieved: false },
                { id: 'm5', name: 'Senior Developer', desc: 'You have opinions about tabs vs spaces', req: 1000000, achieved: false },
                { id: 'm6', name: 'Tech Lead', desc: 'Half your time is now in meetings', req: 10000000, achieved: false },
                { id: 'm7', name: 'CTO', desc: 'You no longer write code. Tragic.', req: 100000000, achieved: false },
                { id: 'm8', name: 'Unicorn Founder', desc: 'Your startup is valued at $1B', req: 1000000000, achieved: false },
                { id: 'm9', name: 'Software Titan', desc: 'Your codebase has more lines than Wikipedia', req: 10000000000, achieved: false },
            ],
        }
    },

    computed: {
        locPerSecond() {
            return this.buildings.reduce((total, b) => total + b.baseLps * b.count * b.mult, 0)
        },
        availableUpgrades() {
            return this.upgrades.filter(u => !u.bought && this.isUnlocked(u))
        },
        boughtUpgrades() {
            return this.upgrades.filter(u => u.bought)
        },
    },

    mounted() {
        this.loadGame()
        this.gameLoopRef = setInterval(() => this.tick(), 100)
    },

    beforeUnmount() {
        clearInterval(this.gameLoopRef)
        document.body.classList.remove('clicker-focus')
    },

    methods: {
        tick() {
            const gain = this.locPerSecond / 10
            if (gain > 0) {
                this.loc += gain
                this.totalLoc += gain
            }
            // Clean up expired floating texts
            const now = Date.now()
            if (this.floatingTexts.length > 0) {
                this.floatingTexts = this.floatingTexts.filter(f => now - f.time < 1200)
            }
            // Milestone check
            this.milestones.forEach(m => {
                if (!m.achieved && this.totalLoc >= m.req) m.achieved = true
            })
            // Auto-save every ~30s (300 ticks)
            this.tickCount++
            if (this.tickCount % 300 === 0) this.saveGame()
        },

        handleClick(event) {
            const gain = this.locPerClick
            this.loc += gain
            this.totalLoc += gain
            // Spawn floating text
            const x = (Math.random() - 0.5) * 100
            this.floatingTexts.push({
                id: ++this.floatId,
                text: '+' + this.formatNum(gain),
                x,
                time: Date.now(),
            })
            // Keep array from growing unbounded
            if (this.floatingTexts.length > 15) this.floatingTexts.shift()
        },

        isUnlocked(upgrade) {
            if (upgrade.unlockType === 'totalLoc') {
                return this.totalLoc >= upgrade.unlockVal
            }
            if (upgrade.unlockType === 'building') {
                const b = this.buildings.find(b => b.id === upgrade.unlockVal.id)
                return b && b.count >= upgrade.unlockVal.count
            }
            return false
        },

        buildingCost(building) {
            return Math.ceil(building.baseCost * Math.pow(1.15, building.count))
        },

        canAfford(cost) {
            return this.loc >= cost
        },

        buyBuilding(building) {
            const cost = this.buildingCost(building)
            if (!this.canAfford(cost)) return
            this.loc -= cost
            building.count++
            this.saveGame()
        },

        buyUpgrade(upgrade) {
            if (!this.canAfford(upgrade.cost)) return
            this.loc -= upgrade.cost
            upgrade.bought = true
            this.applyUpgrade(upgrade)
            this.saveGame()
        },

        applyUpgrade(upgrade) {
            if (upgrade.type === 'click') {
                this.locPerClick *= upgrade.mult
            } else if (upgrade.type === 'building') {
                const b = this.buildings.find(b => b.id === upgrade.target)
                if (b) b.mult *= upgrade.mult
            } else if (upgrade.type === 'global') {
                this.buildings.forEach(b => b.mult *= upgrade.mult)
            }
        },

        formatNum(n) {
            if (n < 1) return n.toFixed(2)
            if (n < 1000) return Math.floor(n).toLocaleString()
            if (n < 1e6) return (n / 1e3).toFixed(1) + 'k'
            if (n < 1e9) return (n / 1e6).toFixed(2) + 'M'
            if (n < 1e12) return (n / 1e9).toFixed(2) + 'B'
            return (n / 1e12).toFixed(2) + 'T'
        },

        formatLoc(n) {
            if (n < 100) return n.toFixed(1)
            return this.formatNum(n)
        },

        saveGame() {
            try {
                const state = {
                    loc: this.loc,
                    totalLoc: this.totalLoc,
                    locPerClick: this.locPerClick,
                    buildings: this.buildings.map(b => ({ id: b.id, count: b.count, mult: b.mult })),
                    upgrades: this.upgrades.map(u => ({ id: u.id, bought: u.bought })),
                    milestones: this.milestones.map(m => ({ id: m.id, achieved: m.achieved })),
                }
                localStorage.setItem('nicoslinks_clicker', JSON.stringify(state))
            } catch (e) { /* storage unavailable */ }
        },

        loadGame() {
            try {
                const raw = localStorage.getItem('nicoslinks_clicker')
                if (!raw) return
                const state = JSON.parse(raw)
                this.loc = state.loc || 0
                this.totalLoc = state.totalLoc || 0
                this.locPerClick = state.locPerClick || 1

                if (state.buildings) {
                    state.buildings.forEach(sb => {
                        const b = this.buildings.find(b => b.id === sb.id)
                        if (b) { b.count = sb.count || 0; b.mult = sb.mult || 1 }
                    })
                }
                if (state.upgrades) {
                    state.upgrades.forEach(su => {
                        const u = this.upgrades.find(u => u.id === su.id)
                        if (u && su.bought) u.bought = true
                    })
                }
                if (state.milestones) {
                    state.milestones.forEach(sm => {
                        const m = this.milestones.find(m => m.id === sm.id)
                        if (m) m.achieved = sm.achieved || false
                    })
                }
            } catch (e) { /* corrupt save – start fresh */ }
        },

        toggleFocusMode() {
            this.focusMode = !this.focusMode
            document.body.classList.toggle('clicker-focus', this.focusMode)
        },

        resetGame() {
            if (!confirm('Reset all progress? This cannot be undone.')) return
            localStorage.removeItem('nicoslinks_clicker')
            this.loc = 0
            this.totalLoc = 0
            this.locPerClick = 1
            this.tickCount = 0
            this.floatingTexts = []
            this.buildings.forEach(b => { b.count = 0; b.mult = 1 })
            this.upgrades.forEach(u => { u.bought = false })
            this.milestones.forEach(m => { m.achieved = false })
        },
    },
}
