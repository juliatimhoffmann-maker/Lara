// ==================== PASSWORT SCHUTZ ====================
function checkPassword() {
    const input = document.getElementById('password-input').value;
    const error = document.getElementById('login-error');

    if (input === 'lara123.cool#090984') {
        document.getElementById('login-screen').style.opacity = '0';
        document.getElementById('login-screen').style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-website').style.display = 'block';
            document.getElementById('main-website').style.animation = 'fadeIn 0.5s ease';
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
        answers: ["Henry Ford", "Carl Benz", "Ferdinand Porsche", "Gottlieb Daimler"],
        correct: 1,
        explanation: "Carl Benz hat 1886 das erste Automobil erfunden!"
    },
    {
        question: "Wann wurde Mercedes-Benz gegründet?",
        answers: ["1886", "1910", "1926", "1945"],
        correct: 2,
        explanation: "Mercedes-Benz wurde 1926 durch die Fusion von Daimler und Benz gegründet."
    },
    {
        question: "Was hat Mercedes-Benz als erster Autohersteller in Serienfahrzeugen eingebaut?",
        answers: ["Klimaanlage", "Airbag", "Navi", "Sitzheizung"],
        correct: 1,
        explanation: "Mercedes-Benz war Pionier beim Einbau von Airbags in Serienfahrzeugen!"
    },
    {
        question: "Wie viel hat der Bau des Mercedes-Benz Museums gekostet (ohne Autos)?",
        answers: ["50 Millionen €", "100 Millionen €", "150 Millionen €", "200 Millionen €"],
        correct: 2,
        explanation: "Das Museum hat über 150 Millionen Euro gekostet – ohne die wertvollen Autos darin!"
    },
    {
        question: "Was passiert im Mercedes-Benz Museum, wenn es brennt?",
        answers: ["Sprinkleranlage mit Wasser", "Roboter löschen das Feuer", "Ein Tornado entzieht den Sauerstoff", "Die Autos fahren automatisch raus"],
        correct: 2,
        explanation: "Ein Tornado entzieht dem Feuer den Sauerstoff, damit die Autos nicht durch Wasser beschädigt werden!"
    },
    {
        question: "Wie viel hat ein anonymer Käufer für eines der seltensten Mercedes-Autos bezahlt?",
        answers: ["10 Millionen €", "50 Millionen €", "100 Millionen €", "160 Millionen €"],
        correct: 3,
        explanation: "160 Millionen Euro! Das Auto gibt es nur 2 Mal auf der ganzen Welt."
    },
    {
        question: "Wofür steht 'KI' in der IT-Abteilung?",
        answers: ["Kontroll-Instrument", "Künstliche Intelligenz", "Kern-Information", "Kluge Ideen"],
        correct: 1,
        explanation: "KI steht für Künstliche Intelligenz – ein großes Thema bei Mercedes-Benz!"
    },
    {
        question: "Wo hat Lara ihr Praktikum bei Mercedes-Benz gemacht?",
        answers: ["München", "Berlin", "Stuttgart", "Wiesbaden"],
        correct: 2,
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
