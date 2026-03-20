// ==================== PASSWORT SCHUTZ ====================
// Passwort wird als SHA-256 Hash gespeichert (nicht im Klartext)
const PASS_HASH = 'b9da2f77f8130780b6ea06f0b6d0fb61ca44acf85517dec736f5dc2b2bef9190';

// Rate-Limiting: max. 5 Versuche, dann 60 Sekunden Sperre
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000; // 60 Sekunden in ms
let loginAttempts = 0;
let lockoutUntil = 0;

// Session-Timeout: 30 Minuten Inaktivität = automatischer Logout
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessionTimer = null;
let isLoggedIn = false;

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (isLoggedIn) {
        sessionTimer = setTimeout(() => {
            doLogout();
            alert('Sitzung abgelaufen. Bitte erneut einloggen.');
        }, SESSION_TIMEOUT);
    }
}

function doLogout() {
    isLoggedIn = false;
    if (sessionTimer) clearTimeout(sessionTimer);
    document.getElementById('login-screen').style.display = '';
    document.getElementById('login-screen').style.opacity = '1';
    document.getElementById('login-screen').style.transition = '';
    const main = document.getElementById('main-website');
    main.style.position = 'absolute';
    main.style.visibility = 'hidden';
    main.style.opacity = '0';
    main.style.animation = '';
    document.getElementById('password-input').value = '';
    document.getElementById('login-error').textContent = '';
}

async function checkPassword() {
    const input = document.getElementById('password-input').value;
    const error = document.getElementById('login-error');

    // Rate-Limiting prüfen
    const now = Date.now();
    if (now < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - now) / 1000);
        error.textContent = `Zu viele Versuche! Warte noch ${remaining} Sekunden.`;
        document.getElementById('password-input').value = '';
        return;
    }

    const inputHash = await hashPassword(input);

    if (inputHash === PASS_HASH) {
        loginAttempts = 0;
        isLoggedIn = true;
        resetSessionTimer();

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
        loginAttempts++;
        const attemptsLeft = MAX_ATTEMPTS - loginAttempts;

        if (loginAttempts >= MAX_ATTEMPTS) {
            lockoutUntil = now + LOCKOUT_DURATION;
            loginAttempts = 0;
            error.textContent = `Zu viele Fehlversuche! Gesperrt für 60 Sekunden.`;
        } else {
            error.textContent = `Falsches Passwort! Noch ${attemptsLeft} Versuche übrig.`;
        }
        document.getElementById('password-input').style.borderColor = '#ff6b8a';
        document.getElementById('password-input').value = '';
        setTimeout(() => {
            document.getElementById('password-input').style.borderColor = '';
        }, 3000);
    }
}

// Enter-Taste für Login
document.getElementById('password-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkPassword();
});

// Session-Timeout bei Aktivität zurücksetzen
['mousemove', 'keypress', 'click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetSessionTimer, { passive: true });
});

// Schutz: Rechtsklick und Quelltext-Zugriff erschweren
document.addEventListener('contextmenu', function(e) {
    if (!isLoggedIn) e.preventDefault();
});

// Schutz: Bestimmte Tastenkombinationen blockieren (F12, Ctrl+Shift+I, Ctrl+U)
document.addEventListener('keydown', function(e) {
    if (!isLoggedIn) {
        if (e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
            e.preventDefault();
        }
    }
});

