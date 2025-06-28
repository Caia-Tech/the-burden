/**
 * Starfield Background for "The Burden of Seeing Clearly"
 * 
 * An over-engineered approach to rendering the vast emptiness between stars,
 * much like the space between understanding and feeling.
 * 
 * Each star represents a moment of clarity in the void of confusion.
 * Their movement mirrors our constant search for patterns in chaos.
 */

class Starfield {
  constructor() {
    // The void we project our patterns onto
    this.container = null;
    this.layers = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.centerX = window.innerWidth / 2;
    this.centerY = window.innerHeight / 2;
    
    // Performance detection
    this.isLowEndDevice = this.detectLowEndDevice();
    
    // Configuration: because even chaos needs parameters
    const baseLayers = [
      { count: 150, speed: 0.5, size: { min: 0.5, max: 1 }, opacity: { min: 0.3, max: 0.6 } },
      { count: 100, speed: 1, size: { min: 1, max: 1.5 }, opacity: { min: 0.5, max: 0.8 } },
      { count: 50, speed: 2, size: { min: 1.5, max: 2.5 }, opacity: { min: 0.7, max: 1 } },
      { count: 20, speed: 3, size: { min: 2, max: 3 }, opacity: { min: 0.8, max: 1 }, glow: true }
    ];
    
    // Reduce stars on low-end devices
    if (this.isLowEndDevice) {
      baseLayers.forEach(layer => {
        layer.count = Math.floor(layer.count * 0.5); // 50% reduction
      });
    }
    
    this.config = {
      layers: baseLayers,
      glitchProbability: this.isLowEndDevice ? 0.0005 : 0.001,
      errorStarProbability: 0.05,
      constellationProbability: this.isLowEndDevice ? 0.01 : 0.02
    };
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.generateStars();
    this.bindEvents();
    this.animate();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'starfield-container';
    this.container.setAttribute('aria-hidden', 'true'); // Decorative element
    document.body.insertBefore(this.container, document.body.firstChild);
  }
  
  generateStars() {
    this.config.layers.forEach((layerConfig, layerIndex) => {
      const layer = document.createElement('div');
      layer.className = `star-layer star-layer-${layerIndex}`;
      layer.style.setProperty('--layer-speed', layerConfig.speed);
      
      const stars = [];
      
      for (let i = 0; i < layerConfig.count; i++) {
        const star = this.createStar(layerConfig, layerIndex);
        layer.appendChild(star.element);
        stars.push(star);
      }
      
      this.container.appendChild(layer);
      this.layers.push({ element: layer, stars, config: layerConfig });
    });
  }
  
  createStar(config, layerIndex) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Position: random distribution across the void
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Size: varies by layer depth
    const size = this.randomBetween(config.size.min, config.size.max);
    
    // Opacity: depth perception through transparency
    const opacity = this.randomBetween(config.opacity.min, config.opacity.max);
    
    // Special stars: because even in patterns, we seek anomalies
    const isError = Math.random() < this.config.errorStarProbability;
    const isCodePattern = Math.random() < this.config.constellationProbability;
    const isBlue = Math.random() < 0.2; // 20% blue-tinted stars
    
    if (isError) {
      star.classList.add('star-error');
    } else if (isBlue) {
      star.classList.add('star-blue');
    }
    
    if (isCodePattern) {
      star.classList.add('star-code');
      star.setAttribute('data-symbol', this.getRandomCodeSymbol());
    }
    
    // Apply styles
    star.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --opacity: ${opacity};
      --star-x: ${x};
      --star-y: ${y};
    `;
    
    if (config.glow) {
      star.classList.add('star-glow');
    }
    
    return {
      element: star,
      x,
      y,
      size,
      opacity,
      originalY: y,
      speed: config.speed
    };
  }
  
  getRandomCodeSymbol() {
    const symbols = ['{', '}', '<', '>', '/', '*', '&', '||', '&&', '!=', '===', '=>'];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  bindEvents() {
    // Mouse parallax: because we can't help but think our perspective matters
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateParallax();
    });
    
    // Resize: adapting to new viewports like adapting to new truths
    window.addEventListener('resize', () => {
      this.centerX = window.innerWidth / 2;
      this.centerY = window.innerHeight / 2;
    });
    
    // Reduced motion: respecting those who prefer stillness
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', () => {
      this.handleReducedMotion(mediaQuery.matches);
    });
    this.handleReducedMotion(mediaQuery.matches);
  }
  
  updateParallax() {
    const deltaX = (this.mouseX - this.centerX) / this.centerX;
    const deltaY = (this.mouseY - this.centerY) / this.centerY;
    
    this.layers.forEach((layer, index) => {
      const parallaxAmount = (index + 1) * 5; // Deeper layers move more
      layer.element.style.transform = `translate(${deltaX * parallaxAmount}px, ${deltaY * parallaxAmount}px)`;
    });
  }
  
  animate() {
    // Continuous movement: like thoughts that won't stop processing
    const animationLoop = () => {
      // Check for special states
      this.checkForEasterEggs();
      
      requestAnimationFrame(animationLoop);
    };
    
    requestAnimationFrame(animationLoop);
  }
  
  triggerGlitch() {
    this.container.classList.add('glitching');
    
    // Glitch duration: long enough to notice, short enough to question
    setTimeout(() => {
      this.container.classList.remove('glitching');
    }, this.randomBetween(50, 200));
  }
  
  checkForEasterEggs() {
    // Check if user has reached the end
    const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
    
    if (scrollPercent > 0.98 && !this.hasShownFinale) {
      this.showFinale();
      this.hasShownFinale = true;
    }
  }
  
  showFinale() {
    // Brief moment where stars align to form a heart
    this.container.classList.add('finale-sequence');
    
    setTimeout(() => {
      this.container.classList.remove('finale-sequence');
    }, 3000);
  }
  
  handleReducedMotion(prefersReduced) {
    if (prefersReduced) {
      this.container.classList.add('reduced-motion');
    } else {
      this.container.classList.remove('reduced-motion');
    }
  }
  
  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  detectLowEndDevice() {
    // Simple heuristic for performance detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return true; // No WebGL support
    
    // Check for mobile or limited memory
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const limitedMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    
    return isMobile || limitedMemory;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.starfield = new Starfield();
  });
} else {
  window.starfield = new Starfield();
}