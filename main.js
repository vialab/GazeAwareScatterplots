// Track mouse movement to simulate an ambient "gaze" tracking effect for the page background
const updateGaze = (e) => {
    document.documentElement.style.setProperty('--gaze-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--gaze-y', `${e.clientY}px`);
};

window.addEventListener('mousemove', updateGaze, { passive: true });

// Setup smooth scroll observer for "flow" style reveals down the page
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll('.flow-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Boot GSAP & D3 background animation if loaded
    if (typeof gsap !== 'undefined' && typeof d3 !== 'undefined') {
        initHeroBackground();
    }

    // Set up Citation Toggle
    const citBtns = document.querySelectorAll('.cit-btn');
    const copyBtn = document.querySelector('.citation-copy-btn');
    
    citBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            citBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.citation-content').forEach(c => {
                c.classList.remove('active');
            });
            document.getElementById('cit-' + btn.dataset.type).classList.add('active');
        });
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const activeCit = document.querySelector('.citation-content.active');
            if (activeCit) {
                navigator.clipboard.writeText(activeCit.innerText).then(() => {
                    const icon = copyBtn.querySelector('i');
                    icon.className = 'fas fa-check text-brand';
                    setTimeout(() => {
                        icon.className = 'fas fa-copy';
                    }, 2000);
                });
            }
        });
    }
});

