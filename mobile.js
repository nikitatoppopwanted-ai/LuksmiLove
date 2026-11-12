/* Mobile / touch adaptive enhancements: disable heavy tilt on coarse pointers, improve menu a11y, prevent body scroll when menu open, optimize ripple */
(function(){
  const isCoarse = window.matchMedia('(pointer:coarse)').matches;
  if(isCoarse){
    document.documentElement.classList.add('pointer-coarse');
    // Block existing tilt pointermove handlers (capture phase)
    document.addEventListener('pointermove', e=>{
      const t=e.target.closest('.tilt');
      if(t) e.stopImmediatePropagation();
    }, true);
  }
  // Improve menu button ARIA and body scroll lock consistency
  const menuBtn=document.querySelector('.menu-toggle');
  const navWrap=document.querySelector('.nav-collapsible');
  if(menuBtn && navWrap){
    if(!menuBtn.hasAttribute('aria-expanded')) menuBtn.setAttribute('aria-expanded','false');
    const sync=()=>{
      const open=menuBtn.classList.contains('active')||navWrap.classList.contains('open');
      menuBtn.setAttribute('aria-expanded', open? 'true':'false');
      document.body.classList.toggle('no-scroll', open);
    };
    // Observe class changes (covers existing click handlers without duplicating)
    const obs=new MutationObserver(sync);
    obs.observe(menuBtn,{attributes:true, attributeFilter:['class']});
    obs.observe(navWrap,{attributes:true, attributeFilter:['class']});
    sync();
  }
  // Reduce ripple duration on coarse pointer for performance
  if(isCoarse){
    const style=document.createElement('style');
    style.textContent='@media (pointer:coarse){ .ripple-ink{animation-duration:.55s!important;} } body.no-scroll{overflow:hidden;}';
    document.head.appendChild(style);
  }
})();
