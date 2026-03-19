// ==================== LOGIN BACKGROUND CANVAS ====================
(function() {
    const canvas = document.getElementById('login-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Neural network particles
    const particles = [];
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI * 2
        });
    }

    // AMG GT silhouette points (scaled to canvas)
    function getCarPoints() {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w * 0.5;
        const cy = h * 0.62;
        const scale = Math.min(w, h) * 0.0028;

        const pts = [
            [-180, 0], [-170, -8], [-155, -14], [-140, -18],
            [-120, -22], [-105, -38], [-95, -48], [-80, -55],
            [-60, -58], [-40, -58], [-20, -56], [0, -55],
            [20, -56], [40, -58], [60, -58], [80, -52],
            [95, -42], [105, -35], [120, -22], [140, -16],
            [155, -12], [170, -8], [180, 0],
            [175, 6], [160, 8], [140, 8],
            [120, 10], [100, 10], [80, 10],
            [-80, 10], [-100, 10], [-120, 10],
            [-140, 8], [-160, 8], [-175, 6], [-180, 0]
        ];

        return pts.map(([px, py]) => [cx + px * scale, cy + py * scale]);
    }

    // Circuit board traces
    const traces = [];
    for (let i = 0; i < 15; i++) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const segments = [];
        let x = startX, y = startY;
        for (let j = 0; j < 4 + Math.floor(Math.random() * 4); j++) {
            const horizontal = Math.random() > 0.5;
            const len = 30 + Math.random() * 80;
            const dir = Math.random() > 0.5 ? 1 : -1;
            const nx = horizontal ? x + len * dir : x;
            const ny = horizontal ? y : y + len * dir;
            segments.push({ x1: x, y1: y, x2: nx, y2: ny });
            x = nx;
            y = ny;
        }
        traces.push({ segments, alpha: 0.03 + Math.random() * 0.06 });
    }

    let time = 0;

    function draw() {
        time += 0.008;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dark gradient background
        const bg = ctx.createRadialGradient(
            canvas.width * 0.5, canvas.height * 0.55, 0,
            canvas.width * 0.5, canvas.height * 0.55, canvas.width * 0.7
        );
        bg.addColorStop(0, '#12121f');
        bg.addColorStop(0.5, '#0c0c18');
        bg.addColorStop(1, '#08080e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Circuit traces
        traces.forEach(trace => {
            trace.segments.forEach(seg => {
                ctx.strokeStyle = `rgba(196, 163, 90, ${trace.alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();
            });
        });

        // Draw & connect particles (neural network)
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.15;
                    ctx.strokeStyle = `rgba(196, 163, 90, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            const glow = 0.3 + Math.sin(p.pulse) * 0.2;
            ctx.fillStyle = `rgba(196, 163, 90, ${glow})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // AMG GT silhouette
        const carPts = getCarPoints();
        if (carPts.length > 2) {
            // Glow effect
            ctx.shadowColor = 'rgba(196, 163, 90, 0.4)';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = 'rgba(196, 163, 90, 0.25)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(carPts[0][0], carPts[0][1]);
            for (let i = 1; i < carPts.length; i++) {
                ctx.lineTo(carPts[i][0], carPts[i][1]);
            }
            ctx.closePath();
            ctx.stroke();

            // Fill with subtle gradient
            const carGrad = ctx.createLinearGradient(
                carPts[0][0], carPts[0][1] - 60,
                carPts[0][0], carPts[0][1] + 20
            );
            carGrad.addColorStop(0, 'rgba(196, 163, 90, 0.06)');
            carGrad.addColorStop(1, 'rgba(196, 163, 90, 0.02)');
            ctx.fillStyle = carGrad;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Animated scan line over car
            const scanY = carPts[0][1] - 70 + Math.sin(time) * 40;
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.15 + Math.sin(time * 2) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(carPts[0][0] - 20, scanY);
            ctx.lineTo(carPts[carPts.length - 2][0] + 20, scanY);
            ctx.stroke();

            // Data points on car
            for (let i = 0; i < carPts.length; i += 3) {
                const glow = 0.4 + Math.sin(time * 3 + i) * 0.3;
                ctx.fillStyle = `rgba(100, 200, 255, ${glow})`;
                ctx.beginPath();
                ctx.arc(carPts[i][0], carPts[i][1], 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // "AI" text watermark
        ctx.font = `${Math.min(canvas.width, canvas.height) * 0.08}px Poppins, sans-serif`;
        ctx.fillStyle = 'rgba(196, 163, 90, 0.04)';
        ctx.textAlign = 'center';
        ctx.fillText('AMG GT × AI', canvas.width * 0.5, canvas.height * 0.85);

        // Mercedes star hint (three lines from center)
        const starCx = canvas.width * 0.5;
        const starCy = canvas.height * 0.3;
        const starR = Math.min(canvas.width, canvas.height) * 0.06;
        const starAlpha = 0.06 + Math.sin(time) * 0.03;

        ctx.strokeStyle = `rgba(196, 163, 90, ${starAlpha})`;
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 3; a++) {
            const angle = (a * 120 - 90) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(starCx, starCy);
            ctx.lineTo(starCx + Math.cos(angle) * starR, starCy + Math.sin(angle) * starR);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(starCx, starCy, starR, 0, Math.PI * 2);
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();
})();

// ==================== PASSWORT SCHUTZ ====================
function checkPassword() {
    const input = document.getElementById('password-input').value;
    const error = document.getElementById('login-error');

    if (input === 'lara123.cool#090984') {
        document.getElementById('login-screen').style.opacity = '0';
        document.getElementById('login-screen').style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            const main = document.getElementById('main-website');
            main.style.position = 'relative';
            main.style.visibility = 'visible';
            main.style.opacity = '1';
            main.style.animation = 'fadeIn 0.5s ease';
            startCountAnimation();
        }, 500);
    } else {
        error.textContent = 'Falsches Passwort! Versuch es nochmal.';
        document.getElementById('password-input').style.borderColor = '#ff6b8a';
        document.getElementById('password-input').value = '';
        setTimeout(() => {
            error.textContent = '';
            document.getElementById('password-input').style.borderColor = '';
        }, 3000);
    }
}

// Enter-Taste für Login
document.getElementById('password-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkPassword();
});

// ==================== NAVIGATION ====================
function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

function closeMenu() {
    document.getElementById('nav-links').classList.remove('active');
}

// Navbar Scroll-Effekt
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '10px 30px';
        navbar.style.background = 'rgba(13, 13, 13, 0.98)';
    } else {
        navbar.style.padding = '15px 30px';
        navbar.style.background = 'rgba(13, 13, 13, 0.9)';
    }
});

// ==================== ZÄHLER ANIMATION ====================
function startCountAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    function update() {
        current += step;
        if (current >= target) {
            if (target >= 1000) {
                element.textContent = target.toLocaleString('de-DE');
            } else {
                element.textContent = target;
            }
            return;
        }
        if (target >= 1000) {
            element.textContent = Math.floor(current).toLocaleString('de-DE');
        } else {
            element.textContent = Math.floor(current);
        }
        requestAnimationFrame(update);
    }
    update();
}

// ==================== QUIZ ====================
const quizQuestions = [
    {
        question: "Wer gilt als Erfinder des ersten Automobils?",
        answers: ["Henry Ford", "Carl Benz", "Ferdinand Porsche"],
        correct: 1,
        explanation: "Carl Benz hat 1886 das erste Automobil erfunden!"
    },
    {
        question: "Wann wurde Mercedes-Benz gegründet?",
        answers: ["1886", "1926", "1945"],
        correct: 1,
        explanation: "Mercedes-Benz wurde 1926 durch die Fusion von Daimler und Benz gegründet."
    },
    {
        question: "Was hat Mercedes-Benz als erster Autohersteller in Serienfahrzeugen eingebaut?",
        answers: ["Klimaanlage", "Airbag", "Sitzheizung"],
        correct: 1,
        explanation: "Mercedes-Benz war Pionier beim Einbau von Airbags in Serienfahrzeugen!"
    },
    {
        question: "Wie viel hat der Bau des Mercedes-Benz Museums gekostet (ohne Autos)?",
        answers: ["50 Millionen €", "150 Millionen €", "200 Millionen €"],
        correct: 1,
        explanation: "Das Museum hat über 150 Millionen Euro gekostet – ohne die wertvollen Autos darin!"
    },
    {
        question: "Was passiert im Mercedes-Benz Museum, wenn es brennt?",
        answers: ["Sprinkleranlage mit Wasser", "Ein Tornado entzieht den Sauerstoff", "Die Autos fahren automatisch raus"],
        correct: 1,
        explanation: "Ein Tornado entzieht dem Feuer den Sauerstoff, damit die Autos nicht durch Wasser beschädigt werden!"
    },
    {
        question: "Wie viel hat ein anonymer Käufer für eines der seltensten Mercedes-Autos bezahlt?",
        answers: ["50 Millionen €", "100 Millionen €", "160 Millionen €"],
        correct: 2,
        explanation: "160 Millionen Euro! Das Auto gibt es nur 2 Mal auf der ganzen Welt."
    },
    {
        question: "Wofür steht 'KI' in der IT-Abteilung?",
        answers: ["Kontroll-Instrument", "Künstliche Intelligenz", "Kern-Information"],
        correct: 1,
        explanation: "KI steht für Künstliche Intelligenz – ein großes Thema bei Mercedes-Benz!"
    },
    {
        question: "Wo hat Lara ihr Praktikum bei Mercedes-Benz gemacht?",
        answers: ["München", "Stuttgart", "Berlin"],
        correct: 1,
        explanation: "In Stuttgart – dem Herzen von Mercedes-Benz! 🚗"
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

function loadQuestion() {
    const q = quizQuestions[currentQuestion];
    document.getElementById('quiz-question-number').textContent = `FRAGE ${currentQuestion + 1} VON ${quizQuestions.length}`;
    document.getElementById('quiz-question').textContent = q.question;
    document.getElementById('quiz-progress-bar').style.width = `${((currentQuestion) / quizQuestions.length) * 100}%`;
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-next-btn').style.display = 'none';
    answered = false;

    const answersDiv = document.getElementById('quiz-answers');
    answersDiv.innerHTML = '';

    q.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(index);
        answersDiv.appendChild(btn);
    });
}

function selectAnswer(index) {
    if (answered) return;
    answered = true;

    const q = quizQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.quiz-answer-btn');

    buttons.forEach(btn => btn.classList.add('disabled'));

    if (index === q.correct) {
        buttons[index].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = `<span style="color:#81c784">✓ Richtig! ${q.explanation}</span>`;
        score++;
    } else {
        buttons[index].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
        document.getElementById('quiz-feedback').innerHTML = `<span style="color:#e57373">✗ Leider falsch! ${q.explanation}</span>`;
    }

    document.getElementById('quiz-next-btn').style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    document.getElementById('quiz-progress-bar').style.width = '100%';

    const percentage = Math.round((score / quizQuestions.length) * 100);
    document.getElementById('quiz-score-display').textContent = `${score} / ${quizQuestions.length}`;

    if (percentage >= 80) {
        document.getElementById('quiz-result-title').textContent = 'Super gemacht!';
        document.getElementById('quiz-result-text').textContent = 'Du bist ein echtes Mercedes-Benz Genie!';
    } else if (percentage >= 50) {
        document.getElementById('quiz-result-title').textContent = 'Gut gemacht!';
        document.getElementById('quiz-result-text').textContent = 'Du weißt schon einiges über Mercedes-Benz!';
    } else {
        document.getElementById('quiz-result-title').textContent = 'Nicht schlecht!';
        document.getElementById('quiz-result-text').textContent = 'Schau dir die Seite nochmal an und versuch es erneut!';
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    loadQuestion();
}

// Quiz starten
loadQuestion();

// ==================== CHAT ====================
const chatResponses = {
    // Grüße
    greetings: {
        patterns: ['hallo', 'hi', 'hey', 'moin', 'servus', 'guten tag', 'guten morgen', 'guten abend'],
        responses: [
            'Hallo! 😊 Schön, dass du dich für Laras Praktikum bei Mercedes-Benz interessierst! Was möchtest du wissen?',
            'Hey! 👋 Willkommen! Frag mich alles über das Praktikum bei Mercedes-Benz in Stuttgart!'
        ]
    },
    // Wann war das Praktikum?
    wann: {
        patterns: ['wann', 'datum', 'zeitraum', 'wie lange', 'dauer'],
        responses: [
            'Das Praktikum war vom 9. März bis 20. März 2026 – also genau zwei Wochen! 📅'
        ]
    },
    // Wo war das Praktikum?
    wo: {
        patterns: ['wo ', 'ort', 'stadt', 'standort', 'adresse'],
        responses: [
            'Das Praktikum fand bei Mercedes-Benz in Stuttgart statt – in der IT-Abteilung! 📍 Stuttgart ist das Herz von Mercedes-Benz.'
        ]
    },
    // Was wurde gemacht?
    was: {
        patterns: ['was gemacht', 'was hast', 'was hat', 'aufgaben', 'tätigkeiten', 'was macht man', 'was lernt'],
        responses: [
            'Lara war in der IT-Abteilung und hat sich viel mit Künstlicher Intelligenz (KI) beschäftigt. Sie hat gelernt, wie KI bei Mercedes-Benz eingesetzt wird! 🤖'
        ]
    },
    // Mercedes allgemein
    mercedes: {
        patterns: ['mercedes', 'auto', 'autos', 'fahrzeug', 'marke'],
        responses: [
            'Mercedes-Benz wurde 1926 gegründet und ist einer der bekanntesten Automobilhersteller der Welt! Sie stehen für Luxus, Qualität und Innovation. Der Gründervater Carl Benz hat 1886 das erste Auto erfunden! 🚗'
        ]
    },
    // KI
    ki: {
        patterns: ['ki', 'künstliche intelligenz', 'artificial intelligence', 'ai', 'intelligent'],
        responses: [
            'KI (Künstliche Intelligenz) war ein großes Thema im Praktikum! Mercedes-Benz setzt KI für autonomes Fahren, digitale Assistenten und viele andere Bereiche ein. Lara hat in der IT-Abteilung live miterleben können, wie daran gearbeitet wird! 🤖✨'
        ]
    },
    // Museum
    museum: {
        patterns: ['museum', 'ausstellung', 'besuchen'],
        responses: [
            'Das Mercedes-Benz Museum in Stuttgart ist mega beeindruckend! Es hat über 150 Millionen Euro gekostet (ohne die Autos!), zeigt über 160 Fahrzeuge und hat ein geniales Brandschutzsystem: Bei Feuer wird ein Tornado erzeugt, der dem Feuer den Sauerstoff entzieht – damit die teuren Autos nicht beschädigt werden! 🏛️'
        ]
    },
    // Schule
    schule: {
        patterns: ['schule', 'klasse', 'orianienschule', 'wiesbaden'],
        responses: [
            'Lara geht auf die Orianienschule in Wiesbaden und ist in der 9. Klasse. Für das Praktikum war sie bei ihrem Onkel in Stuttgart zu Besuch! 🏫'
        ]
    },
    // Onkel
    onkel: {
        patterns: ['onkel', 'familie', 'verwandt'],
        responses: [
            'Laras Onkel arbeitet bei Mercedes-Benz in Stuttgart. Sie durfte ihn besuchen und in seiner IT-Abteilung ein Praktikum machen – wie cool ist das! 👨‍💻'
        ]
    },
    // Mitarbeiter
    mitarbeiter: {
        patterns: ['mitarbeiter', 'angestellte', 'beschäftigte', 'wie viele arbeiten'],
        responses: [
            'Mercedes-Benz hat weltweit etwa 170.000 Mitarbeiter! In Stuttgart allein gibt es mehrere große Standorte wie Untertürkheim und Sindelfingen. 👥'
        ]
    },
    // Spaß/Gefallen
    spass: {
        patterns: ['spaß', 'spass', 'gefallen', 'toll', 'cool', 'schön', 'erfahrung'],
        responses: [
            'Lara fand das Praktikum super spannend! Besonders die Arbeit mit KI in der IT-Abteilung war total interessant. Es war eine unvergessliche Erfahrung! 🌟'
        ]
    },
    // Danke
    danke: {
        patterns: ['danke', 'dankeschön', 'vielen dank', 'thx', 'thanks'],
        responses: [
            'Gerne! 😊 Wenn du noch mehr Fragen hast, frag einfach!',
            'Bitteschön! Schau dich gerne weiter auf der Website um! ✨'
        ]
    },
    // Tschüss
    bye: {
        patterns: ['tschüss', 'bye', 'ciao', 'bis dann', 'auf wiedersehen'],
        responses: [
            'Tschüss! 👋 Danke fürs Vorbeischauen! Schau gerne wieder rein!',
            'Bis bald! 😊 Es war schön, mit dir zu chatten!'
        ]
    }
};

function findResponse(message) {
    const lowerMsg = message.toLowerCase().trim();

    // Suche nach passender Kategorie
    for (const category of Object.values(chatResponses)) {
        for (const pattern of category.patterns) {
            if (lowerMsg.includes(pattern)) {
                const responses = category.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Standard-Antworten wenn nichts passt
    const defaults = [
        'Gute Frage! 🤔 Leider weiß ich darauf noch keine genaue Antwort. Versuch es mal mit Fragen über das Praktikum, Mercedes-Benz, KI oder Stuttgart!',
        'Hmm, das weiß ich leider nicht genau. Frag mich doch über Mercedes-Benz, das Praktikum, KI oder Stuttgart! 😊',
        'Darüber kann ich dir leider nicht viel sagen. Aber frag mich gerne über Laras Praktikum bei Mercedes-Benz! 🚗'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById('chat-messages');

    // User-Nachricht
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user-msg';
    userDiv.innerHTML = `
        <span class="chat-avatar">👤</span>
        <div class="chat-bubble">${escapeHtml(message)}</div>
    `;
    chatMessages.appendChild(userDiv);
    input.value = '';

    // Bot "tippt" Animation
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot-msg';
    typingDiv.innerHTML = `
        <span class="chat-avatar">🤖</span>
        <div class="chat-bubble" style="color:#999">Tippt...</div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Bot-Antwort nach kurzer Verzögerung
    setTimeout(() => {
        chatMessages.removeChild(typingDiv);

        const botDiv = document.createElement('div');
        botDiv.className = 'chat-msg bot-msg';
        botDiv.innerHTML = `
            <span class="chat-avatar">🤖</span>
            <div class="chat-bubble">${findResponse(message)}</div>
        `;
        chatMessages.appendChild(botDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800 + Math.random() * 700);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.timeline-item, .fact-card, .stuttgart-card, .praktikum-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        scrollObserver.observe(el);
    });
});
