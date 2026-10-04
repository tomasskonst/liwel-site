/* Liwel 3D jar. Requires three.js r128 and OrbitControls loaded first.
   buildLiwelJar(canvas, getName, onReady) draws the jar into canvas; the label name comes from getName().
   onReady(refresh) hands back a function that redraws the label. Returns a cleanup function. */
function buildLiwelJar(canvas, getName, onReady) {

  var INK = '#0E0F0E', MUTED = '#5C605C', ACCENT = '#C9EFCF', ACCENT_DEEP = '#7FB589', PAPER = '#F7F7F4';
  var PICKED = [1,3,7,11,14,17,22,26,29,33,38,41,44,48,52,59,63,67,71,75,80,86,91,97];
  var INGREDIENTS = [
    ['Vitamin D3','2,000 IU'],['Vitamin K2','75 µg'],['Vitamin B12','250 µg'],['Magnesium','200 mg'],
    ['Omega-3','1,000 mg'],['Zinc','10 mg'],['Iodine','150 µg'],['Glycine','3 g'],['Creatine','3 g']
  ];

  /* ---------- label artwork (180 x 50 mm at 20 px/mm) ---------- */
  var LW = 3600, LH = 1000, PANEL = 1200;
  var labelCanvas = document.createElement('canvas');
  labelCanvas.width = LW; labelCanvas.height = LH;
  var lidCanvas = document.createElement('canvas');
  lidCanvas.width = 1024; lidCanvas.height = 1024;

  function mono(px, w){ return (w||400) + ' ' + px + "px 'Geist Mono', ui-monospace, monospace"; }
  function sans(px, w){ return (w||400) + ' ' + px + "px 'Geist', 'Helvetica Neue', sans-serif"; }
  function hegarty(px){ return '400 ' + px + "px 'BBH Hegarty', 'Archivo Black', sans-serif"; }

  // the motion-dot mark: 5x5 dots, each with three ghosts trailing toward the centre
  function drawMark(ctx, cx, cy, size, color){
    var n = 5, step = size / n, r = step * 0.3;
    var c = (n - 1) / 2;
    var maxD = Math.sqrt(2) * c;
    var ghosts = [0.18, 0.34, 0.6];
    for (var row = 0; row < n; row++){
      for (var col = 0; col < n; col++){
        var x = cx + (col - c) * step, y = cy + (row - c) * step;
        var vx = c - col, vy = c - row;
        var d = Math.sqrt(vx*vx + vy*vy);
        if (d > 0){
          var ux = vx / d, uy = vy / d, reach = d / maxD;
          for (var g = 3; g >= 1; g--){
            var off = g * r * 0.42 * reach;
            ctx.globalAlpha = ghosts[3 - g];
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(x + ux*off, y + uy*off, r, 0, Math.PI*2); ctx.fill();
          }
        }
        ctx.globalAlpha = 1; ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function spacedText(ctx, text, x, y, spacing, align){
    var w = 0, i;
    for (i = 0; i < text.length; i++){ w += ctx.measureText(text[i]).width + (i < text.length-1 ? spacing : 0); }
    var sx = align === 'center' ? x - w/2 : (align === 'right' ? x - w : x);
    var prev = ctx.textAlign; ctx.textAlign = 'left';
    for (i = 0; i < text.length; i++){ ctx.fillText(text[i], sx, y); sx += ctx.measureText(text[i]).width + spacing; }
    ctx.textAlign = prev;
  }

  function drawLabel(name, formula){
    var ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, LW, LH);
    ctx.textBaseline = 'alphabetic';

    /* ----- left panel: formula + use ----- */
    var L = 110, R = PANEL - 110;
    ctx.fillStyle = INK; ctx.font = sans(46, 500); ctx.textAlign = 'left';
    ctx.fillText('Your formula', L, 170);
    ctx.fillStyle = MUTED; ctx.font = mono(26);
    spacedText(ctx, 'PER DAILY DOSE · 2 CAPSULES', L, 220, 3, 'left');
    var y = 300;
    INGREDIENTS.forEach(function(it){
      ctx.strokeStyle = '#D9DBD5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(L, y - 44); ctx.lineTo(R, y - 44); ctx.stroke();
      ctx.fillStyle = INK; ctx.font = sans(32); ctx.textAlign = 'left'; ctx.fillText(it[0], L, y);
      ctx.font = mono(30); ctx.textAlign = 'right'; ctx.fillText(it[1], R, y);
      y += 58;
    });
    ctx.strokeStyle = '#D9DBD5'; ctx.beginPath(); ctx.moveTo(L, y - 44); ctx.lineTo(R, y - 44); ctx.stroke();
    ctx.fillStyle = INK; ctx.font = sans(30, 500); ctx.textAlign = 'left';
    ctx.fillText('+ 15 other micronutrients', L, y + 4);
    ctx.fillStyle = MUTED; ctx.font = sans(26);
    ctx.fillText('Full list and reasons in your dashboard.', L, y + 46);
    ctx.fillStyle = INK; ctx.font = sans(28, 500);
    ctx.fillText('Take 2 capsules a day with water.', L, LH - 80);

    /* ----- front panel ----- */
    var cx = PANEL * 1.5;
    // size the wordmark so mark (same width as the word) + word + text all fit the 50 mm height
    var F = 170, w, cap;
    do {
      ctx.font = hegarty(F);
      var m = ctx.measureText('LIWEL');
      w = m.width;
      cap = m.actualBoundingBoxAscent || F * 0.72;
      F -= 2;
    } while (w + cap > 600 && F > 60);
    var top = 46, gapMW = 50;
    // mark's outer dot edges span 0.92 of its size parameter
    drawMark(ctx, cx, top + w / 2, w / 0.92, INK);
    var wordBase = top + w + gapMW + cap;
    ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText('LIWEL', cx, wordBase);
    var yMade = wordBase + 76;
    ctx.fillStyle = MUTED; ctx.font = mono(26);
    spacedText(ctx, 'EXCLUSIVELY MADE FOR', cx, yMade, 5, 'center');
    ctx.fillStyle = INK; ctx.textAlign = 'center';
    var nameSize = 64; ctx.font = sans(nameSize, 500);
    while (ctx.measureText(name).width > PANEL - 240 && nameSize > 36){ nameSize -= 2; ctx.font = sans(nameSize, 500); }
    var yName = yMade + 80;
    ctx.fillText(name || ' ', cx, yName);
    var yLine = Math.min(yName + 58, LH - 110);
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(PANEL + 150, yLine); ctx.lineTo(PANEL*2 - 150, yLine); ctx.stroke();
    ctx.font = mono(26); ctx.fillStyle = INK;
    var yInfo = yLine + 52;
    ctx.textAlign = 'left'; ctx.fillText('FORMULA ' + (formula || '00000'), PANEL + 150, yInfo);
    ctx.textAlign = 'center'; ctx.fillText('FOOD SUPPLEMENT', cx, yInfo);
    ctx.textAlign = 'right'; ctx.fillText('60 CAPSULES', PANEL*2 - 150, yInfo);

    /* ----- right panel: personal grid + legal ----- */
    var gx = PANEL * 2 + 110, gy = 120, gsize = 400, cell = gsize / 10, dr = cell * 0.36;
    for (var k = 0; k < 100; k++){
      var on = PICKED.indexOf(k) !== -1;
      var px = gx + (k % 10) * cell + cell/2, py = gy + Math.floor(k / 10) * cell + cell/2;
      ctx.beginPath(); ctx.arc(px, py, dr, 0, Math.PI*2);
      ctx.fillStyle = on ? INK : '#E1E3DE'; ctx.fill();
    }
    var tx = gx + gsize + 50;
    ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = hegarty(120);
    ctx.fillText('24', tx, gy + 120);
    ctx.font = sans(30); ctx.fillStyle = INK;
    ctx.fillText('of 100', tx, gy + 175);
    ctx.fillText('ingredients', tx, gy + 213);
    ctx.fillText('picked for you', tx, gy + 251);
    ctx.fillStyle = MUTED; ctx.font = mono(24);
    ctx.fillText('UPDATED 15.09.2026', tx, gy + 320);
    ctx.fillText('RETEST 15.12.2026', tx, gy + 356);

    var legal = [
      'Food supplement. Do not exceed the recommended daily dose.',
      'Not a substitute for a varied diet and a healthy lifestyle.',
      'Keep out of reach of children. Store dry, below 25 °C.',
      'Produced in Europe for Liwel Health.'
    ];
    ctx.fillStyle = MUTED; ctx.font = sans(24);
    var ly = 640;
    legal.forEach(function(t){ ctx.fillText(t, gx, ly); ly += 36; });
    ctx.fillStyle = '#9A9E99'; ctx.font = mono(22);
    ctx.fillText('BATCH [XXXX]   BEST BEFORE [MM/YYYY]', gx, LH - 80);

    // fine guides between panels (very light, printable fold hints)
    ctx.strokeStyle = 'rgba(14,15,14,0.06)'; ctx.lineWidth = 2;
    [PANEL, PANEL*2].forEach(function(x){ ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, LH-60); ctx.stroke(); });

    // flat preview copy

  }

  function drawLid(){
    var ctx = lidCanvas.getContext('2d'), S = 1024;
    ctx.fillStyle = '#121312'; ctx.fillRect(0,0,S,S);
    drawMark(ctx, S/2, S/2 - 70, 300, '#3A3D3A');
    ctx.fillStyle = '#3A3D3A'; ctx.font = hegarty(96); ctx.textAlign = 'center';
    ctx.fillText('LIWEL', S/2, S/2 + 210);
  }

  /* ---------- 3D ---------- */
  var stage = canvas.parentElement;
  if (!window.THREE){ return function(){}; }

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 7.5, 26);

  if (THREE.RoomEnvironment){
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
  }
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bab4, THREE.RoomEnvironment ? 0.35 : 0.9));
  var key = new THREE.DirectionalLight(0xffffff, THREE.RoomEnvironment ? 1.4 : 1.8);
  key.position.set(-8, 14, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -10; key.shadow.camera.right = 10; key.shadow.camera.top = 10; key.shadow.camera.bottom = -10;
  key.shadow.radius = 12; key.shadow.blurSamples = 20; key.shadow.bias = -0.0003;
  key.shadow.camera.near = 1; key.shadow.camera.far = 60;
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(9, 6, -8); scene.add(rim);

  var jar = new THREE.Group();
  scene.add(jar);

  // dimensions in cm
  var R = 3.0, BODY_H = 7.4, NECK_R = 2.72, NECK_TOP = 8.1;
  var profile = [new THREE.Vector2(0, 0.05)];
  profile.push(new THREE.Vector2(R - 0.55, 0.05));
  for (var i = 0; i <= 12; i++){ var a = (i/12) * Math.PI/2; profile.push(new THREE.Vector2(R - 0.42 + Math.sin(a)*0.42, 0.47 - Math.cos(a)*0.42)); }
  profile.push(new THREE.Vector2(R, BODY_H - 0.55));
  for (i = 1; i <= 14; i++){ var b = (i/14) * Math.PI/2; profile.push(new THREE.Vector2(NECK_R + (R - NECK_R) * Math.cos(b), BODY_H - 0.55 + Math.sin(b)*0.55)); }
  profile.push(new THREE.Vector2(NECK_R, NECK_TOP));
  profile.push(new THREE.Vector2(0, NECK_TOP));
  var bodyGeo = new THREE.LatheGeometry(profile, 192, Math.PI);
  var bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xf3f2ee, roughness: 0.34, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.28 });
  var body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  jar.add(body);

  // label: open cylinder just outside the body, with a small gap at the back
  var labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.encoding = THREE.sRGBEncoding;
  labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var GAP = 0.05, LABEL_H = 5.0, LABEL_Y = 3.75;
  var labelGeo = new THREE.CylinderGeometry(R + 0.012, R + 0.012, LABEL_H, 192, 1, true, Math.PI + GAP * Math.PI, Math.PI * 2 * (1 - GAP));
  var labelMat = new THREE.MeshPhysicalMaterial({ map: labelTex, roughness: 0.62, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.6 });
  var labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = LABEL_Y;
  
  jar.add(labelMesh);

  // studio environment used only for crisp reflections on the lid
  var lidEnv = (function(){
    var env = new THREE.Scene();
    var room = new THREE.Mesh(new THREE.BoxGeometry(60, 40, 60), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.18, 0.18, 0.18), side: THREE.BackSide }));
    room.position.y = 14; env.add(room);
    function softbox(w, h, k, p, l){
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(p[0], p[1], p[2]); m.lookAt(l[0], l[1], l[2]); env.add(m);
    }
    softbox(12, 16, 6, [-18, 12, 16], [0, 6, 0]);
    softbox(2.5, 20, 5, [20, 10, -6], [0, 6, 0]);
    softbox(18, 8, 3, [0, 30, 4], [0, 0, 0]);
    var pm = new THREE.PMREMGenerator(renderer);
    return pm.fromScene(env, 0.015).texture;
  })();

  // lid: polypropylene screw cap. smooth skirt band, fine knurling, crisp rounded top edge, recessed top panel
  var LID_R = 3.06, LID_H = 1.9, LID_Y = 7.35, RIBS = 180;
  var RIB_LO = 0.06, RIB_HI = LID_H - 0.2;
  var lp = [];
  lp.push(new THREE.Vector2(LID_R - 0.05, 0));
  lp.push(new THREE.Vector2(LID_R - 0.01, 0.02));
  lp.push(new THREE.Vector2(LID_R, 0.05));
  for (i = 1; i <= 16; i++){ lp.push(new THREE.Vector2(LID_R, RIB_LO + (RIB_HI - RIB_LO) * i / 16)); }
  for (i = 1; i <= 10; i++){ var c2 = (i/10) * Math.PI/2; lp.push(new THREE.Vector2(LID_R - 0.12 + Math.cos(c2)*0.12, LID_H - 0.12 + Math.sin(c2)*0.12)); }
  lp.push(new THREE.Vector2(LID_R - 0.30, LID_H));
  lp.push(new THREE.Vector2(LID_R - 0.33, LID_H - 0.025)); // step down into the printed panel
  lp.push(new THREE.Vector2(0, LID_H - 0.025));
  var lidGeo = new THREE.LatheGeometry(lp, RIBS * 8, Math.PI);
  var lpos = lidGeo.attributes.position;
  for (i = 0; i < lpos.count; i++){
    var vx = lpos.getX(i), vy = lpos.getY(i), vz = lpos.getZ(i);
    if (vy > RIB_LO + 0.001 && vy < RIB_HI - 0.001){
      var th = Math.atan2(vx, vz), rr = Math.sqrt(vx*vx + vz*vz);
      var fade = Math.min(1, (vy - RIB_LO) / 0.04, (RIB_HI - vy) / 0.06);
      var w = Math.cos(th * RIBS);
      var rib = Math.max(-1, Math.min(1, w * 1.8));      // flat-topped ridges
      var nr = rr + (0.009 * rib - 0.009) * fade;
      lpos.setX(i, vx / rr * nr); lpos.setZ(i, vz / rr * nr);
    }
  }
  lidGeo.computeVertexNormals();
  var lidMat = new THREE.MeshPhysicalMaterial({
    color: 0x161716, roughness: 0.36, metalness: 0,
    clearcoat: 0.5, clearcoatRoughness: 0.22, envMap: lidEnv, envMapIntensity: 1.0
  });
  var lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = LID_Y; lid.castShadow = true;
  jar.add(lid);

  // printed lid top
  var lidTopTex = new THREE.CanvasTexture(lidCanvas);
  lidTopTex.encoding = THREE.sRGBEncoding;
  lidTopTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var lidTop = new THREE.Mesh(new THREE.CircleGeometry(LID_R - 0.34, 128), new THREE.MeshPhysicalMaterial({ map: lidTopTex, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3, envMap: lidEnv, envMapIntensity: 0.7 }));
  lidTop.rotation.x = -Math.PI/2; lidTop.position.y = LID_Y + LID_H - 0.023;
  jar.add(lidTop);

  // floor that only shows the shadow
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.22 }));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true;
  scene.add(floor);
  // contact shadow: tight dark ring where the jar meets the floor, plus a wide soft falloff
  function blob(stops, size){
    var c = document.createElement('canvas'); c.width = c.height = 512;
    var x = c.getContext('2d'); var g = x.createRadialGradient(256,256,0,256,256,256);
    stops.forEach(function(st){ g.addColorStop(st[0], 'rgba(0,0,0,' + st[1] + ')'); });
    x.fillStyle = g; x.fillRect(0,0,512,512);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI/2; return m;
  }
  var tight = blob([[0,0.55],[0.80,0.5],[0.86,0.22],[0.93,0.04],[1,0]], 7.0); tight.position.y = 0.006; scene.add(tight);
  var wide = blob([[0,0.16],[0.5,0.10],[0.8,0.03],[1,0]], 13); wide.position.y = 0.005; scene.add(wide);

  jar.position.y = 0;
  var target = new THREE.Vector3(0, 4.6, 0);
  var controls = null;
  if (THREE.OrbitControls){
    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.copy(target);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.enablePan = false; controls.enableZoom = false; controls.enableZoom = false;
    controls.minDistance = 14; controls.maxDistance = 40;
    controls.minPolarAngle = 0.25; controls.maxPolarAngle = Math.PI/2 - 0.04;
    controls.update();
  } else {
    camera.lookAt(target);
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoSpin = !reduce;
  var snapping = false;

  function resize(){
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.multiplyScalar(1); // keep distance
    camera.updateProjectionMatrix();
  }
  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(stage); else window.addEventListener('resize', resize);

  var last = performance.now();
  function tick(now){
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (autoSpin){ jar.rotation.y += dt * 0.35; }
    if (snapping){
      var t = jar.rotation.y % (Math.PI*2); if (t > Math.PI) t -= Math.PI*2; if (t < -Math.PI) t += Math.PI*2;
      jar.rotation.y = t * 0.88; if (Math.abs(t) < 0.002){ jar.rotation.y = 0; snapping = false; }
      if (controls){
        var off = camera.position.clone().sub(controls.target); var dist = off.length();
        var goal = new THREE.Vector3(0, 0.29, 1).normalize().multiplyScalar(dist).add(controls.target);
        camera.position.lerp(goal, 0.12);
      }
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
    if (alive) raf = requestAnimationFrame(tick);
  }

  function refresh(){
    drawLabel(getName(), '02481');
    labelTex.needsUpdate = true;
  }

  var fontsReady = (document.fonts && document.fonts.load) ? Promise.all([
    document.fonts.load("400 170px 'BBH Hegarty'"),
    document.fonts.load("400 40px 'Geist'"), document.fonts.load("500 40px 'Geist'"),
    document.fonts.load("400 30px 'Geist Mono'")
  ]).catch(function(){}) : Promise.resolve();
  fontsReady.then(function(){
    refresh(); drawLid(); lidTopTex.needsUpdate = true;
  });
  resize();
  if (onReady) { onReady(refresh); }
  var alive = true, raf = requestAnimationFrame(tick);
  return function(){ alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (controls) controls.dispose(); renderer.dispose(); };

}

/* Start the jar only when its panel scrolls into view. */
function startLiwelJarWhenVisible(canvas, getName, onReady) {
  if (!canvas) { return; }
  var started = false;
  function go() {
    if (started) { return; }
    started = true;
    try { buildLiwelJar(canvas, getName, onReady); } catch (e) { if (window.console) { console.warn('Liwel jar could not start', e); } }
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
    }, { rootMargin: '300px 0px' });
    io.observe(canvas);
  } else { go(); }
}
