(function () {
    'use strict';

    const stores = [
        {
            name: 'Excellent Stores',
            branch: 'Movie Towne Mall',
            address: 'MovieTowne Boulevard, Audrey Jeffers Hwy, Port of Spain',
            lat: 10.6618,
            lng: -61.5331,
        },
        {
            name: 'Excellent Stores',
            branch: 'Trincity Mall',
            address: 'Trincity Central Road, Trincity',
            lat: 10.6263,
            lng: -61.3544,
        },
        {
            name: 'Excellent Stores',
            branch: 'Gulf City Mall',
            address: 'Gulf City Mall, La Romaine, San Fernando',
            lat: 10.2724,
            lng: -61.4633,
        },
        {
            name: 'Excellent Stores',
            branch: 'C3 Centre',
            address: 'C3 Centre, Corinth Road, San Fernando',
            lat: 10.2629,
            lng: -61.4541,
        },
    ];

    let map = null;
    let infoWindow = null;
    let markers = [];
    let activeStoreIndex = 0;
    let fallbackIframe = null;

    function pinSvg(fill, innerFill) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C5.84 0 .86 4.98.86 11.14.86 19.5 12 32 12 32s11.14-12.5 11.14-20.86C23.14 4.98 18.16 0 12 0Z" fill="${fill}"/>
                <circle cx="12" cy="11" r="4.1" fill="${innerFill}"/>
            </svg>`;
    }

    function markerIcon(fill) {
        const svg = encodeURIComponent(pinSvg(fill, '#fff8ef'));
        return {
            url: `data:image/svg+xml;charset=UTF-8,${svg}`,
            scaledSize: new google.maps.Size(28, 38),
            anchor: new google.maps.Point(14, 38),
        };
    }

    function listPin(fill, innerFill) {
        return pinSvg(fill, innerFill);
    }

    function renderStoreList(filterText) {
        const list = document.getElementById('ib-store-list');
        if (!list) return;

        const normalized = (filterText || '').toLowerCase().trim();
        const filtered = stores
            .map((store, index) => ({ store, index }))
            .filter(({ store }) => {
                const haystack = `${store.name} ${store.branch} ${store.address}`.toLowerCase();
                return !normalized || haystack.includes(normalized);
            });

        if (!filtered.length) {
            list.innerHTML = '<div class="ib-store-card"><span></span><div><h3>No stores found</h3><p>Try another search term.</p></div></div>';
            return;
        }

        list.innerHTML = filtered.map(({ store, index }) => {
            const active = index === activeStoreIndex ? ' is-active' : '';
            return `
                <button type="button" class="ib-store-card${active}" data-store-index="${index}">
                    <span class="ib-store-pin">${listPin(index === activeStoreIndex ? '#fff8ef' : '#f75941', index === activeStoreIndex ? '#f75941' : '#fff8ef')}</span>
                    <span>
                        <h3>${store.name}<br/>${store.branch}</h3>
                        <p>${store.address}</p>
                    </span>
                </button>`;
        }).join('');

        list.querySelectorAll('[data-store-index]').forEach((button) => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-store-index'), 10);
                selectStore(index, true);
            });
        });
    }

    function storeInfoHtml(store) {
        return `
            <div style="background:#f75941;color:#fff8ef;padding:13px 16px;max-width:210px;font-family:Montserrat,Arial,sans-serif;">
                <strong style="font-size:13px;line-height:1.1;display:block;margin-bottom:4px;">${store.name}<br/>${store.branch}</strong>
                <span style="font-size:11px;line-height:1.25;display:block;">${store.address}</span>
            </div>`;
    }

    function selectStore(index, shouldRenderList) {
        const store = stores[index];
        if (!store) return;
        activeStoreIndex = index;

        if (map && markers[index]) {
            map.panTo({ lat: store.lat, lng: store.lng });
            map.setZoom(13);
            infoWindow.setContent(storeInfoHtml(store));
            infoWindow.open({ anchor: markers[index], map });
            markers.forEach((marker, markerIndex) => {
                marker.setIcon(markerIcon(markerIndex === index ? '#f75941' : '#f75941'));
            });
        } else if (fallbackIframe) {
            fallbackIframe.src = googleIframeUrl(store.lat, store.lng, 13);
        }

        if (shouldRenderList) {
            const search = document.getElementById('ib-store-search');
            renderStoreList(search ? search.value : '');
        }
    }

    function googleIframeUrl(lat, lng, zoom) {
        return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom || 10}&output=embed`;
    }

    function initIframeFallback(mapEl) {
        mapEl.innerHTML = `
            <iframe title="Island Borne Google Map" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="${googleIframeUrl(stores[0].lat, stores[0].lng, 10)}"></iframe>
            <div class="ib-map-fallback-notice">Add your Google Maps API key in the module to enable custom markers and list-to-map popups.</div>`;
        fallbackIframe = mapEl.querySelector('iframe');
    }

    window.ibInitGoogleMap = function () {
        const mapEl = document.getElementById('ib-google-map');
        if (!mapEl || !window.google || !google.maps) return;

        const center = { lat: 10.5364, lng: -61.3119 };
        map = new google.maps.Map(mapEl, {
            center,
            zoom: 9,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#e8e2d7' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#6e6a64' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f1e8' }] },
                { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c4b9ab' }] },
                { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d7cabd' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#8cced7' }] },
            ],
        });

        infoWindow = new google.maps.InfoWindow({ pixelOffset: new google.maps.Size(0, -4) });
        markers = stores.map((store, index) => {
            const marker = new google.maps.Marker({
                position: { lat: store.lat, lng: store.lng },
                map,
                title: `${store.name} ${store.branch}`,
                icon: markerIcon('#f75941'),
            });
            marker.addListener('click', function () {
                selectStore(index, true);
            });
            return marker;
        });
        selectStore(0, true);
    };

    function loadGoogleMap(section, mapEl) {
        const key = (section.getAttribute('data-google-key') || '').trim();
        const hasUsableKey = key && !key.includes('PASTE_GOOGLE_MAPS_API_KEY_HERE') && key.length > 20;

        if (!hasUsableKey) {
            initIframeFallback(mapEl);
            return;
        }

        if (window.google && google.maps) {
            window.ibInitGoogleMap();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=ibInitGoogleMap`;
        script.async = true;
        script.defer = true;
        script.onerror = function () {
            initIframeFallback(mapEl);
        };
        document.head.appendChild(script);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const section = document.querySelector('.ib-store-section');
        const mapEl = document.getElementById('ib-google-map');
        if (!section || !mapEl) return;

        const search = document.getElementById('ib-store-search');
        const searchButton = document.getElementById('ib-store-search-button');

        renderStoreList('');
        loadGoogleMap(section, mapEl);

        if (search) {
            search.addEventListener('input', function () {
                renderStoreList(this.value);
            });
            search.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const first = document.querySelector('#ib-store-list [data-store-index]');
                    if (first) first.click();
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', function () {
                const first = document.querySelector('#ib-store-list [data-store-index]');
                if (first) first.click();
            });
        }
    });
})();
