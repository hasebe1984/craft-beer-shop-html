document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const menuOverlay = document.getElementById('menuOverlay');
    const body = document.body;
    const menuLinks = menuOverlay.querySelectorAll('a');

    // 1. ハンバーガーアイコンのクリックイベント
    hamburger.addEventListener('click', () => {
        // アイコンを三本線 ⇔ クロス に切り替える
        hamburger.classList.toggle('open');
        // メニューオーバーレイを表示 ⇔ 非表示 に切り替える (左からスライド)
        menuOverlay.classList.toggle('open');
        // メニュー表示中はスクロール不可にする
        body.classList.toggle('no-scroll');
    });

    // 2. メニューリンクがクリックされた時のイベント (ページ遷移後メニューを閉じる)
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            // クラスを削除してメニューを閉じる
            hamburger.classList.remove('open');
            menuOverlay.classList.remove('open');
            body.classList.remove('no-scroll');

            // ページ遷移（href属性による移動）はブラウザに任せる
        });
    });
});