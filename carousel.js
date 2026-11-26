(function(){let cleanup=[];function init(){cleanup.forEach(f=>f());cleanup=[];const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const product=document.querySelector('.vivabox-video-stage');if(product){const video=product.querySelector('video'),source=video?.querySelector('source');let visible=false;const sync=()=>{if(!video)return;if(visible&&!reduced.matches&&document.visibilityState==='visible'){if(source?.dataset.src){source.src=source.dataset.src;delete source.dataset.src;video.load()}video.play().catch(()=>{})}else video.pause()};const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.2});observer.observe(product);const onPlaying=()=>product.classList.add('is-playing');const onError=()=>{product.classList.remove('is-playing');video.pause()};video.addEventListener('playing',onPlaying);video.addEventListener('error',onError);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);cleanup.push(()=>{observer.disconnect();video.pause();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);video.removeEventListener('playing',onPlaying);video.removeEventListener('error',onError)})}document.querySelectorAll('.health-carousel').forEach(root => {
  const slides = [...root.querySelectorAll('.health-carousel-slide')];
  const pages = [...root.querySelectorAll('.carousel-page')];
  const tabs = [...root.closest('.health-carousel-row').querySelectorAll('.scenario-tabs button')];
  const controller = new AbortController();
  const options = {signal: controller.signal};
  let index = 0;
  let timer;
  let visible = false;
  let touchX = null;

  for (const img of root.querySelectorAll('img[data-src]')) {
    img.loading = 'eager';
    img.src = img.dataset.src;
    delete img.dataset.src;
  }

  function schedule() {
    clearTimeout(timer);
    if (visible && !reduced.matches && document.visibilityState === 'visible') {
      timer = setTimeout(() => show(index + 1), 5000);
    }
  }

  function show(next) {
    const previous = index;
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-outgoing', i === previous && previous !== index);
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    pages.forEach((page, i) => {
      page.classList.toggle('is-active', i === index);
      page.setAttribute('aria-current', String(i === index));
    });
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    schedule();
  }

  [pages, tabs].forEach(buttons => buttons.forEach((button, i) => {
    button.addEventListener('click', () => show(i), options);
  }));
  root.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
  }, options);
  root.addEventListener('touchstart', event => {
    touchX = event.changedTouches[0].clientX;
  }, {...options, passive:true});
  root.addEventListener('touchend', event => {
    if (touchX === null) return;
    const distance = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(distance) > 40) show(index + (distance < 0 ? 1 : -1));
  }, {...options, passive:true});
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, {threshold:.15});
  observer.observe(root);
  document.addEventListener('visibilitychange', schedule, options);
  reduced.addEventListener('change', schedule, options);
  cleanup.push(() => {
    clearTimeout(timer);
    observer.disconnect();
    controller.abort();
  });
})}
window.initOrbivaCarousels = init;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
else init();
})();
