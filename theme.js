(function () {
    'use strict';

    // FOUC 방지용 초기 적용은 각 HTML <head>의 인라인 스크립트가 이미 처리.
    // 여기서는 토글 버튼의 클릭 핸들러만 부착한다.

    function apply(theme) {
        var html = document.documentElement;
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        try { localStorage.setItem('theme', theme); } catch (e) { /* private mode 등 */ }

        // 접근성용 aria-label 갱신
        var btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.setAttribute(
                'aria-label',
                theme === 'dark' ? '라이트 테마로 전환' : '다크 테마로 전환'
            );
            btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
    }

    function init() {
        var btn = document.querySelector('.theme-toggle');
        if (!btn) return;

        // 현재 상태로 aria-label 초기화
        var current = document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'dark' : 'light';
        apply(current);

        btn.addEventListener('click', function () {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            apply(isDark ? 'light' : 'dark');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
