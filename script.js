const STORAGE_KEY = "estudio_decks_v1";

let decks = loadDecks();

let state = {
    view: "home",
    deckId: null,
    editingCardId: null,
    studyIndex: 0,
    quizIndex: 0,
    quizScore: 0,
    quizQuestions: [],
    importText: "",
    importFileName: "",
    importing: false
};


/* =========================================================
   UTILIDADES
   ========================================================= */

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function normalizeText(text = "") {
    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function cleanSentence(text = "") {
    return text
        .replace(/\s+/g, " ")
        .replace(/^[-•*]\s*/, "")
        .trim();
}

function isUsefulText(text) {
    return text && text.trim().length >= 15;
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadDecks() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveDecks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

function getDeck() {
    return decks.find(deck => deck.id === state.deckId);
}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function goHome() {
    state.view = "home";
    state.deckId = null;
    state.editingCardId = null;
    state.studyIndex = 0;
    state.quizIndex = 0;
    state.quizScore = 0;

    render();
}

function openEditor(deckId = null) {
    state.view = "editor";
    state.deckId = deckId;
    state.editingCardId = null;
    state.importText = "";
    state.importFileName = "";

    render();
}

function openStudy(deckId) {
    const deck = decks.find(d => d.id === deckId);

    if (!deck || !deck.cards.length) {
        showNotification(
            "Este tema todavía no tiene tarjetas.",
            "info"
        );
        return;
    }

    state.view = "study";
    state.deckId = deckId;
    state.studyIndex = 0;

    render();
}

function openQuiz(deckId) {
    const deck = decks.find(d => d.id === deckId);

    if (!deck || deck.cards.length < 2) {
        showNotification(
            "Necesitas al menos 2 tarjetas para comenzar el quiz.",
            "info"
        );
        return;
    }

    state.view = "quiz";
    state.deckId = deckId;
    state.quizIndex = 0;
    state.quizScore = 0;

    state.quizQuestions = createQuizQuestions(deck.cards);

    render();
}


/* =========================================================
   RENDER PRINCIPAL
   ========================================================= */

function render() {
    const app = document.getElementById("app");

    if (!app) return;

    if (state.view === "home") {
        renderHome(app);
    }

    if (state.view === "editor") {
        renderEditor(app);
    }

    if (state.view === "study") {
        renderStudy(app);
    }

    if (state.view === "quiz") {
        renderQuiz(app);
    }

    if (state.view === "results") {
        renderResults(app);
    }

    updateTopbar();
}


/* =========================================================
   TOPBAR
   ========================================================= */

function updateTopbar() {
    const nav = document.getElementById("topbarNav");

    if (!nav) return;

    if (state.view === "home") {
        nav.innerHTML = "";
        return;
    }

    nav.innerHTML = `
        <button class="nav-back" onclick="goHome()">
            ← Inicio
        </button>
    `;
}


/* =========================================================
   HOME
   ========================================================= */

function renderHome(app) {
    app.innerHTML = `
        <section class="hero-section">
            <div class="hero-copy">
                <span class="eyebrow">ESTUDIO</span>

                <h1>
                    Aprende de forma
                    <span>simple.</span>
                </h1>

                <p>
                    Convierte tus documentos en tarjetas de estudio
                    y practica con quizzes automáticamente.
                </p>

                <button class="primary-btn" onclick="openEditor()">
                    + Crear nuevo tema
                </button>
            </div>
        </section>

        <section class="decks-section">
            <div class="section-heading">
                <div>
                    <span class="eyebrow">TU MATERIAL</span>
                    <h2>Mis temas</h2>
                </div>

                <span class="deck-count">
                    ${decks.length}
                    ${decks.length === 1 ? "tema" : "temas"}
                </span>
            </div>

            <div class="deck-grid">
                ${
                    decks.length
                        ? decks.map(renderDeckCard).join("")
                        : renderEmptyState()
                }
            </div>
        </section>
    `;
}

function renderDeckCard(deck) {
    return `
        <article class="deck-card">

            <div class="deck-card-top">

                <div class="deck-icon">
                    ✦
                </div>

                <button
                    class="icon-btn"
                    title="Eliminar"
                    onclick="deleteDeck('${deck.id}')"
                >
                    ⋯
                </button>

            </div>

            <h3>
                ${escapeHtml(deck.title)}
            </h3>

            <p>
                ${deck.cards.length}
                ${deck.cards.length === 1 ? "tarjeta" : "tarjetas"}
            </p>

            <div class="deck-actions">

                <button
                    class="secondary-btn"
                    onclick="openStudy('${deck.id}')"
                >
                    Flashcards
                </button>

                <button
                    class="primary-small-btn"
                    onclick="openQuiz('${deck.id}')"
                >
                    Quiz
                </button>

            </div>

            <button
                class="text-btn"
                onclick="openEditor('${deck.id}')"
            >
                Editar tarjetas →
            </button>

        </article>
    `;
}

function renderEmptyState() {
    return `
        <div class="empty-state">

            <div class="empty-icon">
                ✦
            </div>

            <h3>
                Aún no tienes temas
            </h3>

            <p>
                Importa un PDF o imagen y deja que Estudio
                genere tus tarjetas automáticamente.
            </p>

            <button
                class="primary-btn"
                onclick="openEditor()"
            >
                Crear mi primer tema
            </button>

        </div>
    `;
}


/* =========================================================
   EDITOR
   ========================================================= */

function renderEditor(app) {
    const deck = getDeck();

    if (!deck) {
        renderNewDeckEditor(app);
        return;
    }

    renderExistingDeckEditor(app, deck);
}

function renderNewDeckEditor(app) {
    app.innerHTML = `
        <section class="editor-page">

            <div class="page-heading">

                <span class="eyebrow">
                    NUEVO TEMA
                </span>

                <h1>
                    Crea tu material de estudio
                </h1>

                <p>
                    Puedes importar un documento o crear
                    las tarjetas manualmente.
                </p>

            </div>

            <div class="editor-card">

                <label for="newDeckTitle">
                    Nombre del tema
                </label>

                <input
                    id="newDeckTitle"
                    class="text-input"
                    placeholder="Ej. Historia de El Salvador"
                    maxlength="100"
                />

                <button
                    class="primary-btn full-btn"
                    onclick="createDeckFromEditor()"
                >
                    Continuar
                </button>

            </div>

        </section>
    `;
}

function createDeckFromEditor() {
    const input =
        document.getElementById("newDeckTitle");

    const title =
        input?.value.trim();

    if (!title) {
        showNotification(
            "Escribe un nombre para el tema.",
            "info"
        );
        return;
    }

    const deck = {
        id: uid(),
        title,
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    decks.push(deck);

    saveDecks();

    state.deckId = deck.id;

    render();
}

function renderExistingDeckEditor(app, deck) {
    app.innerHTML = `
        <section class="editor-page">

            <div class="page-heading editor-heading">

                <div>

                    <span class="eyebrow">
                        EDITAR TEMA
                    </span>

                    <h1>
                        ${escapeHtml(deck.title)}
                    </h1>

                    <p>
                        ${deck.cards.length} tarjetas
                    </p>

                </div>

                <button
                    class="secondary-btn"
                    onclick="goHome()"
                >
                    Guardar y salir
                </button>

            </div>

            ${renderImportPanel()}

            <div class="cards-editor-section">

                <div class="section-heading">

                    <div>

                        <span class="eyebrow">
                            TARJETAS
                        </span>

                        <h2>
                            Tu material
                        </h2>

                    </div>

                    <button
                        class="primary-small-btn"
                        onclick="showManualCardForm()"
                    >
                        + Añadir tarjeta
                    </button>

                </div>

                <div id="manualCardContainer"></div>

                <div class="cards-list">

                    ${
                        deck.cards.length
                            ? deck.cards
                                .map(renderEditableCard)
                                .join("")
                            : `
                                <div class="empty-editor">
                                    Todavía no hay tarjetas.
                                    Importa un documento o crea
                                    una manualmente.
                                </div>
                            `
                    }

                </div>

            </div>

        </section>
    `;
}

function renderEditableCard(card, index) {
    return `
        <article class="editable-card">

            <div class="editable-card-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="editable-card-content">

                <strong>
                    ${escapeHtml(card.q)}
                </strong>

                <p>
                    ${escapeHtml(card.a)}
                </p>

            </div>

            <div class="editable-card-actions">

                <button
                    class="icon-btn"
                    onclick="editCard('${card.id}')"
                    title="Editar"
                >
                    ✎
                </button>

                <button
                    class="icon-btn danger"
                    onclick="deleteCard('${card.id}')"
                    title="Eliminar"
                >
                    ×
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   IMPORTACIÓN
   ========================================================= */

function renderImportPanel() {
    return `
        <section class="import-panel">

            <div class="import-header">

                <div>

                    <span class="eyebrow">
                        IMPORTAR
                    </span>

                    <h2>
                        Convierte tus documentos
                        en tarjetas
                    </h2>

                    <p>
                        PDF, PNG o JPG. El procesamiento
                        se realiza directamente
                        en tu navegador.
                    </p>

                </div>

                <div class="import-badge">
                    LOCAL
                </div>

            </div>

            <label
                class="drop-zone"
                id="dropZone"
            >

                <input
                    type="file"
                    id="documentInput"
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                    onchange="handleFileSelect(event)"
                    hidden
                />

                <div class="drop-icon">
                    ↑
                </div>

                <strong>
                    Selecciona tu documento
                </strong>

                <span>
                    PDF · PNG · JPG
                </span>

                <button
                    type="button"
                    class="secondary-btn"
                    onclick="document.getElementById('documentInput').click()"
                >
                    Elegir archivo
                </button>

            </label>

            <div id="importStatus"></div>

            <div
                id="importPreview"
                class="import-preview hidden"
            >

                <div class="preview-heading">

                    <div>

                        <span class="eyebrow">
                            TEXTO EXTRAÍDO
                        </span>

                        <h3>
                            Revisa el contenido
                        </h3>

                    </div>

                    <span id="characterCount"></span>

                </div>

                <textarea
                    id="importTextArea"
                    class="import-textarea"
                    placeholder="Aquí aparecerá el texto..."
                ></textarea>

                <div class="generation-actions">

                    <button
                        class="primary-btn"
                        onclick="generateCardsFromImportedText()"
                    >
                        ✦ Generar tarjetas
                    </button>

                    <button
                        class="secondary-btn"
                        onclick="clearImport()"
                    >
                        Limpiar
                    </button>

                </div>

                <div class="hybrid-note">

                    <span>
                        ◆
                    </span>

                    <div>

                        <strong>
                            Modo híbrido
                        </strong>

                        <p>
                            Las tarjetas se generan localmente.
                            La integración con IA puede añadirse
                            después para mejorar las preguntas.
                        </p>

                    </div>

                </div>

            </div>

        </section>
    `;
}


/* =========================================================
   ARCHIVOS
   ========================================================= */

async function handleFileSelect(event) {
    const file =
        event.target.files?.[0];

    if (!file) return;

    await processFile(file);
}

async function processFile(file) {
    const status =
        document.getElementById("importStatus");

    if (!status) return;

    state.importing = true;

    status.innerHTML = `
        <div class="import-progress">

            <div class="progress-top">

                <strong>
                    Procesando
                    ${escapeHtml(file.name)}
                </strong>

                <span id="progressText">
                    Preparando...
                </span>

            </div>

            <div class="progress-track">

                <div
                    id="progressBar"
                    class="progress-bar"
                    style="width: 5%"
                ></div>

            </div>

        </div>
    `;

    try {

        let text = "";

        if (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
        ) {

            text = await extractPdfText(file);

        } else if (
            file.type.startsWith("image/") ||
            /\.(png|jpg|jpeg)$/i.test(file.name)
        ) {

            text = await extractImageText(file);

        } else {

            throw new Error(
                "Tipo de archivo no compatible."
            );

        }

        text = normalizeText(text);

        if (!isUsefulText(text)) {

            throw new Error(
                "No se pudo encontrar suficiente texto en el documento."
            );

        }

        state.importText = text;
        state.importFileName = file.name;
        state.importing = false;

        showImportedText(text);

    } catch (error) {

        console.error(error);

        state.importing = false;

        status.innerHTML = `
            <div class="import-error">

                <strong>
                    No pudimos leer el archivo
                </strong>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>
        `;
    }
}

async function extractPdfText(file) {

    if (typeof pdfjsLib === "undefined") {

        throw new Error(
            "PDF.js no está disponible."
        );

    }

    updateProgress(
        10,
        "Abriendo PDF..."
    );

    const buffer =
        await file.arrayBuffer();

    const pdf =
        await pdfjsLib
            .getDocument({
                data: buffer
            })
            .promise;

    let pagesText = [];

    for (
        let i = 1;
        i <= pdf.numPages;
        i++
    ) {

        updateProgress(
            10 +
            Math.round(
                (i / pdf.numPages) * 55
            ),
            `Leyendo página ${i} de ${pdf.numPages}...`
        );

        const page =
            await pdf.getPage(i);

        const content =
            await page.getTextContent();

        const pageText =
            content.items
                .map(item => item.str)
                .join(" ");

        pagesText.push(pageText);
    }

    let text =
        pagesText
            .join("\n\n")
            .trim();

    if (text.length < 80) {

        updateProgress(
            70,
            "PDF escaneado detectado. Iniciando OCR..."
        );

        text =
            await ocrPdf(pdf);
    }

    updateProgress(
        95,
        "Finalizando..."
    );

    return text;
}

async function ocrPdf(pdf) {

    if (typeof Tesseract === "undefined") {

        throw new Error(
            "Tesseract.js no está disponible para leer el PDF escaneado."
        );

    }

    let result = [];

    for (
        let i = 1;
        i <= pdf.numPages;
        i++
    ) {

        const page =
            await pdf.getPage(i);

        const viewport =
            page.getViewport({
                scale: 1.5
            });

        const canvas =
            document.createElement("canvas");

        canvas.width =
            viewport.width;

        canvas.height =
            viewport.height;

        const context =
            canvas.getContext("2d");

        await page.render({
            canvasContext: context,
            viewport
        }).promise;

        const ocr =
            await Tesseract.recognize(
                canvas,
                "spa+eng",
                {
                    logger: message => {

                        if (
                            message.status ===
                            "recognizing text"
                        ) {

                            const pageProgress =
                                Math.round(
                                    (message.progress || 0) * 100
                                );

                            updateProgress(
                                70 +
                                Math.round(
                                    pageProgress * 0.2
                                ),
                                `OCR página ${i}...`
                            );
                        }
                    }
                }
            );

        result.push(
            ocr.data.text
        );
    }

    return result.join("\n\n");
}

async function extractImageText(file) {

    if (typeof Tesseract === "undefined") {

        throw new Error(
            "Tesseract.js no está disponible para OCR."
        );

    }

    updateProgress(
        20,
        "Preparando imagen..."
    );

    const result =
        await Tesseract.recognize(
            file,
            "spa+eng",
            {
                logger: message => {

                    if (
                        message.status ===
                        "recognizing text"
                    ) {

                        const percent =
                            Math.round(
                                (message.progress || 0) * 100
                            );

                        updateProgress(
                            20 +
                            Math.round(
                                percent * 0.7
                            ),
                            `Reconociendo texto... ${percent}%`
                        );
                    }
                }
            }
        );

    updateProgress(
        95,
        "Finalizando..."
    );

    return result.data.text;
}

function updateProgress(percent, message) {

    const bar =
        document.getElementById("progressBar");

    const text =
        document.getElementById("progressText");

    if (bar) {

        bar.style.width =
            `${Math.max(
                0,
                Math.min(100, percent)
            )}%`;

    }

    if (text) {
        text.textContent = message;
    }
}

function showImportedText(text) {

    const status =
        document.getElementById("importStatus");

    const preview =
        document.getElementById("importPreview");

    const textarea =
        document.getElementById("importTextArea");

    const count =
        document.getElementById("characterCount");

    if (status) {

        status.innerHTML = `
            <div class="import-success">
                ✓ Documento leído correctamente
            </div>
        `;
    }

    if (preview) {
        preview.classList.remove("hidden");
    }

    if (textarea) {
        textarea.value = text;
    }

    if (count) {

        count.textContent =
            `${text.length.toLocaleString()} caracteres`;
    }
}

function clearImport() {

    state.importText = "";
    state.importFileName = "";

    const input =
        document.getElementById("documentInput");

    const preview =
        document.getElementById("importPreview");

    const status =
        document.getElementById("importStatus");

    if (input) {
        input.value = "";
    }

    if (preview) {
        preview.classList.add("hidden");
    }

    if (status) {
        status.innerHTML = "";
    }
}


/* =========================================================
   GENERACIÓN AUTOMÁTICA DE TARJETAS
   ========================================================= */

function generateCardsFromImportedText() {

    const textarea =
        document.getElementById("importTextArea");

    if (!textarea) return;

    const text =
        normalizeText(textarea.value);

    if (!isUsefulText(text)) {

        showNotification(
            "No hay suficiente texto para generar tarjetas.",
            "info"
        );

        return;
    }

    const deck =
        getDeck();

    if (!deck) return;

    const cards =
        generateLocalCards(text);

    if (!cards.length) {

        showNotification(
            "No pude identificar preguntas y respuestas automáticamente. Puedes crear las tarjetas manualmente.",
            "info"
        );

        return;
    }

    const existingQuestions =
        new Set(
            deck.cards.map(card =>
                card.q.toLowerCase().trim()
            )
        );

    const newCards =
        cards.filter(card => {

            const key =
                card.q.toLowerCase().trim();

            if (
                existingQuestions.has(key)
            ) {
                return false;
            }

            existingQuestions.add(key);

            return true;
        });

    deck.cards.push(...newCards);

    deck.updatedAt =
        Date.now();

    saveDecks();

    state.importText =
        text;

    render();

    setTimeout(() => {

        showNotification(
            `¡Listo! Se generaron ${newCards.length} tarjetas.`,
            "success"
        );

    }, 100);
}


/* =========================================================
   GENERADOR LOCAL
   ========================================================= */

function generateLocalCards(text) {

    const cards = [];

    const lines =
        text
            .split("\n")
            .map(line =>
                cleanSentence(line)
            )
            .filter(Boolean);

    /*
       1. PREGUNTA / RESPUESTA EXPLÍCITA
    */

    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];

        if (
            /^(pregunta|p)\s*:/i.test(line)
        ) {

            const question =
                line
                    .replace(
                        /^(pregunta|p)\s*:/i,
                        ""
                    )
                    .trim();

            const next =
                lines[i + 1];

            if (
                question &&
                next &&
                /^(respuesta|r)\s*:/i.test(next)
            ) {

                const answer =
                    next
                        .replace(
                            /^(respuesta|r)\s*:/i,
                            ""
                        )
                        .trim();

                addGeneratedCard(
                    cards,
                    question,
                    answer
                );

                i++;
            }
        }
    }

    /*
       2. LÍNEAS QUE YA SON PREGUNTAS
    */

    for (
        let i = 0;
        i < lines.length - 1;
        i++
    ) {

        const line =
            lines[i];

        if (
            line.endsWith("?") ||
            line.startsWith("¿")
        ) {

            const answer =
                lines[i + 1];

            if (
                isUsefulText(line) &&
                isUsefulText(answer) &&
                !answer.endsWith("?")
            ) {

                addGeneratedCard(
                    cards,
                    line,
                    answer
                );
            }
        }
    }

    /*
       3. DEFINICIONES
    */

    const definitionRegex =
        /^(.{2,100}?)\s+(es|son|se define como|consiste en|significa|se refiere a)\s+(.{15,500})$/i;

    for (
        const line of lines
    ) {

        const match =
            line.match(
                definitionRegex
            );

        if (!match) continue;

        const subject =
            cleanSentence(
                match[1]
            );

        const answer =
            cleanSentence(
                `${match[2]} ${match[3]}`
            );

        const question =
            `¿Qué es ${removeFinalPunctuation(subject)}?`;

        addGeneratedCard(
            cards,
            question,
            answer
        );
    }

    /*
       4. EVENTOS
    */

    const eventRegex =
        /^(.{2,100}?)\s+(ocurrió|fue|sucedió|comenzó|terminó|nació)\s+(.{10,400})$/i;

    for (
        const line of lines
    ) {

        const match =
            line.match(
                eventRegex
            );

        if (!match) continue;

        const subject =
            cleanSentence(
                match[1]
            );

        const answer =
            cleanSentence(
                `${match[2]} ${match[3]}`
            );

        const question =
            `¿Qué se sabe sobre ${removeFinalPunctuation(subject)}?`;

        addGeneratedCard(
            cards,
            question,
            answer
        );
    }

    /*
       5. TÍTULOS + PÁRRAFOS
    */

    for (
        let i = 0;
        i < lines.length - 1;
        i++
    ) {

        const title =
            lines[i];

        const next =
            lines[i + 1];

        if (
            isLikelyHeading(title) &&
            next.length >= 40
        ) {

            const question =
                `¿Qué información presenta el tema "${removeFinalPunctuation(title)}"?`;

            addGeneratedCard(
                cards,
                question,
                next
            );
        }
    }

    /*
       6. PÁRRAFOS COMO ÚLTIMO RECURSO
    */

    if (cards.length < 3) {

        const paragraphs =
            text
                .split(/\n\s*\n/)
                .map(cleanSentence)
                .filter(
                    p => p.length >= 60
                );

        for (
            const paragraph of paragraphs.slice(0, 20)
        ) {

            const firstSentence =
                paragraph.split(/[.!?]/)[0];

            if (
                firstSentence.length < 10
            ) {
                continue;
            }

            const question =
                `¿Qué información importante se explica sobre "${shorten(firstSentence, 80)}"?`;

            addGeneratedCard(
                cards,
                question,
                paragraph
            );
        }
    }

    return uniqueCards(cards)
        .slice(0, 50);
}

function addGeneratedCard(
    cards,
    question,
    answer
) {

    question =
        cleanQuestion(question);

    answer =
        cleanSentence(answer);

    if (
        question.length < 8 ||
        answer.length < 10
    ) {
        return;
    }

    if (answer.length > 1200) {

        answer =
            answer.slice(0, 1197) +
            "...";
    }

    cards.push({
        id: uid(),
        q: question,
        a: answer
    });
}

function cleanQuestion(question) {

    let result =
        cleanSentence(question);

    if (!result.startsWith("¿")) {
        result = "¿" + result;
    }

    if (!result.endsWith("?")) {
        result += "?";
    }

    return result;
}

function removeFinalPunctuation(text) {
    return text.replace(/[.!?]+$/, "");
}

function shorten(text, max) {

    text =
        cleanSentence(text);

    if (text.length <= max) {
        return text;
    }

    return text.slice(
        0,
        max - 3
    ) + "...";
}

function isLikelyHeading(line) {

    if (
        line.length < 3 ||
        line.length > 100
    ) {
        return false;
    }

    if (
        line.endsWith(".") ||
        line.endsWith("?")
    ) {
        return false;
    }

    const words =
        line.split(/\s+/);

    if (words.length > 12) {
        return false;
    }

    const letters =
        line.replace(
            /[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,
            ""
        );

    if (!letters) return false;

    const uppercase =
        letters.replace(
            /[^A-ZÁÉÍÓÚÑ]/g,
            ""
        ).length;

    return (
        uppercase / letters.length > 0.35
    ) ||
    words.length <= 6;
}

function uniqueCards(cards) {

    const seen =
        new Set();

    return cards.filter(card => {

        const key =
            card.q
                .toLowerCase()
                .replace(/[¿?]/g, "")
                .trim();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);

        return true;
    });
}


/* =========================================================
   TARJETAS MANUALES
   ========================================================= */

function showManualCardForm(card = null) {

    const container =
        document.getElementById(
            "manualCardContainer"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="manual-card-form">

            <div class="form-heading">

                <strong>
                    ${card ? "Editar tarjeta" : "Nueva tarjeta"}
                </strong>

                <button
                    class="icon-btn"
                    onclick="closeManualCardForm()"
                >
                    ×
                </button>

            </div>

            <label>
                Pregunta
            </label>

            <textarea
                id="manualQuestion"
                class="text-input textarea-input"
                placeholder="Ej. ¿Qué es la fotosíntesis?"
            >${card ? escapeHtml(card.q) : ""}</textarea>

            <label>
                Respuesta
            </label>

            <textarea
                id="manualAnswer"
                class="text-input textarea-input"
                placeholder="Escribe la respuesta..."
            >${card ? escapeHtml(card.a) : ""}</textarea>

            <div class="manual-form-actions">

                <button
                    class="secondary-btn"
                    onclick="closeManualCardForm()"
                >
                    Cancelar
                </button>

                <button
                    class="primary-small-btn"
                    onclick="${
                        card
                            ? `saveEditedCard('${card.id}')`
                            : "saveManualCard()"
                    }"
                >
                    Guardar tarjeta
                </button>

            </div>

        </div>
    `;
}

function closeManualCardForm() {

    const container =
        document.getElementById(
            "manualCardContainer"
        );

    if (container) {
        container.innerHTML = "";
    }
}

function saveManualCard() {

    const q =
        document
            .getElementById("manualQuestion")
            ?.value.trim();

    const a =
        document
            .getElementById("manualAnswer")
            ?.value.trim();

    if (!q || !a) {

        showNotification(
            "Completa la pregunta y la respuesta.",
            "info"
        );

        return;
    }

    const deck =
        getDeck();

    if (!deck) return;

    deck.cards.push({
        id: uid(),
        q: cleanQuestion(q),
        a
    });

    deck.updatedAt =
        Date.now();

    saveDecks();

    render();
}

function editCard(cardId) {

    const deck =
        getDeck();

    if (!deck) return;

    const card =
        deck.cards.find(
            c => c.id === cardId
        );

    if (!card) return;

    render();

    showManualCardForm(card);
}

function saveEditedCard(cardId) {

    const deck =
        getDeck();

    if (!deck) return;

    const card =
        deck.cards.find(
            c => c.id === cardId
        );

    if (!card) return;

    const q =
        document
            .getElementById("manualQuestion")
            ?.value.trim();

    const a =
        document
            .getElementById("manualAnswer")
            ?.value.trim();

    if (!q || !a) {

        showNotification(
            "Completa ambos campos.",
            "info"
        );

        return;
    }

    card.q =
        cleanQuestion(q);

    card.a =
        a;

    deck.updatedAt =
        Date.now();

    saveDecks();

    render();
}


/* =========================================================
   ELIMINAR TARJETA
   ========================================================= */

function deleteCard(cardId) {

    const deck =
        getDeck();

    if (!deck) return;

    const card =
        deck.cards.find(
            card => card.id === cardId
        );

    if (!card) return;

    showDeleteModal({
        type: "card",
        id: cardId,
        title: "¿Eliminar esta tarjeta?",
        message:
            "La tarjeta se eliminará de este tema."
    });
}


/* =========================================================
   ELIMINAR TEMA
   ========================================================= */

function deleteDeck(deckId) {

    const deck =
        decks.find(
            d => d.id === deckId
        );

    if (!deck) return;

    showDeleteModal({
        type: "deck",
        id: deckId,
        title: "¿Eliminar este tema?",
        message:
            `"${deck.title}" y todas sus tarjetas serán eliminadas.`
    });
}


/* =========================================================
   MODAL DE CONFIRMACIÓN
   ========================================================= */

function showDeleteModal({
    type,
    id,
    title,
    message
}) {

    const existingModal =
        document.getElementById(
            "deleteModal"
        );

    if (existingModal) {
        existingModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "deleteModal";

    modal.className =
        "delete-modal-overlay";

    modal.innerHTML = `
        <div class="delete-modal">

            <div class="delete-modal-icon">
                ×
            </div>

            <div class="delete-modal-content">

                <span class="eyebrow">
                    CONFIRMAR
                </span>

                <h2>
                    ${escapeHtml(title)}
                </h2>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

            <div class="delete-modal-actions">

                <button
                    class="secondary-btn"
                    onclick="closeDeleteModal()"
                >
                    Cancelar
                </button>

                <button
                    class="danger-btn"
                    onclick="confirmDelete('${type}', '${id}')"
                >
                    Eliminar
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.classList.add("visible");
    });
}

function closeDeleteModal() {

    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (!modal) return;

    modal.classList.remove(
        "visible"
    );

    setTimeout(() => {
        modal.remove();
    }, 200);
}

function confirmDelete(
    type,
    id
) {

    if (type === "deck") {

        decks =
            decks.filter(
                deck => deck.id !== id
            );

        saveDecks();

        closeDeleteModal();

        render();

        return;
    }

    if (type === "card") {

        const deck =
            getDeck();

        if (!deck) {

            closeDeleteModal();

            return;
        }

        deck.cards =
            deck.cards.filter(
                card => card.id !== id
            );

        deck.updatedAt =
            Date.now();

        saveDecks();

        closeDeleteModal();

        render();
    }
}


/* =========================================================
   NOTIFICACIONES
   ========================================================= */

function showNotification(
    message,
    type = "info"
) {

    const existing =
        document.querySelector(
            ".app-notification"
        );

    if (existing) {
        existing.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        `app-notification ${type}`;

    const icon =
        type === "success"
            ? "✓"
            : "i";

    notification.innerHTML = `
        <span class="notification-icon">
            ${icon}
        </span>

        <span class="notification-message">
            ${escapeHtml(message)}
        </span>

        <button
            class="notification-close"
            onclick="this.parentElement.remove()"
            aria-label="Cerrar"
        >
            ×
        </button>
    `;

    document.body.appendChild(
        notification
    );

    requestAnimationFrame(() => {
        notification.classList.add(
            "visible"
        );
    });

    setTimeout(() => {

        if (
            notification &&
            notification.isConnected
        ) {

            notification.classList.remove(
                "visible"
            );

            setTimeout(() => {
                notification.remove();
            }, 250);
        }

    }, 3500);
}


/* =========================================================
   FLASHCARDS
   ========================================================= */

function renderStudy(app) {

    const deck =
        getDeck();

    if (
        !deck ||
        !deck.cards.length
    ) {

        goHome();

        return;
    }

    const card =
        deck.cards[
            state.studyIndex
        ];

    app.innerHTML = `
        <section class="study-page">

            <div class="study-header">

                <div>

                    <span class="eyebrow">
                        FLASHCARDS
                    </span>

                    <h1>
                        ${escapeHtml(deck.title)}
                    </h1>

                </div>

                <div class="study-counter">

                    ${state.studyIndex + 1}

                    <span>
                        /
                    </span>

                    ${deck.cards.length}

                </div>

            </div>

            <div class="flashcard-scene">

                <div
                    class="flashcard"
                    id="flashcard"
                    onclick="flipFlashcard()"
                >

                    <div
                        class="flashcard-face flashcard-front"
                    >

                        <span class="card-label">
                            PREGUNTA
                        </span>

                        <div class="flashcard-content">
                            ${escapeHtml(card.q)}
                        </div>

                        <span class="flip-hint">
                            Haz clic para ver la respuesta
                        </span>

                    </div>

                    <div
                        class="flashcard-face flashcard-back"
                    >

                        <span class="card-label">
                            RESPUESTA
                        </span>

                        <div class="flashcard-content">
                            ${escapeHtml(card.a)}
                        </div>

                        <span class="flip-hint">
                            Haz clic para volver
                        </span>

                    </div>

                </div>

            </div>

            <div class="study-controls">

                <button
                    class="secondary-btn"
                    onclick="previousCard()"
                >
                    ← Anterior
                </button>

                <button
                    class="primary-btn"
                    onclick="nextCard()"
                >
                    Siguiente →
                </button>

            </div>

            <div class="study-footer-actions">

                <button
                    class="text-btn"
                    onclick="openQuiz('${deck.id}')"
                >
                    Terminar flashcards
                    y comenzar quiz →
                </button>

            </div>

        </section>
    `;
}

function flipFlashcard() {

    const card =
        document.getElementById(
            "flashcard"
        );

    if (card) {
        card.classList.toggle(
            "flipped"
        );
    }
}

function nextCard() {

    const deck =
        getDeck();

    if (!deck) return;

    if (
        state.studyIndex <
        deck.cards.length - 1
    ) {

        state.studyIndex++;

        render();
    }
}

function previousCard() {

    if (
        state.studyIndex > 0
    ) {

        state.studyIndex--;

        render();
    }
}


/* =========================================================
   QUIZ
   ========================================================= */

function createQuizQuestions(cards) {

    const shuffledCards =
        shuffle(cards);

    return shuffledCards.map(card => {

        const wrongAnswers =
            shuffle(
                cards.filter(
                    other =>
                        other.id !== card.id
                )
            )
                .map(
                    other => other.a
                )
                .filter(
                    (answer, index, array) =>
                        array.indexOf(answer) === index
                )
                .slice(0, 3);

        const options =
            shuffle([
                card.a,
                ...wrongAnswers
            ]);

        return {
            cardId: card.id,
            question: card.q,
            correctAnswer: card.a,
            options
        };
    });
}

function renderQuiz(app) {

    const deck =
        getDeck();

    if (
        !deck ||
        !state.quizQuestions.length
    ) {

        goHome();

        return;
    }

    const current =
        state.quizQuestions[
            state.quizIndex
        ];

    const progress =
        (
            state.quizIndex /
            state.quizQuestions.length
        ) * 100;

    app.innerHTML = `
        <section class="quiz-page">

            <div class="quiz-header">

                <div>

                    <span class="eyebrow">
                        QUIZ
                    </span>

                    <h1>
                        ${escapeHtml(deck.title)}
                    </h1>

                </div>

                <div class="quiz-counter">

                    ${state.quizIndex + 1}
                    /
                    ${state.quizQuestions.length}

                </div>

            </div>

            <div class="quiz-progress">

                <div
                    style="width:${progress}%"
                ></div>

            </div>

            <div class="quiz-question-card">

                <span class="card-label">
                    PREGUNTA ${state.quizIndex + 1}
                </span>

                <h2>
                    ${escapeHtml(current.question)}
                </h2>

            </div>

            <div class="quiz-options">

                ${current.options
                    .map(
                        (option, index) => `
                            <button
                                class="quiz-option"
                                onclick="answerQuiz(${index})"
                            >

                                <span
                                    class="option-letter"
                                >
                                    ${String.fromCharCode(
                                        65 + index
                                    )}
                                </span>

                                <span>
                                    ${escapeHtml(option)}
                                </span>

                            </button>
                        `
                    )
                    .join("")}

            </div>

        </section>
    `;
}

function answerQuiz(index) {

    const current =
        state.quizQuestions[
            state.quizIndex
        ];

    if (!current) return;

    const selected =
        current.options[index];

    if (
        selected ===
        current.correctAnswer
    ) {

        state.quizScore++;
    }

    if (
        state.quizIndex <
        state.quizQuestions.length - 1
    ) {

        state.quizIndex++;

        render();

    } else {

        state.view =
            "results";

        render();
    }
}


/* =========================================================
   RESULTADOS
   ========================================================= */

function renderResults(app) {

    const deck =
        getDeck();

    const total =
        state.quizQuestions.length;

    const percentage =
        total
            ? Math.round(
                (state.quizScore / total) * 100
            )
            : 0;

    let message = "";

    if (percentage >= 90) {

        message =
            "Excelente trabajo.";

    } else if (percentage >= 70) {

        message =
            "Muy buen resultado.";

    } else if (percentage >= 50) {

        message =
            "Vas por buen camino.";

    } else {

        message =
            "Sigue practicando.";
    }

    app.innerHTML = `
        <section class="results-page">

            <span class="eyebrow">
                RESULTADO
            </span>

            <h1>
                ${message}
            </h1>

            <p>
                Has terminado el quiz de
                <strong>
                    ${escapeHtml(deck?.title || "")}
                </strong>.
            </p>

            <div
                class="result-ring"
                style="--percentage:${percentage}%"
            >

                <div>

                    <strong>
                        ${percentage}%
                    </strong>

                    <span>
                        resultado
                    </span>

                </div>

            </div>

            <div class="result-summary">

                <div>

                    <strong>
                        ${state.quizScore}
                    </strong>

                    <span>
                        Correctas
                    </span>

                </div>

                <div>

                    <strong>
                        ${total - state.quizScore}
                    </strong>

                    <span>
                        Incorrectas
                    </span>

                </div>

                <div>

                    <strong>
                        ${total}
                    </strong>

                    <span>
                        Total
                    </span>

                </div>

            </div>

            <div class="results-actions">

                <button
                    class="secondary-btn"
                    onclick="openStudy('${deck.id}')"
                >
                    Repasar flashcards
                </button>

                <button
                    class="primary-btn"
                    onclick="openQuiz('${deck.id}')"
                >
                    Repetir quiz
                </button>

            </div>

            <button
                class="text-btn"
                onclick="goHome()"
            >
                Volver a mis temas
            </button>

        </section>
    `;
}


/* =========================================================
   TECLADO
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            state.view !== "study"
        ) {
            return;
        }

        if (
            event.key === "ArrowRight"
        ) {

            nextCard();
        }

        if (
            event.key === "ArrowLeft"
        ) {

            previousCard();
        }

        if (
            event.key === " "
        ) {

            event.preventDefault();

            flipFlashcard();
        }
    }
);


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        render();

        const logo =
            document.querySelector(
                ".brand"
            );

        if (logo) {
            logo.addEventListener(
                "click",
                goHome
            );
        }
    }
);