// Schutz: Main-Website Sichtbarkeit überwachen (gegen Konsolen-Bypass)
(function protectContent() {
    const observer = new MutationObserver(function() {
        const main = document.getElementById('main-website');
        if (!isLoggedIn && main) {
            if (main.style.visibility !== 'hidden' || main.style.opacity !== '0') {
                main.style.visibility = 'hidden';
                main.style.opacity = '0';
                main.style.position = 'absolute';
            }
        }
    });

    const main = document.getElementById('main-website');
    if (main) {
        observer.observe(main, { attributes: true, attributeFilter: ['style'] });
    }
})();

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
        answers: ["Henry Ford", "Ferdinand Porsche", "Carl Benz"],
        correct: 2,
        explanation: "Carl Benz hat 1886 das erste Automobil erfunden!"
    },
    {
        question: "Wann wurde Mercedes-Benz gegründet?",
        answers: ["1926", "1886", "1945"],
        correct: 0,
        explanation: "Mercedes-Benz wurde 1926 durch die Fusion von Daimler und Benz gegründet."
    },
    {
        question: "Was brachte Mercedes-Benz 1981 als erster europäischer Hersteller in die Serienproduktion?",
        answers: ["Klimaanlage", "Sitzheizung", "Airbag mit Gurtstraffer"],
        correct: 2,
        explanation: "Mercedes-Benz war 1981 der erste europäische Hersteller mit Airbag und Gurtstraffer in Serie!"
    },
    {
        question: "Wie viel hat der Bau des Mercedes-Benz Museums gekostet (ohne Autos)?",
        answers: ["200 Millionen €", "150 Millionen €", "50 Millionen €"],
        correct: 1,
        explanation: "Das Museum hat rund 150 Millionen Euro gekostet – ohne die wertvollen Autos darin!"
    },
    {
        question: "Was passiert im Mercedes-Benz Museum, wenn es brennt?",
        answers: ["Die Autos fahren automatisch raus", "Sprinkleranlage mit Wasser", "Ein künstlicher Tornado saugt den Rauch ab"],
        correct: 2,
        explanation: "Der stärkste künstliche Tornado der Welt (Guinness-Rekord!) saugt den Rauch aus dem Gebäude ab!"
    },
    {
        question: "Wie viel wurde 2022 für das teuerste Auto der Welt (Mercedes 300 SLR) bezahlt?",
        answers: ["135 Millionen €", "100 Millionen €", "50 Millionen €"],
        correct: 0,
        explanation: "135 Millionen Euro! Das Uhlenhaut Coupé gibt es nur 2 Mal auf der ganzen Welt."
    },
    {
        question: "Wofür steht 'KI' in der IT-Abteilung?",
        answers: ["Kern-Information", "Kontroll-Instrument", "Künstliche Intelligenz"],
        correct: 2,
        explanation: "KI steht für Künstliche Intelligenz – ein großes Thema bei Mercedes-Benz!"
    },
    {
        question: "Wo hat Lara ihr Praktikum bei Mercedes-Benz gemacht?",
        answers: ["Stuttgart", "München", "Berlin"],
        correct: 0,
        explanation: "In Stuttgart – dem Herzen von Mercedes-Benz!"
    },
    {
        question: "Wie heißt das autonome Fahrsystem von Mercedes-Benz, das seit 2021 Level 3 ermöglicht?",
        answers: ["AutoPilot", "DRIVE PILOT", "CruiseControl AI"],
        correct: 1,
        explanation: "Der DRIVE PILOT nutzt über 35 Sensoren und erlaubt autonomes Fahren bis 95 km/h – Mercedes war der erste Hersteller weltweit mit Level-3-Zulassung!"
    },
    {
        question: "Welches Gebäude hat Lara während ihres Praktikums besucht, in dem es um KI und Innovation geht?",
        answers: ["Tesla Gigafactory", "IPAI Spaces", "Google Campus"],
        correct: 1,
        explanation: "IPAI Spaces in Heilbronn – ein modernes Gebäude für KI und Innovation, wo Lara spannende Einblicke bekam!"
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
        patterns: ['hallo', 'hi', 'hey', 'moin', 'servus', 'guten tag', 'guten morgen', 'guten abend', 'grüß', 'grüss', 'yo', 'na'],
        responses: [
            'Hallo! 😊 Schön, dass du dich für Laras Praktikum bei Mercedes-Benz interessierst! Was möchtest du wissen?',
            'Hey! 👋 Willkommen! Frag mich alles über das Praktikum bei Mercedes-Benz in Stuttgart!',
            'Hi! 😄 Schön, dass du da bist! Ich kann dir alles über Laras Praktikum erzählen – frag einfach drauf los!'
        ]
    },
    // Wann war das Praktikum?
    wann: {
        patterns: ['wann', 'datum', 'zeitraum', 'wie lange', 'dauer', 'wochen', 'tage'],
        responses: [
            'Das Praktikum war vom 9. März bis 20. März 2026 – also genau zwei spannende Wochen! 📅',
            'Zwei Wochen lang, vom 9. bis 20. März 2026! In dieser Zeit hat Lara richtig viel erlebt. 📅'
        ]
    },
    // Wo war das Praktikum?
    wo: {
        patterns: ['wo ', 'ort', 'stadt', 'standort', 'adresse', 'stuttgart'],
        responses: [
            'Das Praktikum fand bei Mercedes-Benz in Stuttgart statt – in der IT-Abteilung! 📍 Stuttgart ist das Herz von Mercedes-Benz.',
            'In Stuttgart! 📍 Lara war in der IT-Abteilung bei Mercedes-Benz. Stuttgart ist der Hauptsitz des Unternehmens und ein super spannender Ort!'
        ]
    },
    // Was wurde gemacht?
    was: {
        patterns: ['was gemacht', 'was hast', 'was hat', 'aufgaben', 'tätigkeiten', 'was macht man', 'was lernt', 'was gelernt', 'gelernt'],
        responses: [
            'Lara war in der IT-Abteilung und hat sich viel mit Künstlicher Intelligenz beschäftigt. Sie hat gelernt, wie KI bei Mercedes-Benz eingesetzt wird, war bei Meetings dabei und hat sogar selbst eine kleine KI programmiert! 🤖',
            'Lara hat Meetings besucht, den Unterschied zwischen Sprachmodellen und KI-Agenten gelernt, eine eigene KI programmiert, einen Vortrag gehalten und sogar diese Website hier gebaut! 💻',
            'Jede Menge! Von KI-Programmierung über Werksbesichtigungen bis hin zum Bau dieser Website. Lara hat auch einen Vortrag gehalten und an echten IT-Meetings teilgenommen! 🚀'
        ]
    },
    // Website
    website: {
        patterns: ['website', 'webseite', 'seite', 'homepage', 'html', 'css', 'programmier', 'coden', 'code'],
        responses: [
            'Diese Website hier hat Lara am vorletzten Tag selbst gebaut! 💻 Sie hat HTML für die Struktur und CSS für das Design benutzt. Außerdem hat sie passend zum Thema eine eigene KI entwickelt – nämlich mich! 🤖',
            'Lara hat diese Website als Abschlussprojekt ihres Praktikums erstellt. Mit HTML und CSS hat sie alles von Grund auf gecodet. Das Ganze hat zwei Tage gedauert – ganz schön beeindruckend! ✨',
            'Fun Fact: Ich bin Teil dieser Website! 😄 Lara hat mich als KI-Chatbot entwickelt, als sie die Seite mit HTML und CSS gebaut hat. Das war quasi ihre Abschlussprüfung!'
        ]
    },
    // Highlight / Lieblingstag
    highlight: {
        patterns: ['highlight', 'lieblings', 'bester tag', 'bestes', 'favorit', 'am besten', 'am meisten'],
        responses: [
            'Laras persönliches Highlight war der Dienstag in der ersten Woche! 🌟 Da war sie zusammen mit Aleks Wiedak und Thomas Kastle unterwegs. Der Tag war super abwechslungsreich und genau das, wofür sie sich interessiert!',
            'Der beste Tag? Definitiv der Dienstag in Woche 1! 🌟 Lara war mit Aleks Wiedak und Thomas Kastle unterwegs und hat genau die Dinge gemacht, die sie am meisten begeistern!'
        ]
    },
    // Werk / Fabrik
    werk: {
        patterns: ['werk', 'fabrik', 'produktion', 'untertürkheim', 'herstell', 'fertigung', 'gabelstapler', 'vr'],
        responses: [
            'Lara war im Werk Untertürkheim und hat live gesehen, wie Autos hergestellt werden! 🏭 Es gab auch einen Gabelstapler-Simulator und eine VR-Brille, mit der man Gefahren am Arbeitsplatz erkennen konnte.',
            'Das Werk Untertürkheim war mega spannend! 🏭 Lara hat die komplette Autoproduktion gesehen, einen Gabelstapler-Simulator ausprobiert und mit einer VR-Brille Sicherheitsgefahren erkannt.'
        ]
    },
    // Ola Källenius
    ola: {
        patterns: ['ola', 'källenius', 'kaellenius', 'vorstand', 'chef', 'boss', 'ceo'],
        responses: [
            'Lara hat tatsächlich kurz Ola Källenius getroffen – den Vorstandsvorsitzenden von Mercedes-Benz! 😲 Das war beim Besuch im Werk Untertürkheim. Eine richtig besondere Erfahrung!',
            'Ja, wirklich! 😲 Lara durfte kurz beim Vorstand vorbeischauen und hat sogar ein paar Worte mit Ola Källenius gewechselt – dem CEO von Mercedes-Benz! Wie cool ist das bitte?!'
        ]
    },
    // Mercedes allgemein
    mercedes: {
        patterns: ['mercedes', 'auto', 'autos', 'fahrzeug', 'marke', 'benz', 'stern', 'daimler'],
        responses: [
            'Mercedes-Benz wurde 1926 gegründet und ist einer der bekanntesten Automobilhersteller der Welt! 🚗 Carl Benz hat 1886 das erste Automobil erfunden. 2025 hat das Unternehmen 2,2 Millionen Fahrzeuge verkauft und einen Umsatz von 132,2 Milliarden Euro erzielt!',
            'Mercedes-Benz steht für Luxus, Qualität und Innovation. 🌟 Wusstest du, dass 2026 ein besonderes Jahr ist? Mercedes feiert 140 Jahre Innovation – seit Carl Benz 1886 das Motorpatent angemeldet hat!',
            'Mercedes-Benz hat weltweit rund 164.000 Mitarbeiter und verkauft in über 100 Ländern! 🚗 Das Unternehmen investiert bis 2026 über 60 Milliarden Euro in Elektromobilität und Software. Richtig beeindruckend!'
        ]
    },
    // Elektromobilität
    elektro: {
        patterns: ['elektro', 'elektrisch', 'eqs', 'eqa', 'eqb', 'eqe', 'ev', 'batterie', 'laden', 'e-auto', 'cla'],
        responses: [
            'Mercedes-Benz setzt voll auf Elektromobilität! ⚡ 2025 stieg der Verkauf von E-Autos um 18% im letzten Quartal. Der neue elektrische CLA wurde sogar zum "Auto des Jahres 2026" in Europa gewählt!',
            'Spannend: Mercedes investiert über 60 Milliarden Euro in die Umstellung auf vollelektrische Mobilität! ⚡ Auch bei den Transportern stieg der E-Absatz 2025 um ganze 46%. Die Zukunft ist elektrisch!',
            'Der neue elektrische CLA ist ein echter Star! ⚡ Außerdem plant Mercedes bis 2026 mehr als 40 neue Modelle. Auch der vollelektrische VLE wird eine neue Ära bei Mercedes-Benz Vans einleiten.'
        ]
    },
    // Autonomes Fahren
    autonom: {
        patterns: ['autonom', 'selbstfahrend', 'drive pilot', 'level 3', 'level 4', 'selbst fahr', 'ohne fahrer'],
        responses: [
            'Mercedes-Benz ist Vorreiter beim autonomen Fahren! 🚘 Mit DRIVE PILOT hat Mercedes als erster Hersteller weltweit ein Level-3-System auf die Straße gebracht – das Auto fährt sich selbst mit bis zu 95 km/h auf der Autobahn!',
            'Krass: Beim Level-3-System DRIVE PILOT darf der Fahrer während der Fahrt sogar TV schauen, Zeitung lesen oder arbeiten! 🚘 Über 35 Sensoren, darunter LiDAR, Kameras und Radar, machen das möglich. Mercedes hat sogar spezielle türkise Lichter entwickelt, die anzeigen, wenn das Auto autonom fährt!',
            'Mercedes arbeitet bereits an Level 4 – also komplett fahrerlosem Fahren! 🚘 Das neue MB.OS-Betriebssystem mit Nvidia-Prozessoren wird die Grundlage für noch bessere autonome Systeme bilden.'
        ]
    },
    // KI
    ki: {
        patterns: ['ki', 'künstliche intelligenz', 'artificial intelligence', 'ai', 'intelligent', 'chatbot', 'bot', 'roboter'],
        responses: [
            'KI war DAS große Thema im Praktikum! 🤖 Lara hat den Unterschied zwischen Sprachmodellen und KI-Agenten gelernt, selbst eine KI programmiert und sogar mich – diesen Chatbot – entwickelt!',
            'Mercedes-Benz setzt KI überall ein: vom MBUX-Sprachassistenten mit generativer KI über autonomes Fahren bis zur Produktion. 🤖 Lara hat in der IT-Abteilung live gesehen, wie daran gearbeitet wird!',
            'Fun Fact: Ich bin die KI, die Lara im Praktikum gebaut hat! 😄 Übrigens: Mercedes hat 2026 einen neuen KI-gestützten Sprachassistenten im MBUX Superscreen eingeführt – powered by generative AI!',
            'KI bei Mercedes ist riesig! 🤖 Von der intelligenten Sprachsteuerung im MBUX bis zum autonomen DRIVE PILOT mit über 35 Sensoren. Lara hat im Praktikum gelernt, wie das alles zusammenhängt.'
        ]
    },
    // MBUX / Technik
    mbux: {
        patterns: ['mbux', 'infotainment', 'bildschirm', 'display', 'touchscreen', 'mb.os', 'software', 'betriebssystem'],
        responses: [
            'Das neue MBUX Superscreen ist der Wahnsinn! 🖥️ Es besteht aus drei Displays: einem 12,3-Zoll-Instrumenten-Display, einem 14,4-Zoll-Touchscreen in der Mitte und einem 12,3-Zoll-Display für den Beifahrer. Alles läuft auf dem neuen MB.OS mit Nvidia-Prozessoren!',
            'Mercedes hat 2026 das neue MB.OS eingeführt – ein komplett neues Betriebssystem, das das bisherige MBUX ablöst! 🖥️ Es hat einen generativen KI-Sprachassistenten und basiert auf neuesten Nvidia-Chips.'
        ]
    },
    // Museum
    museum: {
        patterns: ['museum', 'ausstellung', 'besuchen'],
        responses: [
            'Das Mercedes-Benz Museum in Stuttgart ist mega beeindruckend! 🏛️ Es wurde vom Architekten Ben van Berkel entworfen und hat eine einzigartige Kleeblatt-Form, die an eine DNA-Doppelhelix erinnert. Auf 17.000 m² Fläche über 9 Etagen stehen 160 Fahrzeuge und über 1.500 Exponate!',
            'Das Museum wurde 2006 eröffnet und hat seitdem über 9 Millionen Besucher aus über 190 Nationen empfangen! 🏛️ Man kann dort alles sehen – vom allerersten Auto der Welt (Benz Patent-Motorwagen von 1886) bis zu den neuesten E-Modellen.',
            'Fun Fact zum Museum: 🏛️ Das Gebäude hat KEINE geraden Wände oder ebenen Böden – alles ist geschwungen! Bei Feuer wird ein Tornado erzeugt, der dem Feuer den Sauerstoff entzieht, damit die wertvollen Autos geschützt bleiben. Das Museum ist 47,5 Meter hoch!'
        ]
    },
    // Nachhaltigkeit
    nachhaltigkeit: {
        patterns: ['nachhaltig', 'umwelt', 'klima', 'grün', 'co2', 'windkraft', 'solar', 'ökologisch'],
        responses: [
            'Mercedes-Benz setzt stark auf Nachhaltigkeit! 🌱 Bis 2027 werden am Testgelände in Papenburg 20 Windkraftanlagen mit 140 Megawatt Leistung errichtet – die sollen rund 20% des Strombedarfs in Deutschland decken!',
            'Nachhaltigkeit ist für Mercedes super wichtig! 🌱 Neben der Elektrifizierung der Fahrzeugflotte wird auch die Produktion immer grüner. Das Unternehmen investiert Milliarden in erneuerbare Energien und nachhaltige Materialien.'
        ]
    },
    // Umsatz / Zahlen
    zahlen: {
        patterns: ['umsatz', 'gewinn', 'milliard', 'million', 'geld', 'verdien', 'ebit', 'aktie', 'börse'],
        responses: [
            'Mercedes-Benz in Zahlen (2025): 💰 132,2 Milliarden Euro Umsatz, 5,8 Milliarden Euro EBIT und 2,2 Millionen verkaufte Fahrzeuge! Die Nettoliquidität lag bei 32,2 Milliarden Euro.',
            'Beeindruckende Zahlen! 💰 Mercedes-Benz hat 2025 einen Umsatz von 132,2 Mrd. Euro erzielt. Deutschland macht 15,8% des Umsatzes aus, Europa 28%, USA 23,4% und China 12,5%.'
        ]
    },
    // Carl Benz / Geschichte
    geschichte: {
        patterns: ['carl benz', 'geschichte', 'gründer', 'erfinder', 'gegründet', 'patent', '1886', 'erfind', 'bertha', 'historie'],
        responses: [
            'Carl Benz hat 1886 das Motorpatent angemeldet und damit das allererste Automobil der Welt geschaffen! 📜 2026 feiert Mercedes-Benz deshalb 140 Jahre Innovation. Übrigens: Bertha Benz fuhr 1888 die erste Langstreckenfahrt der Geschichte – 106 km von Mannheim nach Pforzheim!',
            '1886 begann alles: Carl Benz meldete sein Patent für den Motorwagen an! 📜 1926 fusionierten die Unternehmen von Carl Benz und Gottlieb Daimler zur Daimler-Benz AG. Seitdem steht der Mercedes-Stern für Innovation und Qualität.'
        ]
    },
    // Produktion / Standorte
    produktion: {
        patterns: ['produktion', 'standort', 'sindelfingen', 'rastatt', 'fabrik', 'werk', 'herstell'],
        responses: [
            'Mercedes-Benz produziert weltweit! 🏭 Allein in Deutschland liegt die Kapazität bei 900.000 Fahrzeugen pro Jahr. Dazu kommt Kecskemét in Ungarn mit bis zu 400.000 Einheiten. Insgesamt will Mercedes bis 2028 auf rund 2,2 Millionen Einheiten kommen.',
            'Die wichtigsten Werke sind Sindelfingen, Untertürkheim, Rastatt und Bremen in Deutschland! 🏭 Lara war im Werk Untertürkheim und hat live gesehen, wie die Produktion funktioniert. Bis 2027 sollen die Produktionskosten pro Einheit um 10% sinken.'
        ]
    },
    // Schule
    schule: {
        patterns: ['schule', 'klasse', 'orianienschule'],
        responses: [
            'Lara geht auf die Orianienschule in Wiesbaden und ist in der 9. Klasse. Für das Praktikum ist sie extra nach Stuttgart gereist! 🏫',
            'Lara kommt aus Wiesbaden und besucht die Orianienschule, 9. Klasse. Das Praktikum bei Mercedes-Benz war ihr Schülerpraktikum! 🏫'
        ]
    },
    // Onkel
    onkel: {
        patterns: ['onkel', 'familie', 'verwandt'],
        responses: [
            'Laras Onkel arbeitet bei Mercedes-Benz in der IT-Abteilung in Stuttgart. Durch ihn hat sie die Chance auf dieses tolle Praktikum bekommen! 👨‍💻',
            'Dank ihrem Onkel, der in der IT-Abteilung bei Mercedes-Benz arbeitet, konnte Lara dieses einzigartige Praktikum machen. Familie ist was Tolles! 👨‍💻❤️'
        ]
    },
    // Mitarbeiter / Team
    mitarbeiter: {
        patterns: ['mitarbeiter', 'angestellte', 'beschäftigte', 'wie viele arbeiten', 'team', 'kollegen', 'aleks', 'thomas', 'kastle', 'wiedak'],
        responses: [
            'Mercedes-Benz hat weltweit rund 164.000 Mitarbeiter! 👥 Lara war besonders beeindruckt von der herzlichen Aufnahme im Team. Aleks Wiedak und Thomas Kastle waren an ihrem Lieblingstag dabei!',
            'Das Team war super nett zu Lara! 👥 Besonders Aleks Wiedak und Thomas Kastle haben einen bleibenden Eindruck hinterlassen. Insgesamt hat Mercedes-Benz rund 164.000 Mitarbeiter weltweit!'
        ]
    },
    // Spaß/Gefallen
    spass: {
        patterns: ['spaß', 'spass', 'gefallen', 'toll', 'cool', 'schön', 'erfahrung', 'wie war'],
        responses: [
            'Lara fand das Praktikum super spannend! 🌟 Jeder Tag war anders und individuell, was es besonders aufregend gemacht hat. Eine unvergessliche Erfahrung!',
            'Es war mega! 🌟 Lara sagt, sie war jeden Tag aufs Neue aufgeregt, weil kein Tag wie der andere war. Von KI bis Werksbesichtigung war alles dabei!',
            'Lara blickt sehr dankbar auf die Zeit zurück und kann jedem empfehlen, dort ein Praktikum zu machen! 🌟 Es war abwechslungsreich, spannend und lehrreich.'
        ]
    },
    // Empfehlung / Praktikum machen
    empfehlung: {
        patterns: ['empfehl', 'auch praktikum', 'selbst praktikum', 'lohnt', 'würdest du', 'tipps', 'rat', 'bewerb'],
        responses: [
            'Lara kann es absolut empfehlen! 💯 Wer praxisnahe Erfahrungen sammeln und Teil eines engagierten Teams werden möchte, ist bei Mercedes-Benz genau richtig!',
            'Auf jeden Fall machen! 💯 Lara sagt: Man lernt super viel, die Mitarbeiter sind herzlich und man bekommt echte Einblicke in die Arbeitswelt. Es lohnt sich!'
        ]
    },
    // Vortrag
    vortrag: {
        patterns: ['vortrag', 'präsentation', 'vorgestellt', 'präsentiert'],
        responses: [
            'Lara hat tatsächlich einen eigenen Vortrag gehalten! 🎤 Es ging darum, wie man zeigen kann, dass KI zuverlässig ist. Zusammen mit den Mitarbeitern hat sie Ideen dazu gesammelt.',
            'Ja, Lara durfte sogar einen Vortrag halten! 🎤 Das Thema war die Zuverlässigkeit von KI. Ziemlich beeindruckend für ein Schülerpraktikum!'
        ]
    },
    // Problemfrage
    problemfrage: {
        patterns: ['problemfrage', 'zukunft', 'arbeitsplätze', 'ersetzen', 'ersetzt', 'jobs', 'braucht man noch'],
        responses: [
            'Laras Problemfrage war: „Braucht die Automobilindustrie in Zukunft noch genauso viele Mitarbeiter, wenn immer mehr Aufgaben von KI übernommen werden?" 🤔 Eine super spannende Frage, die sie während des Praktikums untersucht hat!',
            'Eine wichtige Frage! 🤔 Lara hat untersucht, ob KI in Zukunft Arbeitsplätze bei Mercedes-Benz ersetzen wird. Im Praktikum hat sie gesehen, dass KI die Arbeit eher unterstützt als ersetzt.'
        ]
    },
    // Danke
    danke: {
        patterns: ['danke', 'dankeschön', 'vielen dank', 'thx', 'thanks'],
        responses: [
            'Gerne! 😊 Wenn du noch mehr Fragen hast, frag einfach!',
            'Bitteschön! Schau dich gerne weiter auf der Website um! ✨',
            'Kein Problem! 😊 Ich bin hier, wenn du noch was wissen willst!'
        ]
    },
    // Tschüss
    bye: {
        patterns: ['tschüss', 'bye', 'ciao', 'bis dann', 'auf wiedersehen', 'tschau'],
        responses: [
            'Tschüss! 👋 Danke fürs Vorbeischauen! Schau gerne wieder rein!',
            'Bis bald! 😊 Es war schön, mit dir zu chatten!',
            'Ciao! 👋 Ich hoffe, dir hat die Website gefallen. Komm gerne wieder!'
        ]
    },
    // Wer bist du?
    werbistdu: {
        patterns: ['wer bist du', 'was bist du', 'dein name', 'wie heißt du', 'was kannst du'],
        responses: [
            'Ich bin Laras Praktikums-Bot! 🤖 Lara hat mich im Rahmen ihres Praktikums bei Mercedes-Benz selbst programmiert. Du kannst mich alles über ihr Praktikum fragen!',
            'Ich bin eine KI, die Lara während ihres Praktikums entwickelt hat! 🤖 Frag mich über das Praktikum, Mercedes-Benz, KI oder die Website – ich weiß eine Menge!'
        ]
    }
};