function initHeroBackground() {
    const heroBg = document.getElementById('hero-bg-anim');
    if (!heroBg) return;

    let width = heroBg.clientWidth || window.innerWidth;
    let height = heroBg.clientHeight || window.innerHeight;

    // Remove old simple axis blocks
    const oldAxes = heroBg.querySelectorAll('.bg-axis-x, .bg-axis-y');
    oldAxes.forEach(a => a.remove());

    // Main SVG layer for Voronoi and Axes
    const svg = d3.select(heroBg).append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('position', 'absolute')
        .style('inset', '0')
        .style('pointer-events', 'none')
        .style('z-index', '0');

    const voronoiGroup = svg.append('g').attr('class', 'voronoi-layer').style('opacity', 0);
    const axisGroup = svg.append('g').attr('class', 'axis-layer').style('opacity', 0);

    // Build D3 Local Reference Axis Component
    const drawAxis = (x, y) => {
        axisGroup.selectAll('*').remove();

        // Y Axis line
        axisGroup.append('line').attr('class', 'ref-axis-line')
            .attr('x1', x).attr('y1', y - 60)
            .attr('x2', x).attr('y2', y + 30);

        // X Axis line
        axisGroup.append('line').attr('class', 'ref-axis-line')
            .attr('x1', x - 10).attr('y1', y + 30)
            .attr('x2', x + 100).attr('y2', y + 30);

        // Ticks Y
        [0, 30, 60].forEach((dy, i) => {
            let ty = y - 60 + dy;
            axisGroup.append('line').attr('class', 'ref-axis-tick')
                .attr('x1', x - 5).attr('y1', ty)
                .attr('x2', x).attr('y2', ty);
            axisGroup.append('text').attr('class', 'ref-axis-text')
                .attr('x', x - 30).attr('y', ty + 4).text((3.4 - i * 0.2).toFixed(1));
        });

        // Ticks X
        [40, 80].forEach((dx, i) => {
            let tx = x + dx;
            axisGroup.append('line').attr('class', 'ref-axis-tick')
                .attr('x1', tx).attr('y1', y + 30)
                .attr('x2', tx).attr('y2', y + 35);
            axisGroup.append('text').attr('class', 'ref-axis-text')
                .attr('x', tx - 10).attr('y', y + 50).text((2.3 + i * 0.1).toFixed(1));
        });
    };

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'bg-tooltip';
    heroBg.appendChild(tooltip);

    // Color definitions mimicking the visual (Orange, Blue, Green)
    // Assigned manually to clusters to mimic structural data
    const colors = ['#ffbfa8', '#aebce3', '#bce3c5'];

    const numDots = 150;
    const dotsData = [];

    // Points DOM Container
    const pointsContainer = document.createElement('div');
    pointsContainer.style.position = 'absolute';
    pointsContainer.style.inset = '0';
    pointsContainer.style.zIndex = '5';
    heroBg.appendChild(pointsContainer);

    for (let i = 0; i < numDots; i++) {
        let dot = document.createElement('div');
        dot.className = 'bg-dot';

        let classId = i % 3; // Evenly distribute colors
        let x, y;

        // Create 3 basic clusters corresponding to classes

        x = (Math.random() * 0.8 + 0.1) * width;
        y = (Math.random() * 0.8 + 0.1) * height;

        // Add some noise
        x += (Math.random() * 100 - 50);
        y += (Math.random() * 100 - 50);

        // Clamp to screen
        x = Math.max(20, Math.min(width - 20, x));
        y = Math.max(20, Math.min(height - 20, y));

        dot.style.backgroundColor = colors[classId];

        gsap.set(dot, { x: x - 10, y: y - 10 }); // Center offset (20/2)
        pointsContainer.appendChild(dot);

        dotsData.push({ el: dot, x, y, classId, color: colors[classId] });
    }

    // Gaze / Pursuits Visualization
    const gazeRing = document.createElement('div');
    gazeRing.className = 'bg-gaze';
    heroBg.appendChild(gazeRing);

    let gazePos = { x: width / 2, y: height / 2 };
    gsap.set(gazeRing, { x: gazePos.x, y: gazePos.y, xPercent: -50, yPercent: -50 });

    let activeTechnique = 0; // Cycles 0 to 3
    let currentTargetColor = colors[2]; // Default start on Green
    
    // Master Timeline Reference (Global)
    const masterTimeline = gsap.globalTimeline;
    let isPaused = false;

    // Setup Pause Button
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            if (isPaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                masterTimeline.pause(); // Flawlessly freezes all GSAP tweens and delayed calls
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                masterTimeline.play(); // Resumes everything exactly where it left off
            }
        });
    }

    // Calculate and draw the voronoi based on current nodes
    const updateVoronoi = () => {
        const delaunay = d3.Delaunay.from(dotsData.map(d => [d.x, d.y]));
        const voronoi = delaunay.voronoi([0, 0, width, height]);

        const paths = voronoiGroup.selectAll('path').data(dotsData);
        paths.join(
            enter => enter.append('path').attr('class', 'voronoi-path').attr('d', (d, i) => voronoi.renderCell(i)),
            update => update.attr('d', (d, i) => voronoi.renderCell(i)),
            exit => exit.remove()
        );

        // Optional: Highlight cells corresponding to the target color during Click Accuracy
        if (activeTechnique === 3) {
            voronoiGroup.selectAll('.voronoi-path').attr('stroke', d => d.color === currentTargetColor ? 'rgba(174, 188, 227, 0.6)' : 'rgba(77, 70, 79, 0.1)')
                .attr('stroke-width', d => d.color === currentTargetColor ? '2px' : '1px');
        } else {
            voronoiGroup.selectAll('.voronoi-path').attr('stroke', 'rgba(77, 70, 79, 0.15)').attr('stroke-width', '1.5px');
        }
    };

    updateVoronoi();

    window.addEventListener('resize', () => {
        width = heroBg.clientWidth || window.innerWidth;
        height = heroBg.clientHeight || window.innerHeight;
        updateVoronoi();
    });

    // Move Gaze Loop
    // "Smooth pursuit" vs "Saccade" path
    function moveGaze() {
        let isSaccade = Math.random() > 0.8; // Reduce jump frequency for smoother flow
        let nextX = Math.random() * (width - 200) + 100;
        let nextY = Math.random() * (height - 200) + 100;
        let duration = isSaccade ? 0.8 : (3.5 + Math.random() * 2); // Make overall movement much slower and smoother
        let ease = "sine.inOut"; // Use purely smooth easing for all motions

        // Technique 0 (Rendering Order): Prepare for Reference Axis by drifting near a fairly dense cluster
        if (activeTechnique === 0) {
            let targets = dotsData.filter(d => d.color === currentTargetColor);
            if (targets.length > 0) {
                let candidateClusters = [];
                targets.forEach(t1 => {
                    let neighbors = 0;
                    targets.forEach(t2 => {
                        if (t1 !== t2) {
                            let dist = Math.pow(t1.x - t2.x, 2) + Math.pow(t1.y - t2.y, 2);
                            if (dist < 2500) neighbors++;
                        }
                    });
                    if (neighbors >= 2) {
                        candidateClusters.push(t1);
                    }
                });

                let bestClusterDot = candidateClusters.length > 0 
                ? candidateClusters[Math.floor(Math.random() * candidateClusters.length)] 
                : targets[Math.floor(Math.random() * targets.length)];

                // Deliberately move to roughly the cluster area, giving an organic "searching" feel
                nextX = Math.max(50, Math.min(width - 50, bestClusterDot.x + (Math.random() * 40 - 20)));
                nextY = Math.max(50, Math.min(height - 50, bestClusterDot.y + (Math.random() * 40 - 20)));
            }
            isSaccade = false; // Prioritize smooth approach
            duration = 4.5; // Flow continuously through the whole technique phase
        }

        // Technique 1 (Reference Axis fixation): Lock and coordinate gaze so the target dot lands in the center of the axis
        if (activeTechnique === 1) {
            let closestTargetDot = null;
            let currentMinDist = Infinity;
            
            // Find the closest dot of the currently chased target color
            dotsData.forEach(d => {
                if (d.color === currentTargetColor) {
                    let dist = (d.x - gazePos.x)**2 + (d.y - gazePos.y)**2;
                    if (dist < currentMinDist) { currentMinDist = dist; closestTargetDot = d; }
                }
            });

            let isAtDot = false;
            if (closestTargetDot) {
                // Position the gaze so that the closest dot is exactly in the center of the bounding box
                // The axis bounds are roughly dx: [0 to 100], dy: [-60 to +30] relative to gazePos.
                // Center offset: dx = 50, dy = -15
                let targetGazeX = closestTargetDot.x - 50;
                let targetGazeY = closestTargetDot.y + 15;

                let distToTarget = Math.sqrt((targetGazeX - gazePos.x)**2 + (targetGazeY - gazePos.y)**2);
                
                // If we are basically perfectly arrived at the offset position
                if (distToTarget < 2) {
                    isAtDot = true;
                    nextX = gazePos.x;
                    nextY = gazePos.y;
                } else {
                    // Smoothly slide into exact offset position
                    nextX = targetGazeX;
                    nextY = targetGazeY;
                    duration = Math.max(0.6, distToTarget / 150); // Make the final settle organic but not jarringly fast
                    ease = "power2.out";
                }
            } else {
                nextX = gazePos.x;
                nextY = gazePos.y;
                isAtDot = true;
            }
            
            if (isAtDot) {
                duration = 2.0; // Sleep here so the axis can comfortably trigger
                if (!gazePos.stopTime) gazePos.stopTime = Date.now(); // Start 0.5s timer ONLY when perfectly landed
            } else {
                gazePos.stopTime = null; // Do not start plotting the axis until physical arrival completes
            }
        } else {
            gazePos.stopTime = null; // Clear stop time if we aren't in axis technique
        }

        // Determine the dominant color at the new region to be the 'Interest Color'
        let closest = null;
        let minDist = Infinity;
        dotsData.forEach(d => {
            let dx = d.x - nextX;
            let dy = d.y - nextY;
            let dist = dx * dx + dy * dy;
            if (dist < minDist) { minDist = dist; closest = d; }
        });

        // Prevent changing target color while we are specifically animating rendering order or axis technique
        if (isSaccade && closest && activeTechnique !== 1 && activeTechnique !== 0) {
            currentTargetColor = closest.color;
        }

        gsap.to(gazePos, {
            x: nextX,
            y: nextY,
            dummyProp: Math.random(), // Force onUpdate to trigger even if x/y aren't changing while stopped
            duration: duration,
            ease: ease,
            onUpdate: () => {
                gsap.set(gazeRing, { x: gazePos.x, y: gazePos.y });

                let curClosest = null;
                let curMinDist = Infinity;

                dotsData.forEach(d => {
                    let dx = d.x - gazePos.x;
                    let dy = d.y - gazePos.y;
                    let dist = dx * dx + dy * dy;

                    if (dist < curMinDist) {
                        curMinDist = dist;
                        curClosest = d;
                    }

                    // Check if gaze has been still for 0.5s in Technique 1
                    let isStoppedLongEnough = gazePos.stopTime && (Date.now() - gazePos.stopTime > 500);
                    // Technique Visualization Rules
                    if (activeTechnique === 1) {
                        let isActiveColor = d.color === currentTargetColor;
                        
                        if (isStoppedLongEnough) {
                            // Reference Axis: Highlight only the target color dots inside the static axis bounding box
                            let inAxisBounds = (dx >= -10 && dx <= 110) && (dy >= -70 && dy <= 40);
                            
                            if (inAxisBounds && isActiveColor) {
                                gsap.to(d.el, { opacity: 1, zIndex: 10, scale: 1.1, duration: 0.1 });
                            } else {
                                gsap.to(d.el, { opacity: 0.4, zIndex: 1, scale: 1, duration: 0.4 });
                            }
                        } else {
                            // While waiting for the 0.5s stop, don't mistakenly fade out the dots
                            gsap.to(d.el, { opacity: isActiveColor ? 1 : 0.8, scale: 1, zIndex: isActiveColor ? 10 : 1, duration: 0.4 });
                        }
                    } else {
                        let isActiveColor = d.color === currentTargetColor;

                        // Rendering Order (0): Just bring target color to top layer, no fading
                        if (activeTechnique === 0) {
                            if (!isActiveColor) {
                                gsap.to(d.el, { opacity: 1, zIndex: 1, scale: 1, duration: 0.4 });
                            } else {
                                gsap.to(d.el, { opacity: 1, zIndex: 10, scale: 1.1, duration: 0.4 });
                            }
                        } else {
                            // Default reset for 2 and 3
                            gsap.to(d.el, { opacity: isActiveColor ? 1 : 0.8, scale: 1, zIndex: isActiveColor ? 10 : 1, duration: 0.4 });
                        }
                    }
                });

                if (curClosest) {
                    let isStoppedLongEnough = gazePos.stopTime && (Date.now() - gazePos.stopTime > 500);
                    // Reference Axis (Fixed position lock based on gazePos, only after 0.5s stop)
                    if (activeTechnique === 1 && isStoppedLongEnough) {
                        axisGroup.style('opacity', 1);
                        drawAxis(gazePos.x, gazePos.y); // lock to the stopped gaze pos for stability
                    } else {
                        axisGroup.style('opacity', 0);
                    }

                    // Hover Speed Tooltip
                    if (activeTechnique === 2 && curMinDist < 2500 && curClosest.color === currentTargetColor) {
                        tooltip.innerHTML = `<span style="color:${curClosest.color}; font-weight:bold;">Obj ID: ${Math.floor(Math.random() * 1000)}</span><br>x: ${(curClosest.x / 100).toFixed(2)} y: ${(curClosest.y / 100).toFixed(2)}`;
                        gsap.to(tooltip, { x: curClosest.x + 15, y: curClosest.y - 45, opacity: 1, duration: 0.1 });
                    } else if (activeTechnique !== 2  || curMinDist >= 2500) {
                        gsap.to(tooltip, { opacity: 0, duration: 0.2 });
                    }
                }
            },
            onComplete: () => {
                if (activeTechnique === 3) updateVoronoi();
                moveGaze(); // Naturally loops since global timeline controls executing this
            }
        });
    }

    // State Machine (Syncs perfectly with GSAP global timeline instead of setInterval)
    function cycleState() {
        activeTechnique = (activeTechnique + 1) % 4;
        
        // Reset stopTime explicitly when transitioning away from or into techniques
        gazePos.stopTime = null;
        
        // Immediately kill the current gaze animation so it perfectly syncs to the new state's rules
        gsap.killTweensOf(gazePos);
        moveGaze();

        // Show voronoi explicitly during Click Accuracy state
        if (activeTechnique === 3) {
            voronoiGroup.transition().duration(500).style('opacity', 0.8);
            // Change current target color to a random one for the Click Accuracy technique
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            currentTargetColor = randomColor;
        } else {
            voronoiGroup.transition().duration(500).style('opacity', 0);
        }

        gsap.fromTo(gazeRing, { scale: 1.1 }, { scale: 1, duration: 0.5, ease: "bounce.out" });
        
        // Auto queue the next cycle, controlled by the master timeline
        gsap.delayedCall(5, cycleState);
    }
    
    // Start the state loop
    gsap.delayedCall(5, cycleState);

    // Init
    gazePos.stopTime = null; // explicitly start without any stopTime state
    gsap.to(gazeRing, { opacity: 1, duration: 1, delay: 0.5 });
    setTimeout(moveGaze, 100);
}