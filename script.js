// ===================================
// Global Variables & State Management
// ===================================

let questions = []; // Array to store all quiz questions
let currentQuestionIndex = 0; // Track current question (0-based index)
let score = 0; // Track user's score (calculated after submission)
let userAnswers = []; // Store user's selected answers for each question
let quizSubmitted = false; // Track if quiz has been submitted
let reviewMode = false; // Track if in review all questions mode

// ===================================
// DOM Elements
// ===================================

const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackMessage = document.getElementById('feedbackMessage');
const scoreDisplay = document.getElementById('scoreDisplay');
const totalQuestions = document.getElementById('totalQuestions');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const logoutBtn = document.getElementById('logoutBtn');
const quizSection = document.getElementById('quizSection');
const resultsSection = document.getElementById('resultsSection');
const finalScore = document.getElementById('finalScore');
const resultMessage = document.getElementById('resultMessage');
const restartBtn = document.getElementById('restartBtn');
const viewReviewBtn = document.getElementById('viewReviewBtn');
const reviewSection = document.getElementById('reviewSection');
const reviewContainer = document.getElementById('reviewContainer');

// ===================================
// LocalStorage Utilities
// ===================================

/**
 * Save quiz result to history
 */
function saveQuizResult(score, totalQuestions, userAnswers) {
    const username = localStorage.getItem('quizUsername') || 'Guest';
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');

    const result = {
        id: Date.now().toString(),
        username: username,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        score: score,
        total: totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        answers: userAnswers
    };

    quizHistory.push(result);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

    return result;
}

/**
 * Get quiz history
 */
function getQuizHistory() {
    return JSON.parse(localStorage.getItem('quizHistory') || '[]');
}

/**
 * Clear quiz history
 */
function clearQuizHistory() {
    localStorage.removeItem('quizHistory');
}

/**
 * Delete specific quiz result
 */
function deleteQuizResult(id) {
    const history = getQuizHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem('quizHistory', JSON.stringify(filtered));
}

/**
 * Save quiz progress (auto-save)
 */
function saveProgress() {
    if (quizSubmitted) return; // Don't save if quiz is already submitted

    const progress = {
        currentQuestionIndex: currentQuestionIndex,
        userAnswers: userAnswers,
        startTime: new Date().toISOString(),
        questionsTotal: questions.length
    };

    localStorage.setItem('quizProgress', JSON.stringify(progress));
}

/**
 * Load saved progress
 */
function loadProgress() {
    const saved = localStorage.getItem('quizProgress');
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Error loading progress:', e);
        return null;
    }
}

/**
 * Clear saved progress
 */
function clearProgress() {
    localStorage.removeItem('quizProgress');
}

/**
 * Check if there's saved progress
 */
function hasSavedProgress() {
    return localStorage.getItem('quizProgress') !== null;
}

/**
 * Update statistics
 */
function updateStatistics(score, totalQuestions, userAnswers) {
    const stats = getStatistics();

    // Update totals
    stats.totalQuizzes++;
    stats.totalQuestionsAnswered += totalQuestions;
    stats.totalCorrect += score;
    stats.totalIncorrect += (totalQuestions - score);

    // Update best and worst scores
    if (score > stats.bestScore || stats.bestScore === 0) {
        stats.bestScore = score;
    }
    if (score < stats.worstScore || stats.worstScore === 0 || stats.totalQuizzes === 1) {
        stats.worstScore = score;
    }

    // Calculate average
    stats.averageScore = parseFloat((stats.totalCorrect / stats.totalQuestionsAnswered * questions.length).toFixed(2));

    // Track performance per question
    questions.forEach((question, index) => {
        if (!stats.questionPerformance[index]) {
            stats.questionPerformance[index] = { correct: 0, incorrect: 0, total: 0 };
        }

        stats.questionPerformance[index].total++;

        if (userAnswers[index] === question.correct) {
            stats.questionPerformance[index].correct++;
        } else {
            stats.questionPerformance[index].incorrect++;
        }
    });

    stats.lastUpdated = new Date().toISOString();
    localStorage.setItem('quizStats', JSON.stringify(stats));
}

/**
 * Get statistics
 */
