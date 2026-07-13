/* theme toggle */
(function(){
  var btn=document.getElementById('themeBtn');
  // the sun/moon icons are swapped by CSS on [data-theme]; just keep the label current
  function label(){btn.setAttribute('aria-label',document.documentElement.getAttribute('data-theme')==='light'?'Switch to dark mode':'Switch to light mode');}
  label();
  btn.addEventListener('click',function(){
    var next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme',next);
    localStorage.setItem('theme',next);label();
  });
})();
/* hero drawing: rewind, then release into the draw */
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var de=document.documentElement;
  de.classList.add('rewind');
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    de.classList.add('drawing');de.classList.remove('rewind');
  });});
})();
/* ── ACCORDION ── */
(function(){
  var accs=[].slice.call(document.querySelectorAll('[data-acc]'));
  var navEl=document.querySelector('nav');
  var PANEL_MS=520; // must be >= the .acc-panel grid-rows transition (500ms)
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function anchorTo(acc, hadSwitch){
    // If another (taller) section was collapsing, its height animates out over
    // PANEL_MS; scrolling before that finishes lands in the wrong place. So we
    // wait for the collapse to settle, then jump the opened header under the nav.
    // Always wait out the panel expand/collapse so the target's final
    // position is settled before we scroll (otherwise we measure mid-animation).
    var delay = reduce ? 0 : PANEL_MS;
    setTimeout(function(){
      var target=acc.querySelector('.panel-title')||acc;
      // Measure the real nav height: on mobile it wraps to two rows and is much
      // taller than the desktop bar, so a hardcoded offset clips the title.
      var navH=navEl?navEl.getBoundingClientRect().height:72;
      var top=target.getBoundingClientRect().top+window.scrollY-navH-20;
      window.scrollTo({top:top,behavior:reduce?'auto':'smooth'});
    }, delay);
  }
  // map section id -> its cover-menu item, to sync the active highlight
  var triggers={};
  [].slice.call(document.querySelectorAll('.cover-item')).forEach(function(a){
    var id=a.getAttribute('href').slice(1);
    if(document.getElementById(id)) triggers[id]=a;
  });
  function syncActive(){
    accs.forEach(function(acc){
      var t=triggers[acc.id]; if(!t) return;
      var on=acc.hasAttribute('data-open');
      t.classList.toggle('active',on);
      t.setAttribute('aria-expanded',on?'true':'false');
    });
  }
  function setOpen(acc, open, scroll){
    if(open){
      var switched=false;
      // exclusive: collapse every other section first
      accs.forEach(function(other){
        if(other!==acc&&other.hasAttribute('data-open')){other.removeAttribute('data-open');switched=true;}
      });
      acc.setAttribute('data-open','');
      // re-anchor whenever we explicitly navigate OR a different section just closed
      if(scroll||switched) anchorTo(acc, switched);
    }else{acc.removeAttribute('data-open');}
    syncActive();
  }
  // toggle a section (used by cover menu + hash): click the open one to close it
  function toggleById(id, scroll){
    var acc=document.getElementById(id);
    if(acc&&acc.hasAttribute('data-acc')){setOpen(acc, !acc.hasAttribute('data-open'), scroll);}
  }
  // cover-menu links + top-nav in-page anchors control the sections
  [].slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function(a){
    var id=a.getAttribute('href').slice(1);
    if(document.getElementById(id)&&document.getElementById(id).hasAttribute('data-acc')){
      a.addEventListener('click',function(e){e.preventDefault();toggleById(id,true);history.replaceState(null,'',a.getAttribute('href'));});
    }
  });
  // deep-link: open the section named in the URL hash on load
  if(location.hash){var acc=document.getElementById(location.hash.slice(1));if(acc&&acc.hasAttribute('data-acc'))setOpen(acc,true,true);}
})();
/* reveals, with a never-invisible failsafe */
(function(){
  var els=[].slice.call(document.querySelectorAll('.rv'));
  function showAll(){els.forEach(function(el){el.classList.add('in');});}
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window)){showAll();return;}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0,rootMargin:'0px 0px -10% 0px'});
  els.forEach(function(el){io.observe(el);});
  window.addEventListener('load',function(){setTimeout(showAll,2500);});
})();
