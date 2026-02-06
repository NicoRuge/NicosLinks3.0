const CameraEquipmentView = {
    template: `
        <div class="container-fluid px-4 py-5">
            <h1 class="display-5 fw-bold mb-5">Camera Equipment</h1>
            
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
                    .card-header-icon {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
                <!-- Cameras -->
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow equipment-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="card-header-icon bg-primary rounded-3 text-white shadow-sm me-3">
                                    <i class="bi bi-camera" style="font-size: 1.2rem;"></i>
                                </div>
                                <h3 class="h5 mb-0 fw-bold">Cameras</h3>
                            </div>
                            <ul class="list-group list-group-flush bg-transparent">
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Sony Alpha 7 III</div>
                                    <small class="text-secondary">ILCE-7M3</small>
                                </li>
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Praktica Mat</div>
                                    <small class="text-secondary">35mm (ca. 1965)</small>
                                </li>
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Polaroid Supercolor 635CL</div>
                                    <small class="text-secondary">(ca. 1981)</small>
                                </li>
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Google Pixel 9 Pro</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Lenses -->
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow equipment-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="card-header-icon bg-success rounded-3 text-white shadow-sm me-3">
                                    <i class="bi bi-vinyl" style="font-size: 1.2rem;"></i>
                                </div>
                                <h3 class="h5 mb-0 fw-bold">Lenses</h3>
                            </div>
                            <ul class="list-group list-group-flush bg-transparent">
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Sony FE 70-200mm f/4 G OSS</div>
                                    <small class="text-secondary">(SEL70200G)</small>
                                    <span class="badge rounded-pill bg-danger-subtle text-danger ms-1">Broken</span>
                                </li>
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Sigma Makro 105mm f/2.8 DG OS HSM</div>
                                </li>
                                <li class="list-group-item bg-transparent border-0 px-0 py-2">
                                    <div class="fw-bold">Sony FE 28-70 f/3.5-5.6</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Storage -->
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow equipment-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="card-header-icon bg-info rounded-3 text-white shadow-sm me-3">
                                    <i class="bi bi-hdd-fill" style="font-size: 1.2rem;"></i>
                                </div>
                                <h3 class="h5 mb-0 fw-bold">Storage</h3>
                            </div>
                            <div class="mb-3">
                                <h6 class="text-secondary text-uppercase small fw-bold mb-2">In-Camera</h6>
                                <ul class="list-group list-group-flush bg-transparent">
                                    <li class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="fw-bold small">RAW - SanDisk Extreme Pro 256 GB</div>
                                    </li>
                                    <li class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="fw-bold small">JPEG - SanDisk Ultra 32 GB</div>
                                    </li>
                                </ul>
                            </div>
                            <hr class="my-3 opacity-10">
                            <div>
                                <h6 class="text-secondary text-uppercase small fw-bold mb-2">External</h6>
                                <ul class="list-group list-group-flush bg-transparent">
                                    <li class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="fw-bold small">Samsung T7 500 GB</div>
                                    </li>
                                    <li class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="fw-bold small">WD MyBook 4 TB</div>
                                    </li>
                                    <li class="list-group-item bg-transparent border-0 px-0 py-1">
                                        <div class="fw-bold small">Google Photos</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Flash & Software -->
                <div class="col-md-12 col-lg-4">
                    <div class="row g-4">
                        <div class="col-md-6 col-lg-12">
                            <div class="card shadow equipment-card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="card-header-icon bg-warning rounded-3 text-dark shadow-sm me-3">
                                            <i class="bi bi-lightning-fill" style="font-size: 1.2rem;"></i>
                                        </div>
                                        <div>
                                            <h3 class="h5 mb-0 fw-bold">Flash</h3>
                                            <div class="small fw-bold">Yongnou Speedlite YN560 IV</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-12">
                            <div class="card shadow equipment-card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="card-header-icon bg-dark rounded-3 text-white shadow-sm me-3">
                                            <i class="bi bi-display" style="font-size: 1.2rem;"></i>
                                        </div>
                                        <h3 class="h5 mb-0 fw-bold">Software</h3>
                                    </div>
                                    <ul class="list-group list-group-flush bg-transparent">
                                        <li class="list-group-item bg-transparent border-0 px-0 py-1 small">Affinity</li>
                                        <li class="list-group-item bg-transparent border-0 px-0 py-1 small">Adobe Lightroom Classic</li>
                                        <li class="list-group-item bg-transparent border-0 px-0 py-1 small">Adobe Photoshop</li>
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