function getStatistics() {
    const defaultStats = {
        totalQuizzes: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        questionPerformance: {},
        lastUpdated: null
    };

    const saved = localStorage.getItem('quizStats');
    if (!saved) return defaultStats;

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Error loading statistics:', e);
        return defaultStats;
    }
}

/**
 * Clear statistics
 */
function clearStatistics() {
    localStorage.removeItem('quizStats');
}

/**
 * Save user preferences
 */
function savePreferences(prefs) {
    const preferences = {
        ...getPreferences(),
        ...prefs,
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    applyPreferences(preferences);
}

/**
 * Get user preferences
 */
function getPreferences() {
    const defaultPrefs = {
        theme: 'light',
        soundEnabled: false,
        autoAdvance: false,
        showTimer: false,
        lastUpdated: null
    };

    const saved = localStorage.getItem('userPreferences');
    if (!saved) return defaultPrefs;

    try {
        return { ...defaultPrefs, ...JSON.parse(saved) };
    } catch (e) {
        console.error('Error loading preferences:', e);
        return defaultPrefs;
    }
}

/**
 * Apply preferences to UI
 */
function applyPreferences(prefs) {
    // Apply theme
    if (prefs.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Other preferences can be applied as needed
}

/**
 * Reset preferences to default
 */
function resetPreferences() {
    localStorage.removeItem('userPreferences');
    applyPreferences(getPreferences());
}

// ===================================
// Authentication Check
// ===================================

/**
 * Check if user is logged in by verifying localStorage
 * Redirect to login page if not authenticated
 */
function checkAuth() {
    const username = localStorage.getItem('quizUsername');

    if (!username) {
        // User not logged in, redirect to login page
        alert('Please login first to access the quiz');
        window.location.href = 'login.html';
    }
}

// ===================================
// Load Questions (Embedded)
// ===================================

/**
 * Load questions from embedded array (no server required)
 * Initialize quiz after successful load
 */
function loadQuestions() {
    try {
        // Questions embedded directly in JavaScript to work without server
        questions = [
            {
                "question": "What does HTML stand for?",
                "options": [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Home Tool Markup Language",
                    "Hyperlinks and Text Markup Language"
                ],
                "correct": 0
            },
            {
                "question": "Which CSS property is used to change the text color?",
                "options": [
                    "text-color",
                    "font-color",
                    "color",
                    "text-style"
                ],
                "correct": 2
            },
            {
                "question": "What is the correct syntax for referring to an external JavaScript file?",
                "options": [
                    "<script href='file.js'>",
                    "<script name='file.js'>",
                    "<script src='file.js'>",
                    "<script file='file.js'>"
                ],
                "correct": 2
            },
            {
                "question": "Which HTML tag is used to define an internal style sheet?",
                "options": [
                    "<css>",
                    "<script>",
                    "<style>",
                    "<link>"
                ],
                "correct": 2
            },
            {
                "question": "What does CSS stand for?",
                "options": [
                    "Computer Style Sheets",
                    "Cascading Style Sheets",
                    "Creative Style Sheets",
                    "Colorful Style Sheets"
                ],
                "correct": 1
            },
            {
                "question": "Which JavaScript method is used to select an element by its ID?",
                "options": [
                    "getElement()",
                    "getElementById()",
                    "selectElement()",
                    "querySelector()"
                ],
                "correct": 1
            },
            {
                "question": "What is the correct HTML element for inserting a line break?",
                "options": [
                    "<break>",
                    "<lb>",
                    "<br>",
                    "<newline>"
                ],
                "correct": 2
            },
            {
                "question": "Which property is used in CSS to change the background color?",
                "options": [
                    "bgcolor",
                    "background-color",
                    "color-background",
                    "bg-color"
                ],
                "correct": 1
            },
            {
                "question": "How do you declare a JavaScript variable?",
                "options": [
                    "variable name",
                    "var name",
                    "v name",
                    "declare name"
                ],
                "correct": 1
            },
            {
                "question": "Which HTML attribute specifies an alternate text for an image?",
                "options": [
                    "title",
                    "alt",
                    "src",
                    "longdesc"
                ],
                "correct": 1
            }
        ];

        totalQuestions.textContent = questions.length;

        // Initialize user answers array with null values
        userAnswers = new Array(questions.length).fill(null);

        // Apply saved preferences
        applyPreferences(getPreferences());

        // Check for saved progress
        const savedProgress = loadProgress();
        if (savedProgress && savedProgress.questionsTotal === questions.length) {
            const resume = confirm(
                '🔄 You have a saved quiz in progress. Would you like to resume where you left off?'
            );

            if (resume) {
                currentQuestionIndex = savedProgress.currentQuestionIndex;
                userAnswers = savedProgress.userAnswers;
            } else {
                clearProgress();
            }
        }

        // Render first question (or current if resumed)
        renderQuestion();

    } catch (error) {
        console.error('Error loading questions:', error);
        questionText.textContent = 'Error loading quiz. Please refresh the page.';
    }
}

// ===================================
// Render Current Question
// ===================================

/**
 * Display the current question and its options
 * Update UI elements based on current state
 */
function renderQuestion() {
    // Get current question object
    const question = questions[currentQuestionIndex];

    // Update question number and text
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionText.textContent = question.question;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Hide feedback message when not submitted
    if (!quizSubmitted) {
        feedbackMessage.classList.remove('show', 'correct', 'incorrect');
    }

    // Create option buttons dynamically
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.setAttribute('data-index', index);

        // If quiz already submitted, show correct/incorrect styling
        if (quizSubmitted) {
            button.disabled = true;

            // Highlight the user's selected answer
            if (index === userAnswers[currentQuestionIndex]) {
                button.classList.add('selected');

                // Show correct or incorrect styling
                if (index === question.correct) {
                    button.classList.add('correct');
                } else {
                    button.classList.add('incorrect');
                }
            }

            // Always highlight the correct answer
            if (index === question.correct) {
                button.classList.add('correct');
            }
        } else {
            // Quiz not submitted - allow selection and editing

            // Highlight previously selected answer (if any)
            if (index === userAnswers[currentQuestionIndex]) {
                button.classList.add('selected');
            }

            // Add click event for selection
            button.addEventListener('click', () => selectOption(index));
        }

        optionsContainer.appendChild(button);
    });

    // Update navigation buttons state
    updateNavigationButtons();

    // Show feedback if submitted
    if (quizSubmitted) {
        showSubmittedFeedback();
    }
}

