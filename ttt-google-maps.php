/**
 * ============================================
 * TTT Google Maps - PHP 主程序
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
 *   [改] 地图样式恢复完整版规则（匹配 Map ID 时代的视觉效果）
 *   [新] GMaps 按钮位置选择（左上/右上/左下/右下）
 *   [新] 标记可在 Elementor 编辑器中拖动微调位置
 * v1.3.0 (2026-06-26)
 *   [新] OverlayView + 控件 + 双脉冲 + 多标记 + GMaps 按钮
 * ============================================
 */

add_action( 'elementor/widgets/register', function ( $widgets_manager ) {

    if ( ! class_exists( '\Elementor\Widget_Base' ) ) return;

    if ( ! class_exists( 'TTT_Google_Maps_Widget' ) ) {

    class TTT_Google_Maps_Widget extends \Elementor\Widget_Base {

        public function get_name()           { return 'ttt_google_maps'; }
        public function get_title()          { return 'TTT Google Maps'; }
        public function get_icon()           { return 'eicon-google-maps'; }
        public function get_categories()     { return [ 'general' ]; }
        public function get_keywords()       { return [ 'google', 'maps', 'map', 'location', 'marker', 'ttt' ]; }
        public function get_style_depends()  { return [ 'ttt-google-maps' ]; }
        public function get_script_depends() { return [ 'ttt-google-maps' ]; }

        protected function register_controls() {

            /* ── API ── */
            $this->start_controls_section( 'section_api', [
                'label' => 'API Key', 'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ] );
            $this->add_control( 'api_key_override', [
                'label' => 'Google Maps API Key', 'type' => \Elementor\Controls_Manager::TEXT,
                'placeholder' => 'AIzaSy...', 'default' => '', 'label_block' => true,
                'description' => '留空则从 Elementor 集成设置读取。',
            ] );
            $this->add_control( 'map_language', [
                'label' => '地图语言', 'type' => \Elementor\Controls_Manager::SELECT, 'default' => 'auto',
                'options' => [
                    'auto' => '自动检测',
                    'zh-CN' => '中文简体', 'zh-TW' => '中文繁体',
                    'en' => 'English', 'ja' => '日本語', 'ko' => '한국어',
                    'th' => 'ไทย', 'vi' => 'Tiếng Việt', 'id' => 'Bahasa Indonesia',
                    'ms' => 'Bahasa Melayu', 'hi' => 'हिन्दी',
                    'ar' => 'العربية', 'fr' => 'Français', 'es' => 'Español',
                    'ru' => 'Русский', 'de' => 'Deutsch', 'pt' => 'Português',
                ],
            ] );
            $this->end_controls_section();

            /* ── 位置 ── */
            $this->start_controls_section( 'section_location', [
                'label' => '位置设置', 'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ] );
            $this->add_control( 'location_mode', [
                'label' => '定位方式', 'type' => \Elementor\Controls_Manager::SELECT, 'default' => 'address',
                'options' => [ 'address' => '地址搜索', 'coordinates' => '经纬度坐标' ],
            ] );
            $this->add_control( 'address', [
                'label' => '地址', 'type' => \Elementor\Controls_Manager::TEXT,
                'placeholder' => '例如：Shanghai', 'default' => '',
                'condition' => [ 'location_mode' => 'address' ], 'dynamic' => [ 'active' => true ],
            ] );
            $this->add_control( 'latitude', [
                'label' => '纬度', 'type' => \Elementor\Controls_Manager::NUMBER,
                'step' => 0.000001, 'default' => '', 'condition' => [ 'location_mode' => 'coordinates' ],
            ] );
            $this->add_control( 'longitude', [
                'label' => '经度', 'type' => \Elementor\Controls_Manager::NUMBER,
                'step' => 0.000001, 'default' => '', 'condition' => [ 'location_mode' => 'coordinates' ],
            ] );
            $this->end_controls_section();

            /* ── 地图设置 ── */
            $this->start_controls_section( 'section_map_settings', [
                'label' => '地图设置', 'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ] );
            $this->add_control( 'zoom', [
                'label' => '缩放级别', 'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [ 'min' => 1, 'max' => 20 ], 'default' => [ 'size' => 15 ],
            ] );
            $this->add_responsive_control( 'height', [
                'label' => '地图高度', 'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [ 'min' => 100, 'max' => 1000, 'step' => 10 ],
                'default' => [ 'size' => 400, 'unit' => 'px' ], 'units' => [ 'px' ],
                'selectors' => [ '{{WRAPPER}} .zgm-map-container' => 'height: {{SIZE}}{{UNIT}};' ],
            ] );
            $this->add_control( 'draggable', [
                'label' => '可拖动地图', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes', 'return_value' => 'yes',
            ] );
            $this->add_control( 'scrollwheel', [
                'label' => '滚轮缩放', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes', 'return_value' => 'yes',
            ] );
            $this->end_controls_section();

            /* ── 地图样式 ── */
            $this->start_controls_section( 'section_map_style', [
                'label' => '地图样式', 'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ] );
            $this->add_control( 'map_style_preset', [
                'label' => '地图风格预设', 'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'light_gray',
                'options' => [
                    'standard' => '标准地图', 'minimal' => '精简风格',
                    'retro' => '复古风格', 'night' => '夜间模式',
                    'satellite' => '卫星影像', 'hybrid' => '混合模式', 'terrain' => '地形模式',
                    'light_gray' => '浅灰风格 ★', 'dark_gray' => '深灰风格',
                    'cool_gray' => '冷灰风格', 'green_style' => '绿色风格',
                    'colorful' => '彩色风格', 'monochrome' => '黑白风格',
                    'custom' => '自定义样式',
                ],
            ] );
            $this->add_control( 'custom_style_json', [
                'label' => '自定义 JSON 样式', 'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => '', 'condition' => [ 'map_style_preset' => 'custom' ],
                'dynamic' => [ 'active' => true ],
            ] );
            $this->end_controls_section();

            /* ── 地图组件 ── */
            $this->start_controls_section( 'section_components', [
                'label' => '地图组件', 'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ] );
            $this->add_control( 'show_zoom_control', [
                'label' => '缩放控制', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes', 'return_value' => 'yes',
            ] );
            $this->add_control( 'show_map_type_control', [
                'label' => '地图类型切换', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'no', 'return_value' => 'yes',
            ] );
            $this->add_control( 'show_scale_control', [
                'label' => '比例尺', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'no', 'return_value' => 'yes',
            ] );
            $this->add_control( 'show_fullscreen_control', [
                'label' => '全屏按钮', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes', 'return_value' => 'yes',
            ] );
            $this->add_control( 'show_street_view_control', [
                'label' => '街景小人', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'no', 'return_value' => 'yes',
            ] );
            $this->add_control( 'show_gmaps_button', [
                'label' => '显示"在 Google Maps 中查看"按钮',
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes', 'return_value' => 'yes',
            ] );
            $this->add_control( 'gmaps_button_position', [
                'label' => '按钮位置', 'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'bottom-right',
                'options' => [
                    'bottom-right' => '右下角', 'bottom-left' => '左下角',
                    'top-right' => '右上角', 'top-left' => '左上角',
                    'center-top' => '中间顶部', 'center-bottom' => '中间底部',
                ],
                'condition' => [ 'show_gmaps_button' => 'yes' ],
            ] );
            $this->end_controls_section();

            /* ── 标记列表 ── */
            $this->start_controls_section( 'section_markers', [
                'label' => '地图标记', 'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ] );
            $repeater = new \Elementor\Repeater();
            $repeater->add_control( 'marker_title', [
                'label' => '标记标题', 'type' => \Elementor\Controls_Manager::TEXT, 'default' => '标记 1',
            ] );
            $repeater->add_control( 'marker_mode', [
                'label' => '标记类型', 'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'default_circle',
                'options' => [
                    'default_circle' => '默认圆形标记（Logo）',
                    'text_marker' => '文字标记', 'image_marker' => '图片标记',
                ],
            ] );
            $repeater->add_control( 'marker_text', [
                'label' => '标记文字', 'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '', 'condition' => [ 'marker_mode' => 'text_marker' ],
                'dynamic' => [ 'active' => true ],
            ] );
            $repeater->add_control( 'marker_image', [
                'label' => '标记图片', 'type' => \Elementor\Controls_Manager::MEDIA,
                'default' => [ 'url' => '' ], 'condition' => [ 'marker_mode' => 'image_marker' ],
                'dynamic' => [ 'active' => true ],
            ] );
            $repeater->add_control( 'marker_lat', [
                'label' => '纬度', 'type' => \Elementor\Controls_Manager::NUMBER,
                'step' => 0.000001, 'default' => '',
                'description' => '留空则使用地图中心位置',
            ] );
            $repeater->add_control( 'marker_lng', [
                'label' => '经度', 'type' => \Elementor\Controls_Manager::NUMBER,
                'step' => 0.000001, 'default' => '',
            ] );
            $repeater->add_control( 'marker_draggable', [
                'label' => '允许在编辑器中拖动微调',
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'no', 'return_value' => 'yes',
                'description' => '开启后，可在 Elementor 预览区拖拽标记移动位置。拖动后新的经纬度会打印到浏览器 Console。',
            ] );
            $repeater->add_control( 'show_info_window', [
                'label' => '点击显示信息窗口',
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'no', 'return_value' => 'yes',
            ] );
            $repeater->add_control( 'info_window_content', [
                'label' => '信息窗口内容', 'type' => \Elementor\Controls_Manager::TEXTAREA,
                'rows' => 3, 'default' => '',
                'condition' => [ 'show_info_window' => 'yes' ],
                'dynamic' => [ 'active' => true ],
            ] );
            $this->add_control( 'markers', [
                'label' => '标记列表', 'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'title_field' => '{{{ marker_title }}}',
                'default' => [ [ 'marker_title' => '默认标记', 'marker_mode' => 'default_circle' ] ],
            ] );
            $this->end_controls_section();

            /* ── 标记样式 ── */
            $this->start_controls_section( 'section_marker_style', [
                'label' => '标记样式', 'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ] );
            $this->add_control( 'marker_primary_color', [
                'label' => '标记主色调', 'type' => \Elementor\Controls_Manager::COLOR, 'default' => '#59A498',
                'selectors' => [
                    '{{WRAPPER}} .zgm-marker-circle' => 'background-color: {{VALUE}};',
                    '{{WRAPPER}} .zgm-marker-text' => 'background-color: {{VALUE}};',
                    '{{WRAPPER}} .zgm-marker-text::after' => 'border-top-color: {{VALUE}};',
                ],
            ] );
            $this->add_control( 'pulse_outer_enable', [
                'label' => '外层脉冲', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'no', 'return_value' => 'yes',
            ] );
            $this->add_control( 'pulse_outer_color', [
                'label' => '外层脉冲颜色', 'type' => \Elementor\Controls_Manager::COLOR,
                'default' => 'rgba(89, 164, 152, 0.3)', 'condition' => [ 'pulse_outer_enable' => 'yes' ],
                'selectors' => [ '{{WRAPPER}} .zgm-pulse-outer' => 'background-color: {{VALUE}};' ],
            ] );
            $this->add_control( 'pulse_inner_enable', [
                'label' => '内层脉冲', 'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes', 'return_value' => 'yes',
            ] );
            $this->add_control( 'pulse_inner_color', [
                'label' => '内层脉冲颜色', 'type' => \Elementor\Controls_Manager::COLOR,
                'default' => 'rgba(89, 164, 152, 0.25)', 'condition' => [ 'pulse_inner_enable' => 'yes' ],
                'selectors' => [ '{{WRAPPER}} .zgm-pulse-inner' => 'background-color: {{VALUE}};' ],
            ] );
            $this->add_control( 'marker_size', [
                'label' => '标记大小', 'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [ 'min' => 80, 'max' => 200 ], 'default' => [ 'size' => 144 ],
                'selectors' => [
                    '{{WRAPPER}} .zgm-marker-circle' => 'width: {{SIZE}}px; height: {{SIZE}}px;',
                    '{{WRAPPER}} .zgm-marker-pulse' => 'width: calc({{SIZE}}px + 82px); height: calc({{SIZE}}px + 82px);',
                ],
            ] );
            $this->add_control( 'marker_logo_size', [
                'label' => 'Logo 大小', 'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [ 'min' => 30, 'max' => 100 ], 'default' => [ 'size' => 50 ],
                'selectors' => [ '{{WRAPPER}} .zgm-marker-logo img' => 'width: {{SIZE}}px; height: {{SIZE}}px;' ],
            ] );
            $this->end_controls_section();

            /* ── GMaps 按钮样式 ── */
            $this->start_controls_section( 'section_gmaps_btn', [
                'label' => 'GMaps 按钮', 'tab' => \Elementor\Controls_Manager::TAB_STYLE,
                'condition' => [ 'show_gmaps_button' => 'yes' ],
            ] );
            $this->add_control( 'gmaps_btn_bg', [
                'label' => '背景色', 'type' => \Elementor\Controls_Manager::COLOR, 'default' => '#ffffff',
                'selectors' => [ '{{WRAPPER}} .zgm-gmaps-btn' => 'background-color: {{VALUE}};' ],
            ] );
            $this->add_control( 'gmaps_btn_text', [
                'label' => '文字颜色', 'type' => \Elementor\Controls_Manager::COLOR, 'default' => '#333333',
                'selectors' => [ '{{WRAPPER}} .zgm-gmaps-btn' => 'color: {{VALUE}};' ],
            ] );
            $this->end_controls_section();

            /* ── 容器样式 ── */
            $this->start_controls_section( 'section_container_style', [
                'label' => '容器样式', 'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ] );
            $this->add_control( 'map_border_radius', [
                'label' => '地图圆角', 'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [ 'min' => 0, 'max' => 50 ], 'default' => [ 'size' => 0 ],
                'selectors' => [ '{{WRAPPER}} .zgm-map-container' => 'border-radius: {{SIZE}}px;' ],
            ] );
            $this->add_control( 'map_border_color', [
                'label' => '边框颜色', 'type' => \Elementor\Controls_Manager::COLOR, 'default' => '#e0e0e0',
                'selectors' => [ '{{WRAPPER}} .zgm-map-container' => 'border-color: {{VALUE}};' ],
            ] );
            $this->add_control( 'map_border_width', [
                'label' => '边框宽度', 'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [ 'min' => 0, 'max' => 10 ], 'default' => [ 'size' => 1 ],
                'selectors' => [ '{{WRAPPER}} .zgm-map-container' => 'border-style: solid; border-width: {{SIZE}}px;' ],
            ] );
            $this->add_responsive_control( 'map_margin', [
                'label' => '外边距', 'type' => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => [ 'px', 'em', '%', 'rem' ],
                'default' => [ 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'unit' => 'px', 'isLinked' => false ],
                'selectors' => [ '{{WRAPPER}} .zgm-map-wrapper' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};' ],
            ] );
            $this->end_controls_section();
        }

        protected function render() {
            $settings = $this->get_settings_for_display();

            $api_key_override = isset( $settings['api_key_override'] ) ? trim( $settings['api_key_override'] ) : '';
            $map_language     = isset( $settings['map_language'] ) ? $settings['map_language'] : 'auto';
            $location_mode = isset( $settings['location_mode'] ) ? $settings['location_mode'] : 'address';
            $address       = isset( $settings['address'] ) ? $settings['address'] : '';
            $latitude      = isset( $settings['latitude'] ) ? $settings['latitude'] : '';
            $longitude     = isset( $settings['longitude'] ) ? $settings['longitude'] : '';
            $zoom = 15;
            if ( isset( $settings['zoom'] ) && is_array( $settings['zoom'] ) && isset( $settings['zoom']['size'] ) ) {
                $zoom = intval( $settings['zoom']['size'] );
            }
            $draggable   = ( isset( $settings['draggable'] ) && $settings['draggable'] === 'yes' );
            $scrollwheel = ( isset( $settings['scrollwheel'] ) && $settings['scrollwheel'] === 'yes' );

            $map_style_preset  = isset( $settings['map_style_preset'] ) ? $settings['map_style_preset'] : 'light_gray';
            $custom_style_json = isset( $settings['custom_style_json'] ) ? $settings['custom_style_json'] : '';

            $show_zoom        = ( isset( $settings['show_zoom_control'] ) && $settings['show_zoom_control'] === 'yes' );
            $show_map_type    = ( isset( $settings['show_map_type_control'] ) && $settings['show_map_type_control'] === 'yes' );
            $show_scale       = ( isset( $settings['show_scale_control'] ) && $settings['show_scale_control'] === 'yes' );
            $show_fullscreen  = ( isset( $settings['show_fullscreen_control'] ) && $settings['show_fullscreen_control'] === 'yes' );
            $show_street_view = ( isset( $settings['show_street_view_control'] ) && $settings['show_street_view_control'] === 'yes' );
            $show_gmaps_btn   = ( isset( $settings['show_gmaps_button'] ) && $settings['show_gmaps_button'] === 'yes' );
            $gmaps_btn_pos    = isset( $settings['gmaps_button_position'] ) ? $settings['gmaps_button_position'] : 'bottom-right';

            $pulse_outer_enable = ( isset( $settings['pulse_outer_enable'] ) && $settings['pulse_outer_enable'] === 'yes' );
            $pulse_inner_enable = ( isset( $settings['pulse_inner_enable'] ) && $settings['pulse_inner_enable'] === 'yes' );

            $markers_data = array();
            if ( isset( $settings['markers'] ) && is_array( $settings['markers'] ) ) {
                foreach ( $settings['markers'] as $m ) {
                    $img_url = '';
                    if ( isset( $m['marker_image'] ) && is_array( $m['marker_image'] ) && ! empty( $m['marker_image']['url'] ) ) {
                        $img_url = $m['marker_image']['url'];
                    }
                    $markers_data[] = array(
                        'mode' => isset( $m['marker_mode'] ) ? $m['marker_mode'] : 'default_circle',
                        'title' => isset( $m['marker_title'] ) ? $m['marker_title'] : '',
                        'text' => isset( $m['marker_text'] ) ? $m['marker_text'] : '',
                        'image' => esc_url( $img_url ),
                        'lat' => isset( $m['marker_lat'] ) ? $m['marker_lat'] : '',
                        'lng' => isset( $m['marker_lng'] ) ? $m['marker_lng'] : '',
                        'draggable' => ( isset( $m['marker_draggable'] ) && $m['marker_draggable'] === 'yes' ),
                        'show_info_window' => ( isset( $m['show_info_window'] ) && $m['show_info_window'] === 'yes' ),
                        'info_content' => isset( $m['info_window_content'] ) ? $m['info_window_content'] : '',
                    );
                }
            }

            $api_key = $api_key_override;
            if ( empty( $api_key ) ) $api_key = get_option( 'elementor_google_maps_api_key', '' );
            if ( empty( $api_key ) ) {
                $es = get_option( 'elementor_settings', array() );
                if ( is_array( $es ) && ! empty( $es['google_maps_api_key'] ) ) $api_key = $es['google_maps_api_key'];
            }

            $detected_lang = '';
            if ( $map_language === 'auto' ) {
                if ( defined( 'ICL_LANGUAGE_CODE' ) ) $detected_lang = ICL_LANGUAGE_CODE;
                elseif ( function_exists( 'trp_get_current_language' ) ) { $d = trp_get_current_language(); if ( is_string( $d ) ) $detected_lang = substr( $d, 0, 5 ); }
                elseif ( function_exists( 'pll_current_language' ) ) { $d = pll_current_language(); if ( is_string( $d ) ) $detected_lang = $d; }
                elseif ( function_exists( 'get_locale' ) ) $detected_lang = substr( get_locale(), 0, 5 );
            }

            $widget_id = 'zgm-' . $this->get_id();
            $pulse_cls = '';
            if ( ! $pulse_outer_enable ) $pulse_cls .= ' zgm-no-outer';
            if ( ! $pulse_inner_enable ) $pulse_cls .= ' zgm-no-inner';

            echo '<div class="zgm-map-wrapper">';
            echo '<div id="' . esc_attr( $widget_id ) . '" class="zgm-map-container' . esc_attr( $pulse_cls ) . '"';
            echo ' data-location-mode="' . esc_attr( $location_mode ) . '"';
            echo ' data-address="' . esc_attr( $address ) . '"';
            echo ' data-lat="' . esc_attr( $latitude ) . '" data-lng="' . esc_attr( $longitude ) . '"';
            echo ' data-zoom="' . esc_attr( $zoom ) . '"';
            echo ' data-draggable="' . ( $draggable ? 'true' : 'false' ) . '"';
            echo ' data-scrollwheel="' . ( $scrollwheel ? 'true' : 'false' ) . '"';
            echo ' data-style-preset="' . esc_attr( $map_style_preset ) . '"';
            echo ' data-custom-style="' . esc_attr( $custom_style_json ) . '"';
            echo ' data-show-zoom="' . ( $show_zoom ? 'true' : 'false' ) . '"';
            echo ' data-show-map-type="' . ( $show_map_type ? 'true' : 'false' ) . '"';
            echo ' data-show-scale="' . ( $show_scale ? 'true' : 'false' ) . '"';
            echo ' data-show-fullscreen="' . ( $show_fullscreen ? 'true' : 'false' ) . '"';
            echo ' data-show-street-view="' . ( $show_street_view ? 'true' : 'false' ) . '"';
            echo ' data-show-gmaps-btn="' . ( $show_gmaps_btn ? 'true' : 'false' ) . '"';
            echo ' data-gmaps-btn-pos="' . esc_attr( $gmaps_btn_pos ) . '"';
            echo ' data-language="' . esc_attr( $map_language ) . '"';
            echo ' data-detected-lang="' . esc_attr( $detected_lang ) . '"';
            echo ' data-api-key="' . esc_attr( $api_key ) . '"';
            echo ' data-markers="' . esc_attr( wp_json_encode( $markers_data ) ) . '"';
            echo '></div></div>';
        }
    }
    }

    $widgets_manager->register( new TTT_Google_Maps_Widget() );
} );
