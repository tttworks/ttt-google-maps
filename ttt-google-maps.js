/**
 * ============================================
 * TTT Google Maps - JS 脚本
 * ============================================
 *
 * @version     1.3.1
 * @date        2026-06-26
 * @author      Aloysius Luo
 * @organization TTTWORKS
 * @contact     https://tttworks.com
 * @description Elementor Google Maps v1.3.1
 *
 * ============================================
 *
 * --------------------------------------------
 * 版本更新日志
 * --------------------------------------------
 * v1.3.1 (2026-06-26)
 *   [改] 地图样式恢复完整版规则（匹配 Map ID 时代视觉效果）
 *   [新] GMaps 按钮位置选择（四角）
 *   [新] 标记可在 Elementor 编辑器中拖动微调（鼠标拖拽 → 实时打印新坐标到 Console）
 * v1.3.0 (2026-06-26)
 *   [新] OverlayView + 控件 + 双脉冲 + 多标记 + GMaps 按钮
 * ============================================
 */

add_action( 'wp_enqueue_scripts',                'ttt_google_maps_enqueue' );
add_action( 'elementor/preview/enqueue_scripts', 'ttt_google_maps_enqueue' );
function ttt_google_maps_enqueue() {
    $js = <<<'JS'
(function () {
    'use strict';

    var DEBUG = true;
    function log() { if (DEBUG) console.log.apply(console, ['[ZGM]'].concat(Array.prototype.slice.call(arguments))); }
    function warn() { console.warn.apply(console, ['[ZGM]'].concat(Array.prototype.slice.call(arguments))); }

    var ZGM = {
        defaultLogo: 'https://example.com/wp-content/uploads/2026/06/logo-2-2.png',
        defaultCenter: { lat: 22.2808, lng: 114.1613 },
    };

    // ════════════════════════════════
    // API 加载器
    // ════════════════════════════════
    function MapsLoader() { var me = this; me.loaded = false; me.failed = false; me.loading = false; me.callbacks = []; }
    MapsLoader.prototype.load = function(key, lang, cb) {
        if (this.loaded) { cb(true); return; }
        if (this.failed) { cb(false); return; }
        if (!key || key.length < 15) { this.failed = true; cb(false); return; }
        if (this.loading) { this.callbacks.push(function() { cb(true); }); return; }
        this.loading = true; this.callbacks.push(function() { cb(true); });
        var url = 'https://maps.googleapis.com/maps/api/js?v=weekly&key=' + encodeURIComponent(key) + '&callback=__zgm_ready';
        if (lang && lang !== 'auto') url += '&language=' + encodeURIComponent(lang);
        var self = this;
        window.__zgm_ready = function() { self.loaded = true; self.loading = false; log('Maps API ready'); self.callbacks.forEach(function(f) { f(); }); self.callbacks = []; };
        var s = document.createElement('script'); s.async = true; s.defer = true; s.src = url;
        s.onerror = function() { self.failed = true; self.loading = false; self.callbacks = []; warn('Maps API load failed'); };
        setTimeout(function() { if (self.loading && !self.loaded) { self.failed = true; self.loading = false; self.callbacks = []; } }, 12000);
        document.head.appendChild(s);
    };
    MapsLoader.prototype.isReady = function() { return this.loaded; };
    var loader = new MapsLoader();

    // ════════════════════════════════
    // 完整版地图样式（匹配 Map ID 时代的视觉效果）
    // ════════════════════════════════
    var STYLES = {
        standard: [],

        minimal: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],

        retro: [
            { elementType: 'geometry', stylers: [{ hue: '#f4e6c8' }, { saturation: -30 }, { lightness: 10 }] },
            { elementType: 'labels.icon', stylers: [{ hue: '#8b6f47' }, { saturation: -50 }] },
            { elementType: 'labels.text.fill', stylers: [{ hue: '#5c4a2a' }, { saturation: -40 }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f4e6c8' }, { weight: 2 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#8b6f47' }] },
            { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dcc8a0' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#c4a878' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#8b6f47' }, { weight: 0.5 }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#b8945c' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#6b5532' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#7a9bb5' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5670' }] },
        ],

        night: [
            { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
            { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#7dabaf' }] },
            { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f0e9c4' }] },
            { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
            { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
            { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
            { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
        ],

        satellite: [], hybrid: [], terrain: [],

        light_gray: [
            { elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: 90 }] },
            { elementType: 'geometry.stroke', stylers: [{ saturation: -100 }, { lightness: 80 }] },
            { elementType: 'labels.icon', stylers: [{ saturation: -100 }, { lightness: 50 }] },
            { elementType: 'labels.text.fill', stylers: [{ saturation: -100 }, { lightness: 30 }] },
            { elementType: 'labels.text.stroke', stylers: [{ saturation: -100 }, { lightness: 100 }, { weight: 3 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#bbbbbb' }, { weight: 1 }] },
            { featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ededed' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#dddddd' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#cccccc' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
            { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#ededed' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
        ],

        dark_gray: [
            { elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: -10 }] },
            { elementType: 'geometry.stroke', stylers: [{ saturation: -100 }, { lightness: -20 }] },
            { elementType: 'labels.icon', stylers: [{ saturation: -100 }, { lightness: 70 }] },
            { elementType: 'labels.text.fill', stylers: [{ saturation: -100 }, { lightness: 95 }] },
            { elementType: 'labels.text.stroke', stylers: [{ saturation: -100 }, { lightness: 10 }, { weight: 3 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#777777' }, { weight: 2 }] },
            { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#2e2e2e' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#555555' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#888888' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f0f' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#999999' }] },
        ],

        cool_gray: [
            { elementType: 'geometry', stylers: [{ hue: '#1a3a5c' }, { saturation: -40 }, { lightness: -10 }] },
            { elementType: 'geometry.stroke', stylers: [{ color: '#3a5570' }] },
            { elementType: 'labels.icon', stylers: [{ saturation: -100 }, { lightness: 60 }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8aa8c5' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1f33' }, { weight: 3 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4a6a8a' }] },
            { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#2a3d54' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#1e2d40' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#3a5570' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#243650' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1830' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a6a8a' }] },
        ],

        green_style: [
            { elementType: 'geometry', stylers: [{ hue: '#2d5a3d' }, { saturation: -20 }, { lightness: -5 }] },
            { elementType: 'geometry.stroke', stylers: [{ color: '#1f3f2a' }] },
            { elementType: 'labels.icon', stylers: [{ saturation: -80 }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#a8d4b0' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3a25' }, { weight: 3 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#5a8a6a' }] },
            { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#3a6a4a' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#2d5a3d' }] },
            { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: '#4a7a5a' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#3a7a4a' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#6a8a5a' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#4a6a3a' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#8aa67a' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#5a7a4a' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#5a7a4a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a4a5a' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7ab0c0' }] },
        ],

        colorful: [
            { elementType: 'geometry', stylers: [{ saturation: 90 }, { lightness: -10 }] },
            { elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }, { weight: 1 }] },
            { elementType: 'labels.icon', stylers: [{ saturation: 100 }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#000000' }, { weight: 4 }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 6 }] },
            { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#e63946' }, { weight: 2 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#ff006e' }, { weight: 2 }] },
            { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ffbe0b' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#3a86ff' }] },
            { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: '#06d6a0' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#38b000' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#8338ec' }, { weight: 1 }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fb5607' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#d90429' }] },
            { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#ffbe0b' }, { weight: 4 }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#fdca40' }] },
            { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#9b5de5' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0077b6' }] },
        ],

        monochrome: [
            { elementType: 'geometry', stylers: [{ saturation: -100 }] },
            { elementType: 'geometry.stroke', stylers: [{ saturation: -100 }] },
            { elementType: 'labels.icon', stylers: [{ saturation: -100 }] },
            { elementType: 'labels.text.fill', stylers: [{ saturation: -100 }, { lightness: 0 }] },
            { elementType: 'labels.text.stroke', stylers: [{ saturation: -100 }, { lightness: 100 }, { weight: 4 }] },
            { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#000000' }, { weight: 2 }] },
            { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#dddddd' }] },
            { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#888888' }, { weight: 1 }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#cccccc' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#555555' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#dddddd' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#aaaaaa' }] },
        ],
    };

    // ════════════════════════════════
    // Geocoding
    // ════════════════════════════════
    var geoCache = {};
    function geocode(geocoder, address) {
        return new Promise(function(resolve) {
            if (!address || !geocoder) return resolve(null);
            var key = address.toLowerCase().trim();
            if (geoCache.hasOwnProperty(key)) { var v = geoCache[key]; if (v) { log('Geo cache hit:', v); return resolve(v); } delete geoCache[key]; }
            var req = { address: key };
            if (/[一-鿿]/.test(key)) { req.region = 'cn'; }
            log('Geocoding:', key);
            geocoder.geocode(req, function(r, s) {
                if (s === 'OK' && r && r[0]) { var p = { lat: r[0].geometry.location.lat(), lng: r[0].geometry.location.lng() }; geoCache[key] = p; log('Geocoded:', p); resolve(p); }
                else { warn('Geocode fail:', s, key); resolve(null); }
            });
        });
    }

    // ════════════════════════════════
    // DOM 构建
    // ════════════════════════════════
    function buildMarkerDOM(markerData) {
        var mode = markerData.mode || 'default_circle';
        var el = document.createElement('div');
        el.className = 'zgm-marker';
        if (markerData.draggable) el.classList.add('zgm-draggable');

        switch (mode) {
            case 'text_marker':
                var t = document.createElement('div'); t.className = 'zgm-marker-text';
                t.textContent = markerData.text || 'Marker'; el.appendChild(t);
                break;
            case 'image_marker':
                var w = document.createElement('div'); w.className = 'zgm-marker-image';
                var img = document.createElement('img');
                img.src = markerData.image || ''; img.alt = 'Marker'; w.appendChild(img); el.appendChild(w);
                break;
            default:
                var pulseContainer = document.createElement('div'); pulseContainer.className = 'zgm-marker-pulse';
                var outer = document.createElement('div'); outer.className = 'zgm-pulse-outer'; pulseContainer.appendChild(outer);
                var inner = document.createElement('div'); inner.className = 'zgm-pulse-inner'; pulseContainer.appendChild(inner);
                var circle = document.createElement('div'); circle.className = 'zgm-marker-circle';
                var logoW = document.createElement('div'); logoW.className = 'zgm-marker-logo';
                var logo = document.createElement('img');
                logo.src = markerData.image || ZGM.defaultLogo; logo.alt = 'Marker';
                logoW.appendChild(logo); circle.appendChild(logoW);
                el.appendChild(pulseContainer); el.appendChild(circle);
                if (markerData.show_info_window && markerData.info_content) {
                    var info = document.createElement('div'); info.className = 'zgm-info-window';
                    info.innerHTML = markerData.info_content; el.appendChild(info);
                }
                break;
        }
        return el;
    }

    // ════════════════════════════════
    // OverlayView 标记 + 拖动支持
    // ════════════════════════════════
    function createOverlayMarker(map, position, domEl, markerData) {
        function OverlayMarker() {
            this.pos = position;
            this.el = domEl;
            this.data = markerData || {};
            this.setMap(map);
            var self = this;

            // 拖动功能（Elementor 编辑器用）
            if (self.data.draggable) {
                var dragging = false, startPos = null;
                self.el.addEventListener('mousedown', function(e) {
                    e.preventDefault(); e.stopPropagation();
                    dragging = true; startPos = { x: e.clientX, y: e.clientY };
                    self.el.classList.add('zgm-dragging');
                });
                document.addEventListener('mousemove', function(e) {
                    if (!dragging || !self.el.parentNode) return;
                    var dx = e.clientX - startPos.x, dy = e.clientY - startPos.y;
                    var curLeft = parseFloat(self.el.style.left) || 0;
                    var curTop = parseFloat(self.el.style.top) || 0;
                    self.el.style.left = (curLeft + dx) + 'px';
                    self.el.style.top = (curTop + dy) + 'px';
                    startPos = { x: e.clientX, y: e.clientY };
                });
                document.addEventListener('mouseup', function(e) {
                    if (!dragging) return;
                    dragging = false;
                    self.el.classList.remove('zgm-dragging');
                    // 像素 -> 经纬度
                    if (self.getProjection()) {
                        var newPos = self.getProjection().fromDivPixelToLatLng(
                            new google.maps.Point(parseFloat(self.el.style.left), parseFloat(self.el.style.top))
                        );
                        if (newPos) {
                            self.pos = newPos;
                            log('Marker moved to:', newPos.lat(), newPos.lng());
                            // 更新 data 属性以便复制到 widget 设置
                            self.el.setAttribute('data-new-lat', newPos.lat());
                            self.el.setAttribute('data-new-lng', newPos.lng());
                            console.info('[ZGM] 复制以下坐标粘贴到标记的纬/经度字段：',
                                '\n  纬度:', newPos.lat(), '\n  经度:', newPos.lng());
                        }
                    }
                });
            }
        }
        OverlayMarker.prototype = Object.create(google.maps.OverlayView.prototype);
        OverlayMarker.prototype.onAdd = function() {
            this.getPanes().overlayMouseTarget.appendChild(this.el);
            var self = this;
            // 信息窗口
            if (this.data && this.data.show_info_window) {
                this.el.addEventListener('click', function(e) {
                    if (self._wasDragged) { self._wasDragged = false; return; }
                    e.stopPropagation();
                    var infoEl = self.el.querySelector('.zgm-info-window');
                    if (infoEl) {
                        document.querySelectorAll('.zgm-info-window.zgm-info-visible').forEach(function(w) { if (w !== infoEl) w.classList.remove('zgm-info-visible'); });
                        infoEl.classList.toggle('zgm-info-visible');
                    }
                });
            }
        };
        OverlayMarker.prototype.draw = function() {
            var px = this.getProjection().fromLatLngToDivPixel(this.pos);
            if (px) { this.el.style.left = px.x + 'px'; this.el.style.top = px.y + 'px'; }
        };
        OverlayMarker.prototype.onRemove = function() {
            if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
        };
        return new OverlayMarker();
    }

    // ════════════════════════════════
    // GMaps 按钮
    // ════════════════════════════════
    function addGMapsButton(container, center, cfg) {
        var wrap = document.createElement('div');
        wrap.className = 'zgm-gmaps-btn-wrap';
        var pos = cfg.gmapsBtnPos || 'bottom-right';
        wrap.className += ' zgm-btn-' + pos.replace('_', '-');
        var btn = document.createElement('a');
        btn.className = 'zgm-gmaps-btn'; btn.target = '_blank'; btn.rel = 'noopener';
        var query = cfg.mode === 'address' && cfg.address ? encodeURIComponent(cfg.address) : center.lat() + ',' + center.lng();
        btn.href = 'https://www.google.com/maps/search/?api=1&query=' + query;
        btn.innerHTML = '<img src="data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>') + '" alt="">View on Google Maps';
        btn.title = '在 Google Maps 中查看';
        wrap.appendChild(btn); container.appendChild(wrap);
    }

    // ════════════════════════════════
    // 主地图
    // ════════════════════════════════
    function createMap(container, cfg) {
        var map, geocoder, markers = [], el = container;

        function getMapTypeId() { return ({ satellite: 'satellite', hybrid: 'hybrid', terrain: 'terrain' })[cfg.stylePreset] || 'roadmap'; }

        async function resolveCenter() {
            if (cfg.mode === 'coordinates') { var lat = parseFloat(cfg.lat), lng = parseFloat(cfg.lng); if (!isNaN(lat) && !isNaN(lng)) return { lat: lat, lng: lng }; }
            if (cfg.mode === 'address' && cfg.address) { var r = await geocode(geocoder, cfg.address); if (r) return r; }
            warn('Center resolved to default (Hong Kong)'); return { lat: ZGM.defaultCenter.lat, lng: ZGM.defaultCenter.lng };
        }

        function applyStyle() {
            var preset = cfg.stylePreset || 'light_gray';
            log('Applying style:', preset);
            if (preset === 'custom' && cfg.customStyle) {
                try { var s = JSON.parse(cfg.customStyle); if (Array.isArray(s)) map.setOptions({ styles: s }); } catch(e){}
            } else if (STYLES[preset]) { map.setOptions({ styles: STYLES[preset] }); }
        }

        async function addMarkers(center) {
            var list = cfg.markers || [];
            for (var i = 0; i < list.length; i++) {
                var m = list[i], pos;
                if (m.lat && m.lng) { var la = parseFloat(m.lat), lo = parseFloat(m.lng); if (!isNaN(la) && !isNaN(lo)) pos = { lat: la, lng: lo }; }
                if (!pos && m.address) pos = await geocode(geocoder, m.address);
                if (!pos) pos = { lat: center.lat, lng: center.lng };
                var dom = buildMarkerDOM(m);
                var marker = createOverlayMarker(map, new google.maps.LatLng(pos.lat, pos.lng), dom, m);
                markers.push(marker);
            }
        }

        function fallbackEmbed() {
            warn('Falling back to Embed mode'); el.innerHTML = ''; el.classList.add('zgm-embed-mode');
            var q = cfg.address || (cfg.lat && cfg.lng ? cfg.lat + ',' + cfg.lng : '');
            var url = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=' + (cfg.zoom || 15) + '&output=embed';
            var f = document.createElement('iframe'); f.src = url; f.width = '100%'; f.height = '100%'; f.style.border = '0'; f.loading = 'lazy'; el.appendChild(f);
        }

        async function init() {
            geocoder = new google.maps.Geocoder();
            var center = await resolveCenter();
            if (!center) { fallbackEmbed(); return; }
            try {
                map = new google.maps.Map(el, {
                    center: center, zoom: cfg.zoom || 15, mapTypeId: getMapTypeId(),
                    draggable: cfg.draggable !== false, scrollwheel: cfg.scrollwheel !== false,
                    zoomControl: cfg.showZoomControl === true, mapTypeControl: cfg.showMapTypeControl === true,
                    scaleControl: cfg.showScaleControl === true, fullscreenControl: cfg.showFullscreenControl === true,
                    streetViewControl: cfg.showStreetViewControl === true,
                });
            } catch (e) { fallbackEmbed(); return; }
            applyStyle();
            if (cfg.showGMapsButton) addGMapsButton(el, map.getCenter(), cfg);
            await addMarkers({ lat: center.lat, lng: center.lng });
            var trigger = function() { if (map) google.maps.event.trigger(map, 'resize'); };
            window.addEventListener('resize', trigger);
            if (typeof ResizeObserver !== 'undefined') { try { new ResizeObserver(trigger).observe(el); } catch(e){} }
        }
        return { init: init, fallbackEmbed: fallbackEmbed };
    }

    // ════════════════════════════════
    // 设置解析
    // ════════════════════════════════
    function parseSettings(el) {
        var markers; try { markers = JSON.parse(el.dataset.markers || '[]'); } catch(e) { markers = []; }
        return {
            apiKey: el.dataset.apiKey || '', language: el.dataset.language || 'auto',
            detectedLang: el.dataset.detectedLang || '', mode: el.dataset.locationMode || 'address',
            address: el.dataset.address || '', lat: el.dataset.lat || '', lng: el.dataset.lng || '',
            zoom: parseInt(el.dataset.zoom) || 15,
            draggable: el.dataset.draggable === 'true', scrollwheel: el.dataset.scrollwheel === 'true',
            stylePreset: el.dataset.stylePreset || 'light_gray', customStyle: el.dataset.customStyle || '',
            showZoomControl: el.dataset.showZoom === 'true', showMapTypeControl: el.dataset.showMapType === 'true',
            showScaleControl: el.dataset.showScale === 'true', showFullscreenControl: el.dataset.showFullscreen === 'true',
            showStreetViewControl: el.dataset.showStreetView === 'true',
            showGMapsButton: el.dataset.showGmapsBtn === 'true', gmapsBtnPos: el.dataset.gmapsBtnPos || 'bottom-right',
            markers: markers,
        };
    }

    function initMaps(scope) {
        var root = scope || document;
        root.querySelectorAll('.zgm-map-container:not(.zgm-init)').forEach(function(el) {
            el.classList.add('zgm-init');
            try {
                var cfg = parseSettings(el);
                if (cfg.apiKey && cfg.apiKey.length >= 15) {
                    loader.load(cfg.apiKey, cfg.detectedLang || cfg.language, function(ok) {
                        if (ok && loader.isReady()) createMap(el, cfg).init();
                        else createMap(el, cfg).fallbackEmbed();
                    });
                } else { createMap(el, cfg).fallbackEmbed(); }
            } catch (e) { console.error('ZGM error:', e); }
        });
    }

    function bootstrap() {
        initMaps();
        if (typeof MutationObserver !== 'undefined') { new MutationObserver(function() { initMaps(); }).observe(document.body, { childList: true, subtree: true }); }
        if (typeof elementorFrontend !== 'undefined' && elementorFrontend.hooks) {
            elementorFrontend.hooks.addAction('frontend/element_ready/global', function($s) { initMaps($s[0]); });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
    else bootstrap();

})();
JS;

    wp_register_script( 'ttt-google-maps', '', [], null, true );
    wp_enqueue_script(  'ttt-google-maps' );
    wp_add_inline_script( 'ttt-google-maps', $js );
}