// ===================================
// Handle Option Selection
// ===================================

/**
 * Handle user selecting an answer option
 * @param {number} selectedIndex - Index of selected option (0-3)
 */
function selectOption(selectedIndex) {
    // Store user's answer (allow changing answer)
    userAnswers[currentQuestionIndex] = selectedIndex;

    // Update visual selection
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, idx) => {
        if (idx === selectedIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    // Auto-save progress after each answer
    saveProgress();

    // NO immediate feedback - user can change their answer
}

// ===================================
// Show Feedback After Submission
// ===================================

/**
 * Display feedback message after quiz submission
 */
function showSubmittedFeedback() {
    const question = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];

    if (userAnswer === null) {
        feedbackMessage.textContent = 'Not answered';
        feedbackMessage.className = 'feedback-message show incorrect';
    } else if (userAnswer === question.correct) {
        feedbackMessage.textContent = '✓ Correct!';
        feedbackMessage.className = 'feedback-message show correct';
    } else {
        feedbackMessage.textContent = `✗ Incorrect! Correct answer: ${question.options[question.correct]}`;
        feedbackMessage.className = 'feedback-message show incorrect';
    }
}

// ===================================
// Navigation Functions
// ===================================

/**
 * Navigate to next question or show review
 */
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        // Last question - show review page
        if (!quizSubmitted) {
            showReviewAllQuestions();
        }
    }
}

/**
 * Navigate to previous question
 */
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

/**
 * Update the state of navigation buttons
 */
function updateNavigationButtons() {
    // Disable Previous button on first question (not in review mode)
    if (!reviewMode) {
        prevBtn.disabled = currentQuestionIndex === 0;
    }

    // Change Next button text based on state
    if (reviewMode) {
        // In review mode, hide navigation buttons
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else if (quizSubmitted) {
        // After submission, just navigate
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Next ➡';
        }
    } else {
        // Before submission
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.textContent = 'Review All Questions';
        } else {
            nextBtn.textContent = 'Next ➡';
        }
    }
}

