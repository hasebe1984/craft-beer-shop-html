class RobustScrollAnimationSystem {
    constructor() {
        this.animationElements = new Map();
        this.ticking = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        this.init();
    }

    init() {
        this.detectElements();
        this.setupScrollListener();
        this.startFPSCounter();
        this.updateScrollEffects(); // 初回実行

        console.log(' 堅牢なスクロールアニメーションシステムが初期化されました');
        console.log(`検出された要素数: ${this.animationElements.size}`);
    }

    // data属性を使用して要素を自動検出
    detectElements() {
        this.animationElements.clear();

        // スクロールタイプを持つ全ての要素を検出
        const scrollElements = document.querySelectorAll('[data-scroll-type]');

        scrollElements.forEach((element) => {
            const scrollType = element.dataset.scrollType;
            const elementId = this.generateElementId(element);

            const config = {
                element: element,
                type: scrollType,
                ...this.getElementConfig(element),
            };

            this.animationElements.set(elementId, config);
        });

        this.updateDebugInfo();
    }

    // 要素の一意IDを生成
    generateElementId(element) {
        return element.id || element.className.split(' ').join('-') + '-' + Math.random().toString(36).substr(2, 9);
    }

    // 要素の設定を取得
    getElementConfig(element) {
        const config = {};

        // data属性から設定を取得
        Object.keys(element.dataset).forEach((key) => {
            if (key !== 'scrollType') {
                config[key] = element.dataset[key];
            }
        });

        // 子要素も検索
        const childElements = element.querySelectorAll('[data-scroll-element]');
        config.childElements = Array.from(childElements).map((child) => ({
            element: child,
            name: child.dataset.scrollElement,
            ...child.dataset,
        }));

        return config;
    }

    // スクロールリスナーセットアップ
    setupScrollListener() {
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        window.addEventListener('resize', () => this.detectElements());
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateScrollEffects());
            this.ticking = true;
        }
    }

    // メインのスクロール効果更新関数
    updateScrollEffects() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        let activeAnimations = 0;

        this.animationElements.forEach((config, id) => {
            const { element, type } = config;

            // 要素が存在するかチェック
            if (!document.contains(element)) {
                this.animationElements.delete(id);
                return;
            }

            const rect = element.getBoundingClientRect();
            const isVisible = rect.bottom > 0 && rect.top < windowHeight;

            if (isVisible || type === 'rotate') {
                activeAnimations++;
                this.applyAnimation(config, scrollTop, windowHeight, rect);
            }
        });

        this.updateProgress(scrollTop);
        this.updateDebugInfo(activeAnimations);
        this.ticking = false;
    }

    // アニメーションタイプ別の処理
    applyAnimation(config, scrollTop, windowHeight, rect) {
        const { element, type, childElements = [] } = config;

        switch (type) {
            case 'rotate':
                this.applyRotateAnimation(element, config, scrollTop);
                break;

            case 'hero':
                this.applyHeroAnimation(childElements, rect, windowHeight);
                break;

            case 'sliding':
                this.applySlidingAnimation(childElements, config, rect, windowHeight);
                break;

            case 'horizontal':
                this.applyHorizontalAnimation(childElements, config, rect, windowHeight);
                break;

            case 'parallax':
                this.applyParallaxAnimation(childElements, rect, windowHeight);
                break;

            case 'zoom':
                this.applyZoomAnimation(childElements, config, rect, windowHeight);
                break;

            case 'fadein':
                this.applyFadeInAnimation(childElements, config, rect, windowHeight);
                break;
        }
    }

    // 回転アニメーション
    applyRotateAnimation(element, config, scrollTop) {
        const speed = parseFloat(config.rotateSpeed) || 10;
        const rotation = (scrollTop / speed) % 360;
        element.style.transform = `rotate(${rotation}deg)`;
    }

    // ヒーローアニメーション
    applyHeroAnimation(childElements, rect, windowHeight) {
        if (rect.bottom > 0 && rect.top < windowHeight) {
            const progress = Math.abs(rect.top) / windowHeight;

            childElements.forEach((child) => {
                if (child.name === 'hero-image') {
                    const scale = 1 + progress * 2;
                    child.element.style.transform = `scale(${scale})`;
                } else if (child.name === 'hero-text') {
                    child.element.style.opacity = Math.max(0, 1 - progress * 2);
                }
            });
        }
    }

    // 横移動アニメーション
    applySlidingAnimation(childElements, config, rect, windowHeight) {
        if (rect.bottom > 0 && rect.top < windowHeight) {
            const progress = -rect.top / windowHeight;
            const slideRange = parseFloat(config.slideRange) || 50;
            const translateX = progress * slideRange - slideRange / 2;

            childElements.forEach((child) => {
                if (child.name === 'sliding-text') {
                    child.element.style.transform = `translateX(${translateX}vw)`;
                }
            });
        }
    }

    // 横スクロールアニメーション
    applyHorizontalAnimation(childElements, config, rect, windowHeight) {
        const wrapperHeight = config.element.offsetHeight;

        if (rect.bottom > 0 && rect.top < windowHeight) {
            const progress = Math.min(1, Math.max(0, -rect.top / (wrapperHeight - windowHeight)));
            const scrollDistance = parseFloat(config.scrollDistance) || 400;
            const translateX = -progress * scrollDistance;

            childElements.forEach((child) => {
                if (child.name === 'horizontal-content') {
                    child.element.style.transform = `translateX(${translateX}vw)`;
                }
            });
        }
    }

    // パララックスアニメーション
    applyParallaxAnimation(childElements, rect, windowHeight) {
        if (rect.bottom > 0 && rect.top < windowHeight) {
            const progress = -rect.top / windowHeight;

            childElements.forEach((child) => {
                if (child.name === 'parallax-bg') {
                    const speed = parseFloat(child.parallaxSpeed) || 100;
                    child.element.style.transform = `translateY(${progress * speed}px)`;
                } else if (child.name === 'parallax-content') {
                    if (rect.top < windowHeight * 0.5) {
                        child.element.classList.add('visible');
                    }
                }
            });
        }
    }

    // ズームアニメーション
    applyZoomAnimation(childElements, config, rect, windowHeight) {
        const wrapperHeight = config.element.offsetHeight;

        if (rect.bottom > 0 && rect.top < windowHeight) {
            const progress = Math.min(1, Math.max(0, -rect.top / (wrapperHeight - windowHeight)));
            const zoomScale = parseFloat(config.zoomScale) || 2;
            const scale = 1 + progress * zoomScale;

            childElements.forEach((child) => {
                if (child.name === 'zoom-image') {
                    child.element.style.transform = `scale(${scale})`;
                }
            });
        }
    }

    // フェードインアニメーション
    applyFadeInAnimation(childElements, config, rect, windowHeight) {
        const triggerPoint = parseFloat(config.triggerPoint) || 0.8;

        if (rect.top < windowHeight * triggerPoint) {
            childElements.forEach((child) => {
                if (child.name === 'fade-content') {
                    child.element.classList.add('visible');
                }
            });
        }
    }

    // プログレスバー更新
    updateProgress(scrollTop) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
    }

    // デバッグ情報更新
    updateDebugInfo(activeAnimations = 0) {
        const elementCount = document.getElementById('elementCount');
        const activeAnimationsEl = document.getElementById('activeAnimations');
        const scrollPosition = document.getElementById('scrollPosition');
        const fpsEl = document.getElementById('fps');

        if (elementCount) elementCount.textContent = this.animationElements.size;
        if (activeAnimationsEl) activeAnimationsEl.textContent = activeAnimations;
        if (scrollPosition) scrollPosition.textContent = Math.round(window.pageYOffset);
        if (fpsEl) fpsEl.textContent = this.fps;
    }

    // FPSカウンター
    startFPSCounter() {
        setInterval(() => {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }, 1000);

        const countFrame = () => {
            this.frameCount++;
            requestAnimationFrame(countFrame);
        };
        countFrame();
    }

    // 動的要素の再検出
    refresh() {
        this.detectElements();
        console.log('🔄 要素を再検出しました');
    }

    // 特定のアニメーションを無効化/有効化
    toggleAnimation(elementId, enabled = true) {
        const config = this.animationElements.get(elementId);
        if (config) {
            config.enabled = enabled;
        }
    }

    // パフォーマンス情報取得
    getPerformanceInfo() {
        return {
            elementsCount: this.animationElements.size,
            fps: this.fps,
            memoryUsage: performance.memory
                ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                }
                : 'N/A',
        };
    }
}

