document.addEventListener('DOMContentLoaded', () => {
  // 1. Hero Animation (Canvas)
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const frames = [];
    const totalFrames = 30;
    let framesLoaded = 0;

    // Set canvas size
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Load frames
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `./assets/ezgif-frame-${frameNum}.png`;
      img.onload = () => {
        framesLoaded++;
        if (framesLoaded === totalFrames) {
          requestAnimationFrame(animate);
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load frame ${frameNum}`);
        framesLoaded++; // Still count to avoid locking
        if (framesLoaded === totalFrames) {
          requestAnimationFrame(animate);
        }
      };
      frames[i - 1] = img;
    }

    function animate() {
      if (frames.length === 0) return;

      // Map scroll position to frame index
      // Every 20px of scroll = 1 frame
      const scrollFactor = Math.floor(window.scrollY / 20) % totalFrames;
      const frame = frames[scrollFactor];

      if (frame && frame.complete && frame.width > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image keeping aspect ratio (Cover effect)
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = frame.width / frame.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          offsetX = 0;
          offsetY = -(drawHeight - canvas.height) / 2;
        } else {
          drawWidth = canvas.height * imgAspect;
          drawHeight = canvas.height;
          offsetX = -(drawWidth - canvas.width) / 2;
          offsetY = 0;
        }

        ctx.drawImage(frame, offsetX, offsetY, drawWidth, drawHeight);
      }

      requestAnimationFrame(animate);
    }
  }

  // 2. Sticky Header Logic
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Reveal Animations (Intersection Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Optional: stop observing once revealed
        // revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // CRITICAL: Actually observe the elements
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el) => revealObserver.observe(el));

  // 4. Interactive Steps List
  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach((item) => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      stepItems.forEach((i) => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 5. Neon Cursor Tracker
  const cursorGlow = document.querySelector('.cursor-glow');
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });

  function updateCursor() {
    // Smooth easing for the cursor
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.1;
    cursorY += dy * 0.1;

    cursorGlow.style.left = `${cursorX}px`;
    cursorGlow.style.top = `${cursorY}px`;

    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Hover effects for the cursor
  const interactiveElements = document.querySelectorAll(
    'a, button, .step-item, .service-card, .bento-item',
  );
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorGlow.style.width = '180px';
      cursorGlow.style.height = '180px';
      cursorGlow.style.background =
        'radial-gradient(circle, rgba(255, 69, 0, 0.25) 0%, transparent 70%)';
    });
    el.addEventListener('mouseleave', () => {
      cursorGlow.style.width = '120px';
      cursorGlow.style.height = '120px';
      cursorGlow.style.background =
        'radial-gradient(circle, rgba(255, 69, 0, 0.15) 0%, transparent 70%)';
    });
  });

  // Initial check for elements already in view
  const triggerInitialReveal = () => {
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('revealed');
      }
    });
  };

  // Run on load and slightly after for dynamic content
  triggerInitialReveal();
  setTimeout(triggerInitialReveal, 100);
});
