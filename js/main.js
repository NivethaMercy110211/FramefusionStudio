(function () {
  const body = document.body;
  const savedTheme = localStorage.getItem("ff-theme") || "light";
  const savedDir = localStorage.getItem("ff-dir") || "ltr";
  if (savedTheme === "dark") body.classList.add("dark");
  document.documentElement.dir = savedDir === "rtl" ? "rtl" : "ltr";
  body.classList.toggle("rtl", document.documentElement.dir === "rtl");

  const playAutoplayVideos = () => {
    document.querySelectorAll("video[autoplay]").forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.controls = false;
      video.removeAttribute("controls");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.play().catch(() => {});
    });
  };
  playAutoplayVideos();
  window.addEventListener("load", playAutoplayVideos);

  const closeNavPopups = () => {
    body.classList.add("suppress-nav-popups");
    document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
      dropdown.querySelector(".nav-dropbtn")?.blur();
    });
    document.querySelectorAll(".mobile-home[open]").forEach((item) => {
      item.removeAttribute("open");
    });
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.setTimeout(() => body.classList.remove("suppress-nav-popups"), 500);
  };

  const syncButtons = () => {
    const isDark = body.classList.contains("dark");
    const isRtl = document.documentElement.dir === "rtl";
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const icon = button.querySelector("img.theme-icon");
      if (icon) icon.src = isDark ? "assets/icons/icon-sun.svg" : "assets/icons/icon-moon.svg";
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    });
    document.querySelectorAll("[data-dir-toggle]").forEach((button) => {
      const icon = button.querySelector("img.dir-icon");
      if (icon) {
        icon.src = isRtl ? "assets/icons/icon-ltr.svg" : "assets/icons/icon-rtl.svg";
      }
      button.setAttribute("aria-label", isRtl ? "Current direction is right-to-left. Switch to left-to-right" : "Current direction is left-to-right. Switch to right-to-left");
    });
  };
  syncButtons();

  const panel = document.querySelector(".mobile-panel");
  const overlay = document.querySelector(".mobile-overlay");
  const menuButton = document.querySelector("[data-menu-open]");
  const closeButtons = document.querySelectorAll("[data-menu-close]");

  const setMenu = (open) => {
    if (!panel || !overlay || !menuButton) return;
    panel.setAttribute("dir", document.documentElement.dir || "ltr");
    panel.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    body.classList.toggle("no-scroll", open);
    menuButton.setAttribute("aria-expanded", String(open));
  };
  if (menuButton) menuButton.addEventListener("click", () => setMenu(true));
  closeButtons.forEach((button) => button.addEventListener("click", () => setMenu(false)));
  if (overlay) overlay.addEventListener("click", () => setMenu(false));
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1366) setMenu(false);
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      body.classList.toggle("dark");
      localStorage.setItem("ff-theme", body.classList.contains("dark") ? "dark" : "light");
      syncButtons();
      closeNavPopups();
    });
  });

  document.querySelectorAll("[data-dir-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      setMenu(false);
      const next = document.documentElement.dir === "rtl" ? "ltr" : "rtl";
      document.documentElement.dir = next;
      body.classList.toggle("rtl", next === "rtl");
      if (panel) panel.setAttribute("dir", next);
      localStorage.setItem("ff-dir", next);
      syncButtons();
      closeNavPopups();
      button.blur();
    });
  });

  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    if (dropdown.querySelector("a.active")) {
      dropdown.querySelector(".nav-dropbtn")?.classList.add("active");
    }
  });

  document.querySelectorAll("[data-validate]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      form.querySelectorAll("[data-required]").forEach((field) => {
        const wrapper = field.closest(".field");
        const value = field.value.trim();
        let ok = value.length > 0;
        if (field.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (field.dataset.min && value.length < Number(field.dataset.min)) ok = false;
        if (field.dataset.match) {
          const other = form.querySelector(`#${field.dataset.match}`);
          ok = Boolean(other) && value === other.value.trim();
        }
        if (wrapper) wrapper.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      const message = form.querySelector(".form-message");
      if (message) message.classList.toggle("show", valid);
      if (valid) form.reset();
    });
  });

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      const isHidden = input.type === "password";
      button.classList.toggle("is-visible", !isHidden);
      button.setAttribute("aria-label", isHidden ? "Show password" : "Hide password");
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll("[data-product]").forEach((card) => {
        card.style.display = filter === "all" || card.dataset.product === filter ? "" : "none";
      });
    });
  });

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  });

  const estimateFields = document.querySelectorAll("[data-estimate-input]");
  const estimateTotal = document.querySelector("[data-estimate-total]");
  const estimateLabel = document.querySelector("[data-estimate-label]");
  const updateEstimate = () => {
    if (!estimateTotal) return;
    const kit = Number(document.querySelector("#kitLevel")?.value || 1);
    const items = Number(document.querySelector("#itemCount")?.value || document.querySelector("#videoCount")?.value || 4);
    const rush = document.querySelector("#rushReview")?.checked ? 85 : 0;
    const total = 180 + kit * 140 + items * 28 + rush;
    estimateTotal.textContent = `$${total.toLocaleString()}`;
    if (estimateLabel) estimateLabel.textContent = `${items} items, level ${kit}${rush ? ", rush review" : ""}`;
  };
  estimateFields.forEach((field) => field.addEventListener("input", updateEstimate));
  updateEstimate();

  // --- PREMIUM HOME2 INTERACTIVES (Before-After & Sticky Timeline Progress) ---
  
  // 1. Before & After Interactive Slider
  const sliderContainer = document.getElementById("beforeAfterSlider");
  const sliderRange = document.getElementById("sliderRange");
  const sliderOverlay = document.getElementById("sliderOverlay");
  const sliderHandle = document.getElementById("sliderHandle");
  
  if (sliderRange && sliderOverlay && sliderHandle && sliderContainer) {
    const updateSlider = (value) => {
      sliderOverlay.style.width = `${value}%`;
      sliderHandle.style.left = `${value}%`;
    };
    sliderRange.addEventListener("input", (e) => updateSlider(e.target.value));
    sliderRange.addEventListener("change", (e) => updateSlider(e.target.value));

    // Dynamic width synchronization using ResizeObserver to ensure pixel alignment
    const updateOverlayWidth = () => {
      const containerWidth = sliderContainer.getBoundingClientRect().width;
      sliderContainer.style.setProperty('--slider-width', `${containerWidth}px`);
    };
    
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => updateOverlayWidth());
      ro.observe(sliderContainer);
    } else {
      window.addEventListener("resize", updateOverlayWidth);
      updateOverlayWidth();
    }
  }

  // 2. Bento Grid Interactive Aspect Ratio Boxes
  const cropBoxes = document.querySelectorAll(".bento-crop-box");
  cropBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      cropBoxes.forEach((b) => b.classList.remove("active"));
      box.classList.add("active");
    });
  });

  // 3. Sticky Timeline Scroll Progress Sync & Click Navigation
  const timelineCards = document.querySelectorAll(".timeline-card");
  const stepIndicators = [
    document.getElementById("stepIndicator1"),
    document.getElementById("stepIndicator2"),
    document.getElementById("stepIndicator3")
  ];

  if (timelineCards.length && stepIndicators.some(Boolean)) {
    const handleTimelineScroll = () => {
      let activeIndex = 0;
      const triggerOffset = window.innerHeight * 0.45;

      timelineCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top <= triggerOffset) {
          activeIndex = index;
        }
      });

      stepIndicators.forEach((indicator, index) => {
        if (indicator) {
          indicator.classList.toggle("active", index === activeIndex);
        }
      });
    };

    // Add click listeners to smoothly scroll viewport to corresponding timeline card
    stepIndicators.forEach((indicator, index) => {
      if (indicator && timelineCards[index]) {
        indicator.addEventListener("click", () => {
          const card = timelineCards[index];
          const yOffset = -100; /* matches sticky top: 80px + a little breathing room */
          const y = card.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        });
      }
    });

    window.addEventListener("scroll", handleTimelineScroll);
    handleTimelineScroll();
  }

  // --- INTERACTIVE REDESIGN ENGINE (HOME 2) ---

  // 4. Video Showreel Modal Handler
  const openShowreelBtn = document.getElementById("openShowreelBtn");
  const closeShowreelBtn = document.getElementById("closeShowreelBtn");
  const showreelModal = document.getElementById("showreelModal");
  const modalVideo = document.getElementById("modalVideo");

  if (openShowreelBtn && showreelModal) {
    openShowreelBtn.addEventListener("click", () => {
      showreelModal.classList.add("active");
      if (modalVideo) {
        modalVideo.currentTime = 0;
        modalVideo.play().catch(() => {});
      }
    });
  }

  if (closeShowreelBtn && showreelModal) {
    const closeModal = () => {
      showreelModal.classList.remove("active");
      if (modalVideo) {
        modalVideo.pause();
      }
    };
    closeShowreelBtn.addEventListener("click", closeModal);
    showreelModal.addEventListener("click", (e) => {
      if (e.target === showreelModal) closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && showreelModal.classList.contains("active")) {
        closeModal();
      }
    });
  }

  // 5. Kinetic Captions Selector Engine
  const captionStyleButtons = document.querySelectorAll(".sim-style-btn");
  const captionOutput = document.getElementById("captionOutput");

  const captionTemplates = {
    hormozi: 'We design <span class="accent-word">retention-focused</span> captions that keep viewers hooked! <span class="emoji">🔥</span>',
    neon: 'Visual branding <span class="accent-word">engineered</span> to capture infinite scrolling attention.',
    minimal: 'Clean, elegant lower-third <span class="accent-word">subtitles</span> crafted for professional content.'
  };

  captionStyleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      captionStyleButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      
      const styleName = btn.dataset.style;
      if (captionOutput && captionTemplates[styleName]) {
        captionOutput.style.opacity = 0;
        captionOutput.style.transform = "scale(0.95)";
        
        setTimeout(() => {
          captionOutput.className = `sim-caption-text caption-style-${styleName}`;
          captionOutput.innerHTML = captionTemplates[styleName];
          captionOutput.style.opacity = 1;
          captionOutput.style.transform = "";
        }, 200);
      }
    });
  });

  // 6. Pro Sound Mixer EQ Visualizer Sync
  const trackRows = document.querySelectorAll(".mixer-track-row");
  const equalizerWave = document.getElementById("equalizerWave");
  const mixerStatus = document.getElementById("mixerStatus");

  const trackStatusLabels = {
    vocals: "Vocals EQ Active",
    risers: "Cinematic Risers Active",
    sfx: "Impact SFX & Whooshes Active"
  };

  let equalizerInterval = null;

  const animateEqualizer = (active) => {
    const bars = document.querySelectorAll(".equalizer-bar");
    if (!bars.length) return;

    if (active) {
      if (!equalizerInterval) {
        equalizerInterval = setInterval(() => {
          bars.forEach((bar) => {
            const height = Math.floor(Math.random() * 85) + 15;
            bar.style.height = `${height}%`;
          });
        }, 120);
      }
    } else {
      if (equalizerInterval) {
        clearInterval(equalizerInterval);
        equalizerInterval = null;
      }
      bars.forEach((bar) => {
        bar.style.height = "10%";
      });
    }
  };

  trackRows.forEach((row) => {
    row.addEventListener("click", () => {
      trackRows.forEach((r) => {
        r.classList.remove("active");
        const btn = r.querySelector(".mixer-trigger-btn");
        if (btn) btn.textContent = "▶";
      });
      
      row.classList.add("active");
      const triggerBtn = row.querySelector(".mixer-trigger-btn");
      if (triggerBtn) triggerBtn.textContent = "✓";

      const trackName = row.dataset.track;
      if (mixerStatus) {
        mixerStatus.textContent = trackStatusLabels[trackName] || "Track Playing";
        mixerStatus.classList.add("playing");
      }

      animateEqualizer(true);
    });
  });

  if (document.querySelector(".mixer-track-row.active")) {
    animateEqualizer(true);
  }

  // 7. Custom Budget Estimator Widget Calculator
  const videoCountSlider = document.getElementById("videoCountSlider");
  const footageLengthSlider = document.getElementById("footageLengthSlider");
  const rigComplexitySlider = document.getElementById("rigComplexitySlider");

  const videoCountBadge = document.getElementById("videoCountBadge");
  const footageLengthBadge = document.getElementById("footageLengthBadge");
  const rigComplexityBadge = document.getElementById("rigComplexityBadge");

  const captionsAddon = document.getElementById("captionsAddon");
  const thumbnailAddon = document.getElementById("thumbnailAddon");
  const audioBrandingAddon = document.getElementById("audioBrandingAddon");
  const rushAddon = document.getElementById("rushAddon");

  const customRateTotal = document.getElementById("customRateTotal");
  const estimatorSummaryLabel = document.getElementById("estimatorSummaryLabel");

  const complexityLabels = {
    1: "Basic Cut",
    2: "Standard Grade",
    3: "Cinematic High Grade"
  };

  const calculateMonthlyRate = () => {
    if (!customRateTotal) return;

    const count = Number(videoCountSlider?.value || 3);
    const footage = Number(footageLengthSlider?.value || 15);
    const complexity = Number(rigComplexitySlider?.value || 2);

    let baseRatePerVideo = 100;
    if (complexity === 2) baseRatePerVideo = 160;
    if (complexity === 3) baseRatePerVideo = 280;

    const footageFactor = 1 + (footage - 5) * 0.03;
    let total = count * baseRatePerVideo * footageFactor;

    let summaryAddons = [];
    if (captionsAddon && captionsAddon.checked) {
      total += count * 25;
      summaryAddons.push("branded subtitles");
    }
    if (thumbnailAddon && thumbnailAddon.checked) {
      total += count * 15;
      summaryAddons.push("covers");
    }
    if (audioBrandingAddon && audioBrandingAddon.checked) {
      total += count * 20;
      summaryAddons.push("sound design package");
    }
    if (rushAddon && rushAddon.checked) {
      total += 150;
      summaryAddons.push("24h rush delivery");
    }

    const finalRate = Math.round(total);
    customRateTotal.textContent = `$${finalRate.toLocaleString()}`;

    if (estimatorSummaryLabel) {
      const summary = `${count} video${count > 1 ? "s" : ""}, ${complexityLabels[complexity].toLowerCase()} (${footage}m length)${summaryAddons.length ? ", " + summaryAddons.join(", ") : ""}`;
      estimatorSummaryLabel.textContent = summary;
    }

    [videoCountSlider, footageLengthSlider, rigComplexitySlider].forEach((slider) => {
      if (slider) {
        const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.backgroundSize = `${percentage}% 100%`;
      }
    });
  };

  if (videoCountSlider && videoCountBadge) {
    videoCountSlider.addEventListener("input", (e) => {
      videoCountBadge.textContent = `${e.target.value} Video${e.target.value > 1 ? "s" : ""}`;
      calculateMonthlyRate();
    });
  }
  if (footageLengthSlider && footageLengthBadge) {
    footageLengthSlider.addEventListener("input", (e) => {
      footageLengthBadge.textContent = `${e.target.value} Minutes`;
      calculateMonthlyRate();
    });
  }
  if (rigComplexitySlider && rigComplexityBadge) {
    rigComplexitySlider.addEventListener("input", (e) => {
      rigComplexityBadge.textContent = complexityLabels[e.target.value];
      calculateMonthlyRate();
    });
  }

  [captionsAddon, thumbnailAddon, audioBrandingAddon, rushAddon].forEach((addon) => {
    addon?.addEventListener("change", calculateMonthlyRate);
  });

  calculateMonthlyRate();

  // 8. Collapsible FAQ Accordion Engine
  const faqHeaders = document.querySelectorAll(".accordion-faq-header");
  faqHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const card = header.closest(".accordion-faq-card");
      if (!card) return;

      const body = card.querySelector(".accordion-faq-body");
      const content = card.querySelector(".accordion-faq-content");
      if (!body || !content) return;

      const isOpen = card.classList.contains("open");
      
      document.querySelectorAll(".accordion-faq-card.open").forEach((c) => {
        if (c !== card) {
          c.classList.remove("open");
          c.querySelector(".accordion-faq-header")?.setAttribute("aria-expanded", "false");
          const otherBody = c.querySelector(".accordion-faq-body");
          if (otherBody) otherBody.style.height = "0px";
        }
      });

      if (isOpen) {
        card.classList.remove("open");
        header.setAttribute("aria-expanded", "false");
        body.style.height = "0px";
      } else {
        card.classList.add("open");
        header.setAttribute("aria-expanded", "true");
        body.style.height = `${content.scrollHeight}px`;
      }
    });
  });

  // 9. Interactive Workflow Tabs Engine (Home 1)
  const workflowTabButtons = document.querySelectorAll(".workflow-tab-btn");
  const workflowTabContents = document.querySelectorAll(".workflow-tab-content");

  workflowTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      workflowTabButtons.forEach((b) => b.classList.remove("active"));
      workflowTabContents.forEach((c) => {
        c.classList.remove("active");
      });

      btn.classList.add("active");

      const phaseName = btn.dataset.phase;
      const targetContent = document.getElementById(`phase-${phaseName}`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // 10. Interactive Production Summary Controller (About Page)
  const summaryTabs = document.querySelectorAll(".summary-tab-btn");
  const summaryCards = document.querySelectorAll(".summary-details-card");

  if (summaryTabs.length && summaryCards.length) {
    summaryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.getAttribute("data-summary-tab");
        
        // Remove active class from all tabs
        summaryTabs.forEach((t) => t.classList.remove("active"));
        // Add active class to clicked tab
        tab.classList.add("active");
        
        // Deactivate all cards
        summaryCards.forEach((card) => {
          card.classList.remove("active");
        });
        
        // Activate targeted card
        const activeCard = document.getElementById(`summary-card-${targetTab}`);
        if (activeCard) {
          activeCard.classList.add("active");
          
          // Force reflow to trigger progress meter animations
          const progressFills = activeCard.querySelectorAll(".summary-meter-fill");
          progressFills.forEach((fill) => {
            const originalWidth = fill.style.width || fill.getAttribute("style").match(/width:\s*([0-9]+%)/)?.[1] || "100%";
            fill.style.width = "0%";
            setTimeout(() => {
              fill.style.width = originalWidth;
            }, 50);
          });
        }
      });
    });
  }

  // 11. Testimonials FAQ Accordion Handler
  document.querySelectorAll('.testi-faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.testi-faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('is-open');
      // Close all
      document.querySelectorAll('.testi-faq-item.is-open').forEach((openItem) => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.testi-faq-trigger')?.setAttribute('aria-expanded', 'false');
      });
      // Open clicked unless already open
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 12. Pricing Page — Billing Toggle (Per Project / Monthly Retainer)
  const billingToggle = document.getElementById('billingToggle');
  const labelMonthly  = document.getElementById('labelMonthly');
  const labelAnnual   = document.getElementById('labelAnnual');

  if (billingToggle) {
    let isAnnual = false;

    const annualMessages = {
      'note-basic':    'Retainer: $79/mo · save $20',
      'note-standard': 'Retainer: $199/mo · save $50',
      'note-premium':  'Retainer: $479/mo · save $120'
    };

    const updatePricing = () => {
      document.querySelectorAll('.pricing-amount').forEach((el) => {
        const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
        if (val) el.innerHTML = `<sup>$</sup>${val}`;
      });
      ['note-basic', 'note-standard', 'note-premium'].forEach((id) => {
        const note = document.getElementById(id);
        if (note) note.textContent = isAnnual ? annualMessages[id] : '';
      });
      billingToggle.classList.toggle('is-annual', isAnnual);
      billingToggle.setAttribute('aria-checked', String(isAnnual));
      if (labelMonthly) labelMonthly.classList.toggle('active', !isAnnual);
      if (labelAnnual)  labelAnnual.classList.toggle('active', isAnnual);
    };

    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      updatePricing();
    });
    billingToggle.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        isAnnual = !isAnnual;
        updatePricing();
      }
    });

    // Also allow clicking the labels
    if (labelMonthly) labelMonthly.addEventListener('click', () => { isAnnual = false; updatePricing(); });
    if (labelAnnual)  labelAnnual.addEventListener('click',  () => { isAnnual = true;  updatePricing(); });
  }

  // --- PREMIUM COLOR GRADING DECK INTERACTIVE SIMULATOR ---
  const coloristVideo = document.getElementById("coloristVideo");
  const activeLutLabel = document.getElementById("activeLutLabel");
  const lutButtons = document.querySelectorAll(".lut-btn");
  const scopesGrid = document.getElementById("scopesGrid");
  
  const colorWheelDeck = document.getElementById("colorWheelDeck");
  const wheelCrosshair = document.getElementById("wheelCrosshair");
  const redVal = document.getElementById("redVal");
  const greenVal = document.getElementById("greenVal");
  const blueVal = document.getElementById("blueVal");
  const resetWheelBtn = document.getElementById("resetWheelBtn");

  if (coloristVideo) {
    const lutFilters = {
      log: 'contrast(0.7) saturate(0.55) brightness(1.05) sepia(0.04)',
      'teal-orange': 'contrast(1.15) saturate(1.22) sepia(0.14) hue-rotate(-5deg)',
      cyberpunk: 'contrast(1.25) saturate(1.58) hue-rotate(95deg) brightness(0.92)',
      vintage: 'contrast(1.05) saturate(0.88) sepia(0.26) brightness(1.02)',
      noir: 'grayscale(1) contrast(1.38) brightness(0.9)'
    };

    const lutLabels = {
      log: 'LOG RAW FEED (0% GRADING)',
      'teal-orange': 'TEAL & ORANGE PRESET',
      cyberpunk: 'CYBERPUNK NEON GRADE',
      vintage: 'VINTAGE KODACHROME PRINT',
      noir: 'MOODY HIGH-CONTRAST NOIR'
    };

    const scopeHeights = {
      log: [30, 25, 35, 40, 38, 42, 32, 28, 36],
      'teal-orange': [70, 48, 62, 78, 55, 68, 80, 52, 65],
      cyberpunk: [90, 85, 95, 88, 92, 98, 87, 90, 96],
      vintage: [52, 46, 58, 62, 54, 60, 50, 44, 55],
      noir: [85, 12, 88, 95, 15, 90, 92, 10, 89]
    };

    let activeLut = 'log';
    let currentFilters = lutFilters.log;
    let hueOffset = 0;
    let satOffset = 1;

    const updateMonitorFilters = () => {
      // Combines standard LUT filter preset + interactive color wheel adjustments
      coloristVideo.style.filter = `${currentFilters} hue-rotate(${hueOffset}deg) saturate(${satOffset})`;
    };

    const animateScopes = (lutName) => {
      const bars = scopesGrid?.querySelectorAll(".scope-bar");
      if (!bars || !bars.length) return;
      const targets = scopeHeights[lutName] || scopeHeights.log;

      bars.forEach((bar, index) => {
        const baseVal = targets[index] || 35;
        // Fluctuates slightly for a living waveform look
        const fluctuate = Math.floor(Math.random() * 12) - 6;
        const finalHeight = Math.max(5, Math.min(100, baseVal + fluctuate));
        bar.style.height = `${finalHeight}%`;
      });
    };

    // Keep scopes dancing in background
    let scopesInterval = setInterval(() => {
      animateScopes(activeLut);
    }, 150);

    // LUT preset buttons
    lutButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        lutButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const lut = btn.dataset.lut;
        activeLut = lut;
        currentFilters = lutFilters[lut] || lutFilters.log;
        
        if (activeLutLabel) activeLutLabel.textContent = lutLabels[lut];
        
        // Instantly animate scopes to high/low targets
        animateScopes(lut);
        updateMonitorFilters();
      });
    });

    // Interactive Color Wheel Mouse / Touch controls
    let isDraggingWheel = false;

    const handleWheelMove = (clientX, clientY) => {
      if (!colorWheelDeck || !wheelCrosshair) return;
      const rect = colorWheelDeck.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance and angle from center
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const radius = rect.width / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Constraint within circle boundary
      if (distance > radius) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * radius;
        dy = Math.sin(angle) * radius;
      }

      // Convert to percentage values
      const percentX = (dx / radius) * 100;
      const percentY = (dy / radius) * 100;

      // Position crosshair dot
      wheelCrosshair.style.left = `${50 + percentX / 2}%`;
      wheelCrosshair.style.top = `${50 + percentY / 2}%`;

      // Calculate pseudo RGB offset values
      const r = (percentX / 10).toFixed(1);
      const b = (percentY / 10).toFixed(1);
      const g = ((radius - distance) / (radius / 10)).toFixed(1);

      if (redVal) redVal.textContent = r > 0 ? `+${r}` : r;
      if (greenVal) greenVal.textContent = g;
      if (blueVal) blueVal.textContent = b > 0 ? `+${b}` : b;

      // Map to video styling
      hueOffset = Math.round((percentX / 100) * 180);
      satOffset = Math.max(0.2, (1 + (percentY / 100) * 0.8).toFixed(2));
      updateMonitorFilters();
    };

    colorWheelDeck.addEventListener("mousedown", (e) => {
      isDraggingWheel = true;
      handleWheelMove(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDraggingWheel) {
        handleWheelMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener("mouseup", () => {
      isDraggingWheel = false;
    });

    // Touch support
    colorWheelDeck.addEventListener("touchstart", (e) => {
      isDraggingWheel = true;
      if (e.touches[0]) handleWheelMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener("touchmove", (e) => {
      if (isDraggingWheel && e.touches[0]) {
        handleWheelMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    });
    window.addEventListener("touchend", () => {
      isDraggingWheel = false;
    });

    // Reset Color Wheel button
    if (resetWheelBtn) {
      resetWheelBtn.addEventListener("click", () => {
        if (wheelCrosshair) {
          wheelCrosshair.style.left = "50%";
          wheelCrosshair.style.top = "50%";
        }
        if (redVal) redVal.textContent = "0.0";
        if (greenVal) greenVal.textContent = "0.0";
        if (blueVal) blueVal.textContent = "0.0";
        
        hueOffset = 0;
        satOffset = 1;
        updateMonitorFilters();
      });
    }
  }

})();

  // ===== SIMULATED FRAME-BY-FRAME PROOFING SUITE =====
  (function () {
    const video      = document.getElementById('proofingVideo');
    const timecode   = document.getElementById('proofingTimecode');
    const marker     = document.getElementById('proofingMarker');
    const tooltip    = document.getElementById('markerTooltip');
    const list       = document.getElementById('proofingCommentsList');
    const countBadge = document.getElementById('commentCount');
    const input      = document.getElementById('mockCommentInput');
    const addBtn     = document.getElementById('addMockCommentBtn');

    if (!video) return;   // only runs on showreel.html

    /* ---- Helpers ---- */
    const pad = (n) => String(Math.floor(n)).padStart(2, '0');
    const fmtTime = (s) => `${pad(s / 60)}:${pad(s % 60)}`;

    /* ---- Live timecode ---- */
    video.addEventListener('timeupdate', () => {
      if (timecode) timecode.textContent = fmtTime(video.currentTime);
    });

    /* ---- Click video to play / pause ---- */
    video.addEventListener('click', () => {
      video.paused ? video.play() : video.pause();
    });

    /* ---- Show / hide marker ---- */
    const showMarker = (topPct, leftPct, text) => {
      if (!marker || !tooltip) return;
      marker.style.display  = 'block';
      marker.style.top      = `${topPct}%`;
      marker.style.left     = `${leftPct}%`;
      tooltip.textContent   = text;

      // Highlight active note
      document.querySelectorAll('.proofing-comment-btn').forEach(b => b.classList.remove('active-note'));
    };
    const hideMarker = () => {
      if (marker) marker.style.display = 'none';
    };

    /* ---- Event delegation — comment buttons ---- */
    if (list) {
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('.proofing-comment-btn');
        if (!btn) return;

        const seekTo = parseFloat(btn.dataset.time) || 0;
        const top    = parseFloat(btn.dataset.top)  || 50;
        const left   = parseFloat(btn.dataset.left) || 50;
        const text   = btn.dataset.text || '';

        // Seek & pause
        video.currentTime = seekTo;
        video.pause();

        showMarker(top, left, text);
        btn.classList.add('active-note');

        // Auto-hide marker after 3 s when user starts playing again
        video.addEventListener('play', hideMarker, { once: true });
      });
    }

    /* ---- Add Note ---- */
    const submitNote = () => {
      if (!input || !list || !countBadge) return;
      const text = input.value.trim();
      if (!text) { input.focus(); return; }

      const currentSec = Math.floor(video.currentTime);
      const timeLabel  = fmtTime(currentSec);

      // Random marker position (keep within safe 15–85% range)
      const rTop  = 15 + Math.random() * 70;
      const rLeft = 15 + Math.random() * 70;

      // Build new comment button
      const btn = document.createElement('button');
      btn.className     = 'proofing-comment-btn';
      btn.type          = 'button';
      btn.dataset.time  = currentSec;
      btn.dataset.top   = rTop.toFixed(1);
      btn.dataset.left  = rLeft.toFixed(1);
      btn.dataset.text  = text;
      btn.innerHTML = `
        <div class="comment-btn-meta">
          <span class="comment-time">${timeLabel}</span>
          <span class="comment-author">You (Review)</span>
        </div>
        <p class="comment-btn-text">${text}</p>
      `;

      // Prepend to top of list
      list.prepend(btn);
      input.value = '';

      // Pause + show marker immediately
      video.pause();
      showMarker(rTop, rLeft, text);
      btn.classList.add('active-note');
      video.addEventListener('play', hideMarker, { once: true });

      // Update count badge
      const current = parseInt(countBadge.textContent) || 0;
      countBadge.textContent = `${current + 1} Notes`;
    };

    if (addBtn)  addBtn.addEventListener('click', submitNote);
    if (input)   input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitNote();
    });
  })();