// システムを初期化
const scrollSystem = new RobustScrollAnimationSystem();

// グローバルに公開（デバッグ用）
window.scrollSystem = scrollSystem;

// 動的要素追加のデモ
// setTimeout(() => {
//     console.log('💡 5秒後に新しい要素を動的追加');

//     const newSection = document.createElement('section');
//     newSection.style.cssText = `
//     min-height: 100vh;
//     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: white;
//     text-align: center;
//     font-size: 2rem;
// `;
//     newSection.dataset.scrollType = 'fadein';
//     newSection.innerHTML = `
//     <div data-scroll-element="fade-content" data-trigger-point="0.7">
//         <h2>🆕 動的に追加されたセクション</h2>
//         <p>このセクションは5秒後に動的に追加されました！</p>
//     </div>
// `;

//     document.body.appendChild(newSection);
//     scrollSystem.refresh();
// }, 5000);

// キーボードショートカット
// document.addEventListener('keydown', (e) => {
//     switch (e.key.toLowerCase()) {
//         case 'r':
//             e.preventDefault();
//             scrollSystem.refresh();
//             console.log('🔄 手動更新実行');
//             break;
//         case 'p':
//             e.preventDefault();
//             console.log('📊 パフォーマンス情報:', scrollSystem.getPerformanceInfo());
//             break;
//     }
// });

// console.log('🎮 使用可能なコマンド:');
// console.log('- Rキー: 要素を手動更新');
// console.log('- Pキー: パフォーマンス情報表示');
// console.log('- scrollSystem.refresh(): 要素再検出');
// console.log('- scrollSystem.getPerformanceInfo(): パフォーマンス情報');
