// --- NEW Preloader Logic with Minimum 3-Second Delay ---
const preloader = document.getElementById('preloader');

// Only run this logic if the preloader element exists
if (preloader) {
    let isPageLoaded = false;
    let isTimerFinished = false;

    // This function attempts to hide the preloader
    const tryHidePreloader = () => {
        // It will only succeed if both the timer is done AND the page has loaded
        if (isPageLoaded && isTimerFinished) {
            preloader.classList.add('hidden');
        }
    };

    // 1. Listen for the entire page to finish loading
    window.addEventListener('load', () => {
        isPageLoaded = true;
        tryHidePreloader(); // Attempt to hide
    });

    // 2. Set a timer for 3 seconds (3000 milliseconds)
    setTimeout(() => {
        isTimerFinished = true;
        tryHidePreloader(); // Attempt to hide
    }, 3000);
}


document.addEventListener('DOMContentLoaded', () => {
    // --- Basic Setup ---
    const menuToggle = document.querySelector('.menu-toggle');
    const fullScreenNav = document.querySelector('.full-screen-nav');
    const closeNavButton = document.querySelector('.close-nav');
    const navLinkItems = document.querySelectorAll('.full-screen-nav .nav-link-item');
    const header = document.querySelector('.main-header');
    const video = document.querySelector('.hero-video');

    // --- Navigation Toggle ---
    if (menuToggle && fullScreenNav && closeNavButton) {
        const closeMenu = () => {
            fullScreenNav.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        };
        menuToggle.addEventListener('click', () => {
            fullScreenNav.classList.add('active');
            menuToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeNavButton.addEventListener('click', closeMenu);
        navLinkItems.forEach(link => link.addEventListener('click', closeMenu));
    }

    // --- Sticky Header Background ---
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
    
    // --- Video Speed on Scroll ---
    if (video) {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            video.playbackRate = 4.0;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                video.playbackRate = 1.0;
            }, 150);
        });
    }

    // --- Advanced Cursor Trail Logic ---
    const cursors = document.querySelectorAll('.cursor');
    if (cursors.length > 0) {
        if ('ontouchstart' in window) {
             document.body.style.cursor = 'auto';
             cursors.forEach(c => c.style.display = 'none');
        } else {
            const cursorPositions = [];
            for (let i = 0; i < cursors.length; i++) {
                cursorPositions.push({ x: 0, y: 0 });
            }
            let mouseX = 0;
            let mouseY = 0;
            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            function animateCursors() {
                let x = mouseX;
                let y = mouseY;
                cursors.forEach((cursor, index) => {
                    const dx = x - cursorPositions[index].x;
                    const dy = y - cursorPositions[index].y;
                    const easingFactor = 0.2;
                    cursorPositions[index].x += dx * easingFactor;
                    cursorPositions[index].y += dy * easingFactor;
                    x = cursorPositions[index].x;
                    y = cursorPositions[index].y;
                    cursor.style.transform = `translate3d(${x - cursor.offsetWidth / 2}px, ${y - cursor.offsetHeight / 2}px, 0)`;
                    if (index > 0) {
                        cursor.style.opacity = 1 - (index / cursors.length);
                        cursor.style.transform += ` scale(${1 - (index / cursors.length)})`;
                    }
                });
                requestAnimationFrame(animateCursors);
            }
            animateCursors();
        }
    }


    // --- Color Inversion on Scroll Logic ---
    const workSection = document.querySelector('.work-section');
    if (workSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                document.body.classList.toggle('invert-colors', entry.isIntersecting);
            });
        }, { threshold: 0.15 });
        observer.observe(workSection);
    }

    // --- DYNAMIC CONTENT LOADER ---
    const featuredWorkGrid = document.getElementById('featured-work-grid');
    const workPageList = document.getElementById('work-page-list');
    const projectDetailContainer = document.getElementById('project-detail-container');

    async function fetchProjects() {
        try {
            const response = await fetch(`projects.json?v=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Could not fetch projects:", error);
            return null;
        }
    }
    
    function populateFeaturedGrid(projects) {
        if (!featuredWorkGrid) return;
        const featuredProjects = projects.filter(p => p.featured);
        featuredWorkGrid.innerHTML = ''; 

        featuredProjects.forEach((project, index) => {
            const isLarge = index === 0;
            const projectItem = document.createElement('a');
            projectItem.href = `project.html?id=${project.id}`;
            projectItem.className = `work-item ${isLarge ? 'work-item-large' : ''}`;
            
            let tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

            projectItem.innerHTML = `
                <div class="work-image-container">
                     <img src="${project.thumbnail}" alt="${project.title} Project Thumbnail" class="work-img">
                </div>
                <div class="work-info-tab">
                    <div class="work-info">
                        <h3>${project.title}</h3>
                        ${project.description ? `<p>${project.description}</p>` : ''}
                    </div>
                    <div class="work-tags">${tagsHTML}</div>
                </div>
            `;
            featuredWorkGrid.appendChild(projectItem);
        });
    }

    function populateWorkList(projects) {
        if (!workPageList) return;
        workPageList.innerHTML = '';

        projects.forEach(project => {
            const projectItem = document.createElement('a');
            projectItem.href = `project.html?id=${project.id}`;
            projectItem.className = 'project-item';
            projectItem.dataset.image = project.thumbnail;

            let tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

            projectItem.innerHTML = `
                <div class="project-info">
                    <span class="project-title">${project.title}</span>
                    <span class="project-desc">${project.description}</span>
                </div>
                <div class="project-tags">${tagsHTML}</div>
            `;
            workPageList.appendChild(projectItem);
        });
    }

    function populateProjectDetail(projects) {
        if (!projectDetailContainer) return;
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const project = projects.find(p => p.id === projectId);

        if (project) {
            document.title = `${project.title} - Sada Studio`;
            const tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
            const imagesHTML = project.images.map(imgSrc => `<img src="${imgSrc}" alt="${project.title} gallery image">`).join('');

            projectDetailContainer.innerHTML = `
                <div class="project-info-wrapper">
                    <div class="project-details-column">
                        <h1>${project.title}</h1>
                        <p class="short-desc">${project.description}</p>
                        <div class="tags">${tagsHTML}</div>
                        <p class="long-desc">${project.longDescription || ''}</p>
                    </div>
                    <a href="work.html" class="btn see-all-work-btn"><span>← Back</span></a>
                </div>
                <div class="project-gallery-column">${imagesHTML}</div>
            `;
        } else {
            projectDetailContainer.innerHTML = `
                <div class="not-found">
                    <h1>Project Not Found</h1>
                    <p>The project you are looking for does not exist.</p>
                    <br>
                    <a href="work.html" class="btn">View All Work</a>
                </div>
            `;
        }
    }

    // --- WORK PAGE THUMBNAIL HOVER LOGIC ---
    const thumbnailViewer = document.getElementById('project-thumbnail-viewer');

    if (workPageList && thumbnailViewer) {
        let mouseX = 0, mouseY = 0;
        let lastMouseX = 0;
        let rotation = 0;
        let animationFrameId = null;

        const animate = () => {
            const velocityX = mouseX - lastMouseX;
            lastMouseX = mouseX;
            const rotationForce = 0.1; 
            const damping = 0.92;      
            rotation += velocityX * rotationForce;
            rotation *= damping;
            thumbnailViewer.style.transform = `translate(${mouseX + 15}px, ${mouseY + 15}px) rotate(${rotation}deg)`;
            animationFrameId = requestAnimationFrame(animate);
        };

        workPageList.addEventListener('mouseover', e => {
            const projectItem = e.target.closest('.project-item');
            if (projectItem && projectItem.dataset.image) {
                thumbnailViewer.style.backgroundImage = `url(${projectItem.dataset.image})`;
                thumbnailViewer.classList.add('visible');
            }
        });

        workPageList.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        workPageList.addEventListener('mouseenter', e => {
            lastMouseX = e.clientX;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animate();
        });

        workPageList.addEventListener('mouseleave', () => {
            thumbnailViewer.classList.remove('visible');
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            rotation = 0;
        });
    }

    // --- Main function to initialize pages ---
    async function initializePage() {
        const projects = await fetchProjects();
        if (!projects) {
            if (projectDetailContainer) {
                projectDetailContainer.innerHTML = `<div class="not-found"><h1>Error</h1><p>Could not load project data. Please try again later.</p></div>`
            }
            return;
        }

        populateFeaturedGrid(projects);
        populateWorkList(projects);
        populateProjectDetail(projects);
    }

    initializePage();
});