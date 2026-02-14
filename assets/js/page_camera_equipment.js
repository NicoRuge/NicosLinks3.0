const CameraEquipmentView = {
    data() {
        return {
            affiliateNoticeLanguage: 'de',
            cameras: [
                { name: 'Sony Alpha 7 III', detail: 'ILCE-7M3', affiliateUrl: 'https://amzn.to/4atHut9' },
                { name: 'Praktica Mat', detail: '35mm (ca. 1965)', affiliateUrl: '' },
                { name: 'Polaroid Supercolor 635CL', detail: '(ca. 1981)', affiliateUrl: '' },
                { name: 'Google Pixel 9 Pro', detail: '', affiliateUrl: 'https://amzn.to/46y93jM' }
            ],
            lenses: [
                { name: 'Sony FE 70-200mm f/4 G OSS', detail: '', affiliateUrl: 'https://amzn.to/4tswZim' },
                { name: 'Sigma Makro 105mm f/2.8 DG OS HSM', detail: '', affiliateUrl: 'https://amzn.to/4cuZp5f' },
                { name: 'Sony FE 28-70 f/3.5-5.6', detail: '', affiliateUrl: '' },
                { name: 'Samyang T1.5 24mm ED AS IF UMC II', detail: '', affiliateUrl: 'https://amzn.to/4asct8Y' }
            ],
            storageInCamera: [
                { name: 'RAW - SanDisk Extreme Pro 256 GB', detail: '', affiliateUrl: 'https://amzn.to/4tJrR9V' },
                { name: 'JPEG - SanDisk Ultra 32 GB', detail: '', affiliateUrl: 'https://amzn.to/4ahPuyv' }
            ],
            storageExternal: [
                { name: 'Samsung T7 500 GB', detail: '', affiliateUrl: 'https://amzn.to/4qEVPJn' },
                { name: 'WD MyBook 4 TB', detail: '', affiliateUrl: '' },
                { name: 'Google Photos', detail: '', affiliateUrl: '' }
            ],
            flashItems: [
                { name: 'Yongnou Speedlite YN560 IV', detail: '', affiliateUrl: 'https://amzn.to/4kKcb24' }
            ],
            software: [
                { name: 'Affinity', detail: '', affiliateUrl: '' },
                { name: 'Adobe Lightroom Classic', detail: '', affiliateUrl: '' },
                { name: 'Adobe Photoshop', detail: '', affiliateUrl: '' }
            ]
        };
    },
    methods: {
        hasAffiliateUrl(item) {
            return !!(item && item.affiliateUrl && item.affiliateUrl.trim());
        },
        setAffiliateNoticeLanguage(language) {
            this.affiliateNoticeLanguage = language === 'en' ? 'en' : 'de';
        },
        getAffiliateNoticeText() {
            if (this.affiliateNoticeLanguage === 'en') {
                return 'Some links on this page are affiliate links. If you buy something through them, I may receive a small commission. The price stays the same for you.';
            }

            return 'Einige der Links auf dieser Seite sind Affiliate Links. Wenn du darüber etwas kaufst, bekomme ich eine kleine Provision. Der Preis für dich bleibt gleich.';
        }
    },
    template: `
        <div class="container-fluid px-4 py-5">
            <h1 class="display-5 fw-bold mb-5">Camera Equipment</h1>
            <div class="alert alert-secondary py-2 px-3 mb-4 small" role="note">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                    <div>
                        <i class="bi bi-info-circle me-2"></i>
                        {{ getAffiliateNoticeText() }}
                        <a href="#privacy-policy-main" class="ms-1">{{ affiliateNoticeLanguage === 'de' ? 'Hier geht es zur Datenschutzerklaerung.' : 'See the Privacy Policy here.' }}</a>
                    </div>
                    <div class="btn-group btn-group-sm" role="group" aria-label="Affiliate notice language">
                        <button type="button" class="btn" :class="affiliateNoticeLanguage === 'de' ? 'btn-secondary' : 'btn-outline-secondary'" @click="setAffiliateNoticeLanguage('de')">DE</button>
                        <button type="button" class="btn" :class="affiliateNoticeLanguage === 'en' ? 'btn-secondary' : 'btn-outline-secondary'" @click="setAffiliateNoticeLanguage('en')">EN</button>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <style>
                    .equipment-card {
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                        border: 1px solid var(--bs-border-color);
                        background-color: var(--bs-body-tertiary-bg);
                    }
                    .equipment-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                    }
                </style>

                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow equipment-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <span class="badge bg-primary rounded-3 text-white shadow-sm me-3 p-2">
                                    <i class="bi bi-camera fs-5"></i>
                                </span>
                                <h3 class="h5 mb-0 fw-bold">Cameras</h3>
                            </div>
                            <ul class="list-group list-group-flush bg-transparent">
                                <li v-for="item in cameras" :key="item.name" class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="d-flex align-items-start gap-2">
                                        <div class="flex-grow-1">
                                            <div class="fw-bold">{{ item.name }}</div>
                                            <small v-if="item.detail" class="text-secondary">{{ item.detail }}</small>
                                        </div>
                                        <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary">Amazon</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow equipment-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <span class="badge bg-success rounded-3 text-white shadow-sm me-3 p-2">
                                    <i class="bi bi-vinyl fs-5"></i>
                                </span>
                                <h3 class="h5 mb-0 fw-bold">Lenses</h3>
                            </div>
                            <ul class="list-group list-group-flush bg-transparent">
                                <li v-for="item in lenses" :key="item.name" class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="d-flex align-items-start gap-2">
                                        <div class="flex-grow-1">
                                            <div class="fw-bold">{{ item.name }}</div>
                                            <small v-if="item.detail" class="text-secondary">{{ item.detail }}</small>
                                        </div>
                                        <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary">Amazon</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow equipment-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <span class="badge bg-info rounded-3 text-white shadow-sm me-3 p-2">
                                    <i class="bi bi-hdd-fill fs-5"></i>
                                </span>
                                <h3 class="h5 mb-0 fw-bold">Storage</h3>
                            </div>
                            <div class="mb-3">
                                <h6 class="text-secondary text-uppercase small fw-bold mb-2">In-Camera</h6>
                                <ul class="list-group list-group-flush bg-transparent">
                                    <li v-for="item in storageInCamera" :key="item.name" class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="d-flex align-items-start gap-2">
                                            <div class="fw-bold small flex-grow-1">{{ item.name }}</div>
                                            <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary py-0 px-2">Amazon</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <hr class="my-3 opacity-10">
                            <div>
                                <h6 class="text-secondary text-uppercase small fw-bold mb-2">External</h6>
                                <ul class="list-group list-group-flush bg-transparent">
                                    <li v-for="item in storageExternal" :key="item.name" class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="d-flex align-items-start gap-2">
                                            <div class="fw-bold small flex-grow-1">{{ item.name }}</div>
                                            <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary py-0 px-2">Amazon</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-12 col-lg-4">
                    <div class="row g-4">
                        <div class="col-md-6 col-lg-12">
                            <div class="card shadow equipment-card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <span class="badge bg-warning rounded-3 text-dark shadow-sm me-3 p-2">
                                            <i class="bi bi-lightning-fill fs-5"></i>
                                        </span>
                                        <h3 class="h5 mb-0 fw-bold">Flash</h3>
                                    </div>
                                    <ul class="list-group list-group-flush bg-transparent">
                                        <li v-for="item in flashItems" :key="item.name" class="list-group-item bg-transparent border-0 px-0 py-1">
                                            <div class="d-flex align-items-start gap-2">
                                                <div class="small fw-bold flex-grow-1">{{ item.name }}</div>
                                                <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary py-0 px-2">Amazon</a>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-12">
                            <div class="card shadow equipment-card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <span class="badge bg-dark rounded-3 text-white shadow-sm me-3 p-2">
                                            <i class="bi bi-display fs-5"></i>
                                        </span>
                                        <h3 class="h5 mb-0 fw-bold">Software</h3>
                                    </div>
                                    <ul class="list-group list-group-flush bg-transparent">
                                        <li v-for="item in software" :key="item.name" class="list-group-item bg-transparent border-0 px-0 py-1 small">
                                            <div class="d-flex align-items-start gap-2">
                                                <div class="flex-grow-1">{{ item.name }}</div>
                                                <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary py-0 px-2">Amazon</a>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