// Hilfsfunktion: Einfaches Fuzzy-Matching für Tippfehler
function fuzzyMatch(text, pattern) {
    // Exakter Match
    if (text.includes(pattern)) return true;

    // Für kurze Patterns kein Fuzzy-Matching (zu viele False Positives)
    if (pattern.length < 4) return false;

    // Prüfe ob die Wörter im Text ähnlich genug sind
    const words = text.split(/\s+/);
    for (const word of words) {
        if (levenshtein(word, pattern) <= 1) return true;
        // Auch Teilstrings prüfen für zusammengesetzte Wörter
        if (word.length > pattern.length && word.includes(pattern)) return true;
    }
    return false;
}

// Levenshtein-Distanz für Tippfehler-Erkennung
function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function findResponse(message) {
    const lowerMsg = message.toLowerCase().trim()
        .replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü').replace(/ss/g, 'ß');

    // Suche nach passender Kategorie (exakter Match zuerst)
    for (const category of Object.values(chatResponses)) {
        for (const pattern of category.patterns) {
            if (lowerMsg.includes(pattern)) {
                const responses = category.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Zweiter Durchlauf: Fuzzy-Matching für Tippfehler
    for (const category of Object.values(chatResponses)) {
        for (const pattern of category.patterns) {
            if (fuzzyMatch(lowerMsg, pattern)) {
                const responses = category.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Standard-Antworten wenn nichts passt, mit Vorschlägen
    const defaults = [
        'Gute Frage! 🤔 Darauf habe ich leider keine Antwort. Versuch es mal mit: "Was hat Lara gemacht?", "Was war das Highlight?" oder "Erzähl mir über die Website!"',
        'Hmm, das weiß ich leider nicht. 😊 Frag mich doch zum Beispiel: "Wann war das Praktikum?", "Was ist KI?" oder "Wie war das Werk?"',
        'Darüber kann ich dir leider nicht viel sagen. Aber versuch mal: "Wer bist du?", "Erzähl mir über Mercedes!" oder "Was war der beste Tag?" 🚗'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// Vorgeschlagene Fragen als klickbare Buttons
const suggestedQuestions = [
    'Was hat Lara gemacht?',
    'Was war das Highlight?',
    'Erzähl mir über die Website!',
    'Was ist KI?',
    'Wie war das Werk?',
    'Wer bist du?'
];

function createSuggestions() {
    const chatMessages = document.getElementById('chat-messages');
    const suggestDiv = document.createElement('div');
    suggestDiv.className = 'chat-suggestions';
    suggestDiv.id = 'chat-suggestions';
    suggestedQuestions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = q;
        btn.addEventListener('click', () => {
            document.getElementById('chat-input').value = q;
            sendChat();
            const suggestions = document.getElementById('chat-suggestions');
            if (suggestions) suggestions.remove();
        });
        suggestDiv.appendChild(btn);
    });
    chatMessages.appendChild(suggestDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Vorschläge entfernen wenn vorhanden
    const suggestions = document.getElementById('chat-suggestions');
    if (suggestions) suggestions.remove();

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

    // Bot "tippt" Animation mit drei Punkten
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot-msg';
    typingDiv.innerHTML = `
        <span class="chat-avatar">🤖</span>
        <div class="chat-bubble typing-bubble"><span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span></div>
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
        input.focus();
    }, 800 + Math.random() * 700);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Vorgeschlagene Fragen beim Start anzeigen
setTimeout(createSuggestions, 500);

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

    // Event-Listener statt inline onclick (sicherer gegen XSS)
    document.getElementById('login-btn').addEventListener('click', checkPassword);
    document.getElementById('nav-toggle-btn').addEventListener('click', toggleMenu);
    document.getElementById('quiz-next-btn').addEventListener('click', nextQuestion);
    document.getElementById('quiz-restart-btn').addEventListener('click', restartQuiz);
    document.getElementById('chat-send-btn').addEventListener('click', sendChat);
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChat();
    });
    document.querySelectorAll('.nav-close-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // DevTools-Schutz: Warnung wenn jemand die Konsole öffnet
    const devtoolsWarning = function() {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            if (!isLoggedIn) {
                document.getElementById('login-error').textContent = 'Bitte logge dich zuerst ein.';
            }
        }
    };
    setInterval(devtoolsWarning, 2000);
});
