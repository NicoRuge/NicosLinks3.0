const QrView = {
    methods: {
        downloadVcard() {
            const lines = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                'FN:Nico Ruge',
                'N:Ruge;Nico;;;',
                'EMAIL;TYPE=INTERNET:mail@nico-ruge.de',
                'URL:https://nico-ruge.de',
                'X-SOCIALPROFILE;type=linkedin:https://www.linkedin.com/in/nico-ruge/',
                'X-SOCIALPROFILE;type=instagram:https://www.instagram.com/nico_ruge',
                'END:VCARD'
            ];
            const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'NicoRuge.vcf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    },
    template: `
        <div class="biz-page">
            <div class="biz-wrapper">
                <div class="biz-card">
                    <div class="biz-card-left">
                        <div>
                            <p class="biz-kicker">Contact</p>
                            <h1 class="biz-name">Nico Ruge</h1>
                            <p class="biz-title">Photographer &amp; Data Analyst</p>
                        </div>
                        <div class="biz-divider"></div>
                        <div class="biz-contacts">
                            <a class="biz-link" href="mailto:mail@nico-ruge.de">
                                <i class="bi bi-envelope"></i>
                                <span>mail@nico-ruge.de</span>
                            </a>
                            <a class="biz-link" href="https://nico-ruge.de" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-globe2"></i>
                                <span>nico-ruge.de</span>
                            </a>
                            <a class="biz-link" href="https://www.linkedin.com/in/nico-ruge/" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-linkedin"></i>
                                <span>LinkedIn</span>
                            </a>
                            <a class="biz-link" href="https://www.instagram.com/nico_ruge" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-instagram"></i>
                                <span>Instagram</span>
                            </a>
                        </div>
                    </div>
                    <div class="biz-card-right">
                        <div class="biz-qr-wrap">
                            <img
                                class="biz-qr-img"
                                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fnico-ruge.de%2F%23qr&margin=2"
                                alt="QR Code — nico-ruge.de/#qr"
                                width="160"
                                height="160"
                            >
                        </div>
                    </div>
                </div>
                <button class="biz-vcard-btn" @click="downloadVcard">
                    <i class="bi bi-person-vcard me-1"></i>Download .vcard
                </button>
            </div>
        </div>
    `
};
