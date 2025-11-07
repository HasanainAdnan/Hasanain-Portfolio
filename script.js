document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  initGallery();

  initSmoothScroll();

  initScrollAnimations();

  initLightbox();
});

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");
  const zoomInBtn = document.querySelector(".zoom-in");
  const zoomOutBtn = document.querySelector(".zoom-out");
  const zoomResetBtn = document.querySelector(".zoom-reset");

  let currentZoom = 1;
  let isDragging = false;
  let startX,
    startY,
    translateX = 0,
    translateY = 0;

  function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    lightboxImg.alt = "Portfolio image";
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    resetZoom();
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      lightboxImg.src = "";
    }, 300);
  }

  function updateZoom() {
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    zoomResetBtn.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.25, 3);
    updateZoom();
  }

  function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.25, 0.5);
    updateZoom();
  }

  function resetZoom() {
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateZoom();
  }

  lightboxImg.addEventListener("mousedown", (e) => {
    if (currentZoom > 1) {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      lightboxImg.style.cursor = "grabbing";
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateZoom();
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      lightboxImg.style.cursor = "move";
    }
  });

  let touchStartX, touchStartY;

  lightboxImg.addEventListener("touchstart", (e) => {
    if (currentZoom > 1) {
      touchStartX = e.touches[0].clientX - translateX;
      touchStartY = e.touches[0].clientY - translateY;
    }
  });

  lightboxImg.addEventListener("touchmove", (e) => {
    if (currentZoom > 1) {
      e.preventDefault();
      translateX = e.touches[0].clientX - touchStartX;
      translateY = e.touches[0].clientY - touchStartY;
      updateZoom();
    }
  });

  closeBtn.addEventListener("click", closeLightbox);
  zoomInBtn.addEventListener("click", zoomIn);
  zoomOutBtn.addEventListener("click", zoomOut);
  zoomResetBtn.addEventListener("click", resetZoom);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });

  lightbox.addEventListener("wheel", (e) => {
    if (lightbox.classList.contains("active")) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  });

  window.openLightbox = openLightbox;
}

function initGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const config = {
    path: "img/work/",
    prefix: "work-",
    extensions: ["webp", "png", "jpg", "jpeg"],
    maxFiles: 200,
    gapLimit: 6,
  };

  const createGalleryItem = (src, indexOrName = "") => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.style.cursor = "pointer";
    item.addEventListener("click", () => window.openLightbox(src));

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
    img.alt = indexOrName ? `Project ${indexOrName}` : "Project";

    item.appendChild(img);
    gallery.appendChild(item);
  };

  fetch(`${config.path}manifest.json`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((list) => {
      if (!Array.isArray(list) || !list.length)
        throw new Error("Empty manifest");
      list.forEach((name, i) => {
        const src = `${config.path}${name}`;
        createGalleryItem(src, i + 1);
      });
    })
    .catch(() => {
      let gap = 0;

      const tryIndex = async (i) => {
        for (const ext of config.extensions) {
          const src = `${config.path}${config.prefix}${i}.${ext}`;
          try {
            const res = await fetch(src, { method: "HEAD", cache: "no-store" });
            if (res.ok) {
              createGalleryItem(src, i);
              gap = 0;
              return true;
            }
          } catch (e) {}
        }
        gap++;
        return false;
      };

      (async () => {
        for (let i = 1; i <= config.maxFiles; i++) {
          const found = await tryIndex(i);
          if (!found && gap >= config.gapLimit) break;
        }

        if (!gallery.children.length) {
          const message = document.createElement("div");
          message.style.cssText =
            "grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 60px 20px;";
          message.innerHTML =
            '<p style="font-size: 16px;">Add images to <code style="background: rgba(77,159,255,0.1); padding: 2px 8px; border-radius: 4px;">img/work/</code></p><p style="margin-top: 12px; font-size: 14px;">Name them like <strong>work-1.png</strong>, <strong>work-2.webp</strong>, etc.</p>';
          gallery.appendChild(message);
        }
      })();
    });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href === "#") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll(
    ".section-header, .featured-item, .gallery-item, .skill-column, .about-grid, .contact-card"
  );

  animateElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.style.color = "";
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.style.color = "var(--accent-blue)";
    }
  });
});
