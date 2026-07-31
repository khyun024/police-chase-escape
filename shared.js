/* =========================================================================
   ESCAPE 7 — 공용 인터페이스 스크립트
   · 페이지 사이를 암전으로 이어 붙여 새로고침 느낌을 지운다
   · 챕터 표시(CH.1 / CH.2)를 공통으로 얹는다
   · 1부 → 2부로 넘어갈 때 "이어서 넘어왔다"는 신호를 남긴다
   ========================================================================= */
(function(){
  "use strict";

  /* 빌드 표시 — 폰에서 어떤 버전이 떠 있는지 눈으로 확인할 수 있게 */
  const BUILD = '2026-07-31 · v7';

  /* ---------- 암전 오버레이 ---------- */
  const fade = document.createElement('div');
  fade.id = 'x-fade';
  const mount = () => {
    document.body.appendChild(fade);
    const reveal = () => fade.classList.add('clear');
    // rAF는 탭이 화면에 그려지지 않으면 실행되지 않는다 → 타이머로도 반드시 걷어낸다
    requestAnimationFrame(() => requestAnimationFrame(reveal));
    setTimeout(reveal, 80);
  };
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  /* 다른 장면으로 이동 — 화면을 덮은 뒤 넘어간다 */
  function go(url, opts){
    if(opts && opts.jump){
      try{ sessionStorage.setItem('escape7.jump', '1'); }catch(e){}
    }
    fade.classList.remove('clear');
    setTimeout(() => { location.href = url; }, 430);
  }

  /* 1부에서 곧장 넘어온 상황인가 */
  function cameFromPrison(){
    let flag = false;
    try{
      flag = sessionStorage.getItem('escape7.jump') === '1';
      if(flag) sessionStorage.removeItem('escape7.jump');
    }catch(e){}
    return flag || /(\?|&)from=prison/.test(location.search);
  }

  /* ---------- 챕터 표시 ---------- */
  function chip(n){
    const el = document.createElement('div');
    el.className = 'x-chip';
    el.innerHTML = (n === 1 ? '<b>CH.1</b> 감옥' : '<b>CH.2</b> 도로') +
      '<span class="dot' + (n === 1 ? ' on' : '') + '"></span>' +
      '<span class="dot' + (n === 2 ? ' on' : '') + '"></span>';
    const add = () => document.body.appendChild(el);
    if(document.body) add(); else document.addEventListener('DOMContentLoaded', add);
    return el;
  }

  /* data-go 속성이 붙은 링크·버튼은 자동으로 암전 전환 */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go]');
    if(!t) return;
    e.preventDefault();
    go(t.getAttribute('data-go'), { jump: t.hasAttribute('data-jump') });
  });

  /* ---------- 빌드 라벨 ---------- */
  const stamp = document.createElement('div');
  stamp.className = 'x-build';
  stamp.textContent = 'build ' + BUILD;
  const addStamp = () => document.body.appendChild(stamp);
  if(document.body) addStamp(); else document.addEventListener('DOMContentLoaded', addStamp);

  /* ---------- 서비스워커: 항상 최신을 받아온다 ----------
     캐시에 눌러앉은 예전 버전 때문에 수정이 반영되지 않는 일을 막는다. */
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then(reg => {
        reg.update();
        setInterval(() => reg.update(), 60000);
      })
      .catch(()=>{});
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if(refreshing) return;            // 새 버전이 넘겨받으면 한 번만 새로고침
      refreshing = true;
      location.reload();
    });
  }

  window.X = { go, chip, cameFromPrison, fade, build: BUILD, stamp };
})();
