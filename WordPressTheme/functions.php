<?php

/**
 * Functions
 */

/**
 * WordPress標準機能
 */
function my_setup()
{
	add_theme_support('post-thumbnails');
	add_theme_support('automatic-feed-links');
	add_theme_support('title-tag');
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
		)
	);
}
add_action('after_setup_theme', 'my_setup');


/**
 * CSSとJavaScriptの読み込み
 * - 開発（.local）：Vite（HMR）
 * - 本番：assets 配信
 */
function my_script_init()
{
	$is_local = (strpos(home_url(), 'localhost') !== false);

	if ($is_local) {
		// ================================
		// 開発：Vite
		// ================================
		$vite = 'http://localhost:5173';

		// Vite client（HMR）
		wp_enqueue_script('vite-client', $vite . '/@vite/client', array(), null, true);

		// 入口（ここで SCSS / JS / Swiper / jQuery など全部 import する）
		wp_enqueue_script('vite-main', $vite . '/src/main.js', array(), null, true);
	} else {
		// ================================
		// 本番：ビルド済み assets
		// ================================

		// CSS
		$css_path = get_theme_file_path('/assets/css/styles.css');
		wp_enqueue_style(
			'my',
			get_template_directory_uri() . '/assets/css/styles.css',
			array(),
			file_exists($css_path) ? filemtime($css_path) : null,
			'all'
		);

		// JS（Vite build で /assets/js/script.js を出す前提）
		$js_path = get_theme_file_path('/assets/js/script.js');
		wp_enqueue_script(
			'my',
			get_template_directory_uri() . '/assets/js/script.js',
			array(),
			file_exists($js_path) ? filemtime($js_path) : null,
			true
		);
	}
}
add_action('wp_enqueue_scripts', 'my_script_init');


/**
 * アーカイブタイトル書き換え
 */
function my_archive_title($title)
{
	if (is_home()) {
		$title = 'ブログ';
	} elseif (is_category()) {
		$title = '' . single_cat_title('', false) . '';
	} elseif (is_tag()) {
		$title = '' . single_tag_title('', false) . '';
	} elseif (is_post_type_archive()) {
		$title = '' . post_type_archive_title('', false) . '';
	} elseif (is_tax()) {
		$title = '' . single_term_title('', false);
	} elseif (is_search()) {
		$title = '「' . esc_html(get_query_var('s')) . '」の検索結果';
	} elseif (is_author()) {
		$title = '' . get_the_author() . '';
	} elseif (is_date()) {
		$title = '';
		if (get_query_var('year')) $title .= get_query_var('year') . '年';
		if (get_query_var('monthnum')) $title .= get_query_var('monthnum') . '月';
		if (get_query_var('day')) $title .= get_query_var('day') . '日';
	}
	return $title;
};
add_filter('get_the_archive_title', 'my_archive_title');


/**
 * Vite scripts を module として読み込む（必須）
 */
add_filter('script_loader_tag', function ($tag, $handle, $src) {
	if ($handle === 'vite-client' || $handle === 'vite-main') {
		return '<script type="module" src="' . esc_url($src) . '"></script>';
	}
	return $tag;
}, 10, 3);

add_action('wp_head', function () {
	echo '<style>:root{
    --img-dummy:url("' . esc_url(get_theme_file_uri('assets/images/dummy.webp')) . '");
    --img-dummy02:url("'  . esc_url(get_theme_file_uri('assets/images/dummy02.webp'))  . '");
  }</style>';
}, 1);