// ===================================
// Review All Questions
// ===================================

/**
 * Show all questions on one page for review before submission
 */
function showReviewAllQuestions() {
    reviewMode = true;

    // Clear the options container and use it for review
    questionNumber.textContent = 'Review All Your Answers';
    questionText.textContent = 'Check all your answers below. Click on any question to edit your answer.';

    optionsContainer.innerHTML = '';

    // Create review container with all questions
    const reviewAllContainer = document.createElement('div');
    reviewAllContainer.style.cssText = 'margin: 2rem 0;';

    questions.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'review-item';
        questionCard.style.cssText = `
      background: white;
      border: 2px solid ${userAnswers[index] !== null ? '#10B981' : '#E5E7EB'};
      border-radius: 0.75rem;
      padding: 1rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

        questionCard.onmouseover = () => {
            questionCard.style.borderColor = '#4F46E5';
            questionCard.style.transform = 'translateX(4px)';
        };
        questionCard.onmouseout = () => {
            questionCard.style.borderColor = userAnswers[index] !== null ? '#10B981' : '#E5E7EB';
            questionCard.style.transform = 'translateX(0)';
        };

        questionCard.onclick = () => {
            reviewMode = false;
            currentQuestionIndex = index;
            renderQuestion();
        };

        const questionHeader = document.createElement('div');
        questionHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;';

        const questionTitle = document.createElement('div');
        questionTitle.innerHTML = `
      <div style="color: #6B7280; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
        QUESTION ${index + 1}
      </div>
      <div style="color: #1F2937; font-weight: 600; font-size: 1rem;">
        ${question.question}
      </div>
    `;

        const statusBadge = document.createElement('div');
        if (userAnswers[index] !== null) {
            statusBadge.innerHTML = '<span style="background: #D1FAE5; color: #10B981; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">✓ Answered</span>';
        } else {
            statusBadge.innerHTML = '<span style="background: #FEE2E2; color: #EF4444; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">⚠ Not Answered</span>';
        }

        questionHeader.appendChild(questionTitle);
        questionHeader.appendChild(statusBadge);
        questionCard.appendChild(questionHeader);

        if (userAnswers[index] !== null) {
            const selectedAnswer = document.createElement('div');
            selectedAnswer.style.cssText = 'background: #EFF6FF; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.5rem; border-left: 3px solid #3B82F6;';
            selectedAnswer.innerHTML = `
        <div style="color: #6B7280; font-size: 0.85rem; margin-bottom: 0.25rem;">Your Answer:</div>
        <div style="color: #1F2937; font-weight: 500;">${question.options[userAnswers[index]]}</div>
      `;
            questionCard.appendChild(selectedAnswer);
        }

        reviewAllContainer.appendChild(questionCard);
    });

    optionsContainer.appendChild(reviewAllContainer);

    // Hide feedback message
    feedbackMessage.classList.remove('show');

    // Create submit button
    const submitButtonContainer = document.createElement('div');
    submitButtonContainer.style.cssText = 'margin-top: 2rem; text-align: center;';

    const unanswered = userAnswers.filter(answer => answer === null).length;

    if (unanswered > 0) {
        const warningMessage = document.createElement('div');
        warningMessage.style.cssText = 'background: #FEF2F2; border: 2px solid #EF4444; color: #EF4444; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; font-weight: 600;';
        warningMessage.textContent = `⚠️ Warning: You have ${unanswered} unanswered question(s). Click on them above to answer.`;
        submitButtonContainer.appendChild(warningMessage);
    }

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.cssText = 'font-size: 1.1rem; padding: 1rem 3rem;';
    submitBtn.textContent = unanswered > 0 ? '⚠️ Submit Anyway' : '✓ Submit Final Answers';
    submitBtn.onclick = submitQuiz;

    submitButtonContainer.appendChild(submitBtn);
    optionsContainer.appendChild(submitButtonContainer);

    // Update navigation buttons
    updateNavigationButtons();
}

// ===================================
// Submit Quiz
// ===================================

/**
 * Submit the quiz and calculate score
 */
function submitQuiz() {
    // Calculate score
    score = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            score++;
        }
    });

    // Mark quiz as submitted
    quizSubmitted = true;
    reviewMode = false;

    // Update score display
    scoreDisplay.textContent = score;

    // Save quiz result to history
    saveQuizResult(score, questions.length, userAnswers);

    // Update statistics
    updateStatistics(score, questions.length, userAnswers);

    // Clear saved progress (quiz is complete)
    clearProgress();

    // Show results
    showResults();
}

// ===================================
// Show Results
// ===================================

/**
 * Display final score and answer review
 */
function showResults() {
    // Hide quiz section
    quizSection.classList.add('hidden');

    // Show results section
    resultsSection.classList.add('show');

    // Display final score
    finalScore.textContent = `${score}/${questions.length}`;

    // Generate result message based on score
    const percentage = (score / questions.length) * 100;

    if (percentage === 100) {
        resultMessage.textContent = '🏆 Perfect Score! You\'re a Web Development Master!';
    } else if (percentage >= 80) {
        resultMessage.textContent = '🌟 Excellent work! You know your web development!';
    } else if (percentage >= 60) {
        resultMessage.textContent = '👍 Good job! Keep learning web development!';
    } else if (percentage >= 40) {
        resultMessage.textContent = '📚 Not bad! Practice more web development concepts.';
    } else {
        resultMessage.textContent = '💪 Keep practicing! Web development takes time to master!';
    }

    // Generate answer review
    generateReview();
}

// ===================================
// Generate Answer Review
// ===================================

/**
 * Create detailed review of all questions and answers
 */
function generateReview() {
    reviewContainer.innerHTML = '';

    questions.forEach((question, index) => {
        const reviewItem = document.createElement('div');
        const userAnswerIndex = userAnswers[index];
        const isCorrect = userAnswerIndex === question.correct;

        reviewItem.className = `review-item ${isCorrect ? 'correct-review' : 'incorrect-review'}`;

        reviewItem.innerHTML = `
      <div class="review-question">
        ${index + 1}. ${question.question}
      </div>
      <div class="review-answer user-answer">
        Your answer: ${userAnswerIndex !== null ? question.options[userAnswerIndex] : 'Not answered'}
      </div>
      <div class="review-answer correct-answer">
        Correct answer: ${question.options[question.correct]}
      </div>
      <span class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
        ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
      </span>
    `;

        reviewContainer.appendChild(reviewItem);
    });
}

// ===================================
// Restart Quiz
// ===================================

/**
 * Reset quiz state and start over
 * Does not require page refresh
 */
function restartQuiz() {
    // Reset state variables
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(questions.length).fill(null);
    quizSubmitted = false;
    reviewMode = false;

    // Update score display
    scoreDisplay.textContent = score;

    // Clear any saved progress
    clearProgress();

    // Hide results section
    resultsSection.classList.remove('show');
    reviewSection.classList.add('hidden');

    // Show quiz section
    quizSection.classList.remove('hidden');

    // Render first question
    renderQuestion();
}

// ===================================
// Logout Function
// ===================================

/**
 * Clear authentication and redirect to login page
 */
function logout() {
    // Remove username from localStorage
    localStorage.removeItem('quizUsername');
    localStorage.removeItem('loginInfo');

    // Redirect to login page
    window.location.href = 'login.html';
}

// ===================================
// Event Listeners
// ===================================

// Navigation buttons
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', previousQuestion);

// Logout button
logoutBtn.addEventListener('click', logout);

// Restart quiz button
restartBtn.addEventListener('click', restartQuiz);

// View review button (toggle review section)
viewReviewBtn.addEventListener('click', () => {
    reviewSection.classList.toggle('hidden');

    // Update button text
    if (reviewSection.classList.contains('hidden')) {
        viewReviewBtn.textContent = 'View Answers';
    } else {
        viewReviewBtn.textContent = 'Hide Answers';
    }
});

// ===================================
// Initialize Quiz
// ===================================

// Check authentication when page loads
checkAuth();

// Load questions and start quiz
loadQuestions();
