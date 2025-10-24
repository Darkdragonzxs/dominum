/* Main UI interactions for the Dominum Proxy UI scaffold
   - Mobile nav toggle
   - Settings persistence (dark mode, animations, font size)
   - Year injection in footer
   This file intentionally contains UI-only logic. Proxy/network functionality is not included.
*/
(function(){
  'use strict'

  // mobile nav toggle
  const navToggle = document.getElementById('navToggle')
  const mainNav = document.getElementById('mainNav')
  if(navToggle && mainNav){
    navToggle.addEventListener('click', ()=>{
      mainNav.classList.toggle('open')
      navToggle.classList.toggle('open')
    })
  }

  // set year in all pages
  const year = new Date().getFullYear()
  document.querySelectorAll('#year,#year2,#year3,#year4,#year5,#year6').forEach(el=>{ if(el) el.textContent = year })

  // simple sidebar clock + date (UI only)
  function updateSidebarClock(){
    const el = document.getElementById('sidebarClock')
    const dateEl = document.getElementById('sidebarDate')
    if(!el) return
    const now = new Date()
    const hh = String(now.getHours()).padStart(2,'0')
    const mm = String(now.getMinutes()).padStart(2,'0')
    el.textContent = hh + ':' + mm
    if(dateEl) dateEl.textContent = now.toLocaleDateString(undefined,{month:'short',day:'numeric'})
  }
  updateSidebarClock()
  setInterval(updateSidebarClock, 30*1000)

  // Page transition: intercept local links and animate out before navigating
  document.addEventListener('click', (e)=>{
    const a = e.target.closest && e.target.closest('a')
    if(!a) return
    const href = a.getAttribute('href')
    if(!href) return
    // only intercept internal html pages
    if(href.endsWith('.html') || href.startsWith('#')){
      // allow anchors and same page
      if(href.startsWith('#')) return
      e.preventDefault()
      document.documentElement.classList.add('page-exit')
      setTimeout(()=> window.location.href = href, 380)
    }
  })

  // Entry animation
  window.requestAnimationFrame(()=>{
    document.documentElement.classList.remove('page-exit')
    document.documentElement.classList.add('page-enter')
    setTimeout(()=> document.documentElement.classList.remove('page-enter'), 600)
  })

  // Particles: lightweight canvas-based particle system
  const particleCanvas = document.getElementById('particleCanvas')
  let particleCtx, particles = [], particleRAF

  function resizeCanvas(){
    if(!particleCanvas) return
    particleCanvas.width = window.innerWidth
    particleCanvas.height = window.innerHeight
  }

  function createParticles(count){
    particles = []
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*particleCanvas.width,
        y: Math.random()*particleCanvas.height,
        vx: (Math.random()-0.5) * 0.3,
        vy: (Math.random()-0.5) * 0.3,
        r: 0.6 + Math.random()*2.6,
        alpha: 0.5 + Math.random()*0.8,
        hue: 200 + Math.random()*60
      })
    }
  }

  function renderParticles(){
    if(!particleCtx) return
    particleCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height)
    for(const p of particles){
      p.x += p.vx
      p.y += p.vy
      // gentle wrap
      if(p.x < -10) p.x = particleCanvas.width + 10
      if(p.x > particleCanvas.width + 10) p.x = -10
      if(p.y < -10) p.y = particleCanvas.height + 10
      if(p.y > particleCanvas.height + 10) p.y = -10

      const g = particleCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6)
      g.addColorStop(0, `hsla(${p.hue},90%,65%,${p.alpha})`)
      g.addColorStop(0.4, `hsla(${p.hue},80%,45%,${p.alpha*0.4})`)
      g.addColorStop(1, `hsla(${p.hue},60%,20%,0)`) 
      particleCtx.fillStyle = g
      particleCtx.beginPath()
      particleCtx.arc(p.x,p.y,p.r,0,Math.PI*2)
      particleCtx.fill()
    }
    particleRAF = requestAnimationFrame(renderParticles)
  }

  function startParticles(){
    if(!particleCanvas) return
    particleCtx = particleCanvas.getContext('2d')
    resizeCanvas()
    createParticles(Math.round((window.innerWidth*window.innerHeight)/90000))
    cancelAnimationFrame(particleRAF)
    particleRAF = requestAnimationFrame(renderParticles)
  }

  function stopParticles(){
    cancelAnimationFrame(particleRAF)
    if(particleCtx) particleCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height)
    particles = []
  }

  // Particle toggle saved in localStorage
  const savedParticles = localStorage.getItem('ui:particles')
  const particleEnabled = savedParticles === null ? true : savedParticles === 'true'
  if(particleEnabled) startParticles()

  window.addEventListener('resize', ()=>{
    resizeCanvas()
    if(particleEnabled) createParticles(Math.round((window.innerWidth*window.innerHeight)/90000))
  })

  // wire up settings toggle if present
  const toggleParticles = document.getElementById('toggleParticles')
  if(toggleParticles){
    toggleParticles.checked = particleEnabled
    toggleParticles.addEventListener('change', ()=>{
      const enabled = toggleParticles.checked
      localStorage.setItem('ui:particles', String(enabled))
      if(enabled) startParticles()
      else stopParticles()
    })
  }

  // settings controls
  const rootHtml = document.documentElement
  // apply saved prefs
  const savedDark = localStorage.getItem('ui:dark')
  const savedAnim = localStorage.getItem('ui:animations')
  const savedFont = parseFloat(localStorage.getItem('ui:fontScale') || '1')
  if(savedDark === 'true') rootHtml.classList.add('dark')
  if(savedAnim === 'false') rootHtml.setAttribute('data-animations','false')
  if(savedFont && !Number.isNaN(savedFont)) rootHtml.style.fontSize = (savedFont*100) + '%'

  const toggleDark = document.getElementById('toggleDark')
  const toggleAnim = document.getElementById('toggleAnim')
  const incFont = document.getElementById('incFont')
  const decFont = document.getElementById('decFont')
  const resetFont = document.getElementById('resetFont')

  if(toggleDark){
    toggleDark.checked = savedDark === 'true'
    toggleDark.addEventListener('change', ()=>{
      const enabled = toggleDark.checked
      if(enabled) rootHtml.classList.add('dark')
      else rootHtml.classList.remove('dark')
      localStorage.setItem('ui:dark', String(enabled))
    })
  }

  if(toggleAnim){
    toggleAnim.checked = savedAnim !== 'false'
    toggleAnim.addEventListener('change', ()=>{
      const enabled = toggleAnim.checked
      if(!enabled) rootHtml.setAttribute('data-animations','false')
      else rootHtml.removeAttribute('data-animations')
      localStorage.setItem('ui:animations', String(enabled))
    })
  }

  function setFontScale(scale){
    const clamped = Math.min(1.4, Math.max(0.8, scale))
    rootHtml.style.fontSize = (clamped*100) + '%'
    localStorage.setItem('ui:fontScale', String(clamped))
  }
  if(incFont) incFont.addEventListener('click', ()=>{
    const cur = parseFloat(getComputedStyle(rootHtml).fontSize) / 16
    setFontScale(cur + 0.05)
  })
  if(decFont) decFont.addEventListener('click', ()=>{
    const cur = parseFloat(getComputedStyle(rootHtml).fontSize) / 16
    setFontScale(cur - 0.05)
  })
  if(resetFont) resetFont.addEventListener('click', ()=> setFontScale(1))

  // keyboard shortcuts (UI): h - home, g - games, a - apps, s - settings
  window.addEventListener('keydown', (e)=>{
    if(document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return
    if(e.key === 'h') window.location.href = 'index.html'
    if(e.key === 'g') window.location.href = 'games.html'
    if(e.key === 'a') window.location.href = 'apps.html'
    if(e.key === 's') window.location.href = 'settings.html'
  })

})();
